<?php

namespace App\Observers;

use App\Models\Calificacion;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Log;

class CalificacionObserver
{
    /**
     * Se dispara en create Y update (evento 'saved').
     */
    public function saved(Calificacion $calificacion): void
    {
        try {
            // 1. ¿Es una creación o una actualización?
            $esNueva = $calificacion->wasRecentlyCreated;

            // 2. Si es update, verificar que la nota haya cambiado
            if (!$esNueva && !$calificacion->wasChanged('nota')) {
                return; // no cambió la nota → no notificar
            }

            // 3. Cargar relaciones necesarias
            $calificacion->loadMissing('entrega.estudiante.user', 'entrega.leccion');

            $entrega = $calificacion->entrega;
            $estudiante = $entrega?->estudiante;
            $user = $estudiante?->user;

            // 4. Validaciones defensivas
            if (!$user) {
                Log::warning("Calificacion {$calificacion->id}: no se encontró user para notificar.");
                return;
            }

            // 5. Obtener nombre de la tarea (ajustar campo si es necesario)
            $nombreTarea = $entrega->leccion->titulo
                ?? $entrega->leccion->nombre
                ?? 'Tarea';

            // 6. Notificar
            NotificacionService::tareaCalificada(
                user: $user,
                nota: (float) $calificacion->nota,
                nombreTarea: $nombreTarea,
            );

        } catch (\Exception $e) {
            // Nunca romper el flujo del docente por un error de notificación
            Log::error("Error en CalificacionObserver: " . $e->getMessage());
        }
    }
}