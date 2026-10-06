<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;

class AdministrativoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Traemos a todos los usuarios que NO son docentes ni estudiantes, o usuarios que están aislados en el área administrativa.
        $users = User::whereDoesntHave('roles', function ($query) {
            $query->whereIn('name', ['docente', 'estudiante']);
        })
        ->orderBy('created_at', 'desc')
        ->with('roles') // Traer la info de sus roles
        ->paginate(15);

        $roles_list = Role::whereNotIn('name', ['docente', 'estudiante'])->get();

        return Inertia::render('administrativos/index', [
            'users' => $users,
            'roles_list' => $roles_list
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'ci' => 'required|string|max:20|unique:users,ci',
            'email' => 'required|string|email|max:255|unique:users,email',
            'celular' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|exists:roles,name',
        ]);

        // Verificación extra de seguridad (Backup del frontend)
        if (in_array($request->role, ['docente', 'estudiante'])) {
            abort(403, 'No puedes asignar rol de docente o estudiante en este módulo.');
        }

        $user = User::create([
            'nombre' => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'ci' => $request->ci,
            'email' => $request->email,
            'celular' => $request->celular,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return redirect()->route('administrativos.index')
                         ->with('success', 'Usuario administrativo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $administrativo)
    {
        // No implementado actualmente
        abort(404);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $administrativo): RedirectResponse
    {
        if ($administrativo->hasRole(['docente', 'estudiante'])) {
            abort(403, 'No puedes editar un docente/estudiante desde el módulo administrativo.');
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'nullable|string|max:255',
            'ci' => 'required|string|max:20|unique:users,ci,' . $administrativo->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $administrativo->id,
            'celular' => 'nullable|string|max:20',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|exists:roles,name',
        ]);

        if (in_array($request->role, ['docente', 'estudiante'])) {
            abort(403, 'No puedes asignar rol de docente o estudiante en este módulo.');
        }

        $administrativo->update([
            'nombre' => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'ci' => $request->ci,
            'email' => $request->email,
            'celular' => $request->celular,
        ]);

        if ($request->filled('password')) {
            $administrativo->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $administrativo->syncRoles([$request->role]);

        return redirect()->route('administrativos.index')
                         ->with('success', 'Usuario administrativo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $administrativo): RedirectResponse
    {
        // Proteger no borrarse a uno mismo
        if (auth()->id() === $administrativo->id) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta de administrador.');
        }

        if ($administrativo->hasRole(['docente', 'estudiante'])) {
            abort(403, 'No puedes eliminar docentes ni estudiantes desde este módulo.');
        }

        // TODO: Quizá se pueda hacer soft delete, dependerá de la migración original de User.
        // Si no tiene cascade constraints (llaves foraneas), basta con delete normal.
        $administrativo->delete();

        return redirect()->route('administrativos.index')
                         ->with('success', 'Usuario eliminado exitosamente.');
    }
}
