<?php

namespace App\Http\Controllers;

use App\Models\CredencialTemporal;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EstudianteController extends Controller
{
    public function index(): Response
    {
        $estudiantes = Estudiante::with(['user', 'cursos.gestion'])
            ->orderBy('created_at', 'desc')
            ->get();

        $cursos = Curso::with('gestion')
            ->where('estado', 'activo')
            ->withCount('estudiantes')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('estudiantes/index', [
            'estudiantes' => $estudiantes,
            'cursos' => $cursos,
        ]);
    }

    /**
     * Vista del Docente: Listado de solo lectura de sus estudiantes inscritos en sus materias/cursos.
     */
    public function docenteIndex(Request $request): Response
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->first();

        // En caso de que un administrador acceda para supervisión o pruebas
        if (! $docente && $user->hasRole('admin')) {
            $docenteId = $request->query('docente_id');
            $docente = $docenteId ? Docente::find($docenteId) : Docente::first();
        }

        if ($docente) {
            $cursos = Curso::whereHas('materias', function ($q) use ($docente) {
                $q->where('curso_materia.docente_id', $docente->id);
            })
                ->with([
                    'gestion',
                    'materias' => function ($q) use ($docente) {
                        $q->where('curso_materia.docente_id', $docente->id);
                    },
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            $materias = Materia::whereHas('cursos', function ($q) use ($docente) {
                $q->where('curso_materia.docente_id', $docente->id);
            })
                ->orderBy('nombre')
                ->get();
        } elseif ($user->hasRole('admin')) {
            $cursos = Curso::with(['gestion', 'materias'])->orderBy('created_at', 'desc')->get();
            $materias = Materia::orderBy('nombre')->get();
        } else {
            $cursos = collect();
            $materias = collect();
        }

        $cursoId = $request->query('curso_id');
        $materiaId = $request->query('materia_id');
        $estado = $request->query('estado');
        $buscar = $request->query('buscar');

        $docenteCursoIds = $cursos->pluck('id')->all();

        // Filtrar por materia si fue especificada
        if ($materiaId) {
            $materiaCursoIds = DB::table('curso_materia')
                ->when($docente, fn ($q) => $q->where('docente_id', $docente->id))
                ->where('materia_id', $materiaId)
                ->pluck('curso_id')
                ->all();

            $allowedCursoIds = array_values(array_intersect($docenteCursoIds, $materiaCursoIds));
        } else {
            $allowedCursoIds = $docenteCursoIds;
        }

        // Filtrar por curso_id si fue seleccionado y pertenece a los cursos permitidos
        if ($cursoId && in_array((int) $cursoId, $allowedCursoIds, true)) {
            $targetCursoIds = [(int) $cursoId];
        } else {
            $targetCursoIds = $allowedCursoIds;
        }

        if (empty($targetCursoIds)) {
            $estudiantes = collect();
        } else {
            $query = Estudiante::query()
                ->whereHas('cursos', function ($q) use ($targetCursoIds, $estado) {
                    $q->whereIn('cursos.id', $targetCursoIds);
                    if ($estado) {
                        $q->where('curso_estudiante.estado', $estado);
                    }
                })
                ->with([
                    'user',
                    'cursos' => function ($q) use ($docenteCursoIds, $docente) {
                        $q->whereIn('cursos.id', $docenteCursoIds)
                            ->with([
                                'gestion',
                                'materias' => function ($mq) use ($docente) {
                                    if ($docente) {
                                        $mq->where('curso_materia.docente_id', $docente->id);
                                    }
                                },
                            ])
                            ->withPivot('fecha_inscripcion', 'estado');
                    },
                ]);

            if ($buscar) {
                $buscar = trim($buscar);
                $query->whereHas('user', function ($uq) use ($buscar) {
                    $uq->where(function ($inner) use ($buscar) {
                        $inner->where('nombre', 'like', "%{$buscar}%")
                            ->orWhere('apellido_paterno', 'like', "%{$buscar}%")
                            ->orWhere('apellido_materno', 'like', "%{$buscar}%")
                            ->orWhere('ci', 'like', "%{$buscar}%")
                            ->orWhere('email', 'like', "%{$buscar}%");
                    });
                });
            }

            $estudiantes = $query->orderBy('id', 'desc')->get();
        }

        return Inertia::render('estudiantes/docente', [
            'docente' => $docente ? $docente->load('user') : null,
            'estudiantes' => $estudiantes,
            'cursos' => $cursos,
            'materias' => $materias,
            'filtros' => [
                'curso_id' => $cursoId ? (int) $cursoId : null,
                'materia_id' => $materiaId ? (int) $materiaId : null,
                'estado' => $estado ?: null,
                'buscar' => $buscar ?: '',
            ],
            'stats' => [
                'total_estudiantes' => $estudiantes->count(),
                'total_cursos' => $cursos->count(),
                'total_materias' => $materias->count(),
            ],
        ]);
    }

    public function trashed(): Response
    {
        $estudiantes = Estudiante::onlyTrashed()
            ->with('user')
            ->orderBy('deleted_at', 'desc')
            ->get();

        return Inertia::render('estudiantes/eliminados', [
            'estudiantes' => $estudiantes,
        ]);
    }

    public function show(Estudiante $estudiante): Response
    {
        return Inertia::render('estudiantes/show', [
            'estudiante' => $estudiante->load(['user', 'cursos.gestion']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'required|string|max:100',
            'ci' => 'required|string|max:20|unique:users,ci',
            'expedido' => 'nullable|string|max:10',
            'celular' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email',
            'colegio_procedencia' => 'nullable|string|max:150',
            'tipo_inscripcion' => 'nullable|in:preuniversitario,regular,dispensacion,cursillo',
            'genero' => 'nullable|in:M,F,Otro',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:255',
            'curso_id' => 'required|exists:cursos,id',  // ← NUEVO
        ]);

        $password = Str::random(10);

        $user = User::create([
            'nombre' => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'ci' => $request->ci,
            'expedido' => $request->expedido,
            'celular' => $request->celular,
            'email' => $request->email,
            'password' => bcrypt($password),
            'genero' => $request->genero,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'direccion' => $request->direccion,
        ]);

        $estudiante = Estudiante::create([
            'user_id' => $user->id,
            'colegio_procedencia' => $request->colegio_procedencia,
            'tipo_inscripcion' => 'preuniversitario',
        ]);

        // Inscribir al curso
        $estudiante->cursos()->attach($request->curso_id, [
            'fecha_inscripcion' => now(),
            'estado' => 'activo',
        ]);

        // Asignar rol de estudiante
        $user->assignRole('estudiante');

        // ' Guardar credencial temporal para Telegram
        CredencialTemporal::create([
            'user_id' => $user->id,
            'password_temporal' => $password,
        ]);

        return redirect()->route('estudiantes.index')
            ->with('success', "Estudiante creado e inscrito. Contraseña: {$password}");

    }

    public function update(Request $request, Estudiante $estudiante): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'required|string|max:100',
            'ci' => ['required', 'string', 'max:20', Rule::unique('users', 'ci')->ignore($estudiante->user_id)],
            'expedido' => 'nullable|string|max:10',
            'celular' => 'required|string|max:20',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($estudiante->user_id)],
            'password' => 'nullable|string|min:8',
            'colegio_procedencia' => 'nullable|string|max:150',
            'tipo_inscripcion' => 'nullable|in:preuniversitario,regular,dispensacion,cursillo',
            'genero' => 'nullable|in:M,F,Otro',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:255',
            'curso_id' => 'required|exists:cursos,id',  // ← NUEVO
        ]);

        $userData = [
            'nombre' => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'ci' => $request->ci,
            'expedido' => $request->expedido,
            'celular' => $request->celular,
            'email' => $request->email,
            'genero' => $request->genero,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'direccion' => $request->direccion,
        ];

        if ($request->filled('password')) {
            $userData['password'] = bcrypt($request->password);
        }

        $estudiante->user->update($userData);
        $estudiante->update([
            'colegio_procedencia' => $request->colegio_procedencia,
            'tipo_inscripcion' => 'preuniversitario',
        ]);

        // Sincronizar curso (reemplaza el anterior)
        $estudiante->cursos()->sync([
            $request->curso_id => [
                'fecha_inscripcion' => now(),
                'estado' => 'activo',
            ],
        ]);

        return redirect()->route('estudiantes.index')
            ->with('success', 'Estudiante actualizado.');
    }

    public function destroy(Estudiante $estudiante): RedirectResponse
    {
        $estudiante->delete();

        return redirect()->route('estudiantes.index')
            ->with('success', 'Estudiante desactivado.');
    }

    public function restore($id): RedirectResponse
    {
        $estudiante = Estudiante::onlyTrashed()->findOrFail($id);
        $estudiante->restore();

        return redirect()->route('estudiantes.trashed')
            ->with('success', 'Estudiante restaurado.');
    }

    public function resetPassword(Estudiante $estudiante): RedirectResponse
    {
        $user = $estudiante->user;
        $nuevaPassword = strtolower($user->apellido_paterno.'_'.$user->ci);
        $user->update(['password' => bcrypt($nuevaPassword)]);

        return redirect()->route('estudiantes.index')
            ->with('success', "Contraseña reseteada: {$nuevaPassword}");
    }
}
