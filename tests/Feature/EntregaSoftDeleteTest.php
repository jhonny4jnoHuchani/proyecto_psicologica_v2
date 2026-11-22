<?php

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('la vista de entregas del estudiante maneja lecciones eliminadas y sin materia sin fallar', function () {
    Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('estudiante');

    $estudiante = Estudiante::create([
        'user_id' => $user->id,
        'codigo_estudiante' => 'EST-'.fake()->unique()->numerify('#####'),
        'estado' => 'activo',
    ]);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'activo',
    ]);

    $curso = Curso::create([
        'gestion_id' => $gestion->id,
        'paralelo' => 'A',
        'turno' => 'mañana',
        'cupo_maximo' => 40,
        'estado' => 'activo',
    ]);

    $docenteUser = User::factory()->create();
    $docente = Docente::create([
        'user_id' => $docenteUser->id,
        'item' => 'DOC-001',
        'profesion' => 'Psicólogo',
        'estado' => 'activo',
    ]);

    $materia = Materia::create([
        'codigo' => 'PSI-101',
        'nombre' => 'Introducción a la Psicología',
        'color' => '#3B82F6',
        'estado' => 'activo',
    ]);

    // Lección 1 normal
    $leccionActiva = Leccion::create([
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Tarea Activa',
        'fecha_entrega' => now()->addDays(2),
        'estado' => 'activo',
    ]);

    // Lección 2 soft-deleted
    $leccionEliminada = Leccion::create([
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Tarea Antigua Eliminada',
        'fecha_entrega' => now()->subDays(5),
        'estado' => 'inactivo',
    ]);
    $leccionEliminada->delete(); // Soft delete

    // Entrega para la lección activa
    Entrega::create([
        'leccion_id' => $leccionActiva->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'entregado',
        'estado_calificacion' => 'sin_calificar',
        'fecha_entrega' => now(),
    ]);

    // Entrega para la lección eliminada
    Entrega::create([
        'leccion_id' => $leccionEliminada->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'entregado',
        'estado_calificacion' => 'calificado',
        'fecha_entrega' => now()->subDays(6),
    ]);

    $response = $this->actingAs($user)->get(route('entregas.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('entregas/estudiante')
        ->has('entregas', 2)
    );
});
