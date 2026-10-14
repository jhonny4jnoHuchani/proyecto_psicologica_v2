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

        return Inertia::render('dashboard', [
            'rol' => 'admin',
            'gestiones' => $gestiones,
            'filtro_gestion_id' => $gestionId ? (string) $gestionId : 'all',
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

        return Inertia::render('dashboard', [
            'rol' => 'docente',
            'cursos' => $cursos,
        ]);
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
