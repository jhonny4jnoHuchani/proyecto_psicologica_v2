<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles, Permisos y Configuración global
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            ConfiguracionSeeder::class,
        ]);

        // 2. Usuario Administrador inicial con expedido en La Paz (LP)
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $admin = User::firstOrCreate(
            ['email' => 'admin@psicologia.edu.bo'],
            [
                'nombre' => 'Administrador',
                'apellido_paterno' => 'Principal',
                'apellido_materno' => 'Sistema',
                'ci' => '12345678',
                'expedido' => 'LP',
                'celular' => '71234567',
                'password' => Hash::make('admin123'),
                'genero' => 'M',
            ]
        );

        if (! $admin->hasRole('admin')) {
            $admin->assignRole($roleAdmin);
        }

        // 3. Estructura académica, usuarios, cursos, temas y contenidos
        $this->call([
            GestionSeeder::class,
            MateriaSeeder::class,
            DocenteSeeder::class,
            EstudianteSeeder::class,
            CursoSeeder::class,
            TemaSeeder::class,
            LeccionSeeder::class,
            EntregaSeeder::class,
            LibrosSeeder::class,
        ]);
    }
}

