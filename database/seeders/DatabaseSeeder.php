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
            DocenteSeeder::class,
            EstudianteSeeder::class,
            CursoSeeder::class,
            LeccionSeeder::class,
            EntregaSeeder::class,
        ]);

        // Admin
        $admin = User::create([
            'nombre' => 'Admin',
            'apellido_paterno' => 'Sistema',
            'apellido_materno' => 'UPEA',
            'ci' => '1234567 LP',
            'celular' => '76543210',
            'email' => 'sistema@sistema.com',
            'password' => bcrypt('password'),
            'genero' => 'M',
            'fecha_nacimiento' => '1990-01-01',
            'direccion' => 'Av. Sucre B, Zona Villa Esperanza',
        ]);
        
        $admin->assignRole('admin');
    }
}