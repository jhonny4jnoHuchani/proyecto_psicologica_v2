<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TelegramSetWebhook extends Command
{
    protected $signature = 'telegram:set-webhook {url? : URL pública HTTPS del webhook (opcional)}';

    protected $description = 'Configura el Webhook de Telegram con el dominio actual';

    public function handle(): int
    {
        $token = config('services.telegram.bot_token');

        if (! $token || $token === 'xxxxx') {
            $this->error('Error: TELEGRAM_BOT_TOKEN no está configurado en tu archivo .env.');

            return self::FAILURE;
        }

        $url = $this->argument('url');
        if (! $url) {
            $baseUrl = rtrim(config('app.url'), '/');
            $url = "{$baseUrl}/telegram/webhook";
        }

        if (! str_starts_with($url, 'https://')) {
            $this->warn("Advertencia: Telegram requiere una URL pública con HTTPS. Tu URL actual es: {$url}");
            if (! $this->confirm('¿Deseas intentar registrarla de todas formas?', false)) {
                return self::FAILURE;
            }
        }

        $this->info("Registrando webhook en Telegram con la URL: {$url}...");

        try {
            $response = Http::timeout(15)->post("https://api.telegram.org/bot{$token}/setWebhook", [
                'url' => $url,
            ]);

            if ($response->successful() && $response->json('ok')) {
                $this->info('✅ ¡Webhook configurado exitosamente en Telegram!');
                $this->line('Respuesta de Telegram: '.$response->json('description'));

                return self::SUCCESS;
            }

            $this->error('❌ Telegram rechazó la configuración:');
            $this->error($response->body());

            return self::FAILURE;
        } catch (\Exception $e) {
            $this->error('Error conectando con la API de Telegram: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
