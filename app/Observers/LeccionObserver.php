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
            $leccion->loadMissing(['curso.estudiantes.user', 'materia']);
            $curso = $leccion->curso;

            if (! $curso || $curso->estudiantes->isEmpty()) {
                return;
            }

            $materiaNombre = $leccion->materia?->nombre;
            $fechaEntrega = $leccion->fecha_entrega ? $leccion->fecha_entrega->format('d/m/Y H:i') : null;
            $leccionKey = $leccion->getRouteKey();

            foreach ($curso->estudiantes as $estudiante) {
                $user = $estudiante->user;
                if ($user) {
                    NotificacionService::tareaNueva(
                        user: $user,
                        titulo: $leccion->titulo,
                        leccionId: $leccionKey,
                        materiaNombre: $materiaNombre,
                        fechaEntrega: $fechaEntrega,
                        mandarTelegram: true
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Error en LeccionObserver: '.$e->getMessage());
        }
    }
}
