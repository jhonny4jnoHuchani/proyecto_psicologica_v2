<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Gestion;
use App\Models\Materia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CursoController extends Controller
{
    public function index(): Response
    {
        $cursos = Curso::with(['gestion', 'materias', 'estudiantes'])
            ->orderBy('created_at', 'desc')
            ->get();

        $gestions = Gestion::where('estado', 'activo')->orderBy('año', 'desc')->get();
        $materias = Materia::orderBy('nombre')->get();
        $docentes = Docente::with('user')->orderBy('created_at', 'desc')->get();
        
        $docentesOcupados = DB::table('curso_materia')
            ->join('cursos', 'curso_materia.curso_id', '=', 'cursos.id')
            ->join('materias', 'curso_materia.materia_id', '=', 'materias.id')
            ->whereNull('cursos.deleted_at')
            ->select('curso_materia.docente_id', 'curso_materia.materia_id', 'cursos.paralelo', 'materias.nombre as materia_nombre')
            ->get();

        return Inertia::render('cursos/index', [
            'cursos' => $cursos,
            'gestions' => $gestions,
            'materias' => $materias,
            'docentes' => $docentes,
            'docentesOcupados' => $docentesOcupados,
        ]);
    }
    /**
     * Mostrar formulario de creación.
     */
    public function create(): Response
    {
        $gestions = Gestion::where('estado', 'activo')->orderBy('año', 'desc')->get();
        $materias = Materia::orderBy('nombre')->get();
        $docentes = Docente::with('user')->orderBy('created_at', 'desc')->get();
        
        $docentesOcupados = DB::table('curso_materia')
            ->join('cursos', 'curso_materia.curso_id', '=', 'cursos.id')
            ->join('materias', 'curso_materia.materia_id', '=', 'materias.id')
            ->whereNull('cursos.deleted_at')
            ->select('curso_materia.docente_id', 'curso_materia.materia_id', 'cursos.paralelo', 'materias.nombre as materia_nombre')
            ->get();

        return Inertia::render('cursos/index', [  // ← index, no create (usamos modales)
            'gestions' => $gestions,
            'materias' => $materias,
            'docentes' => $docentes,
            'docentesOcupados' => $docentesOcupados,
        ]);
    }

    /**
     * Guardar nuevo curso con sus materias y docentes.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'gestion_id' => 'required|exists:gestions,id',
            'paralelo' => 'required|string|max:10',
            'turno' => ['required', Rule::in(['mañana', 'tarde', 'noche'])],
            'cupos' => 'required|integer|min:1|max:100',
            'materias' => 'required|array|min:1',
            'materias.*.materia_id' => 'required|exists:materias,id',
            'materias.*.docente_id' => 'nullable|exists:docentes,id',
        ]);

        // Crear curso
        $curso = Curso::create([
            'gestion_id' => $request->gestion_id,
            'paralelo' => $request->paralelo,
            'turno' => $request->turno,
            'cupos' => $request->cupos,
            'estado' => 'activo',
        ]);

        // Asignar materias con docentes
        foreach ($request->materias as $materia) {
            $curso->materias()->attach($materia['materia_id'], [
                'docente_id' => $materia['docente_id'] ?? null,
            ]);
        }

        return redirect()->route('cursos.index')
            ->with('success', 'Curso creado exitosamente.');
    }

    /**
     * Mostrar detalle de un curso.
     */
    public function show(Curso $curso): Response
    {
        $docentes = Docente::with('user')->get()->keyBy('id');

        return Inertia::render('cursos/show', [
            'curso' => $curso->load([
                'gestion',
                'materias' => function ($query) {
                    $query->withPivot('docente_id');
                },
                'estudiantes.user',
            ]),
            'docentes' => $docentes,
        ]);
    }

    /**
     * Mostrar formulario de edición.
     */
    public function edit(Curso $curso): Response
    {
        $gestions = Gestion::orderBy('año', 'desc')->get();
        $materias = Materia::orderBy('nombre')->get();
        $docentes = Docente::with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('cursos/edit', [
            'curso' => $curso->load(['materias' => function ($query) {
                $query->withPivot('docente_id');
            }]),
            'gestions' => $gestions,
            'materias' => $materias,
            'docentes' => $docentes,
        ]);
    }

    /**
     * Actualizar curso.
     */
    public function update(Request $request, Curso $curso): RedirectResponse
    {
        $request->validate([
            'gestion_id' => 'required|exists:gestions,id',
            'paralelo' => 'required|string|max:10',
            'turno' => ['required', Rule::in(['mañana', 'tarde', 'noche'])],
            'cupos' => 'required|integer|min:1|max:100',
            'estado' => ['required', Rule::in(['activo', 'inactivo', 'completado'])],
            'materias' => 'required|array|min:1',
            'materias.*.materia_id' => 'required|exists:materias,id',
            'materias.*.docente_id' => 'nullable|exists:docentes,id',
        ]);

        // Actualizar curso
        $curso->update([
            'gestion_id' => $request->gestion_id,
            'paralelo' => $request->paralelo,
            'turno' => $request->turno,
            'cupos' => $request->cupos,
            'estado' => $request->estado,
        ]);

        // Sincronizar materias con docentes
        $syncData = [];
        foreach ($request->materias as $materia) {
            $syncData[$materia['materia_id']] = [
                'docente_id' => $materia['docente_id'] ?? null,
            ];
        }
        $curso->materias()->sync($syncData);

        return redirect()->route('cursos.index')
            ->with('success', 'Curso actualizado exitosamente.');
    }

    /**
     * Eliminar curso (soft delete).
     */
    public function destroy(Curso $curso): RedirectResponse
    {
        $curso->delete();

        return redirect()->route('cursos.index')
            ->with('success', 'Curso desactivado exitosamente.');
    }



    
    /**
     * Mostrar cursos eliminados.
     */
    public function trashed(): Response
    {
        $cursos = Curso::onlyTrashed()
            ->with('gestion')
            ->orderBy('deleted_at', 'desc')
            ->get();

        return Inertia::render('cursos/eliminados', [
            'cursos' => $cursos,
        ]);
    }

    /**
     * Restaurar curso eliminado.
     */
    public function restore($id): RedirectResponse
    {
        Curso::onlyTrashed()->findOrFail($id)->restore();

        return redirect()->route('cursos.trashed')
            ->with('success', 'Curso restaurado exitosamente.');
    }
}