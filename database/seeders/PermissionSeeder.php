<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ========================
        // PERMISOS
        // ========================
        $permisos = [
            // Dashboard
            'ver-dashboard',
            
            // Gestiones
            'gestionar-gestiones',
            
            // Materias
            'ver-materias',
            'crear-materia',
            'editar-materia',
            'eliminar-materia',
            
            // Docentes
            'ver-docentes',
            'crear-docente',
            'editar-docente',
            'eliminar-docente',
            'reset-password-docente',
            
            // Estudiantes
            'ver-estudiantes',
            'crear-estudiante',
            'editar-estudiante',
            'eliminar-estudiante',
            'reset-password-estudiante',
            
            // Cursos
            'ver-cursos',
            'crear-curso',
            'editar-curso',
            'eliminar-curso',
            
            // Lecciones
            'ver-lecciones',
            'crear-leccion',
            'editar-leccion',
            'eliminar-leccion',
            
            // Entregas
            'ver-entregas',
            'subir-entrega',
            
            // Calificaciones
            'ver-calificaciones',
            'calificar-entrega',
            
            // Libros
            'gestionar-libros',
            'ver-libro',
        ];

        foreach ($permisos as $permiso) {
            Permission::create(['name' => $permiso]);
        }

        // ========================
        // ASIGNAR PERMISOS A ROLES
        // ========================
        
        // Admin: TODOS los permisos
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(Permission::all());

        // Docente
        $docente = Role::findByName('docente');
        $docente->givePermissionTo([
            'ver-dashboard',
            'ver-lecciones',
            'crear-leccion',
            'editar-leccion',
            'eliminar-leccion',
            'ver-entregas',
            'ver-calificaciones',
            'calificar-entrega',
            'ver-cursos',
        ]);

        // Estudiante
        $estudiante = Role::findByName('estudiante');
        $estudiante->givePermissionTo([
            'ver-dashboard',
            'ver-lecciones',
            'ver-entregas',
            'subir-entrega',
            'ver-calificaciones',
            'ver-libro',
        ]);
    }
}