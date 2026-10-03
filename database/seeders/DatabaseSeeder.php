<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class, 
            PermissionSeeder::class,
            GestionSeeder::class,
            ConfiguracionSeeder::class,
            MateriaSeeder::class,
            TemaSeeder::class, 
            DocenteSeeder::class,
            EstudianteSeeder::class,
            CursoSeeder::class,
            LeccionSeeder::class,
            EntregaSeeder::class,
            LibrosSeeder::class,
        ]);

        // Admin
        $admin = User::create([
            'nombre' => 'Admin',
            'apellido_paterno' => 'Sistema',
            'apellido_materno' => 'UPEA',
            'ci' => '1234567 LP',
            'celular' => '7777777',

            'email' => 'admin@sistema.com',//usuario
            'password' => bcrypt('admin'),//contraseña
            'genero' => 'F',
            'fecha_nacimiento' => '1990-01-01',
            'direccion' => 'Av. Sucre B, Zona Villa Esperanza',
        ]);

        
        
        $admin->assignRole('admin');
    }
   
}