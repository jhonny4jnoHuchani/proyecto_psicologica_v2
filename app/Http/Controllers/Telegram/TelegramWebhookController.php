<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Models\TelegramVinculacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
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

        Log::info('Telegram webhook', $update);

        $mensaje = $update['message'] ?? null;
        if (!$mensaje) {
            return response()->json(['ok' => true]);
        }

        $chatId = $mensaje['chat']['id'] ?? null;
        $username = $mensaje['from']['username'] ?? null;

        if (!$chatId) {
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
        $this->enviarMensaje($chatId, "Si quieres vincularte, envía /start");
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
            "¡Hola! 👋 Soy el bot de notificaciones.\n\n" .
            "Para vincularte, envíame tu CI (con o sin complemento)."
        );
    }

    /**
     * Paso 2: recibió un CI → buscar user y pedir contacto.
     */
    private function procesarCI(int $chatId, ?string $username, string $ci): void
    {
        $user = User::where('ci', $ci)->first();

        if (!$user) {
            $this->enviarMensaje($chatId, "❌ No encontré ese CI en el sistema. Verifica e intenta de nuevo.");
            return;
        }

        // Verificar que el user no esté ya vinculado a OTRO chat
        $yaVinculado = TelegramVinculacion::where('user_id', $user->id)->exists();
        if ($yaVinculado) {
            $this->enviarMensaje($chatId, "⚠️ Este CI ya está vinculado a otro Telegram.");
            return;
        }

        // Guardar en caché: esperando contacto del user X
        Cache::put("tg:{$chatId}", "esperando_contacto:{$user->id}", now()->addMinutes(10));

        // Pedir contacto con botón
        $this->enviarMensajeConBotonContacto(
            $chatId,
            "✅ Te encontré, {$user->nombre}.\n\n" .
            "Ahora comparte tu número de celular para confirmar tu identidad."
        );
    }

    /**
     * Paso 3: recibió el contacto → validar celular y vincular.
     */
    private function procesarContacto(int $chatId, ?string $username, array $contacto): void
    {
        $paso = Cache::get("tg:{$chatId}");

        if (!$paso || !str_starts_with($paso, 'esperando_contacto:')) {
            $this->enviarMensaje($chatId, "Primero envía /start para comenzar.");
            return;
        }

        $userId = (int) explode(':', $paso)[1];
        $user = User::find($userId);

        if (!$user) {
            Cache::forget("tg:{$chatId}");
            $this->enviarMensaje($chatId, "Algo salió mal. Envía /start de nuevo.");
            return;
        }

        // Normalizar número de Telegram: "+59176543300" → "76543300"
        $telefonoTelegram = $this->normalizarTelefono($contacto['phone_number'] ?? '');
        $telefonoBD = $this->normalizarTelefono($user->celular);

        if ($telefonoTelegram !== $telefonoBD) {
            $this->enviarMensaje(
                $chatId,
                "❌ El número no coincide con el registrado.\n\n" .
                "Verifica o contacta a tu institución."
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

        $this->enviarMensaje(
            $chatId,
            "🎉 ¡Vinculación exitosa!\n\n" .
            "A partir de ahora recibirás tus notificaciones aquí."
        );

        // Flush de notificaciones pendientes
        Artisan::call('telegram:flush-pendientes', [
            'user_id' => $user->id,
        ]);
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
        $token = config('telegram.bots.mybot.token');

        if (!$token || $token === 'xxxxx') {
            Log::warning('Telegram: token no configurado.');
            return;
        }

        try {
            Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $texto,
            ]);
        } catch (\Exception $e) {
            Log::error('Error enviando mensaje Telegram: ' . $e->getMessage());
        }
    }

    /**
     * Envía mensaje con botón "Compartir mi número".
     */
    private function enviarMensajeConBotonContacto(int $chatId, string $texto): void
    {
        $token = config('telegram.bots.mybot.token');

        if (!$token || $token === 'xxxxx') {
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
            Log::error('Error enviando mensaje Telegram: ' . $e->getMessage());
        }
    }
}