<?php

namespace Database\Seeders;

use App\Models\Leccion;
use App\Models\Curso;
use App\Models\Materia;
use App\Models\Docente;
use Illuminate\Database\Seeder;

class LeccionSeeder extends Seeder
{
    public function run(): void
    {
        $curso = Curso::first();
        $materias = Materia::all();
        $docentes = Docente::all();

        $lecciones = [
            [
                'curso_id' => $curso->id,
                'materia_id' => $materias[0]->id,
                'docente_id' => $docentes[0]->id,
                'titulo' => 'Ensayo: Introducción a la Psicología Cognitiva',
                'tema' => 'Capítulo 1: Fundamentos de la Psicología Cognitiva',
                'descripcion' => 'Realizar un ensayo de 3 páginas sobre los fundamentos de la psicología cognitiva.',
                'fecha_programada' => '2026-08-10',
                'fecha_entrega' => '2026-08-15',
                'estado' => 'activo',
            ],
            [
                'curso_id' => $curso->id,
                'materia_id' => $materias[0]->id,
                'docente_id' => $docentes[0]->id,
                'titulo' => 'Cuestionario: Procesos Cognitivos Básicos',
                'tema' => 'Capítulo 2: Percepción, Atención y Memoria',
                'descripcion' => 'Resolver el cuestionario de 20 preguntas sobre percepción, atención y memoria.',
                'fecha_programada' => '2026-08-17',
                'fecha_entrega' => '2026-08-20',
                'estado' => 'activo',
            ],
            [
                'curso_id' => $curso->id,
                'materia_id' => $materias[1]->id,
                'docente_id' => $docentes[1]->id,
                'titulo' => 'Mapa Conceptual: Etapas del Desarrollo',
                'tema' => 'Capítulo 3: Teoría de Piaget',
                'descripcion' => 'Elaborar un mapa conceptual de las etapas del desarrollo humano según Piaget.',
                'fecha_programada' => '2026-08-12',
                'fecha_entrega' => '2026-08-18',
                'estado' => 'activo',
            ],
            [
                'curso_id' => $curso->id,
                'materia_id' => $materias[2]->id,
                'docente_id' => $docentes[2]->id,
                'titulo' => 'Ejercicios de Estadística Descriptiva',
                'tema' => 'Unidad 1: Medidas de Tendencia Central',
                'descripcion' => 'Resolver los 10 ejercicios de media, mediana, moda y desviación estándar.',
                'fecha_programada' => '2026-08-14',
                'fecha_entrega' => '2026-08-21',
                'estado' => 'activo',
            ],
            [
                'curso_id' => $curso->id,
                'materia_id' => $materias[3]->id,
                'docente_id' => $docentes[3]->id,
                'titulo' => 'Anteproyecto de Investigación',
                'tema' => 'Módulo 2: Metodología de la Investigación Científica',
                'descripcion' => 'Presentar un anteproyecto con planteamiento del problema, objetivos y marco teórico.',
                'fecha_programada' => '2026-08-16',
                'fecha_entrega' => '2026-08-25',
                'estado' => 'activo',
            ],
        ];

        foreach ($lecciones as $leccion) {
            Leccion::create($leccion);
        }
    }
}