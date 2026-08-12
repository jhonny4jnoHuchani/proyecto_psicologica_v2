<?php

namespace Database\Seeders;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocenteSeeder extends Seeder
{
    public function run(): void
    {
        $docentes = [
            [
                'user' => [
                    'nombre' => 'Carlos',
                    'apellido_paterno' => 'Mamani',
                    'apellido_materno' => 'Quispe',
                    'ci' => '4832567 LP',
                    'celular' => '76543210',

                    'email' => 'carlos.mamani@upea.edu.bo',
                    'password' => bcrypt('password'),

                    'genero' => 'M',
                ],
                'especialidad' => 'Psicología Cognitiva',
                'titulo_profesional' => 'Lic. en Psicología',
            ],
            [
                'user' => [
                    'nombre' => 'María',
                    'apellido_paterno' => 'López',
                    'apellido_materno' => 'García',
                    'ci' => '5834567 LP',
                    'celular' => '76543211',

                    'email' => 'maria.lopez@upea.edu.bo',
                    'password' => bcrypt('password'),
                    
                    'genero' => 'F',
                ],
                'especialidad' => 'Psicología del Desarrollo',
                'titulo_profesional' => 'Lic. en Psicología',
            ],
            [
                'user' => [
                    'nombre' => 'Jorge',
                    'apellido_paterno' => 'Flores',
                    'apellido_materno' => 'Condori',
                    'ci' => '6834567 LP',
                    'celular' => '76543212',
                    'email' => 'jorge.flores@upea.edu.bo',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                ],
                'especialidad' => 'Estadística Aplicada',
                'titulo_profesional' => 'Lic. en Estadística',
            ],
            [
                'user' => [
                    'nombre' => 'Ana',
                    'apellido_paterno' => 'Rojas',
                    'apellido_materno' => 'Vargas',
                    'ci' => '7834567 LP',
                    'celular' => '76543213',
                    'email' => 'ana.rojas@upea.edu.bo',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                ],
                'especialidad' => 'Metodología de Investigación',
                'titulo_profesional' => 'Mg. en Investigación Educativa',
            ],
        ];

        foreach ($docentes as $docente) {
            $user = User::create($docente['user']);
            $user->assignRole('docente');  // ← ASIGNAR ROL
            
            Docente::create([
                'user_id' => $user->id,
                'especialidad' => $docente['especialidad'],
                'titulo_profesional' => $docente['titulo_profesional'],
            ]);
        }
    }
}