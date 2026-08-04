<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Leccion;
use App\Models\Materia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Estudiante;
use App\Models\Entrega;


class LeccionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $cursoId = $request->query('curso_id');
        $materiaId = $request->query('materia_id');

        $lecciones = Leccion::with(['materia', 'docente.user', 'curso'])
            ->when($cursoId, fn($q) => $q->where('curso_id', $cursoId))
            ->when($materiaId, fn($q) => $q->where('materia_id', $materiaId))
            ->when($user->hasRole('docente'), function ($q) use ($user) {
                $docente = Docente::where('user_id', $user->id)->first();
                if ($docente) $q->where('docente_id', $docente->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Cursos del docente o estudiante
        if ($user->hasRole('docente')) {
            $docente = Docente::where('user_id', $user->id)->first();
            $cursos = Curso::whereHas('materias', fn($q) => $q->where('curso_materia.docente_id', $docente?->id))
                ->with('gestion')->get();
            $materias = Materia::whereHas('cursos', fn($q) => $q->where('curso_materia.docente_id', $docente?->id))->get();
        } elseif ($user->hasRole('estudiante')) {
            $estudiante = $user->estudiante;
            $cursos = $estudiante?->cursos()->with('gestion')->get() ?? collect();
            $materias = Materia::whereHas('cursos.estudiantes', fn($q) => $q->where('estudiante_id', $estudiante?->id))->get();
        } else {
            $cursos = Curso::with('gestion')->get();
            $materias = Materia::all();
        }

        $docentes = Docente::with('user')->get();

        return Inertia::render('lecciones/index', [
            'lecciones' => $lecciones,
            'cursos' => $cursos,
            'materias' => $materias,
            'docentes' => $docentes,
            'filtros' => [
                'curso_id' => $cursoId ? (int) $cursoId : null,
                'materia_id' => $materiaId ? (int) $materiaId : null,
            ],
            'rol' => $user->roles->first()?->name,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'materia_id' => 'required|exists:materias,id',
            'titulo' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'fecha_programada' => 'nullable|date',
            'fecha_entrega' => 'nullable|date',
            'imagen' => 'nullable|string|max:255',
        ]);

        $docente = Docente::where('user_id', Auth::id())->first();

        Leccion::create([
            'curso_id' => $request->curso_id,
            'materia_id' => $request->materia_id,
            'docente_id' => $docente->id,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'fecha_programada' => $request->fecha_programada,
            'fecha_entrega' => $request->fecha_entrega,
            'imagen' => $request->imagen,
            'estado' => 'activo',
        ]);

        return back()->with('success', 'Lección creada exitosamente.');
    }

    public function update(Request $request, Leccion $leccion): RedirectResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'fecha_programada' => 'nullable|date',
            'fecha_entrega' => 'nullable|date',
            'imagen' => 'nullable|string|max:255',
            'estado' => ['required', Rule::in(['activo', 'inactivo'])],
        ]);

        $leccion->update($request->all());

        return back()->with('success', 'Lección actualizada.');
    }

    public function destroy(Leccion $leccion): RedirectResponse
    {
        $leccion->delete();
        return back()->with('success', 'Lección eliminada.');
    }

    /**
     * Mostrar detalle de una lección (para estudiantes: ver y entregar).
     */
    public function show(Leccion $leccion): Response
    {
        $user = Auth::user();
        
        // Buscar si el estudiante ya tiene una entrega para esta lección
        $entrega = null;
        if ($user->hasRole('estudiante')) {
            $estudiante = Estudiante::where('user_id', $user->id)->first();
            $entrega = Entrega::with('calificacion')
                ->where('leccion_id', $leccion->id)
                ->where('estudiante_id', $estudiante?->id)
                ->first();
        }

        return Inertia::render('lecciones/show', [
            'leccion' => $leccion->load(['materia', 'docente.user', 'curso.gestion']),
            'entrega' => $entrega,
            'rol' => $user->roles->first()?->name,
        ]);
    }

    /**
     * Docente: Ver entregas de una lección para calificar.
     */
    public function entregas(Leccion $leccion): Response
    {
        $entregas = Entrega::with(['estudiante.user', 'calificacion'])
            ->where('leccion_id', $leccion->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Estudiantes que NO entregaron
        $estudiantesSinEntregar = Estudiante::whereHas('cursos', function ($q) use ($leccion) {
            $q->where('curso_id', $leccion->curso_id);
        })
        ->whereDoesntHave('entregas', function ($q) use ($leccion) {
            $q->where('leccion_id', $leccion->id);
        })
        ->with('user')
        ->get();

        return Inertia::render('lecciones/entregas', [
            'leccion' => $leccion->load(['materia', 'docente.user', 'curso.gestion']),
            'entregas' => $entregas,
            'estudiantesSinEntregar' => $estudiantesSinEntregar,
        ]);
    }
}