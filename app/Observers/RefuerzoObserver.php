<?php

namespace App\Observers;

use App\Models\Refuerzo;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Log;

class RefuerzoObserver
{
    /**
     * Solo al CREAR el refuerzo (no al responderlo).
     */
    public function created(Refuerzo $refuerzo): void
    {
        try {
            // 1. Cargar relaciones necesarias
            $refuerzo->loadMissing('estudiante.user', 'leccion');

            $estudiante = $refuerzo->estudiante;
            $user = $estudiante?->user;

            // 2. Validación defensiva
            if (!$user) {
                Log::warning("Refuerzo {$refuerzo->id}: no se encontró user para notificar.");
                return;
            }

            // 3. Nombre del tema/tarea
            $nombreTema = $refuerzo->leccion->titulo
                ?? $refuerzo->leccion->nombre
                ?? 'Tema';

            // 4. Notificar
            NotificacionService::refuerzoGenerado(
                user: $user,
                nombreTema: $nombreTema,
                refuerzoId: $refuerzo->id,
            );

        } catch (\Exception $e) {
            // Nunca romper el flujo del docente por un error de notificación
            Log::error("Error en RefuerzoObserver: " . $e->getMessage());
        }
    }
}