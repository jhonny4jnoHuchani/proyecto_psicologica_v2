<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'celular' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email',
            'colegio_procedencia' => 'nullable|string|max:150',
            'tipo_inscripcion' => 'nullable|in:regular,dispensacion,cursillo',
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
            'tipo_inscripcion' => $request->tipo_inscripcion,
        ]);

        // Inscribir al curso
        $estudiante->cursos()->attach($request->curso_id, [
            'fecha_inscripcion' => now(),
            'estado' => 'activo',
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
            'celular' => 'required|string|max:20',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($estudiante->user_id)],
            'password' => 'nullable|string|min:8',
            'colegio_procedencia' => 'nullable|string|max:150',
            'tipo_inscripcion' => 'nullable|in:regular,dispensacion,cursillo',
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
            'tipo_inscripcion' => $request->tipo_inscripcion,
        ]);

        // Sincronizar curso (reemplaza el anterior)
        $estudiante->cursos()->sync([
            $request->curso_id => [
                'fecha_inscripcion' => now(),
                'estado' => 'activo',
            ]
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
        $nuevaPassword = strtolower($user->apellido_paterno . '_' . $user->ci);
        $user->update(['password' => bcrypt($nuevaPassword)]);

        return redirect()->route('estudiantes.index')
            ->with('success', "Contraseña reseteada: {$nuevaPassword}");
    }
}