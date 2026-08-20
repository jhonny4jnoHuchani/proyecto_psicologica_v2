<?php

namespace Database\Seeders;

use App\Models\Materia;
use Illuminate\Database\Seeder;

class MateriaSeeder extends Seeder
{
    public function run(): void
    {
        $materias = [
            ['codigo' => 'PSI-101', 'nombre' => 'INTRODUCCIÓN A LA PSICOLOGÍA'],
            ['codigo' => 'PSI-102', 'nombre' => 'REALIDAD NACIONAL Y SALUD MENTAL'],
            ['codigo' => 'PSI-103', 'nombre' => 'COMUNICACIÓN Y LENGUAJE'],
            ['codigo' => 'PSI-104', 'nombre' => 'ESTRATEGIAS DE APRENDIZAJE'],
            ['codigo' => 'PSI-105', 'nombre' => 'PRINCIPIOS UNIVERSITARIOS'],
            
        ];

        foreach ($materias as $materia) {
            Materia::create($materia);
        }
    }
}