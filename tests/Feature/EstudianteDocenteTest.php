<?php

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);
});

function crearEscenarioDocenteEstudiantes(): array
{
    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1er Semestre',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);

    // Docente 1
    $userDocente1 = User::factory()->create(['nombre' => 'Carlos', 'apellido_paterno' => 'Docente']);
    $userDocente1->assignRole('docente');
    $docente1 = Docente::create(['user_id' => $userDocente1->id, 'especialidad' => 'Psicología Clínica']);

    // Docente 2
    $userDocente2 = User::factory()->create(['nombre' => 'Ana', 'apellido_paterno' => 'DocenteDos']);
    $userDocente2->assignRole('docente');
    $docente2 = Docente::create(['user_id' => $userDocente2->id, 'especialidad' => 'Psicología Social']);

    // Cursos
    $cursoA = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'A', 'turno' => 'mañana', 'cupos' => 30, 'estado' => 'activo']);
    $cursoB = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'B', 'turno' => 'tarde', 'cupos' => 30, 'estado' => 'activo']);

    // Materias
    $materia1 = Materia::create(['codigo' => 'PSI-101', 'nombre' => 'Psicología General']);
    $materia2 = Materia::create(['codigo' => 'PSI-102', 'nombre' => 'Psicometría']);

    // Asignar docente1 a Curso A (Materia 1)
    DB::table('curso_materia')->insert([
        'curso_id' => $cursoA->id,
        'materia_id' => $materia1->id,
        'docente_id' => $docente1->id,
        'ayuda_ia_activa' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Asignar docente1 a Curso B (Materia 2)
    DB::table('curso_materia')->insert([
        'curso_id' => $cursoB->id,
        'materia_id' => $materia2->id,
        'docente_id' => $docente1->id,
        'ayuda_ia_activa' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Estudiante 1 (en Curso A)
    $userEst1 = User::factory()->create([
        'nombre' => 'EstudianteUno',
        'apellido_paterno' => 'Gomez',
        'ci' => '1111111',
    ]);
    $userEst1->assignRole('estudiante');
    $estudiante1 = Estudiante::create(['user_id' => $userEst1->id]);
    $cursoA->estudiantes()->attach($estudiante1->id, ['fecha_inscripcion' => now(), 'estado' => 'activo']);

    // Estudiante 2 (en Curso B)
    $userEst2 = User::factory()->create([
        'nombre' => 'EstudianteDos',
        'apellido_paterno' => 'Perez',
        'ci' => '2222222',
    ]);
    $userEst2->assignRole('estudiante');
    $estudiante2 = Estudiante::create(['user_id' => $userEst2->id]);
    $cursoB->estudiantes()->attach($estudiante2->id, ['fecha_inscripcion' => now(), 'estado' => 'activo']);

    return compact('userDocente1', 'docente1', 'userDocente2', 'docente2', 'cursoA', 'cursoB', 'materia1', 'materia2', 'estudiante1', 'estudiante2');
}

it('redirecciona a login a visitantes no autenticados', function () {
    $response = $this->get('/docente/estudiantes');
    $response->assertRedirect('/login');
});

it('prohíbe el acceso a usuarios con rol estudiante', function () {
    $data = crearEscenarioDocenteEstudiantes();
    $estudianteUser = User::role('estudiante')->first();

    $response = $this->actingAs($estudianteUser)->get('/docente/estudiantes');
    $response->assertForbidden();
});

it('permite a un docente ver la lista de sus estudiantes matriculados en sus cursos', function () {
    $data = crearEscenarioDocenteEstudiantes();

    $response = $this->actingAs($data['userDocente1'])->get('/docente/estudiantes');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('estudiantes/docente')
        ->has('estudiantes', 2)
        ->has('cursos', 2)
        ->has('materias', 2)
        ->where('stats.total_estudiantes', 2)
    );
});

it('permite a un docente filtrar estudiantes por curso_id', function () {
    $data = crearEscenarioDocenteEstudiantes();

    $response = $this->actingAs($data['userDocente1'])
        ->get('/docente/estudiantes?curso_id='.$data['cursoA']->id);

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('estudiantes/docente')
        ->has('estudiantes', 1)
        ->where('estudiantes.0.user.nombre', 'EstudianteUno')
    );
});

it('permite a un docente filtrar estudiantes por materia_id', function () {
    $data = crearEscenarioDocenteEstudiantes();

    $response = $this->actingAs($data['userDocente1'])
        ->get('/docente/estudiantes?materia_id='.$data['materia2']->id);

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('estudiantes/docente')
        ->has('estudiantes', 1)
        ->where('estudiantes.0.user.nombre', 'EstudianteDos')
    );
});

it('permite buscar estudiantes por texto (ci o nombre)', function () {
    $data = crearEscenarioDocenteEstudiantes();

    $response = $this->actingAs($data['userDocente1'])
        ->get('/docente/estudiantes?buscar=1111111');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('estudiantes/docente')
        ->has('estudiantes', 1)
        ->where('estudiantes.0.user.ci', '1111111')
    );
});

it('permite a un administrador acceder a la vista de estudiantes docente', function () {
    $data = crearEscenarioDocenteEstudiantes();
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/docente/estudiantes');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('estudiantes/docente')
    );
});
