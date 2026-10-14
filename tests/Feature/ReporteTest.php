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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);
});

function crearReporteData(): array
{
    $userDocente = User::factory()->create();
    $userDocente->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDocente->id, 'especialidad' => 'Psicología']);

    $userEstudiante = User::factory()->create();
    $estudiante = Estudiante::create(['user_id' => $userEstudiante->id, 'codigo_estudiante' => 'EST-100']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1er Semestre',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'A', 'turno' => 'mañana', 'cupos' => 30, 'estado' => 'activo']);
    $materia = Materia::create(['codigo' => 'PSI-101', 'nombre' => 'Psicología General']);

    $cursoMateriaId = DB::table('curso_materia')->insertGetId([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'ayuda_ia_activa' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $leccion = Leccion::create([
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Ensayo Conductismo',
        'estado' => 'activo',
    ]);

    $entrega = Entrega::create([
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'entregado',
    ]);

    $refuerzo = Refuerzo::create([
        'entrega_id' => $entrega->id,
        'estudiante_id' => $estudiante->id,
        'leccion_id' => $leccion->id,
        'curso_materia_id' => $cursoMateriaId,
        'preguntas' => ['¿Qué plantea el condicionamiento operante?'],
        'completado' => false,
    ]);

    return compact('userDocente', 'docente', 'userEstudiante', 'estudiante', 'gestion', 'curso', 'materia', 'leccion', 'entrega', 'refuerzo');
}

test('docente can visit reportes index and sees assigned courses', function () {
    $data = crearReporteData();

    $response = $this->actingAs($data['userDocente'])->get('/reportes');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('reportes/index')
        ->has('cursos', 1)
        ->has('materias', 1)
    );
});

test('admin can download calificaciones pdf', function () {
    $data = crearReporteData();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get("/reportes/pdf?curso_id={$data['curso']->id}&materia_id={$data['materia']->id}");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

test('admin can download refuerzos ia pdf', function () {
    $data = crearReporteData();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get("/reportes/refuerzos-pdf?curso_id={$data['curso']->id}&materia_id={$data['materia']->id}");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

test('docente cannot download report for a course they do not teach', function () {
    $data = crearReporteData();

    $otroDocenteUser = User::factory()->create();
    $otroDocenteUser->assignRole('docente');
    Docente::create(['user_id' => $otroDocenteUser->id, 'especialidad' => 'Clínica']);

    $response = $this->actingAs($otroDocenteUser)->get("/reportes/refuerzos-pdf?curso_id={$data['curso']->id}");

    $response->assertForbidden();
});
