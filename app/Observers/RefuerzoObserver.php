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
            if (! $user) {
                Log::warning("Refuerzo {$refuerzo->id}: no se encontró user para notificar.");

                return;
            }

            $leccion = $refuerzo->leccion;

            // 3. Nombre del tema/tarea
            $nombreTema = $leccion?->titulo
                ?? $leccion?->nombre
                ?? 'Tema';

            // 4. Notificar con bloque predictivo de ML a nivel de Tema
            NotificacionService::refuerzoGenerado(
                user: $user,
                nombreTema: $nombreTema,
                refuerzoId: $refuerzo->id,
                estudianteId: $estudiante?->id,
                materiaId: $leccion?->materia_id,
                temaId: $leccion?->tema_id,
            );

        } catch (\Exception $e) {
            // Nunca romper el flujo del docente por un error de notificación
            Log::error('Error en RefuerzoObserver: '.$e->getMessage());
        }
    }
}
