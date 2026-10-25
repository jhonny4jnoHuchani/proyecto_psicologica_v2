<?php

namespace App\Http\Controllers;

use App\Models\Calificacion;
use App\Models\Tema;
use App\Services\MachineLearningService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RecomendacionController extends Controller
{
    /**
     * Muestra las recomendaciones inteligentes basadas en el historial
     * REAL del estudiante logueado.
     */
    public function index(MachineLearningService $mlService)
    {
        // ══════════════════════════════════════════════════════════
        // 1. OBTENER EL ESTUDIANTE LOGUEADO
        // ═══════════════════════════════════════════════════════════
        $user = auth()->user();
        $estudiante = $user->estudiante;

        // Si no tiene perfil de estudiante (ej: es admin o docente)
        if (! $estudiante) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'No tienes un perfil de estudiante asociado a esta cuenta.',
            ]);
        }

        // ═══════════════════════════════════════════════════════════
        // 2. BUSCAR CALIFICACIONES REALES AGRUPADAS POR TEMA
        //    (Calcula el promedio de notas por cada tema evaluado)
        // ═══════════════════════════════════════════════════════════
        $calificacionesPorTema = Calificacion::query()
            ->join('entregas', 'calificaciones.entrega_id', '=', 'entregas.id')
            ->join('lecciones', 'entregas.leccion_id', '=', 'lecciones.id')
            ->where('entregas.estudiante_id', $estudiante->id)
            ->whereNotNull('calificaciones.nota')
            ->select(
                'lecciones.tema_id',
                DB::raw('AVG(calificaciones.nota) as promedio'),
                DB::raw('COUNT(calificaciones.id) as cantidad_tareas')
            )
            ->groupBy('lecciones.tema_id')
            ->get();

        // Si aún no tiene ninguna calificación
        if ($calificacionesPorTema->isEmpty()) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => 'Aún no tienes calificaciones. El asistente te ayudará cuando el docente califique tu primera tarea. 📚',
            ]);
        }

        // ═══════════════════════════════════════════════════════════
        // 3. IDENTIFICAR EL TEMA MÁS RECIENTE EVALUADO
        //    (El de mayor "orden" dentro de su materia)
        // ═══════════════════════════════════════════════════════════
        $temaActual = Tema::whereIn('id', $calificacionesPorTema->pluck('tema_id'))
            ->with('materia')
            ->orderBy('orden', 'desc')
            ->first();

        // Promedio real del estudiante en ese tema
        $promedioTemaActual = $calificacionesPorTema
            ->where('tema_id', $temaActual->id)
            ->first()->promedio;

        // 🌟 CORRECCIÓN: Convertimos el promedio a un número ENTERO para Python
        $notaEntera = (int) round($promedioTemaActual);

        // ═══════════════════════════════════════════════════════════
        // 4. BUSCAR EL SIGUIENTE TEMA (el que viene en el temario)
        // ═══════════════════════════════════════════════════════════
        $temaSiguiente = Tema::where('materia_id', $temaActual->materia_id)
            ->where('orden', $temaActual->orden + 1)
            ->where('estado', '!=', 'omitido') // Ignorar temas saltados
            ->first();

        // Si ya completó todos los temas de esa materia
        if (! $temaSiguiente) {
            return Inertia::render('Recomendaciones/Index', [
                'sin_datos' => true,
                'mensaje' => "¡Felicidades! Has completado todos los temas de {$temaActual->materia->nombre}. 🎓",
            ]);
        }

        // ═══════════════════════════════════════════════════════════
        // 5. LLAMAR AL ML PREDICTIVO (Python en puerto 5000)
        // ═══════════════════════════════════════════════════════════
        $prediccion = $mlService->getPrediccion(
            $temaActual->materia_id,
            $notaEntera // <--- AHORA ENVÍA 65 (ENTERO)
        );

        // ═══════════════════════════════════════════════════════════
        // 6. ENVIAR TODO A REACT
        // ═══════════════════════════════════════════════════════════
        return Inertia::render('Recomendaciones/Index', [
            'sin_datos' => false,

            // Datos del estudiante
            'estudiante_nombre' => $user->nombre.' '.$user->apellido_paterno,

            // Datos del tema actual (ya evaluado)
            'materia_nombre' => $temaActual->materia->nombre,
            'tema_actual_nombre' => $temaActual->nombre,
            'nota_actual' => $notaEntera, // <--- También usamos el entero para mostrarlo limpio

            // Datos del siguiente tema (predicción)
            'tema_siguiente' => $temaSiguiente->nombre,
            'paginas_siguiente' => $temaSiguiente->paginas_libro,

            // Predicción del ML
            'prediccion' => $prediccion,
        ]);
    }
}
