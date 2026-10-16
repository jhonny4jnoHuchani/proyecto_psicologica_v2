<?php

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\Refuerzo;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

test('refuerzo is evaluated out of 100 with diagnosis when student responds', function () {
    Role::firstOrCreate(['name' => 'estudiante']);
    Role::firstOrCreate(['name' => 'docente']);

    $userEst = User::factory()->create();
    $userEst->assignRole('estudiante');
    $estudiante = Estudiante::create([
        'user_id' => $userEst->id,
        'codigo_estudiante' => 'EST-1234',
        'semestre' => 1,
    ]);

    $userDoc = User::factory()->create();
    $userDoc->assignRole('docente');
    $docente = Docente::create([
        'user_id' => $userDoc->id,
        'especialidad' => 'Psicología Cognitiva',
        'titulo_profesional' => 'Licenciado',
    ]);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1',
        'fecha_inicio' => '2026-02-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);

    $curso = Curso::create([
        'gestion_id' => $gestion->id,
        'paralelo' => 'A',
        'estado' => 'activo',
        'cupos' => 30,
        'turno' => 'mañana',
    ]);

    $materia = Materia::create([
        'nombre' => 'Psicología General',
        'codigo' => 'PSI-101',
    ]);

    $cursoMateriaId = DB::table('curso_materia')->insertGetId([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'ayuda_ia_activa' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $leccion = Leccion::create([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'titulo' => 'Procesos Psicológicos Básicos',
        'estado' => 'activo',
    ]);

    $entrega = Entrega::create([
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'entregado',
        'estado_calificacion' => 'calificado',
    ]);

    $refuerzo = Refuerzo::create([
        'entrega_id' => $entrega->id,
        'estudiante_id' => $estudiante->id,
        'leccion_id' => $leccion->id,
        'curso_materia_id' => $cursoMateriaId,
        'preguntas' => [
            '¿Qué es la percepción según la psicología cognitiva?',
            '¿Cuál es la diferencia entre memoria a corto y largo plazo?',
        ],
        'respuestas' => [null, null],
        'recomendacion' => 'Repasar conceptos clave.',
        'completado' => false,
    ]);

    $respuestasEstudiante = [
        'La percepción es el proceso activo de organizar e interpretar la información sensorial para darle significado.',
        'La memoria a corto plazo retiene información temporalmente mientras que la de largo plazo almacena conocimientos de forma duradera.',
    ];

    $response = $this->actingAs($userEst)
        ->post(route('refuerzos.responder', $refuerzo), [
            'respuestas' => $respuestasEstudiante,
        ]);

    $response->assertRedirect(route('refuerzos.show', $refuerzo));

    $refuerzo->refresh();
    expect($refuerzo->completado)->toBeTrue();
    expect($refuerzo->nota)->toBeGreaterThan(0.0);
    expect($refuerzo->nota)->toBeLessThanOrEqual(100.0);
    expect($refuerzo->evaluacion_ia)->toBeArray();
    expect($refuerzo->evaluacion_ia)->toHaveKeys(['nota', 'conceptos_dominados', 'que_mejorar', 'recomendacion']);
    expect($refuerzo->fecha_evaluacion)->not->toBeNull();
});
