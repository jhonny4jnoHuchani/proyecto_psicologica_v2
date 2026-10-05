<?php

namespace App\Console\Commands;

use App\Jobs\EnviarNotificacionTelegram;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Console\Command;

class TelegramFlushPendientes extends Command
{
    /**
     * El nombre del comando que usamos en el controller.
     */
    protected $signature = 'telegram:flush-pendientes {user_id}';

    protected $description = 'Envía todas las notificaciones pendientes a Telegram de un usuario recién vinculado.';

    public function handle(): int
    {
        $userId = (int) $this->argument('user_id');

        $user = User::find($userId);

        if (!$user) {
            $this->error("Usuario {$userId} no encontrado.");
            return self::FAILURE;
        }

        // Verificar que tenga Telegram vinculado
        if (!$user->telegramVinculacion) {
            $this->warn("El usuario {$userId} no tiene Telegram vinculado. Nada que hacer.");
            return self::SUCCESS;
        }

        // Buscar notificaciones pendientes de enviar
        $pendientes = Notificacion::where('user_id', $user->id)
            ->where('enviada_telegram', false)
            ->where(function ($q) {
                $q->whereNull('telegram_error')
                  ->orWhere('telegram_error', '!=', 'Bot de Telegram no configurado.');
            })
            ->orderBy('created_at', 'asc')
            ->get();

        if ($pendientes->isEmpty()) {
            $this->info("El usuario {$userId} no tiene notificaciones pendientes.");
            return self::SUCCESS;
        }

        $this->info("Enviando {$pendientes->count()} notificaciones pendientes al usuario {$userId}...");

        // Despachar cada job con delay incremental (evita baneo)
        foreach ($pendientes as $index => $notif) {
            EnviarNotificacionTelegram::dispatch($notif->id)
                ->delay(now()->addSeconds($index + 1));
        }

        $this->info("✅ Jobs despachados.");
        return self::SUCCESS;
    }
}