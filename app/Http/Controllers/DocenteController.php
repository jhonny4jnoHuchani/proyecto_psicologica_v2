<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocenteController extends Controller
{
    /**
     * Mostrar lista de docentes (resumida).
     */
    public function index(): Response
    {
        $docentes = Docente::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('docentes/index', [
            'docentes' => $docentes,
        ]);
    }

    /**
     * Mostrar detalle de un docente.
     */
    public function show(Docente $docente): Response
    {
        return Inertia::render('docentes/show', [
            'docente' => $docente->load('user'),
        ]);
    }

    /**
     * Guardar nuevo docente.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'required|string|max:100',
            'ci' => 'required|string|max:20|unique:users,ci',
            'celular' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email',
            'especialidad' => 'nullable|string|max:100',
            'titulo_profesional' => 'nullable|string|max:150',
            'genero' => 'nullable|in:M,F,Otro',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:255',
        ]);

        // Generar contraseña aleatoria
        $password = Str::random(10);

        // Crear usuario
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

        // Crear docente
        Docente::create([
            'user_id' => $user->id,
            'especialidad' => $request->especialidad,
            'titulo_profesional' => $request->titulo_profesional,
        ]);

        return redirect()->route('docentes.index')
            ->with('success', "Docente creado exitosamente. Contraseña temporal: {$password}");
    }

    /**
     * Actualizar docente.
     */
    public function update(Request $request, Docente $docente): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'required|string|max:100',
            'ci' => ['required', 'string', 'max:20', Rule::unique('users', 'ci')->ignore($docente->user_id)],
            'celular' => 'required|string|max:20',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($docente->user_id)],
            'password' => 'nullable|string|min:8',
            'especialidad' => 'nullable|string|max:100',
            'titulo_profesional' => 'nullable|string|max:150',
            'genero' => 'nullable|in:M,F,Otro',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:255',
        ]);

        // Datos del usuario
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

        // Solo actualizar contraseña si se proporcionó
        if ($request->filled('password')) {
            $userData['password'] = bcrypt($request->password);
        }

        // Actualizar usuario
        $docente->user->update($userData);

        // Actualizar docente
        $docente->update([
            'especialidad' => $request->especialidad,
            'titulo_profesional' => $request->titulo_profesional,
        ]);

        return redirect()->route('docentes.index')
            ->with('success', 'Docente actualizado exitosamente.');
    }

    /**
     * Eliminar docente.
     */
    public function destroy(Docente $docente): RedirectResponse
    {
        // Soft delete: no elimina de la BD, solo marca deleted_at
        $docente->delete();

        return redirect()->route('docentes.index')
            ->with('success', 'Docente desactivado exitosamente.');
    }

    /**
     * Resetear contraseña del docente.
     */
    public function resetPassword(Docente $docente): RedirectResponse
    {
        $user = $docente->user;

        // Generar contraseña: apellido_paterno_ci
        $nuevaPassword = strtolower($user->apellido_paterno . '_' . $user->ci);

        $user->update([
            'password' => bcrypt($nuevaPassword),
        ]);

        return redirect()->route('docentes.index')
            ->with('success', "Contraseña reseteada. Nueva contraseña: {$nuevaPassword}");
    }

    /**
     * Mostrar docentes eliminados (soft deleted).
     */
    public function trashed(): Response
    {
        $docentes = Docente::onlyTrashed()
            ->with('user')
            ->orderBy('deleted_at', 'desc')
            ->get();

        return Inertia::render('docentes/eliminados', [
            'docentes' => $docentes,
        ]);
    }

    /**
     * Restaurar docente eliminado.
     */
    public function restore($id): RedirectResponse
    {
        $docente = Docente::onlyTrashed()->findOrFail($id);
        $docente->restore();

        return redirect()->route('docentes.trashed')
            ->with('success', 'Docente restaurado exitosamente.');
    }

}