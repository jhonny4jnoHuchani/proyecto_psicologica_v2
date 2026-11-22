<?php

namespace App\Services;

use App\Jobs\EnviarNotificacionTelegram;
use App\Models\Calificacion;
use App\Models\Notificacion;
use App\Models\Tema;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Servicio Central de Notificaciones.
 * Registra avisos internos (campanita) y despacha mensajes al Bot de Telegram.
 */
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
        bool $mandarTelegram = true,
    ): Notificacion {
        $notificacion = Notificacion::create([
            'user_id' => $user->id,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'url' => $url,
            'leida' => false,
            'enviada_telegram' => ! $mandarTelegram, // Si no se manda, marcamos como true para ignorar o simplemente queda false sin enviar
        ]);

        if ($mandarTelegram) {
            // Despachar a la cola con delay de 1 seg (evita baneo del bot)
            EnviarNotificacionTelegram::dispatch($notificacion->id)
                ->delay(now()->addSeconds(1));
        }

        return $notificacion;
    }

    /**
     * Construye la sección predictiva de Machine Learning (a nivel de Tema) para Telegram.
     * Tolerancia a fallos: Si el microservicio ML falla o está apagado, retorna cadena vacía.
     */
    public static function generarBloquePredictivoMl(?int $estudianteId, ?int $materiaId, ?int $temaId): string
    {
        if (! $estudianteId || ! $materiaId || ! $temaId) {
            return '';
        }

        try {
            // 1. Consolidar el promedio del estudiante en el TEMA actual (igual que en LeccionController)
            $promedioTema = Calificacion::query()
                ->join('entregas', 'calificaciones.entrega_id', '=', 'entregas.id')
                ->join('lecciones', 'entregas.leccion_id', '=', 'lecciones.id')
                ->where('entregas.estudiante_id', $estudianteId)
                ->where('lecciones.tema_id', $temaId)
                ->whereNotNull('calificaciones.nota')
                ->avg('calificaciones.nota');

            $notaConsolidada = (int) round($promedioTema ?? 70);

            // 2. Consultar al servicio de Machine Learning
            /** @var MachineLearningService $mlService */
            $mlService = app(MachineLearningService::class);
            $prediccion = $mlService->getPrediccion($materiaId, $notaConsolidada, $temaId);

            $siguienteTema = $prediccion['siguiente_tema'] ?? null;

            // Si Python no trajo siguiente_tema directamente, buscar en la BD local
            if (! $siguienteTema) {
                $ordenActual = Tema::where('id', $temaId)->value('orden') ?? 0;
                $sigTemaDb = Tema::where('materia_id', $materiaId)
                    ->where('orden', '>', $ordenActual)
                    ->where('estado', '!=', 'omitido')
                    ->orderBy('orden', 'asc')
                    ->first();

                if ($sigTemaDb) {
                    $siguienteTema = [
                        'nombre' => $sigTemaDb->nombre,
                        'paginas_libro' => $sigTemaDb->paginas_libro,
                    ];
                }
            }

            $nombreSiguiente = $siguienteTema['nombre'] ?? 'Siguiente tema del temario';
            $paginasStr = ! empty($siguienteTema['paginas_libro']) ? " (📖 {$siguienteTema['paginas_libro']})" : '';

            $lineas = [
                '',
                '🔮 Predicción de rendimiento para el próximo tema',
                ' "Ve lo que debes estudiar para la siguiente clase"',
                '',
                "📚 Próximo tema: {$nombreSiguiente}{$paginasStr}",
            ];

            // 3. Caso con datos históricos vs Caso Cold Start
            if (! empty($prediccion['tiene_datos_historicos']) && isset($prediccion['beneficio']) && $prediccion['beneficio'] > 0) {
                $beneficio = $prediccion['beneficio'];
                $lineas[] = "📈 Mejora estimada: +{$beneficio} puntos si repasas el material asignado.";
                $lineas[] = '👉 Ingresa a la plataforma para ver tu proyección comparativa completa.';
            } else {
                $lineas[] = 'ℹ️ Materia en etapa inicial de recopilación de datos históricos.';
                $lineas[] = '👉 Ingresa a la plataforma para revisar el temario y tus lecturas.';
            }

            return implode("\n", $lineas);
        } catch (\Throwable $e) {
            Log::warning('No se pudo generar bloque predictivo ML para Telegram: '.$e->getMessage());

            return '';
        }
    }

    /**
     * Atajo: notificación de tarea calificada.
     */
    public static function tareaCalificada(
        User $user,
        float $nota,
        string $nombreTarea,
        ?string $nombreMateria = null,
        ?string $comentarios = null,
        ?string $url = null,
        bool $mandarTelegram = true,
        ?int $estudianteId = null,
        ?int $materiaId = null,
        ?int $temaId = null,
    ): Notificacion {
        $materiaStr = $nombreMateria ? " ({$nombreMateria})" : '';
        // El mensaje solo notifica que la tarea fue calificada, sin revelar la nota obtenida
        $mensaje = "Tu tarea \"{$nombreTarea}\"{$materiaStr} ya fue calificada.";

        if (! empty(trim($comentarios ?? ''))) {
            $mensaje .= "\n\n💬 Observaciones:\n\"{$comentarios}\"";
        }

        // Bloque predictivo de Machine Learning (a nivel de Tema)
        $bloqueMl = self::generarBloquePredictivoMl($estudianteId, $materiaId, $temaId);
        if (! empty($bloqueMl)) {
            $mensaje .= "\n".$bloqueMl;
        }

        return self::crear(
            user: $user,
            tipo: 'tarea_calificada',
            titulo: '📝 Tarea calificada',
            mensaje: $mensaje,
            url: $url ?? '/entregas',
            mandarTelegram: $mandarTelegram,
        );
    }

    /**
     * Atajo: refuerzo generado.
     */
    public static function refuerzoGenerado(
        User $user,
        string $nombreTema,
        int $refuerzoId,
        ?int $estudianteId = null,
        ?int $materiaId = null,
        ?int $temaId = null,
    ): Notificacion {
        $mensaje = "Se generó un refuerzo para \"{$nombreTema}\". ¡Practica para mejorar!";

        // Bloque predictivo de Machine Learning (a nivel de Tema)
        $bloqueMl = self::generarBloquePredictivoMl($estudianteId, $materiaId, $temaId);
        if (! empty($bloqueMl)) {
            $mensaje .= "\n".$bloqueMl;
        }

        return self::crear(
            user: $user,
            tipo: 'refuerzo_generado',
            titulo: 'Nuevo refuerzo disponible',
            mensaje: $mensaje,
            url: "/refuerzos/{$refuerzoId}",
        );
    }

    /**
     * Atajo: credenciales enviadas.
     */
    public static function credencialesEnviadas(User $user, bool $mandarTelegram = false): Notificacion
    {
        return self::crear(
            user: $user,
            tipo: 'credenciales_enviadas',
            titulo: 'Credenciales enviadas',
            mensaje: 'Tus credenciales de acceso fueron enviadas por Telegram.',
            url: '/',
            mandarTelegram: $mandarTelegram,
        );
    }

    /**
     * Atajo: nueva tarea/lección.
     */
    public static function tareaNueva(
        User $user,
        string $titulo,
        int|string $leccionId,
        ?string $materiaNombre = null,
        ?string $fechaEntrega = null,
        bool $mandarTelegram = true,
    ): Notificacion {
        $mensaje = "Se publicó una nueva tarea: \"{$titulo}\"";
        if ($materiaNombre) {
            $mensaje .= " en la materia {$materiaNombre}.";
        } else {
            $mensaje .= '.';
        }

        if ($fechaEntrega) {
            $mensaje .= "\n📅 Fecha límite de entrega: {$fechaEntrega}";
        }

        return self::crear(
            user: $user,
            tipo: 'tarea_nueva',
            titulo: "📚 Nueva tarea: {$titulo}",
            mensaje: $mensaje,
            url: "/lecciones/{$leccionId}",
            mandarTelegram: $mandarTelegram,
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
