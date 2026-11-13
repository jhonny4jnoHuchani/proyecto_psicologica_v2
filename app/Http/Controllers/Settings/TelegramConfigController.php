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
                'activo' => Configuracion::isTelegramActivo(),
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

        // Si el usuario quiere activar Telegram pero no hay ningún token disponible
        if ($activo && empty($tokenParaUsar)) {
            return back()->withErrors([
                'telegram_bot_token' => 'Debes ingresar un Token de Bot para activar las notificaciones de Telegram.',
            ]);
        }

        $botUsername = $config->telegram_bot_username;
        $webhookRegistrado = false;
        $advertenciaWebhook = null;

        // Si hay token y se está activando (o cambiando de token), validar con Telegram
        if ($activo && ! empty($tokenParaUsar)) {
            // 1. Validar Token con getMe
            try {
                $getMeResponse = Http::timeout(10)
                    ->get("https://api.telegram.org/bot{$tokenParaUsar}/getMe");
            } catch (\Exception $e) {
                Log::error('Error conectando a Telegram getMe: '.$e->getMessage());

                return back()->withErrors([
                    'telegram_bot_token' => self::traducirErrorTelegram($e),
                ]);
            }

            if (! $getMeResponse->successful() || ! $getMeResponse->json('ok')) {
                $descripcion = $getMeResponse->json('description') ?? 'Token no reconocido por Telegram.';

                return back()->withErrors([
                    'telegram_bot_token' => self::traducirErrorTelegram($descripcion),
                ]);
            }

            $botUsername = $getMeResponse->json('result.username');

            // 2. Registrar Webhook si la URL cuenta con HTTPS público
            $webhookUrl = rtrim(config('app.url'), '/').'/telegram/webhook';

            if (str_starts_with($webhookUrl, 'https://')) {
                try {
                    $webhookResponse = Http::timeout(10)
                        ->post("https://api.telegram.org/bot{$tokenParaUsar}/setWebhook", [
                            'url' => $webhookUrl,
                            'drop_pending_updates' => false,
                        ]);

                    if ($webhookResponse->successful() && $webhookResponse->json('ok')) {
                        $webhookRegistrado = true;
                    } else {
                        $advertenciaWebhook = self::traducirErrorTelegram($webhookResponse->json('description') ?? 'Telegram rechazó el webhook.');
                        Log::warning("Telegram rechazó el webhook ({$webhookUrl}): {$advertenciaWebhook}");
                    }
                } catch (\Exception $e) {
                    $advertenciaWebhook = self::traducirErrorTelegram($e);
                    Log::error('Error registrando Webhook en Telegram: '.$e->getMessage());
                }
            } else {
                $advertenciaWebhook = "La URL del sistema ({$webhookUrl}) no utiliza HTTPS. Telegram requiere HTTPS con certificado SSL válido para recibir eventos de webhook.";
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

        // Guardar el nuevo token si se ingresó, o persistir el de .env si la BD estaba vacía
        if (! empty($nuevoToken)) {
            $datosGuardar['telegram_bot_token'] = $nuevoToken;
        } elseif (empty($config->telegram_bot_token) && ! empty($tokenParaUsar)) {
            $datosGuardar['telegram_bot_token'] = $tokenParaUsar;
        }

        $config->update($datosGuardar);
        Configuracion::clearTelegramCache();

        if (! $activo) {
            return back()->with('success', 'Integración de Telegram desactivada correctamente.');
        }

        if ($webhookRegistrado) {
            $mensajeExito = "Bot @{$botUsername} configurado exitosamente y Webhook registrado en {$webhookUrl}.";
        } elseif ($advertenciaWebhook) {
            $mensajeExito = "Bot @{$botUsername} guardado en el sistema. Nota: {$advertenciaWebhook}";
        } else {
            $mensajeExito = "Bot @{$botUsername} guardado exitosamente en el sistema.";
        }

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

        $texto = '🔔 *Mensaje de Prueba - '.config('app.name')."*\n\n".
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

            return back()->with('error', self::traducirErrorTelegram($error));
        } catch (\Exception $e) {
            return back()->with('error', self::traducirErrorTelegram($e));
        }
    }

    /**
     * Traduce descripciones técnicas y excepciones en inglés de Telegram a mensajes en español claros y concisos.
     */
    public static function traducirErrorTelegram(\Throwable|string $error): string
    {
        $msg = is_string($error) ? $error : $error->getMessage();

        if (str_contains($msg, 'chat not found') || str_contains($msg, 'chat_id is empty')) {
            return 'No se encontró el Chat ID en Telegram. Asegúrate de haber iniciado el bot con /start antes de enviar mensajes.';
        }
        if (str_contains($msg, 'Unauthorized') || str_contains($msg, '401') || (str_contains($msg, 'Not Found') && str_contains($msg, 'bot'))) {
            return 'El Token de Bot es inválido o no existe en @BotFather. Verifica que esté copiado correctamente.';
        }
        if (str_contains($msg, 'blocked by the user') || str_contains($msg, 'user is deactivated')) {
            return 'El usuario ha bloqueado al bot en Telegram o la cuenta está desactivada.';
        }
        if (str_contains($msg, 'timed out') || str_contains($msg, 'timeout') || str_contains($msg, 'cURL error 28')) {
            return 'Tiempo de espera agotado al conectar con Telegram. Revisa la conexión a Internet del servidor.';
        }
        if (str_contains($msg, 'Could not resolve host') || str_contains($msg, 'cURL error 6') || str_contains($msg, 'Connection refused')) {
            return 'Fallo de conexión con api.telegram.org. Revisa el acceso a Internet del servidor.';
        }
        if (str_contains($msg, 'message is too long')) {
            return 'El mensaje supera la longitud máxima permitida por Telegram.';
        }

        return 'Falla de comunicación con Telegram: '.$msg;
    }
}
