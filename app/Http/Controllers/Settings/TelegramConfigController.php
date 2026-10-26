<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TelegramConfigController extends Controller
{
    /**
     * Muestra la vista de configuración de Telegram.
     */
    public function edit(): Response
    {
        $config = Configuracion::first();

        $tokenActual = $config?->telegram_bot_token ?: config('services.telegram.bot_token');
        $hasToken = ! empty($tokenActual) && $tokenActual !== 'YOUR-BOT-TOKEN';

        // Previsualización enmascarada del token para la interfaz
        $tokenPreview = null;
        if ($hasToken) {
            $tokenPreview = strlen($tokenActual) > 10
                ? substr($tokenActual, 0, 5).'••••••••••••'.substr($tokenActual, -5)
                : '••••••••••••';
        }

        $webhookUrl = rtrim(config('app.url'), '/').'/telegram/webhook';

        return Inertia::render('settings/telegram', [
            'settings' => [
                'has_token' => $hasToken,
                'token_preview' => $tokenPreview,
                'chat_id' => $config?->telegram_chat_id ?? '',
                'bot_username' => $config?->telegram_bot_username ?? '',
                'activo' => (bool) ($config?->telegram_activo ?? ($hasToken && config('services.telegram.enabled', false))),
                'webhook_url' => $webhookUrl,
                'app_url' => config('app.url'),
            ],
        ]);
    }

    /**
     * Guarda la configuración del Bot, valida el Token contra Telegram
     * y registra automáticamente el Webhook.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'telegram_bot_token' => 'nullable|string',
            'telegram_chat_id' => 'nullable|string|max:100',
            'telegram_activo' => 'required|boolean',
        ]);

        $config = Configuracion::firstOrCreate([], [
            'color_primario' => '#4f46e5',
            'color_secundario' => '#06b6d4',
        ]);

        $nuevoToken = trim($request->telegram_bot_token ?? '');
        $tokenParaUsar = ! empty($nuevoToken) ? $nuevoToken : $config->telegram_bot_token;

        // Si no hay token en BD ni se pasó uno nuevo, verificar si existe en .env
        if (empty($tokenParaUsar)) {
            $tokenParaUsar = config('services.telegram.bot_token');
        }

        $activo = (bool) $request->telegram_activo;

        // Si el usuario quiere activar Telegram pero no hay ningún token
        if ($activo && empty($tokenParaUsar)) {
            return back()->withErrors([
                'telegram_bot_token' => 'Debes ingresar un Token de Bot para activar las notificaciones de Telegram.',
            ]);
        }

        $botUsername = $config->telegram_bot_username;

        // Si hay token y se está activando (o cambiando de token), validar con Telegram
        if ($activo && ! empty($tokenParaUsar)) {
            // 1. Validar Token con getMe
            try {
                $getMeResponse = Http::timeout(10)
                    ->get("https://api.telegram.org/bot{$tokenParaUsar}/getMe");
            } catch (\Exception $e) {
                Log::error('Error conectando a Telegram getMe: '.$e->getMessage());

                return back()->withErrors([
                    'telegram_bot_token' => 'No se pudo conectar con los servidores de Telegram (Tiempo de espera agotado o error de red): '.$e->getMessage(),
                ]);
            }

            if (! $getMeResponse->successful() || ! $getMeResponse->json('ok')) {
                $descripcion = $getMeResponse->json('description') ?? 'Token no reconocido por Telegram.';

                return back()->withErrors([
                    'telegram_bot_token' => "Token inválido: {$descripcion}. Por favor revisa el token generado en @BotFather.",
                ]);
            }

            $botUsername = $getMeResponse->json('result.username');

            // 2. Registrar Webhook automáticamente en Telegram
            $webhookUrl = rtrim(config('app.url'), '/').'/telegram/webhook';

            try {
                $webhookResponse = Http::timeout(10)
                    ->post("https://api.telegram.org/bot{$tokenParaUsar}/setWebhook", [
                        'url' => $webhookUrl,
                        'drop_pending_updates' => false,
                    ]);
            } catch (\Exception $e) {
                Log::error('Error registrando Webhook en Telegram: '.$e->getMessage());

                return back()->withErrors([
                    'telegram_bot_token' => 'Error de conexión al registrar el Webhook con Telegram: '.$e->getMessage(),
                ]);
            }

            if (! $webhookResponse->successful() || ! $webhookResponse->json('ok')) {
                $errorWebhook = $webhookResponse->json('description') ?? 'Telegram rechazó el webhook.';

                return back()->withErrors([
                    'telegram_bot_token' => "El bot @{$botUsername} es válido, pero Telegram rechazó la URL de Webhook ({$webhookUrl}): {$errorWebhook}. Asegúrate de que tu APP_URL sea un dominio público con certificado SSL HTTPS válido.",
                ]);
            }
        }

        // Si se desactiva y había token, opcionalmente eliminamos el webhook en Telegram
        if (! $activo && ! empty($tokenParaUsar)) {
            try {
                Http::timeout(5)->post("https://api.telegram.org/bot{$tokenParaUsar}/deleteWebhook");
            } catch (\Exception $e) {
                // Silencioso al borrar
            }
        }

        // 3. Persistir en la base de datos
        $datosGuardar = [
            'telegram_chat_id' => $request->telegram_chat_id ? trim($request->telegram_chat_id) : null,
            'telegram_activo' => $activo,
            'telegram_bot_username' => $botUsername,
        ];

        // Solo actualizar el token en BD si se ingresó uno nuevo explícitamente
        if (! empty($nuevoToken)) {
            $datosGuardar['telegram_bot_token'] = $nuevoToken;
        }

        $config->update($datosGuardar);
        Configuracion::clearTelegramCache();

        $mensajeExito = $activo
            ? "Bot @{$botUsername} vinculado exitosamente y Webhook registrado en {$webhookUrl}."
            : 'Integración de Telegram desactivada correctamente.';

        return back()->with('success', $mensajeExito);
    }

    /**
     * Envía un mensaje de prueba al Chat ID configurado.
     */
    public function testMessage(Request $request): RedirectResponse
    {
        $token = Configuracion::getTelegramToken();
        $chatId = $request->chat_id ?: Configuracion::getTelegramChatId();

        if (empty($token)) {
            return back()->with('error', 'No hay ningún Token de bot configurado en el sistema.');
        }

        if (empty($chatId)) {
            return back()->with('error', 'Debes configurar o ingresar el Chat ID del responsable para enviar el mensaje de prueba.');
        }

        $texto = "🔔 *Mensaje de Prueba - ".config('app.name')."*\n\n".
                 "¡Conexión exitosa! La integración de Telegram con la plataforma web está funcionando correctamente.\n\n".
                 '📅 *Fecha y Hora:* '.now()->format('d/m/Y H:i:s')."\n".
                 '🌐 *URL Webhook:* '.rtrim(config('app.url'), '/').'/telegram/webhook';

        try {
            $response = Http::timeout(10)
                ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $texto,
                    'parse_mode' => 'Markdown',
                ]);

            if ($response->successful() && $response->json('ok')) {
                return back()->with('success', "¡Mensaje de prueba enviado con éxito al Chat ID {$chatId}!");
            }

            $error = $response->json('description') ?? 'Respuesta no exitosa de Telegram.';

            return back()->with('error', "No se pudo enviar el mensaje a Telegram: {$error}");
        } catch (\Exception $e) {
            return back()->with('error', 'Error al intentar enviar mensaje de prueba: '.$e->getMessage());
        }
    }
}
