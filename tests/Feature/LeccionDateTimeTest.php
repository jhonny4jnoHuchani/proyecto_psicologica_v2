<?php

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'docente', 'guard_name' => 'web']);
    Role::create(['name' => 'estudiante', 'guard_name' => 'web']);
});

test('leccion stores and retrieves exact datetime with hour and minute', function () {
    $userDocente = User::factory()->create();
    $userDocente->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDocente->id, 'especialidad' => 'Psicología']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '2do Semestre',
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'A', 'turno' => 'tarde', 'cupos' => 30, 'estado' => 'activo']);
    $materia = Materia::create(['codigo' => 'PSI-201', 'nombre' => 'Psicología Clínica']);

    $inicioStr = '2026-10-14 08:30:00';
    $finStr = '2026-10-17 23:59:00';

    $leccion = Leccion::create([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'titulo' => 'Caso de estudio con horario específico',
        'descripcion' => 'Subir antes de las 23:59 del 17 de octubre',
        'fecha_programada' => $inicioStr,
        'fecha_entrega' => $finStr,
        'estado' => 'activo',
    ]);

    $leccion->refresh();

    expect($leccion->fecha_programada)->toBeInstanceOf(Carbon::class)
        ->and($leccion->fecha_programada->format('Y-m-d H:i:s'))->toBe($inicioStr)
        ->and($leccion->fecha_entrega)->toBeInstanceOf(Carbon::class)
        ->and($leccion->fecha_entrega->format('Y-m-d H:i:s'))->toBe($finStr)
        ->and($leccion->fecha_entrega->hour)->toBe(23)
        ->and($leccion->fecha_entrega->minute)->toBe(59);
});

test('entrega submitted before deadline timestamp is marked entregado not atrasado', function () {
    Storage::fake('public');

    $userDocente = User::factory()->create();
    $userDocente->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDocente->id, 'especialidad' => 'Psicología']);

    $userEstudiante = User::factory()->create();
    $userEstudiante->assignRole('estudiante');
    $estudiante = Estudiante::create(['user_id' => $userEstudiante->id, 'codigo_estudiante' => 'EST-999']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '2do Semestre',
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'B', 'turno' => 'mañana', 'cupos' => 30, 'estado' => 'activo']);
    $materia = Materia::create(['codigo' => 'PSI-202', 'nombre' => 'Psicometría']);

    DB::table('curso_estudiante')->insert([
        'curso_id' => $curso->id,
        'estudiante_id' => $estudiante->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Deadline is set to 23:59 on 2026-10-17
    $leccion = Leccion::create([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'titulo' => 'Informe Psicométrico',
        'fecha_programada' => '2026-10-14 08:00:00',
        'fecha_entrega' => '2026-10-17 23:59:00',
        'estado' => 'activo',
    ]);

    // Simulate current time is on the same day at 18:30 (before 23:59)
    Carbon::setTestNow('2026-10-17 18:30:00');

    $file = UploadedFile::fake()->create('tarea.pdf', 500);

    $this->actingAs($userEstudiante)
        ->post('/entregas', [
            'leccion_id' => $leccion->id,
            'archivos' => [$file],
            'comentarios' => 'Entrega dentro del horario',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('entregas', [
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'entregado',
    ]);

    Carbon::setTestNow(); // Reset time
});

test('entrega submitted after deadline timestamp is marked atrasado', function () {
    Storage::fake('public');

    $userDocente = User::factory()->create();
    $userDocente->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDocente->id, 'especialidad' => 'Psicología']);

    $userEstudiante = User::factory()->create();
    $userEstudiante->assignRole('estudiante');
    $estudiante = Estudiante::create(['user_id' => $userEstudiante->id, 'codigo_estudiante' => 'EST-998']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '2do Semestre',
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-31',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'C', 'turno' => 'noche', 'cupos' => 30, 'estado' => 'activo']);
    $materia = Materia::create(['codigo' => 'PSI-203', 'nombre' => 'Neuropsicología']);

    $leccion = Leccion::create([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'titulo' => 'Caso Neuropsicología',
        'fecha_programada' => '2026-10-14 08:00:00',
        'fecha_entrega' => '2026-10-17 23:59:00',
        'estado' => 'activo',
    ]);

    // Simulate current time is 1 minute after deadline (2026-10-18 00:00:01)
    Carbon::setTestNow('2026-10-18 00:00:01');

    $file = UploadedFile::fake()->create('tarea_tardia.pdf', 500);

    $this->actingAs($userEstudiante)
        ->post('/entregas', [
            'leccion_id' => $leccion->id,
            'archivos' => [$file],
            'comentarios' => 'Entrega tardía',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('entregas', [
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'atrasado',
    ]);

    Carbon::setTestNow();
});
