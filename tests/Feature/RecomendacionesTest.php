<?php

use App\Models\Calificacion;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\Tema;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

test('invitados son redirigidos al login al intentar acceder a recomendaciones', function () {
    $this->get(route('estudiante.recomendaciones'))->assertRedirect('/login');
});

test('usuario sin perfil de estudiante recibe mensaje de sin_datos', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get(route('estudiante.recomendaciones'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Recomendaciones/Index')
        ->where('sin_datos', true)
        ->where('mensaje', 'No tienes un perfil de estudiante asociado a esta cuenta.')
    );
});

test('estudiante sin calificaciones recibe sin_datos sin error', function () {
    $user = User::factory()->create();
    $user->assignRole('estudiante');
    Estudiante::create([
        'user_id' => $user->id,
        'codigo_estudiante' => 'EST-001',
    ]);

    $response = $this->actingAs($user)->get(route('estudiante.recomendaciones'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Recomendaciones/Index')
        ->where('sin_datos', true)
    );
});

test('estudiante con calificaciones en lecciones sin tema asignado no lanza error 500', function () {
    $user = User::factory()->create();
    $user->assignRole('estudiante');
    $estudiante = Estudiante::create([
        'user_id' => $user->id,
        'codigo_estudiante' => 'EST-002',
    ]);

    $docenteUser = User::factory()->create();
    $docente = Docente::create([
        'user_id' => $docenteUser->id,
        'especialidad' => 'Psicología',
    ]);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1er Semestre',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);

    $curso = Curso::create([
        'gestion_id' => $gestion->id,
        'paralelo' => 'A',
        'turno' => 'mañana',
        'cupos' => 30,
        'estado' => 'activo',
    ]);

    $materia = Materia::create([
        'nombre' => 'Psicología General',
        'codigo' => 'PSI-101',
    ]);

    // Lección SIN tema (tema_id = null)
    $leccion = Leccion::create([
        'materia_id' => $materia->id,
        'tema_id' => null,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Evaluación Diagnóstica',
        'estado' => 'activo',
    ]);

    $entrega = Entrega::create([
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'archivo' => 'diagnostico.pdf',
    ]);

    Calificacion::create([
        'entrega_id' => $entrega->id,
        'docente_id' => $docente->id,
        'nota' => 85,
    ]);

    $response = $this->actingAs($user)->get(route('estudiante.recomendaciones'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Recomendaciones/Index')
        ->where('sin_datos', true)
    );
});

test('estudiante con tema evaluado y tema siguiente recibe proyeccion correctamente', function () {
    $user = User::factory()->create([
        'nombre' => 'Juan',
        'apellido_paterno' => 'Pérez',
    ]);
    $user->assignRole('estudiante');
    $estudiante = Estudiante::create([
        'user_id' => $user->id,
        'codigo_estudiante' => 'EST-003',
    ]);

    $docenteUser = User::factory()->create();
    $docente = Docente::create([
        'user_id' => $docenteUser->id,
        'especialidad' => 'Psicología',
    ]);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1er Semestre',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);

    $curso = Curso::create([
        'gestion_id' => $gestion->id,
        'paralelo' => 'A',
        'turno' => 'mañana',
        'cupos' => 30,
        'estado' => 'activo',
    ]);

    $materia = Materia::create([
        'nombre' => 'Psicología Evolutiva',
        'codigo' => 'PSI-102',
    ]);

    $tema1 = Tema::create([
        'materia_id' => $materia->id,
        'nombre' => 'Tema 1: Infancia',
        'orden' => 1,
        'paginas_libro' => 'págs. 1-15',
        'estado' => 'visto',
    ]);

    $tema2 = Tema::create([
        'materia_id' => $materia->id,
        'nombre' => 'Tema 2: Adolescencia',
        'orden' => 2,
        'paginas_libro' => 'págs. 16-30',
        'estado' => 'programado',
    ]);

    $leccion = Leccion::create([
        'materia_id' => $materia->id,
        'tema_id' => $tema1->id,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Actividad Infancia',
        'estado' => 'activo',
    ]);

    $entrega = Entrega::create([
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'archivo' => 'infancia.pdf',
    ]);

    Calificacion::create([
        'entrega_id' => $entrega->id,
        'docente_id' => $docente->id,
        'nota' => 70,
    ]);

    $response = $this->actingAs($user)->get(route('estudiante.recomendaciones'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Recomendaciones/Index')
        ->where('sin_datos', false)
        ->where('materia_nombre', 'Psicología Evolutiva')
        ->where('tema_actual_nombre', 'Tema 1: Infancia')
        ->where('tema_siguiente', 'Tema 2: Adolescencia')
        ->where('nota_actual', 70)
        ->has('prediccion')
    );
});
