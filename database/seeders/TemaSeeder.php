<?php

namespace Database\Seeders;

use App\Models\Materia;
use App\Models\Tema;
use Illuminate\Database\Seeder;

class TemaSeeder extends Seeder
{
    public function run(): void
    {
        // Temario oficial: temas por materia, con su resumen y página del libro
        $temarios = [
            'PSI-101' => [
                [
                    'nombre' => 'Tema 1: QUÉ ES LA PSICOLOGÍA',
                    'resumen' => "La psicología es la ciencia que estudia el comportamiento y los procesos mentales de los seres humanos. Se ocupa tanto de la conducta observable como de los procesos internos como pensamientos, emociones y percepciones.\n\nSu objeto de estudio abarca desde la actividad neuronal hasta la interacción social, y se apoya en métodos científicos como la observación, la experimentación y la medición. Comprender qué es la psicología implica reconocer su carácter científico y su diversidad de enfoques teóricos.",
                    'paginas_libro' => 'pág. 5',
                ],
                [
                    'nombre' => 'Tema 2: HISTORIA Y EVOLUCIÓN DE LA PSICOLOGÍA',
                    'resumen' => "La psicología como disciplina independiente surge a finales del siglo XIX. Wilhelm Wundt fundó el primer laboratorio de psicología experimental en 1879, marcando el nacimiento formal de la disciplina.\n\nA lo largo del siglo XX surgieron diversas escuelas: el estructuralismo, el funcionalismo, el conductismo, la Gestalt, el psicoanálisis y la psicología cognitiva. Cada una aportó una perspectiva distinta sobre el comportamiento humano y su estudio.",
                    'paginas_libro' => 'pág. 9',
                ],
                [
                    'nombre' => 'Tema 3: PROCESOS PSICOLÓGICOS BÁSICOS',
                    'resumen' => 'Resumen pendiente de completar.',
                    'paginas_libro' => 'pág. 21',
                ],
                [
                    'nombre' => 'Tema 4: MOTIVACIÓN Y EMOCIÓN',
                    'resumen' => 'Resumen pendiente de completar.',
                    'paginas_libro' => 'pág. 31',
                ],
                [
                    'nombre' => 'Tema 5: ÁREAS DE ESTUDIO DE LA PSICOLOGÍA',
                    'resumen' => 'Resumen pendiente de completar.',
                    'paginas_libro' => 'pág. 34',
                ],
                [
                    'nombre' => 'Tema 6: NUEVAS AREAS EMERGENTES DE LA PSICOLOGÍA',
                    'resumen' => 'Resumen pendiente de completar.',
                    'paginas_libro' => 'pág. 38',
                ],
            ],
            'PSI-102' => [
                ['nombre' => 'Tema 1: DEFINICIÓN DE SALUD', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 43'],
                ['nombre' => 'Tema 2: DEFINICIÓN DE SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 45'],
                ['nombre' => 'Tema 3: HISTORIA DE LA SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 46'],
                ['nombre' => 'Tema 4: LA INTERPRETACIÓN MECANICISITA DE LA ENFERMEDAD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 48'],
                ['nombre' => 'Tema 5: LA PSIQUIATRÍA ACTUAL Y SUS DEBATES GENÉTICOS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 50'],
                ['nombre' => 'Tema 6: BASES TEORICAS DE SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 50'],
                ['nombre' => 'Tema 7: CONDICIONANTES DE LA SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 51'],
                ['nombre' => 'Tema 8: NEUROCIENCIA', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 52'],
                ['nombre' => 'Tema 9: PERSONALIDAD', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 54'],
                ['nombre' => 'Tema 10: AMBIENTE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 54'],
                ['nombre' => 'Tema 11: DIFICULTADES RELACIONADAS CON SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 55'],
                ['nombre' => 'Tema 12: PROMOCIÓN DE LA SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 64'],
                ['nombre' => 'Tema 13: REALIDAD NACIONAL Y SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 70'],
                ['nombre' => 'Tema 14: BOLIVIA NO ESTÁ PREPARADA PARA LA CRECIENTE DEMANDA EN ATENCIÓN DE SALUD MENTAL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 73'],
            ],
            'PSI-103' => [
                ['nombre' => 'Tema 1: HISTORIA DEL LENGUAJE Y LA COMUNICACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 80'],
                ['nombre' => 'Tema 2: EL LENGUAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 81'],
                ['nombre' => 'Tema 3: LA COMUNICACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 88'],
                ['nombre' => 'Tema 4: APRENDIZAJE, LENGUAJE Y COMUNICACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 99'],
                ['nombre' => 'Tema 5: CEREBRO PENSAMIENTO Y LENGUAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 101'],
                ['nombre' => 'Tema 6: ADQUISICIÓN DE LA PRIMERA LENGUA', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 103'],
                ['nombre' => 'Tema 7: LA CONVERSACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 104'],
                ['nombre' => 'Tema 8: TEXTO, CONTEXTO Y DISCURSO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 107'],
                ['nombre' => 'Tema 9: LA LECTURA Y LA ESCRITURA', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 110'],
                ['nombre' => 'Tema 10: EL APRENDIZAJE Y LOS SIGNOS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 113'],
                ['nombre' => 'Tema 11: EL SIGNO LINGUÍSTICO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 114'],
                ['nombre' => 'Tema 12: ANÁLISIS MORFOLÁGICO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 115'],
                ['nombre' => 'Tema 13: LAS PALABRAS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 117'],
                ['nombre' => 'Tema 14: LA ORACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 119'],
                ['nombre' => 'Tema 15: REDACCIÓN Y SINTAXIS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 126'],
                ['nombre' => 'Tema 16: SIGNOS DE PUNTUACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 127'],
                ['nombre' => 'Tema 17: USO DE MAYÚSCULAS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 129'],
                ['nombre' => 'Tema 18: LA CONCORDANCIA', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 131'],
                ['nombre' => 'Tema 19: COHERENCIA Y COHESIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 132'],
                ['nombre' => 'Tema 20: LOS VICIOS DE CONSTRUCCIÓN Y CONCORDANCIA', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 134'],
                ['nombre' => 'Tema 21: EL PÁRRAFO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 136'],
                ['nombre' => 'Tema 22: PARÁFRASIS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 138'],
            ],
            'PSI-104' => [
                ['nombre' => 'Tema 1: QUÉ SON LAS ESTRATEGIAS DE APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 141'],
                ['nombre' => 'Tema 2: DEFINICIÓN DE APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 149'],
                ['nombre' => 'Tema 3: FUNDAMENTOS TEORICOS DE LA PSICOLOGÍA DEL APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 157'],
                ['nombre' => 'Tema 4: PRINCIPALES TEORÍAS DEL APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 157'],
                ['nombre' => 'Tema 5: TEORÍAS DE LA MEMORIA', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 160'],
                ['nombre' => 'Tema 6: LA PRÁCTICA ACTIVA EN EL APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 167'],
                ['nombre' => 'Tema 7: ESTRATEGIAS PARA MEJORAR ESTOS PROCESOS CONGNITIVOS EN EL CONTEXTO EDUCATIVO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 174'],
                ['nombre' => 'Tema 8: MOTIVACIÓN Y APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 178'],
                ['nombre' => 'Tema 9: CÓMO LA MOTIVACIÓN INTRÍNSECA Y EXTRÍNSECA INFLUYE EN EL RENDIMIENTO ACADÉMICO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 179'],
                ['nombre' => 'Tema 10: METACOGNICIÓN Y AUTORREGULACIÓN DEL APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 184'],
                ['nombre' => 'Tema 11: AUTORREGULACIÓN DEL APRENDIZAJE', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 186'],
                ['nombre' => 'Tema 12: TÉCNICAS PARA PROMOVER LA METACOGNICIÓN Y LA AUTORREGULACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 191'],
                ['nombre' => 'Tema 13: VENTAJAS Y DESAFÍOS DEL USO DE LA TECNOLOGÍA EN LA EDUCACIÓN', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 201'],
            ],
            'PSI-105' => [
                ['nombre' => 'Tema 1: PRINCIPIOS UNIVERSITARIOS', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 212'],
                ['nombre' => 'Tema 2: REGLAMENTO DE LA ASAMBLEA GENERAL DOCENTE ESTUDIANTIL', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 216'],
                ['nombre' => 'Tema 3: REGLAMENTO DEL HONORABLE CONSEJO UNIVERSITARIO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 216'],
                ['nombre' => 'Tema 4: DE LAS FALTAS DISCIPLINARIAS Y CAUSALES DE PROCESO UNIVERISTARIO', 'resumen' => 'Resumen pendiente de completar.', 'paginas_libro' => 'pág. 217'],
            ],
        ];

        foreach ($temarios as $codigo => $temas) {
            $materia = Materia::where('codigo', $codigo)->first();

            if (!$materia) {
                $this->command->warn("⚠ Materia $codigo no encontrada, se omite.");
                continue;
            }

            foreach ($temas as $indice => $tema) {
                Tema::updateOrCreate(
                    ['materia_id' => $materia->id, 'orden' => $indice + 1],
                    [
                        'nombre' => $tema['nombre'],
                        'resumen' => $tema['resumen'],
                        'paginas_libro' => $tema['paginas_libro'],
                        'estado' => 'programado',
                    ]
                );
            }

            $this->command->info("✔ Temario listo: {$materia->nombre} (" . count($temas) . " temas)");
        }
    }
}