<?php

namespace Database\Seeders;

use App\Models\Materia;
use Illuminate\Database\Seeder;

class MateriaSeeder extends Seeder
{
    public function run(): void
    {
        $materias = [
            ['codigo' => 'PSI-101', 'nombre' => 'Psicología Cognitiva'],
            ['codigo' => 'PSI-102', 'nombre' => 'Psicología del Desarrollo'],
            ['codigo' => 'PSI-103', 'nombre' => 'Estadística Aplicada a la Psicología'],
            ['codigo' => 'PSI-104', 'nombre' => 'Metodología de la Investigación'],
            ['codigo' => 'PSI-105', 'nombre' => 'Psicología Social'],
            ['codigo' => 'PSI-106', 'nombre' => 'Psicología Clínica'],
        ];

        foreach ($materias as $materia) {
            Materia::create($materia);
        }
    }
}