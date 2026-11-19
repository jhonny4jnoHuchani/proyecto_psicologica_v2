<?php

use App\Models\Configuracion;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'docente', 'guard_name' => 'web']);
    Role::create(['name' => 'estudiante', 'guard_name' => 'web']);
});

function crearContextoAcademico(): array
{
    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '2do Semestre',
        'fecha_inicio' => '2026-07-01',
        'fecha_fin' => '2026-12-31',
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
        'codigo' => 'PSI-301',
        'nombre' => 'Psicología Social',
    ]);

    $userDocente = User::factory()->create();
    $userDocente->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDocente->id, 'especialidad' => 'Psicología']);

    $cursoMateriaId = DB::table('curso_materia')->insertGetId([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'ayuda_ia_activa' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $leccion = Leccion::create([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'titulo' => 'Ensayo de Psicología Social',
        'estado' => 'activo',
    ]);

    return compact('gestion', 'curso', 'materia', 'userDocente', 'docente', 'cursoMateriaId', 'leccion');
}

test('entrega rejects dangerous file extensions like html or php', function () {
    Storage::fake('public');
    $ctx = crearContextoAcademico();

    $userEst = User::factory()->create();
    $userEst->assignRole('estudiante');
    $estudiante = Estudiante::create(['user_id' => $userEst->id, 'codigo_estudiante' => 'EST-SEC-1']);

    DB::table('curso_estudiante')->insert([
        'curso_id' => $ctx['curso']->id,
        'estudiante_id' => $estudiante->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $malicious = UploadedFile::fake()->create('exploit.html', 10, 'text/html');

    $response = $this->actingAs($userEst)->post(route('entregas.store'), [
        'leccion_id' => $ctx['leccion']->id,
        'archivos' => [$malicious],
    ]);

    $response->assertSessionHasErrors('archivos.0');
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
});

test('student cannot submit entrega to a course they are not enrolled in', function () {
    Storage::fake('public');
    $ctx = crearContextoAcademico();

    $userEst = User::factory()->create();
    $userEst->assignRole('estudiante');
    Estudiante::create(['user_id' => $userEst->id, 'codigo_estudiante' => 'EST-SEC-2']);

    $pdf = UploadedFile::fake()->create('tarea.pdf', 100, 'application/pdf');

    $response = $this->actingAs($userEst)->post(route('entregas.store'), [
        'leccion_id' => $ctx['leccion']->id,
        'archivos' => [$pdf],
    ]);

    $response->assertForbidden();
});

test('student does not receive roster of other students via curso_id query param in lecciones', function () {
    $ctx = crearContextoAcademico();

    $userEst = User::factory()->create();
    $userEst->assignRole('estudiante');
    $est = Estudiante::create(['user_id' => $userEst->id, 'codigo_estudiante' => 'EST-SEC-3']);

    $otroUser = User::factory()->create();
    $otroUser->assignRole('estudiante');
    $otroEst = Estudiante::create(['user_id' => $otroUser->id, 'codigo_estudiante' => 'EST-SEC-4']);

    DB::table('curso_estudiante')->insert([
        ['curso_id' => $ctx['curso']->id, 'estudiante_id' => $est->id, 'created_at' => now(), 'updated_at' => now()],
        ['curso_id' => $ctx['curso']->id, 'estudiante_id' => $otroEst->id, 'created_at' => now(), 'updated_at' => now()],
    ]);

    $this->actingAs($userEst)
        ->get(route('lecciones.index', ['curso_id' => $ctx['curso']->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lecciones/index')
            ->has('estudiantes', 0)
        );
});

test('docente cannot update or delete another docente leccion', function () {
    $ctx = crearContextoAcademico();

    $otroUserDocente = User::factory()->create();
    $otroUserDocente->assignRole('docente');
    Docente::create(['user_id' => $otroUserDocente->id, 'especialidad' => 'Clínica']);

    $this->actingAs($otroUserDocente)
        ->put(route('lecciones.update', $ctx['leccion']), [
            'titulo' => 'Intento de alteración',
            'estado' => 'activo',
        ])
        ->assertForbidden();

    $this->actingAs($otroUserDocente)
        ->delete(route('lecciones.destroy', $ctx['leccion']))
        ->assertForbidden();
});

test('admin without docente profile can access entregas docente and toggle IA without 500 error', function () {
    $ctx = crearContextoAcademico();

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('entregas.docente'))
        ->assertOk();

    $this->actingAs($admin)
        ->post(route('docente.toggle-ia', $ctx['cursoMateriaId']))
        ->assertRedirect();

    $actualizado = DB::table('curso_materia')->where('id', $ctx['cursoMateriaId'])->first();
    expect((bool) $actualizado->ayuda_ia_activa)->toBeTrue();
});

test('configuracion cached returns fresh value after update', function () {
    $config = Configuracion::create([
        'color_primario' => '#111111',
        'color_secundario' => '#222222',
    ]);

    expect(Configuracion::cached()?->color_primario)->toBe('#111111');

    $config->update(['color_primario' => '#333333']);

    expect(Configuracion::cached()?->color_primario)->toBe('#333333');
});

test('web responses include standard security headers', function () {
    $response = $this->get('/');

    $response->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

test('student cannot view leccion from a course they are not enrolled in', function () {
    $ctx = crearContextoAcademico();

    $userEst = User::factory()->create();
    $userEst->assignRole('estudiante');
    Estudiante::create(['user_id' => $userEst->id, 'codigo_estudiante' => 'EST-SEC-5']);

    $this->actingAs($userEst)
        ->get(route('lecciones.show', $ctx['leccion']))
        ->assertForbidden();
});

test('recurso rejects javascript protocol urls to prevent stored xss', function () {
    $ctx = crearContextoAcademico();

    $this->actingAs($ctx['userDocente'])
        ->post(route('recursos.store'), [
            'materia_id' => $ctx['materia']->id,
            'curso_id' => $ctx['curso']->id,
            'titulo' => 'Enlace malicioso',
            'tipo' => 'enlace',
            'enlace_url' => 'javascript:alert(1)',
        ])
        ->assertSessionHasErrors('enlace_url');
});

test('telegram webhook rejects requests with invalid secret token when configured', function () {
    config()->set('services.telegram.webhook_secret', 'mi-secreto-super-seguro');

    $this->postJson(route('telegram.webhook'), ['message' => ['text' => '/start']])
        ->assertForbidden();

    $this->withHeader('X-Telegram-Bot-Api-Secret-Token', 'mi-secreto-super-seguro')
        ->postJson(route('telegram.webhook'), ['message' => ['text' => '/start']])
        ->assertOk();
});
