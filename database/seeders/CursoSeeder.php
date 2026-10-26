<?php

namespace Database\Seeders;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Materia;
use Illuminate\Database\Seeder;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
        $gestion = Gestion::where('estado', 'activo')->first();
        $materias = Materia::all();
        $docentes = Docente::all();
        $estudiantes = Estudiante::all();

        if (! $gestion) {
            return;
        }

        // Curso Paralelo A
        $cursoA = Curso::firstOrCreate(
            [
                'gestion_id' => $gestion->id,
                'paralelo' => 'A',
            ],
            [
                'turno' => 'mañana',
                'cupos' => 30,
                'estado' => 'activo',
            ]
        );

        // Asignar materias con docentes
        if ($docentes->isNotEmpty()) {
            foreach ($materias as $index => $materia) {
                $docente = $docentes[$index % count($docentes)] ?? null;
                $cursoA->materias()->syncWithoutDetaching([
                    $materia->id => ['docente_id' => $docente?->id],
                ]);
            }
        }

        // Inscribir primeros 2 estudiantes al Paralelo A
        foreach ($estudiantes->take(2) as $estudiante) {
            $cursoA->estudiantes()->syncWithoutDetaching([
                $estudiante->id => [
                    'fecha_inscripcion' => now(),
                    'estado' => 'activo',
                ],
            ]);
        }

        // Curso Paralelo B
        $cursoB = Curso::firstOrCreate(
            [
                'gestion_id' => $gestion->id,
                'paralelo' => 'B',
            ],
            [
                'turno' => 'tarde',
                'cupos' => 30,
                'estado' => 'activo',
            ]
        );

        // Asignar mismas materias pero rotando docentes
        if ($docentes->isNotEmpty()) {
            foreach ($materias as $index => $materia) {
                $docente = $docentes[($index + 2) % count($docentes)] ?? null;
                $cursoB->materias()->syncWithoutDetaching([
                    $materia->id => ['docente_id' => $docente?->id],
                ]);
            }
        }

        // Inscribir últimos 2 estudiantes al Paralelo B
        foreach ($estudiantes->skip(2)->take(2) as $estudiante) {
            $cursoB->estudiantes()->syncWithoutDetaching([
                $estudiante->id => [
                    'fecha_inscripcion' => now(),
                    'estado' => 'activo',
                ],
            ]);
        }
    }
}
