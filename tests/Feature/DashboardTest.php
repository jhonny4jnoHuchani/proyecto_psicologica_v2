<?php

use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Notificacion;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('admin can visit dashboard and receive statistical data', function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats.gestiones_activas')
        ->has('stats.cursos_activos')
        ->has('stats.total_docentes')
        ->has('stats.total_estudiantes')
        ->has('stats.total_lecciones')
        ->has('stats.promedio_general')
        ->has('stats.tasa_aprobacion')
        ->has('stats.total_refuerzos')
        ->has('semaforo.resumen.alto')
        ->has('semaforo.resumen.medio')
        ->has('semaforo.resumen.bajo')
    );
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->create();
    Notificacion::create([
        'user_id' => $user->id,
        'tipo' => 'tarea_calificada',
        'titulo' => 'Tarea Calificada',
        'mensaje' => 'Se calificó tu entrega',
        'leida' => false,
    ]);
    Notificacion::create([
        'user_id' => $user->id,
        'tipo' => 'refuerzo_generado',
        'titulo' => 'Refuerzo Disponible',
        'mensaje' => 'Tienes preguntas de refuerzo',
        'leida' => false,
    ]);

    expect($user->notificaciones()->noLeidas()->count())->toBe(2);

    $response = $this->actingAs($user)->post('/notificaciones/marcar-todas-leidas');

    $response->assertRedirect();
    expect($user->notificaciones()->noLeidas()->count())->toBe(0);
});

test('docente can visit dashboard and receive cursos data', function () {
    Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole('docente');
    Docente::create(['user_id' => $user->id, 'especialidad' => 'Psicología General']);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('rol', 'docente')
        ->has('cursos')
        ->has('semaforo.resumen.alto')
        ->has('docente_stats.entregas_pendientes')
    );
});

test('estudiante can visit dashboard and receive tareas and refuerzos data', function () {
    Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole('estudiante');
    Estudiante::create([
        'user_id' => $user->id,
        'nombre_completo' => 'Estudiante Test',
        'fecha_nacimiento' => '2005-01-01',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('rol', 'estudiante')
        ->has('cursos')
        ->has('tareas_pendientes')
        ->has('refuerzos_pendientes')
        ->has('ultimas_calificaciones')
        ->has('resumen.tareas_pendientes_count')
    );
});
