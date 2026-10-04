<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

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

        if (!$cursoMateria) {
            abort(403, 'No tienes permiso');
        }

        DB::table('curso_materia')
            ->where('id', $cursoMateriaId)
            ->update(['ayuda_ia_activa' => !$cursoMateria->ayuda_ia_activa]);

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

        if (!$cursoMateria) {
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