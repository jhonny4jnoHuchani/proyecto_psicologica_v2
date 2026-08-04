<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        if ($user->hasRole('admin')) {
            return $this->dashboardAdmin();
        } elseif ($user->hasRole('docente')) {
            return $this->dashboardDocente($user);
        } elseif ($user->hasRole('estudiante')) {
            return $this->dashboardEstudiante($user);
        }

        return Inertia::render('dashboard');
    }

    private function dashboardAdmin(): Response
    {
        return Inertia::render('dashboard', [
            'rol' => 'admin',
            'stats' => [
                'gestiones_activas' => Gestion::where('estado', 'activo')->count(),
                'cursos_activos' => Curso::where('estado', 'activo')->count(),
                'total_docentes' => Docente::count(),
                'total_estudiantes' => Estudiante::count(),
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
                    ->withPivot('docente_id');
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
}