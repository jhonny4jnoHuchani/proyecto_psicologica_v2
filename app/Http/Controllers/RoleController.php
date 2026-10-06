<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class RoleController extends Controller
{
    // Roles principales que no pueden ser modificados
    protected $protectedRoles = ['admin', 'docente', 'estudiante'];

    public function index(Request $request): Response
    {
        $roles = Role::paginate(15);
        
        $roles->getCollection()->transform(function ($role) {
            $role->is_protected = in_array($role->name, $this->protectedRoles);
            return $role;
        });

        return Inertia::render('roles/index', [
            'roles' => $roles
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::all();
        
        return Inertia::render('roles/form', [
            'role' => null,
            'permissions' => $permissions,
            'rolePermissions' => []
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array']
        ]);

        $role = Role::create(['name' => $request->name]);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('success', 'Rol creado exitosamente.');
    }

    public function edit(Role $role): Response
    {
        if (in_array($role->name, $this->protectedRoles)) {
            abort(403, 'Acceso denegado: Rol protegido del sistema.');
        }

        $permissions = Permission::all();
        $rolePermissions = $role->permissions->pluck('name')->toArray();

        return Inertia::render('roles/form', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        if (in_array($role->name, $this->protectedRoles)) {
            abort(403, 'Acceso denegado: No se puede modificar un rol del sistema.');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permissions' => ['nullable', 'array']
        ]);

        $role->update(['name' => $request->name]);

        // Acepta los nombres de permisos a través de su request string
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        } else {
            $role->syncPermissions([]); // Si desmarcó todo
        }

        return redirect()->route('roles.index')->with('success', 'Rol actualizado exitosamente.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if (in_array($role->name, $this->protectedRoles)) {
            abort(403, 'Acceso denegado: No se puede eliminar un rol base del sistema.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Rol eliminado exitosamente.');
    }
}
