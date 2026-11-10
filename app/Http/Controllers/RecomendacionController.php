<?php

namespace App\Http\Controllers;

use App\Models\Calificacion;
use App\Models\Tema;
use App\Services\MachineLearningService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RecomendacionController extends Controller
{
    /**
     * Muestra las recomendaciones predictivas basadas en el historial
     * de calificaciones y temas del temario para el estudiante logueado.
     */
    public function index(MachineLearningService $mlService): Response
    {
        // ═══════════════════════════════════════════════════════════
        // 1. OBTENER EL ESTUDIANTE LOGUEADO
        // ═══════════════════════════════════════════════════════════
        $user = auth()->user();
        $estudiante = $user?->estudiante;

        // Si no tiene perfil de estudiante (ej: es admin o docente)
        if (! $estudiante) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'No tienes un perfil de estudiante asociado a esta cuenta.',
            ]);
        }

        // ═══════════════════════════════════════════════════════════
        // 2. BUSCAR CALIFICACIONES REALES AGRUPADAS POR TEMA
        //    (Solo lecciones con tema_id válido y notas asignadas)
        // ═══════════════════════════════════════════════════════════
        $calificacionesPorTema = Calificacion::query()
            ->join('entregas', 'calificaciones.entrega_id', '=', 'entregas.id')
            ->join('lecciones', 'entregas.leccion_id', '=', 'lecciones.id')
            ->where('entregas.estudiante_id', $estudiante->id)
            ->whereNotNull('calificaciones.nota')
            ->whereNotNull('lecciones.tema_id')
            ->select(
                'lecciones.tema_id',
                DB::raw('AVG(calificaciones.nota) as promedio'),
                DB::raw('COUNT(calificaciones.id) as cantidad_tareas')
            )
            ->groupBy('lecciones.tema_id')
            ->get();

        // Si aún no tiene ninguna calificación con tema asignado
        if ($calificacionesPorTema->isEmpty()) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'Aún no tienes calificaciones registradas en los temas del temario. El asistente te ayudará cuando el docente califique tu primera tarea. 📚',
            ]);
        }

        $temaIds = $calificacionesPorTema->pluck('tema_id')->filter()->unique();

        if ($temaIds->isEmpty()) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'Aún no tienes calificaciones vinculadas a temas activos. 📚',
            ]);
        }

        // ═══════════════════════════════════════════════════════════
        // 3. IDENTIFICAR EL TEMA MÁS RECIENTE EVALUADO
        //    (El de mayor "orden" dentro de su materia)
        // ═══════════════════════════════════════════════════════════
        $temaActual = Tema::whereIn('id', $temaIds)
            ->with('materia')
            ->orderBy('orden', 'desc')
            ->first();

        // Si no se encuentra ningún tema activo
        if (! $temaActual) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'No se encontraron temas activos correspondientes a tus evaluaciones actuales. 📚',
            ]);
        }

        // Promedio real del estudiante en ese tema
        $registroTema = $calificacionesPorTema
            ->firstWhere('tema_id', $temaActual->id);

        if (! $registroTema || $registroTema->promedio === null) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'Aún no se ha consolidado el promedio de notas para este tema.',
            ]);
        }

        $notaEntera = (int) round((float) $registroTema->promedio);

        // ═══════════════════════════════════════════════════════════
        // 4. BUSCAR EL SIGUIENTE TEMA (el que viene en el temario)
        // ═══════════════════════════════════════════════════════════
        $temaSiguiente = Tema::where('materia_id', $temaActual->materia_id)
            ->where('orden', '>', $temaActual->orden)
            ->where('estado', '!=', 'omitido') // Ignorar temas saltados
            ->orderBy('orden', 'asc')
            ->first();

        // Si ya completó todos los temas de esa materia o no hay temas siguientes
        if (! $temaSiguiente) {
            $materiaNombre = $temaActual->materia?->nombre ?? 'la materia';

            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => "¡Felicidades! Has completado las evaluaciones disponibles para {$materiaNombre}. 🎓",
            ]);
        }

        // ═══════════════════════════════════════════════════════════
        // 5. LLAMAR AL ML PREDICTIVO (Python o fallback)
        // ═══════════════════════════════════════════════════════════
        $prediccion = $mlService->getPrediccion(
            $temaActual->materia_id,
            $notaEntera
        );

        // ═══════════════════════════════════════════════════════════
        // 6. ENVIAR TODO A REACT
        // ═══════════════════════════════════════════════════════════
        return Inertia::render('Recomendaciones/Index', [
            'sin_datos' => false,

            // Datos del estudiante
            'estudiante_nombre' => trim($user->nombre.' '.($user->apellido_paterno ?? '')),

            // Datos del tema actual (ya evaluado)
            'materia_nombre' => $temaActual->materia?->nombre ?? 'Materia',
            'tema_actual_nombre' => $temaActual->nombre,
            'nota_actual' => $notaEntera,

            // Datos del siguiente tema (predicción)
            'tema_siguiente' => $temaSiguiente->nombre,
            'paginas_siguiente' => $temaSiguiente->paginas_libro ?? 'las lecturas asignadas',

            // Predicción del ML
            'prediccion' => $prediccion,
        ]);
    }
}
