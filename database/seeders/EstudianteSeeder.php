<?php

namespace Database\Seeders;

use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Database\Seeder;

class EstudianteSeeder extends Seeder
{
    public function run(): void
    {
        $estudiantes = [
            [
                'user' => [
                    'nombre' => 'Juan',
                    'apellido_paterno' => 'Pérez',
                    'apellido_materno' => 'García',
                    'ci' => '8377246 LP',
                    'celular' => '76543300',


                    'email' => 'juan.perez@email.com',
                    'password' => bcrypt('password'),


                    'genero' => 'M',
                    'fecha_nacimiento' => '2005-03-15',
                    'direccion' => 'Av. Sucre B, Zona Villa Esperanza',
                ],
                'colegio_procedencia' => 'U.E. San Andrés',
                'tipo_inscripcion' => 'regular',
            ],
            [
                'user' => [
                    'nombre' => 'María',
                    'apellido_paterno' => 'Quispe',
                    'apellido_materno' => 'Mamani',
                    'ci' => '9378246 LP',
                    'celular' => '76543301',


                    'email' => 'maria.quispe@email.com',
                    'password' => bcrypt('password'),

                    
                    'genero' => 'F',
                    'fecha_nacimiento' => '2004-07-22',
                    'direccion' => 'Calle 5, Zona 16 de Julio',
                ],
                'colegio_procedencia' => 'U.E. Bolivia',
                'tipo_inscripcion' => 'regular',
            ],
            [
                'user' => [
                    'nombre' => 'Luis',
                    'apellido_paterno' => 'Choque',
                    'apellido_materno' => 'Flores',
                    'ci' => '10378246 LP',
                    'celular' => '76543302',
                    'email' => 'luis.choque@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2006-11-08',
                    'direccion' => 'Av. Tiahuanaco, Zona Norte',
                ],
                'colegio_procedencia' => 'U.E. Franz Tamayo',
                'tipo_inscripcion' => 'dispensacion',
            ],
            [
                'user' => [
                    'nombre' => 'Sofía',
                    'apellido_paterno' => 'Condori',
                    'apellido_materno' => 'Apaza',
                    'ci' => '11378246 LP',
                    'celular' => '76543303',
                    'email' => 'sofia.condori@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2005-09-30',
                    'direccion' => 'Calle 3, Zona Villa Adela',
                ],
                'colegio_procedencia' => 'U.E. San Andrés',
                'tipo_inscripcion' => 'cursillo',
            ],
        ];

        foreach ($estudiantes as $estudiante) {
            $user = User::create($estudiante['user']);
            $user->assignRole('estudiante'); 
            Estudiante::create([
                'user_id' => $user->id,
                'colegio_procedencia' => $estudiante['colegio_procedencia'],
                'tipo_inscripcion' => $estudiante['tipo_inscripcion'],
            ]);
        }
    }
}