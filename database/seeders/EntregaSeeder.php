<?php

namespace Database\Seeders;

use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Leccion;
use Illuminate\Database\Seeder;

class EntregaSeeder extends Seeder
{
    public function run(): void
    {
        $estudiantes = Estudiante::all();
        $lecciones = Leccion::all();

        // Juan Pérez entrega 2 lecciones
        Entrega::create([
            'leccion_id' => $lecciones[0]->id,
            'estudiante_id' => $estudiantes[0]->id,
            'estado_entrega' => 'entregado',
            'estado_calificacion' => 'sin_calificar',
            'fecha_entrega' => '2026-08-14 10:30:00',
            'archivos_enviado' => ['entregas/1/1/ensayo.pdf'],
            'comentarios' => 'Adjunto el ensayo solicitado.',
        ]);

        Entrega::create([
            'leccion_id' => $lecciones[1]->id,
            'estudiante_id' => $estudiantes[0]->id,
            'estado_entrega' => 'entregado',
            'estado_calificacion' => 'sin_calificar',
            'fecha_entrega' => '2026-08-19 14:00:00',
            'archivos_enviado' => ['entregas/2/1/cuestionario.pdf'],
            'comentarios' => null,
        ]);

        // María Quispe entrega 1 lección
        Entrega::create([
            'leccion_id' => $lecciones[0]->id,
            'estudiante_id' => $estudiantes[1]->id,
            'estado_entrega' => 'atrasado',
            'estado_calificacion' => 'sin_calificar',
            'fecha_entrega' => '2026-08-16 23:00:00',
            'archivos_enviado' => ['entregas/1/2/ensayo_maria.pdf'],
            'comentarios' => 'Disculpe la demora.',
        ]);

        // Luis Choque entrega 1 lección
        Entrega::create([
            'leccion_id' => $lecciones[2]->id,
            'estudiante_id' => $estudiantes[2]->id,
            'estado_entrega' => 'entregado',
            'estado_calificacion' => 'sin_calificar',
            'fecha_entrega' => '2026-08-17 09:00:00',
            'archivos_enviado' => ['entregas/3/3/mapa_conceptual.png'],
            'comentarios' => 'Mapa elaborado en Canva.',
        ]);
    }
}