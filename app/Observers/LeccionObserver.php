<?php

namespace App\Observers;

use App\Models\Leccion;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Log;

class LeccionObserver
{
    /**
     * Handle the Leccion "created" event.
     */
    public function created(Leccion $leccion): void
    {
        try {
            $leccion->loadMissing('curso.estudiantes.user');
            $curso = $leccion->curso;

            if (! $curso || $curso->estudiantes->isEmpty()) {
                return;
            }

            foreach ($curso->estudiantes as $estudiante) {
                $user = $estudiante->user;
                if ($user) {
                    // Notificar sólo internamente por web
                    NotificacionService::tareaNueva(
                        user: $user,
                        titulo: $leccion->titulo,
                        leccionId: $leccion->id,
                        mandarTelegram: false
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Error en LeccionObserver: '.$e->getMessage());
        }
    }
}
