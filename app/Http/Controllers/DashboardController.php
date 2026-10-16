<?php

namespace App\Http\Controllers;

use App\Models\Calificacion;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Refuerzo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return $this->dashboardAdmin($request);
        } elseif ($user->hasRole('docente')) {
            return $this->dashboardDocente($user);
        } elseif ($user->hasRole('estudiante')) {
            return $this->dashboardEstudiante($user);
        }

        return Inertia::render('dashboard');
    }

    private function dashboardAdmin(Request $request): Response
    {
        $gestionId = $request->query('gestion_id');
        $gestiones = Gestion::orderBy('año', 'desc')->orderBy('etapa', 'desc')->get();

        $cursosQuery = Curso::query();
        $leccionesQuery = Leccion::query();
        $entregasQuery = Entrega::query();
        $calificacionesQuery = Calificacion::query();
        $refuerzosQuery = Refuerzo::query();

        if ($gestionId && $gestionId !== 'all') {
            $cursosQuery->where('gestion_id', $gestionId);
            $leccionesQuery->whereHas('curso', fn ($q) => $q->where('gestion_id', $gestionId));
            $entregasQuery->whereHas('leccion.curso', fn ($q) => $q->where('gestion_id', $gestionId));
            $calificacionesQuery->whereHas('entrega.leccion.curso', fn ($q) => $q->where('gestion_id', $gestionId));
            $refuerzosQuery->whereHas('leccion.curso', fn ($q) => $q->where('gestion_id', $gestionId));
        }

        $totalCalificaciones = (clone $calificacionesQuery)->count();
        $aprobados = (clone $calificacionesQuery)->where('nota', '>=', 70)->count();
        $reprobados = (clone $calificacionesQuery)->where('nota', '<', 70)->count();
        $promedioGeneral = $totalCalificaciones > 0 ? round((float) (clone $calificacionesQuery)->avg('nota'), 1) : 0;
        $tasaAprobacion = $totalCalificaciones > 0 ? round(($aprobados / $totalCalificaciones) * 100, 1) : 0;

        $totalEntregas = (clone $entregasQuery)->count();
        $entregasCalificadas = (clone $entregasQuery)->where('estado_calificacion', 'calificado')->count();
        $entregasPendientes = (clone $entregasQuery)->where('estado_calificacion', '!=', 'calificado')->count();

        $totalRefuerzos = (clone $refuerzosQuery)->count();
        $refuerzosCompletados = (clone $refuerzosQuery)->where('completado', true)->count();
        $refuerzosPendientes = (clone $refuerzosQuery)->where('completado', false)->count();

        $semaforo = $this->calcularSemaforoRezago($gestionId && $gestionId !== 'all' ? (int) $gestionId : null);

        return Inertia::render('dashboard', [
            'rol' => 'admin',
            'gestiones' => $gestiones,
            'filtro_gestion_id' => $gestionId ? (string) $gestionId : 'all',
            'semaforo' => $semaforo,
            'stats' => [
                'gestiones_activas' => Gestion::where('estado', 'activo')->count(),
                'cursos_activos' => (clone $cursosQuery)->where('estado', 'activo')->count(),
                'total_docentes' => Docente::count(),
                'total_estudiantes' => Estudiante::count(),
                'total_lecciones' => (clone $leccionesQuery)->count(),
                'total_entregas' => $totalEntregas,
                'entregas_calificadas' => $entregasCalificadas,
                'entregas_pendientes' => $entregasPendientes,
                'total_calificaciones' => $totalCalificaciones,
                'aprobados' => $aprobados,
                'reprobados' => $reprobados,
                'promedio_general' => $promedioGeneral,
                'tasa_aprobacion' => $tasaAprobacion,
                'total_refuerzos' => $totalRefuerzos,
                'refuerzos_completados' => $refuerzosCompletados,
                'refuerzos_pendientes' => $refuerzosPendientes,
            ],
        ]);
    }

    private function dashboardDocente($user): Response
    {
        $docente = Docente::where('user_id', $user->id)->first();

        $cursos = Curso::whereHas('materias', function ($query) use ($docente) {
            $query->where('curso_materia.docente_id', $docente?->id);
        })
            ->with([
                'gestion',
                'materias' => function ($query) use ($docente) {
                    $query->where('curso_materia.docente_id', $docente?->id)
                        ->withPivot('id', 'docente_id', 'ayuda_ia_activa', 'imagen');
                },
            ])
            ->get();

        $semaforo = $this->calcularSemaforoRezago(null, $docente?->id);

        return Inertia::render('dashboard', [
            'rol' => 'docente',
            'cursos' => $cursos,
            'semaforo' => $semaforo,
        ]);
    }

    /**
     * Calcula el Semáforo de Rezago Estudiantil para Alerta Temprana.
     * Rojo: Riesgo Alto (promedio < 51 o >= 2 reprobadas)
     * Amarillo: En Observación (promedio 51-69 o refuerzos pendientes)
     * Verde: Desempeño Favorable (promedio >= 70)
     */
    private function calcularSemaforoRezago(?int $gestionId = null, ?int $docenteId = null): array
    {
        $query = Estudiante::with([
            'user',
            'cursos.gestion',
            'entregas' => function ($q) use ($docenteId) {
                if ($docenteId) {
                    $q->whereHas('leccion', fn ($lq) => $lq->where('docente_id', $docenteId));
                }
                $q->with(['calificacion', 'refuerzo', 'leccion.materia']);
            },
        ]);

        if ($gestionId) {
            $query->whereHas('cursos', fn ($q) => $q->where('gestion_id', $gestionId));
        }

        if ($docenteId) {
            $query->whereHas('cursos.materias', fn ($q) => $q->where('curso_materia.docente_id', $docenteId));
        }

        $estudiantes = $query->get();

        $alto = [];
        $medio = [];
        $bajo = 0;

        foreach ($estudiantes as $estudiante) {
            $calificaciones = $estudiante->entregas->pluck('calificacion')->filter();
            $notas = $calificaciones->pluck('nota')->map(fn ($n) => (float) $n);
            $promedio = $notas->count() > 0 ? round($notas->avg(), 1) : null;
            $reprobadas = $notas->filter(fn ($n) => $n < 70)->count();
            $refuerzosPendientes = $estudiante->entregas->pluck('refuerzo')->filter()->where('completado', false)->count();

            $cursoInfo = $estudiante->cursos->first();
            $cursoStr = $cursoInfo ? "Paralelo {$cursoInfo->paralelo}" : 'Sin curso';

            $item = [
                'id' => $estudiante->id,
                'hash_id' => $estudiante->hash_id ?? (string) $estudiante->id,
                'nombre' => $estudiante->nombre_completo,
                'codigo' => $estudiante->user?->ci ?? "EST-{$estudiante->id}",
                'curso' => $cursoStr,
                'promedio' => $promedio,
                'tareas_reprobadas' => $reprobadas,
                'refuerzos_pendientes' => $refuerzosPendientes,
                'nivel' => 'bajo',
                'motivo' => 'Al día',
            ];

            if (($promedio !== null && $promedio < 51) || $reprobadas >= 2) {
                $item['nivel'] = 'alto';
                $item['motivo'] = $promedio !== null && $promedio < 51
                    ? "Promedio crítico ({$promedio}/100)"
                    : "{$reprobadas} tareas reprobadas";
                $alto[] = $item;
            } elseif (($promedio !== null && $promedio < 70) || $refuerzosPendientes > 0 || $reprobadas === 1) {
                $item['nivel'] = 'medio';
                $item['motivo'] = $refuerzosPendientes > 0
                    ? "{$refuerzosPendientes} refuerzo(s) pendiente(s)"
                    : ($promedio !== null ? "Promedio regular ({$promedio}/100)" : '1 tarea observada');
                $medio[] = $item;
            } else {
                $bajo++;
            }
        }

        // Ordenar estudiantes en riesgo por promedio ascendente
        usort($alto, fn ($a, $b) => ($a['promedio'] ?? 0) <=> ($b['promedio'] ?? 0));
        usort($medio, fn ($a, $b) => ($a['promedio'] ?? 0) <=> ($b['promedio'] ?? 0));

        return [
            'resumen' => [
                'alto' => count($alto),
                'medio' => count($medio),
                'bajo' => $bajo,
                'total' => count($estudiantes),
            ],
            'estudiantes_riesgo' => array_merge($alto, $medio),
        ];
    }

    private function dashboardEstudiante($user): Response
    {
        $estudiante = Estudiante::where('user_id', $user->id)->first();

        $cursos = $estudiante?->cursos()
            ->with(['gestion', 'materias'])
            ->get() ?? collect();

        return Inertia::render('dashboard', [
            'rol' => 'estudiante',
            'cursos' => $cursos,
        ]);
    }

    public function toggleIA($cursoMateriaId): RedirectResponse
    {

        $docente = Docente::where('user_id', Auth::id())->first();

        $cursoMateria = DB::table('curso_materia')
            ->where('id', $cursoMateriaId)
            ->where('docente_id', $docente->id)
            ->first();

        if (! $cursoMateria) {
            abort(403, 'No tienes permiso');
        }

        DB::table('curso_materia')
            ->where('id', $cursoMateriaId)
            ->update(['ayuda_ia_activa' => ! $cursoMateria->ayuda_ia_activa]);

        return back()->with('success', 'Preferencia IA actualizada.');
    }

    public function subirImagen(Request $request, $cursoMateriaId): RedirectResponse
    {
        $request->validate([
            'imagen' => 'required|image|max:2048',
        ]);

        $docente = Docente::where('user_id', Auth::id())->first();

        $cursoMateria = DB::table('curso_materia')
            ->where('id', $cursoMateriaId)
            ->where('docente_id', $docente->id)
            ->first();

        if (! $cursoMateria) {
            abort(403, 'No tienes permiso');
        }

        // Borrar imagen anterior si existe
        if ($cursoMateria->imagen) {
            Storage::disk('public')->delete($cursoMateria->imagen);
        }

        $ruta = $request->file('imagen')->store('curso-materia', 'public');

        DB::table('curso_materia')
            ->where('id', $cursoMateriaId)
            ->update(['imagen' => $ruta]);

        return back()->with('success', 'Imagen actualizada.');
    }
}
