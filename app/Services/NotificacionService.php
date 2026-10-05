<?php

namespace App\Services;

use App\Jobs\EnviarNotificacionTelegram;
use App\Models\Notificacion;
use App\Models\User;

class NotificacionService
{
    /**
     * Crear una notificación para un usuario.
     * - La guarda en BD (campanita).
     * - Despacha el job de Telegram con delay de 1 seg.
     */
    public static function crear(
        User $user,
        string $tipo,
        string $titulo,
        string $mensaje,
        ?string $url = null,
    ): Notificacion {
        $notificacion = Notificacion::create([
            'user_id' => $user->id,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'url' => $url,
            'leida' => false,
            'enviada_telegram' => false,
        ]);

        // Despachar a la cola con delay de 1 seg (evita baneo del bot)
        EnviarNotificacionTelegram::dispatch($notificacion->id)
            ->delay(now()->addSeconds(1));

        return $notificacion;
    }

    /**
     * Atajo: notificación de tarea calificada.
     */
    public static function tareaCalificada(
        User $user,
        float $nota,
        string $nombreTarea,
    ): Notificacion {
        return self::crear(
            user: $user,
            tipo: 'tarea_calificada',
            titulo: "📝 Tarea calificada: {$nota}/100",
            mensaje: "Tu tarea \"{$nombreTarea}\" fue calificada con {$nota}/100.",
            url: '/entregas',
        );
    }

    /**
     * Atajo: refuerzo generado.
     */
    public static function refuerzoGenerado(
        User $user,
        string $nombreTema,
        int $refuerzoId,
    ): Notificacion {
        return self::crear(
            user: $user,
            tipo: 'refuerzo_generado',
            titulo: '🪄 Nuevo refuerzo disponible',
            mensaje: "Se generó un refuerzo para \"{$nombreTema}\". ¡Practica para mejorar!",
            url: "/refuerzos/{$refuerzoId}",
        );
    }

    /**
     * Atajo: credenciales enviadas.
     */
    public static function credencialesEnviadas(User $user): Notificacion
    {
        return self::crear(
            user: $user,
            tipo: 'credenciales_enviadas',
            titulo: '🔐 Credenciales enviadas',
            mensaje: 'Tus credenciales de acceso fueron enviadas por Telegram.',
            url: '/',
        );
    }

    /**
     * Atajo: nueva tarea/lección.
     */
    public static function tareaNueva(
        User $user,
        string $titulo,
        int $leccionId,
    ): Notificacion {
        return self::crear(
            user: $user,
            tipo: 'tarea_nueva',
            titulo: "📚 Nueva tarea: {$titulo}",
            mensaje: "Se publicó una nueva tarea: \"{$titulo}\".",
            url: "/lecciones/{$leccionId}",
        );
    }

    /**
     * Atajo: mensaje del sistema.
     */
    public static function sistema(
        User $user,
        string $titulo,
        string $mensaje,
        ?string $url = null,
    ): Notificacion {
        return self::crear(
            user: $user,
            tipo: 'sistema',
            titulo: $titulo,
            mensaje: $mensaje,
            url: $url,
        );
    }
}