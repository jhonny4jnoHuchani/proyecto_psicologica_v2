<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\Tema;
use App\Services\MachineLearningService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeccionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $cursoId = $request->query('curso_id');
        $materiaId = $request->query('materia_id');

        $estudianteId = $user->hasRole('estudiante') ? $user->estudiante?->id : null;

        $lecciones = Leccion::with([
            'materia',
            'temario',
            'docente.user',
            'curso.gestion',
            'entregas' => function ($q) use ($estudianteId) {
                if ($estudianteId) {
                    $q->where('estudiante_id', $estudianteId)->with(['calificacion', 'refuerzo']);
                }
            },
        ])
            ->when($cursoId, fn ($q) => $q->where('curso_id', $cursoId))
            ->when($materiaId, fn ($q) => $q->where('materia_id', $materiaId))
            ->when($user->hasRole('docente'), function ($q) use ($user) {
                $docente = Docente::where('user_id', $user->id)->first();
                if ($docente) {
                    $q->where('docente_id', $docente->id);
                }
            })
            ->when($user->hasRole('estudiante'), function ($q) use ($user) {
                $estudiante = $user->estudiante;
                $cursoIds = $estudiante?->cursos()->pluck('cursos.id') ?? collect();
                $q->whereIn('curso_id', $cursoIds)
                    ->where('estado', 'activo');
            })
            ->orderBy('created_at', 'desc')
            ->get();

        if ($user->hasRole('docente')) {
            $docente = Docente::where('user_id', $user->id)->first();
            $cursos = Curso::whereHas('materias', fn ($q) => $q->where('curso_materia.docente_id', $docente?->id))
                ->with('gestion')->get();
            $materias = Materia::whereHas('cursos', fn ($q) => $q->where('curso_materia.docente_id', $docente?->id))->get();
            $temas = Tema::orderBy('materia_id')->orderBy('orden')->get();
        } elseif ($user->hasRole('estudiante')) {
            $estudiante = $user->estudiante;
            $cursos = $estudiante?->cursos()->with('gestion')->get() ?? collect();
            $materias = Materia::whereHas('cursos.estudiantes', fn ($q) => $q->where('estudiante_id', $estudiante?->id))->get();
            $cursoIds = $cursos->pluck('id');
            $temas = Tema::whereHas('lecciones', function ($q) use ($cursoIds) {
                $q->whereIn('curso_id', $cursoIds)->where('estado', 'activo');
            })->orderBy('materia_id')->orderBy('orden')->get();
        } else {
            $cursos = Curso::with('gestion')->get();
            $materias = Materia::all();
            $temas = Tema::orderBy('materia_id')->orderBy('orden')->get();
        }

        return Inertia::render('lecciones/index', [
            'lecciones' => $lecciones,
            'cursos' => $cursos,
            'materias' => $materias,
            'temas' => $temas,
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
            'tema_id' => 'nullable|exists:temas,id',
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
            'tema_id' => $request->tema_id,
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
            'tema_id' => 'nullable|exists:temas,id',
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

    public function show(Request $request, Leccion $leccion, MachineLearningService $mlService): Response|RedirectResponse
    {
        if (is_numeric($request->route()->originalParameter('leccion'))) {
            return redirect()->to(route('lecciones.show', $leccion));
        }

        $user = Auth::user();

        // 1. Cargamos la lección con sus relaciones
        $leccion->load(['materia', 'temario', 'docente.user', 'curso.gestion']);
        $entrega = null;
        if ($user->hasRole('estudiante')) {
            $estudiante = Estudiante::where('user_id', $user->id)->first();
            $entrega = Entrega::with(['calificacion', 'refuerzo'])
                ->where('leccion_id', $leccion->id)
                ->where('estudiante_id', $estudiante?->id)
                ->first();
        }

        // 2. Lógica del Machine Learning
        $prediccion_ml = null;
        $tema_siguiente = null;
        $paginas_siguiente = null;

        if ($entrega && $entrega->calificacion) {

            // Forzamos a que sea un número entero (65 en vez de "65.00")
            $notaActual = (int) round($entrega->calificacion->nota);

            // Buscar el siguiente tema (con un orden mayor al actual)
            $ordenActual = $leccion->temario ? $leccion->temario->orden : 0;

            $temaSiguienteObj = Tema::where('materia_id', $leccion->materia_id)
                ->where('orden', '>', $ordenActual)
                ->where('estado', '!=', 'omitido')
                ->orderBy('orden', 'asc')
                ->first();

            if ($temaSiguienteObj) {
                $tema_siguiente = $temaSiguienteObj->nombre;
                $paginas_siguiente = $temaSiguienteObj->paginas_libro;

                // Llamamos a Python
                $prediccion_ml = $mlService->getPrediccion(
                    $leccion->materia_id,
                    $notaActual // <-- Aquí enviamos el entero (ej: 65)
                );
            }
        }

        // --- DEBUG TEMPORAL ---
        // Descomenta esta línea si sigue saliendo 0. Te mostrará qué está pasando exactamente.
        // dd($prediccion_ml, $notaActual, $temaSiguienteObj);
        // ----------------------

        return Inertia::render('lecciones/show', [
            'leccion' => $leccion,
            'entrega' => $entrega,
            'rol' => $user->roles->first()?->name,
            'prediccion_ml' => $prediccion_ml,
            'tema_siguiente' => $tema_siguiente,
            'paginas_siguiente' => $paginas_siguiente,
        ]);
    }

    public function entregas(Request $request, Leccion $leccion): RedirectResponse
    {
        return redirect()->route('entregas.docente', ['leccion_id' => $leccion->id]);
    }
}
