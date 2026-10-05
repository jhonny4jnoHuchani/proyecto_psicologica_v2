<?php

namespace App\Jobs;

use App\Models\Notificacion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EnviarNotificacionTelegram implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public int $notificacionId,
    ) {}

    public function handle(): void
    {
        $notificacion = Notificacion::with('user.telegramVinculacion')
            ->find($this->notificacionId);

        if (!$notificacion) {
            return;
        }

        // Si ya fue enviada, no repetir
        if ($notificacion->enviada_telegram) {
            return;
        }

        $user = $notificacion->user;
        $vinculacion = $user?->telegramVinculacion;

        // 1. Sin Telegram vinculado → queda pendiente
        if (!$vinculacion) {
            Log::info("Notif {$notificacion->id}: user sin Telegram vinculado, queda pendiente.");
            return;
        }

        // 2. Sin token configurado → error controlado
        $token = config('services.telegram.bot_token');
        if (!$token || $token === 'xxxxx') {
            $notificacion->update([
                'enviada_telegram' => false,
                'telegram_error' => 'Bot de Telegram no configurado.',
            ]);
            return;
        }

        // 3. Construir mensaje
        $texto = $this->construirMensaje($notificacion);

        // 4. Enviar a Telegram
        try {
            $response = Http::timeout(10)
                ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => $vinculacion->chat_id,
                    'text' => $texto,
                    'disable_web_page_preview' => true,
                ]);

            if ($response->successful()) {
                $notificacion->update([
                    'enviada_telegram' => true,
                    'enviada_telegram_at' => now(),
                    'telegram_error' => null,
                ]);
            } else {
                $error = $response->json('description') ?? 'Error desconocido';
                $notificacion->update([
                    'enviada_telegram' => false,
                    'telegram_error' => "HTTP {$response->status()}: {$error}",
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Error enviando notif {$notificacion->id} a Telegram: " . $e->getMessage());

            $notificacion->update([
                'enviada_telegram' => false,
                'telegram_error' => $e->getMessage(),
            ]);

            // Re-lanzar para que la cola reintente
            throw $e;
        }
    }

    /**
     * Construye el texto del mensaje.
     */
    private function construirMensaje(Notificacion $notificacion): string
    {
        $lineas = [
            $notificacion->titulo,
            '',
            $notificacion->mensaje,
        ];

        if ($notificacion->url) {
            $baseUrl = rtrim(config('app.url'), '/');
            $lineas[] = '';
            $lineas[] = $baseUrl . $notificacion->url;
        }

        return implode("\n", $lineas);
    }
}