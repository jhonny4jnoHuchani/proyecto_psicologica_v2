<?php

use App\Http\Controllers\CalificacionController;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\Refuerzo;
use App\Models\User;
use App\Services\IAService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'docente', 'guard_name' => 'web']);
});

function crearEntregaTestData(bool $ayudaIaActiva = true): array
{
    $userDocente = User::factory()->create();
    $userDocente->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDocente->id, 'especialidad' => 'Psicología']);

    $userEstudiante = User::factory()->create();
    $estudiante = Estudiante::create(['user_id' => $userEstudiante->id, 'codigo_estudiante' => 'EST-001']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1er Semestre',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'A', 'turno' => 'mañana', 'cupos' => 30, 'estado' => 'activo']);
    $materia = Materia::create(['codigo' => 'PSI-101', 'nombre' => 'Psicología General']);

    DB::table('curso_materia')->insert([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'ayuda_ia_activa' => $ayudaIaActiva,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $leccion = Leccion::create([
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Tarea de Ensayo',
        'estado' => 'activo',
    ]);

    $entrega = Entrega::create([
        'leccion_id' => $leccion->id,
        'estudiante_id' => $estudiante->id,
        'estado_entrega' => 'entregado',
    ]);

    return compact('userDocente', 'docente', 'userEstudiante', 'estudiante', 'curso', 'materia', 'leccion', 'entrega');
}

test('evaluarSugerirRefuerzo returns false and no reason when grade is >= 70', function () {
    $data = crearEntregaTestData(true);
    $controller = new CalificacionController;

    [$sugerir, $motivo] = $controller->evaluarSugerirRefuerzo($data['entrega'], 75.0);

    expect($sugerir)->toBeFalse();
    expect($motivo)->toBeNull();
});

test('evaluarSugerirRefuerzo returns false with warning message when ayuda_ia_activa is false', function () {
    $data = crearEntregaTestData(false);
    $controller = new CalificacionController;

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(fn ($msg) => str_contains($msg, 'ayuda_ia_activa'));

    [$sugerir, $motivo] = $controller->evaluarSugerirRefuerzo($data['entrega'], 60.0);

    expect($sugerir)->toBeFalse();
    expect($motivo)->toContain('ayuda de IA está desactivada');
});

test('evaluarSugerirRefuerzo returns false with reason when refuerzo already exists', function () {
    $data = crearEntregaTestData(true);
    $cursoMateriaId = DB::table('curso_materia')->first()->id;

    Refuerzo::create([
        'entrega_id' => $data['entrega']->id,
        'estudiante_id' => $data['estudiante']->id,
        'leccion_id' => $data['leccion']->id,
        'curso_materia_id' => $cursoMateriaId,
        'preguntas' => ['P1', 'P2'],
        'completado' => false,
    ]);

    $controller = new CalificacionController;

    Log::shouldReceive('info')
        ->once()
        ->withArgs(fn ($msg) => str_contains($msg, 'Refuerzo no sugerido'));

    [$sugerir, $motivo] = $controller->evaluarSugerirRefuerzo($data['entrega'], 55.0);

    expect($sugerir)->toBeFalse();
    expect($motivo)->toContain('ya cuenta con preguntas de refuerzo');
});

test('evaluarSugerirRefuerzo returns false with reason when GROQ_API_KEY is not configured', function () {
    $data = crearEntregaTestData(true);
    Config::set('services.groq.key', '');

    $controller = new CalificacionController;

    Log::shouldReceive('error')
        ->once()
        ->withArgs(fn ($msg) => str_contains($msg, 'GROQ_API_KEY no está configurada'));

    [$sugerir, $motivo] = $controller->evaluarSugerirRefuerzo($data['entrega'], 50.0);

    expect($sugerir)->toBeFalse();
    expect($motivo)->toContain('GROQ_API_KEY');
});

test('evaluarSugerirRefuerzo returns true when all requirements are met for failing grade', function () {
    $data = crearEntregaTestData(true);
    Config::set('services.groq.key', 'test_key_groq');

    $controller = new CalificacionController;

    Log::shouldReceive('info')
        ->once()
        ->withArgs(fn ($msg) => str_contains($msg, 'Refuerzo sugerido exitosamente'));

    [$sugerir, $motivo] = $controller->evaluarSugerirRefuerzo($data['entrega'], 65.0);

    expect($sugerir)->toBeTrue();
    expect($motivo)->toBeNull();
});

test('store endpoint returns motivo_no_refuerzo when IA is disabled for grade < 70', function () {
    $data = crearEntregaTestData(false);

    $response = $this->actingAs($data['userDocente'])
        ->postJson(route('calificaciones.store'), [
            'entrega_id' => $data['entrega']->id,
            'nota' => 65,
            'comentarios' => 'Buen intento pero falta profundizar.',
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'flash' => [
                'sugerir_refuerzo' => false,
                'entrega_refuerzo_id' => null,
            ],
        ]);

    expect($response->json('flash.motivo_no_refuerzo'))->toContain('ayuda de IA está desactivada');
});

test('refuerzos generar endpoint returns descriptive error and logs when IA assistance is inactive', function () {
    $data = crearEntregaTestData(false);

    // Give grade first
    $data['entrega']->calificacion()->create([
        'nota' => 60,
        'fecha_calificacion' => now(),
    ]);

    $response = $this->actingAs($data['userDocente'])
        ->postJson('/refuerzos/generar', [
            'entrega_id' => $data['entrega']->id,
        ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);

    expect($response->json('error'))->toContain('ayuda de IA está desactivada');
});

test('refuerzos generar endpoint returns error when entrega has no calificacion yet', function () {
    $data = crearEntregaTestData(true);

    $response = $this->actingAs($data['userDocente'])
        ->postJson('/refuerzos/generar', [
            'entrega_id' => $data['entrega']->id,
        ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'error' => 'La entrega no tiene calificación todavía.',
        ]);
});

test('refuerzos generar endpoint returns error when nota is >= 70', function () {
    $data = crearEntregaTestData(true);

    $data['entrega']->calificacion()->create([
        'nota' => 85,
        'fecha_calificacion' => now(),
    ]);

    $response = $this->actingAs($data['userDocente'])
        ->postJson('/refuerzos/generar', [
            'entrega_id' => $data['entrega']->id,
        ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);

    expect($response->json('error'))->toContain('aprobada');
});

test('refuerzos generar endpoint returns error when GROQ_API_KEY is missing', function () {
    $data = crearEntregaTestData(true);
    Config::set('services.groq.key', '');

    $data['entrega']->calificacion()->create([
        'nota' => 45,
        'fecha_calificacion' => now(),
    ]);

    $response = $this->actingAs($data['userDocente'])
        ->postJson('/refuerzos/generar', [
            'entrega_id' => $data['entrega']->id,
        ]);

    $response->assertStatus(500)
        ->assertJson([
            'success' => false,
        ]);

    expect($response->json('error'))->toContain('GROQ_API_KEY');
});

test('refuerzos generar endpoint captures and surfaces IAService exception message and logs error', function () {
    $data = crearEntregaTestData(true);
    Config::set('services.groq.key', 'test_key');

    $data['entrega']->calificacion()->create([
        'nota' => 45,
        'fecha_calificacion' => now(),
    ]);

    $mockIaService = Mockery::mock(IAService::class);
    $mockIaService->shouldReceive('generarPreguntas')
        ->once()
        ->andThrow(new Exception('Rate limit exceeded from Groq (HTTP 429)'));

    $this->app->instance(IAService::class, $mockIaService);

    $response = $this->actingAs($data['userDocente'])
        ->postJson('/refuerzos/generar', [
            'entrega_id' => $data['entrega']->id,
        ]);

    $response->assertStatus(500)
        ->assertJson([
            'success' => false,
        ]);

    expect($response->json('error'))->toContain('Rate limit exceeded from Groq (HTTP 429)');
});
