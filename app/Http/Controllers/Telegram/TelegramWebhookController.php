<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\CredencialTemporal;
use App\Models\TelegramVinculacion;
use App\Models\User;
use App\Services\NotificacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    /**
     * Recibe los updates del bot de Telegram.
     */
    public function webhook(Request $request)
    {
        $update = $request->all();

        Log::info('📩 [Telegram Webhook] Payload recibido:', $update);

        if (! Configuracion::isTelegramActivo()) {
            Log::warning('⚠️ [Telegram Webhook] Recibido pero Telegram está deshabilitado en configuración');

            return response()->json(['ok' => false, 'message' => 'Telegram deshabilitado en configuración']);
        }

        $mensaje = $update['message'] ?? null;
        if (! $mensaje) {
            Log::info('ℹ️ [Telegram Webhook] Update no contiene "message" (puede ser callback_query, channel_post, etc.)');

            return response()->json(['ok' => true]);
        }

        $chatId = $mensaje['chat']['id'] ?? null;
        $username = $mensaje['from']['username'] ?? null;

        Log::info("💬 [Telegram Webhook] Mensaje detectado - Chat ID: {$chatId}, Usuario: @{$username}");

        if (! $chatId) {
            return response()->json(['ok' => true]);
        }

        // Caso 1: el user compartió su contacto (botón)
        if (isset($mensaje['contact'])) {
            $this->procesarContacto($chatId, $username, $mensaje['contact']);

            return response()->json(['ok' => true]);
        }

        // Caso 2: mensaje de texto
        $texto = trim($mensaje['text'] ?? '');

        if (str_starts_with($texto, '/start')) {
            $this->iniciarConversacion($chatId);

            return response()->json(['ok' => true]);
        }

        // Si estamos esperando un CI, tratar el texto como CI
        $paso = Cache::get("tg:{$chatId}");

        if ($paso === 'esperando_ci') {
            $this->procesarCI($chatId, $username, $texto);

            return response()->json(['ok' => true]);
        }

        // Cualquier otra cosa
        $this->enviarMensaje($chatId, 'Si quieres vincularte, envía /start');

        return response()->json(['ok' => true]);
    }

    /**
     * Paso 1: /start → pedir CI.
     */
    private function iniciarConversacion(int $chatId): void
    {
        Cache::put("tg:{$chatId}", 'esperando_ci', now()->addMinutes(10));

        $this->enviarMensaje(
            $chatId,
            "¡Hola! 👋 Soy el bot de notificaciones.\n\n".
            'Para vincularte, envíame tu CI (con o sin complemento).'
        );
    }

    /**
     * Paso 2: recibió un CI → buscar user y pedir contacto.
     */
    private function procesarCI(int $chatId, ?string $username, string $ci): void
    {
        $user = User::where('ci', $ci)->first();

        if (! $user) {
            $this->enviarMensaje($chatId, '❌ No encontré ese CI en el sistema. Verifica e intenta de nuevo.');

            return;
        }

        // Verificar que el user no esté ya vinculado
        $vinculacionExistente = TelegramVinculacion::where('user_id', $user->id)->first();
        if ($vinculacionExistente) {
            if ($vinculacionExistente->chat_id === (string) $chatId) {
                Cache::forget("tg:{$chatId}");
                $this->enviarMensaje($chatId, "ℹ️ Ya te encuentras vinculado a este chat de Telegram, {$user->nombre}.");
                $this->enviarCredenciales($chatId, $user, false);

                return;
            }

            $this->enviarMensaje($chatId, '⚠️ Este CI ya está vinculado a otro Telegram.');

            return;
        }

        // Guardar en caché: esperando contacto del user X
        Cache::put("tg:{$chatId}", "esperando_contacto:{$user->id}", now()->addMinutes(10));

        // Pedir contacto con botón
        $this->enviarMensajeConBotonContacto(
            $chatId,
            "✅ Te encontré, {$user->nombre}.\n\n".
            'Ahora comparte tu número de celular para confirmar tu identidad.'
        );
    }

    /**
     * Paso 3: recibió el contacto → validar celular y vincular.
     */
    private function procesarContacto(int $chatId, ?string $username, array $contacto): void
    {
        $paso = Cache::get("tg:{$chatId}");

        if (! $paso || ! str_starts_with($paso, 'esperando_contacto:')) {
            $this->enviarMensaje($chatId, 'Primero envía /start para comenzar.');

            return;
        }

        $userId = (int) explode(':', $paso)[1];
        $user = User::find($userId);

        if (! $user) {
            Cache::forget("tg:{$chatId}");
            $this->enviarMensaje($chatId, 'Algo salió mal. Envía /start de nuevo.');

            return;
        }

        // Normalizar número de Telegram: "+59176543300" → "76543300"
        $telefonoTelegram = $this->normalizarTelefono($contacto['phone_number'] ?? '');
        $telefonoBD = $this->normalizarTelefono($user->celular);

        if ($telefonoTelegram !== $telefonoBD) {
            $this->enviarMensaje(
                $chatId,
                "❌ El número no coincide con el registrado.\n\n".
                'Verifica o contacta a tu institución.'
            );

            return;
        }

        // ✅ Crear vinculación
        TelegramVinculacion::updateOrCreate(
            ['user_id' => $user->id],
            [
                'chat_id' => (string) $chatId,
                'telegram_username' => $username,
                'vinculado_at' => now(),
            ]
        );

        Cache::forget("tg:{$chatId}");

        // 🎉 Enviar mensaje de bienvenida con usuario y contraseña
        $this->enviarCredenciales($chatId, $user, true);

        // Notificación interna en la campanita web
        NotificacionService::credencialesEnviadas($user, false);

        // Flush de notificaciones pendientes
        Artisan::call('telegram:flush-pendientes', [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Envía las credenciales de acceso al usuario por Telegram.
     */
    private function enviarCredenciales(int $chatId, User $user, bool $esPrimeraVinculacion = false): void
    {
        // 1. Obtener o resolver la contraseña
        $credencial = CredencialTemporal::where('user_id', $user->id)->latest()->first();

        if ($credencial && ! empty($credencial->password_temporal)) {
            $password = $credencial->password_temporal;
            $credencial->update([
                'enviada' => true,
                'enviada_at' => now(),
            ]);
        } elseif (Hash::check('password', $user->password)) {
            $password = 'password';
            CredencialTemporal::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'password_temporal' => $password,
                    'enviada' => true,
                    'enviada_at' => now(),
                ]
            );
        } else {
            // Contraseña basada en apellido y CI
            $password = strtolower($user->apellido_paterno.'_'.$user->ci);
            $user->update(['password' => Hash::make($password)]);
            CredencialTemporal::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'password_temporal' => $password,
                    'enviada' => true,
                    'enviada_at' => now(),
                ]
            );
        }

        $loginUrl = rtrim(config('app.url'), '/').'/login';

        $encabezado = $esPrimeraVinculacion
            ? "🎉 ¡Vinculación exitosa!\n\n"
            : "🔐 Tus datos de acceso:\n\n";

        $mensaje = $encabezado.
            "Hola, {$user->nombre}. Tus datos para ingresar a la plataforma son:\n\n".
            "🌐 Enlace de acceso:\n{$loginUrl}\n\n".
            "👤 Usuario (Correo): {$user->email}\n".
            "🔑 Contraseña: {$password}\n".
            "🆔 CI: {$user->ci}\n\n".
            "A partir de ahora recibirás todas tus notificaciones y tareas aquí.";

        $this->enviarMensaje($chatId, $mensaje);
    }

    /**
     * Quita el +591 y espacios para comparar.
     */
    private function normalizarTelefono(string $numero): string
    {
        // Quitar todo lo que no sea dígito
        $soloDigitos = preg_replace('/\D/', '', $numero);

        // Quitar prefijo 591 si está al inicio
        if (str_starts_with($soloDigitos, '591')) {
            $soloDigitos = substr($soloDigitos, 3);
        }

        return $soloDigitos;
    }

    /**
     * Envía mensaje de texto simple.
     */
    private function enviarMensaje(int $chatId, string $texto): void
    {
        $token = Configuracion::getTelegramToken();

        if (! $token || $token === 'xxxxx' || $token === 'YOUR-BOT-TOKEN') {
            Log::warning('Telegram: token no configurado.');

            return;
        }

        try {
            Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $texto,
            ]);
        } catch (\Exception $e) {
            Log::error('Error enviando mensaje Telegram: '.$e->getMessage());
        }
    }

    /**
     * Envía mensaje con botón "Compartir mi número".
     */
    private function enviarMensajeConBotonContacto(int $chatId, string $texto): void
    {
        $token = Configuracion::getTelegramToken();

        if (! $token || $token === 'xxxxx' || $token === 'YOUR-BOT-TOKEN') {
            Log::warning('Telegram: token no configurado.');

            return;
        }

        try {
            Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $texto,
                'reply_markup' => json_encode([
                    'keyboard' => [[
                        ['text' => '📱 Compartir mi número', 'request_contact' => true],
                    ]],
                    'resize_keyboard' => true,
                    'one_time_keyboard' => true,
                ]),
            ]);
        } catch (\Exception $e) {
            Log::error('Error enviando mensaje Telegram: '.$e->getMessage());
        }
    }
}
