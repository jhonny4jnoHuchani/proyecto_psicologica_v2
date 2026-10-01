<?php

namespace Database\Seeders;

use App\Models\Materia;
use App\Models\Tema;
use Illuminate\Database\Seeder;

class TemaSeeder extends Seeder
{
    public function run(): void
    {
        // Temario oficial: temas por materia, con su página del libro-resumen
        $temarios = [
            'PSI-101' => [
                ['Tema 1: QUÉ ES LA PSICOLOGÍA', 'pág. 5'],
                ['Tema 2: HISTORIA Y EVOLUCIÓN DE LA PSICOLOGÍA', 'pág. 9'],
                ['Tema 3: PROCESOS PSICOLÓGICOS BÁSICOS', 'pág. 21'],
                ['Tema 4: MOTIVACIÓN Y EMOCIÓN', 'pág. 31'],
                ['Tema 5: ÁREAS DE ESTUDIO DE LA PSICOLOGÍA', 'pág. 34'],
                ['Tema 6: NUEVAS AREAS EMERGENTES DE LA PSICOLOGÍA', 'pág. 38'],
            ],
            'PSI-102' => [
                ['Tema 1: DEFINICIÓN DE SALUD', 'pág. 43'],
                ['Tema 2: DEFINICIÓN DE SALUD MENTAL', 'pág. 45'],
                ['Tema 3: HISTORIA DE LA SALUD MENTAL', 'pág. 46'],
                ['Tema 4: LA INTERPRETACIÓN MECANICISITA DE LA ENFERMEDAD MENTAL', 'pág. 48'],
                ['Tema 5: LA PSIQUIATRÍA ACTUAL Y SUS DEBATES GENÉTICOS', 'pág. 50'],
                ['Tema 6: BASES TEORICAS DE SALUD MENTAL', 'pág. 50'],
                ['Tema 7: CONDICIONANTES DE LA SALUD MENTAL', 'pág. 51'],
                ['Tema 8: NEUROCIENCIA', 'pág. 52'],
                ['Tema 9: PERSONALIDAD', 'pág. 54'],
                ['Tema 10: AMBIENTE', 'pág. 54'],
                ['Tema 11: DIFICULTADES RELACIONADAS CON SALUD MENTAL', 'pág. 55'],
                ['Tema 12: PROMOCIÓN DE LA SALUD MENTAL', 'pág. 64'],
                ['Tema 13: REALIDAD NACIONAL Y SALUD MENTAL', 'pág. 70'],
                ['Tema 14: BOLIVIA NO ESTÁ PREPARADA PARA LA CRECIENTE DEMANDA EN ATENCIÓN DE SALUD MENTAL', 'pág. 73'],
            ],
            'PSI-103' => [
                ['Tema 1: HISTORIA DEL LENGUAJE Y LA COMUNICACIÓN', 'pág. 80'],
                ['Tema 2: EL LENGUAJE', 'pág. 81'],
                ['Tema 3: LA COMUNICACIÓN', 'pág. 88'],
                ['Tema 4: APRENDIZAJE, LENGUAJE Y COMUNICACIÓN', 'pág. 99'],
                ['Tema 5: CEREBRO PENSAMIENTO Y LENGUAJE', 'pág. 101'],
                ['Tema 6: ADQUISICIÓN DE LA PRIMERA LENGUA', 'pág. 103'],
                ['Tema 7: LA CONVERSACIÓN', 'pág. 104'],
                ['Tema 8: TEXTO, CONTEXTO Y DISCURSO', 'pág. 107'],
                ['Tema 9: LA LECTURA Y LA ESCRITURA', 'pág. 110'],
                ['Tema 10: EL APRENDIZAJE Y LOS SIGNOS', 'pág. 113'],
                ['Tema 11: EL SIGNO LINGUÍSTICO', 'pág. 114'],
                ['Tema 12: ANÁLISIS MORFOLÁGICO', 'pág. 115'],
                ['Tema 13: LAS PALABRAS', 'pág. 117'],
                ['Tema 14: LA ORACIÓN', 'pág. 119'],
                ['Tema 15: REDACCIÓN Y SINTAXIS', 'pág. 126'],
                ['Tema 16: SIGNOS DE PUNTUACIÓN', 'pág. 127'],
                ['Tema 17: USO DE MAYÚSCULAS', 'pág. 129'],
                ['Tema 18: LA CONCORDANCIA', 'pág. 131'],
                ['Tema 19: COHERENCIA Y COHESIÓN', 'pág. 132'],
                ['Tema 20: LOS VICIOS DE CONSTRUCCIÓN Y CONCORDANCIA', 'pág. 134'],
                ['Tema 21: EL PÁRRAFO', 'pág. 136'],
                ['Tema 22: PARÁFRASIS', 'pág. 138'],
            ],
            'PSI-104' => [
                ['Tema 1: QUÉ SON LAS ESTRATEGIAS DE APRENDIZAJE', 'pág. 141'],
                ['Tema 2: DEFINICIÓN DE APRENDIZAJE', 'pág. 149'],
                ['Tema 3: FUNDAMENTOS TEORICOS DE LA PSICOLOGÍA DEL APRENDIZAJE', 'pág. 157'],
                ['Tema 4: PRINCIPALES TEORÍAS DEL APRENDIZAJE', 'pág. 157'],
                ['Tema 5: TEORÍAS DE LA MEMORIA', 'pág. 160'],
                ['Tema 6: LA PRÁCTICA ACTIVA EN EL APRENDIZAJE', 'pág. 167'],
                ['Tema 7: ESTRATEGIAS PARA MEJORAR ESTOS PROCESOS CONGNITIVOS EN EL CONTEXTO EDUCATIVO', 'pág. 174'],
                ['Tema 8: MOTIVACIÓN Y APRENDIZAJE', 'pág. 178'],
                ['Tema 9: CÓMO LA MOTIVACIÓN INTRÍNSECA Y EXTRÍNSECA INFLUYE EN EL RENDIMIENTO ACADÉMICO', 'pág. 179'],
                ['Tema 10: METACOGNICIÓN Y AUTORREGULACIÓN DEL APRENDIZAJE', 'pág. 184'],
                ['Tema 11: AUTORREGULACIÓN DEL APRENDIZAJE', 'pág. 186'],
                ['Tema 12: TÉCNICAS PARA PROMOVER LA METACOGNICIÓN Y LA AUTORREGULACIÓN', 'pág. 191'],
                ['Tema 13: VENTAJAS Y DESAFÍOS DEL USO DE LA TECNOLOGÍA EN LA EDUCACIÓN', 'pág. 201'],  
            ],
            'PSI-105' => [
                ['Tema 1: PRINCIPIOS UNIVERSITARIOS', 'pág. 212'],
                ['Tema 2: REGLAMENTO DE LA ASAMBLEA GENERAL DOCENTE ESTUDIANTIL', 'pág. 216'],
                ['Tema 3: REGLAMENTO DEL HONORABLE CONSEJO UNIVERSITARIO', 'pág. 216'],
                ['Tema 4: DE LAS FALTAS DISCIPLINARIAS Y CAUSALES DE PROCESO UNIVERISTARIO', 'pág. 217'],
            ],
        ];

        foreach ($temarios as $codigo => $temas) {
            $materia = Materia::where('codigo', $codigo)->first();

            if (!$materia) {
                $this->command->warn("⚠ Materia $codigo no encontrada, se omite.");
                continue;
            }

            foreach ($temas as $indice => [$nombre, $paginas]) {
                // updateOrCreate: si ya existe (materia+orden), lo actualiza; si no, lo crea
                Tema::updateOrCreate(
                    ['materia_id' => $materia->id, 'orden' => $indice + 1],
                    [
                        'nombre' => $nombre,
                        'paginas_libro' => $paginas,
                        'estado' => 'programado',
                    ]
                );
            }

            $this->command->info("✔ Temario listo: {$materia->nombre} (" . count($temas) . " temas)");
        }
    }
}
