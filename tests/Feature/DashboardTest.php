<?php

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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

test('estudiante dashboard provides tareas_pendientes with materia details', function () {
    Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);

    $userEst = User::factory()->create();
    $userEst->assignRole('estudiante');
    $estudiante = Estudiante::create(['user_id' => $userEst->id]);

    $userDoc = User::factory()->create();
    $userDoc->assignRole('docente');
    $docente = Docente::create(['user_id' => $userDoc->id]);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => '1er Semestre',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);

    $curso = Curso::create(['gestion_id' => $gestion->id, 'paralelo' => 'A', 'turno' => 'mañana', 'cupos' => 30, 'estado' => 'activo']);
    $materia1 = Materia::create(['codigo' => 'MAT-1', 'nombre' => 'Materia Uno']);
    $materia2 = Materia::create(['codigo' => 'MAT-2', 'nombre' => 'Materia Dos']);

    $curso->materias()->attach($materia1->id, ['docente_id' => $docente->id]);
    $curso->materias()->attach($materia2->id, ['docente_id' => $docente->id]);
    $curso->estudiantes()->attach($estudiante->id, ['fecha_inscripcion' => now(), 'estado' => 'activo']);

    // Crear tarea SOLO en materia1
    $leccion = Leccion::create([
        'curso_id' => $curso->id,
        'materia_id' => $materia1->id,
        'docente_id' => $docente->id,
        'titulo' => 'Tarea Exclusiva Materia 1',
        'estado' => 'activo',
    ]);

    $response = $this->actingAs($userEst)->get('/dashboard');
    $response->assertOk();

    $response->assertInertia(function ($page) use ($materia1, $materia2) {
        $props = $page->toArray()['props'];
        $tareas = $props['tareas_pendientes'];
        $cursos = $props['cursos'];

        expect($tareas)->toHaveCount(1);
        expect($tareas[0]['materia_id'])->toBe($materia1->id);
        expect($cursos[0]['materias'])->toHaveCount(2);

        // Materia 1 coincide con la tarea, Materia 2 NO debe tener la tarea
        $materia1Id = $materia1->id;
        $materia2Id = $materia2->id;

        $tareasMateria1 = array_filter($tareas, fn ($t) => ($t['materia_id'] ?? null) === $materia1Id || ($t['materia']['id'] ?? null) === $materia1Id);
        $tareasMateria2 = array_filter($tareas, fn ($t) => ($t['materia_id'] ?? null) === $materia2Id || ($t['materia']['id'] ?? null) === $materia2Id);

        expect($tareasMateria1)->toHaveCount(1);
        expect($tareasMateria2)->toHaveCount(0);
    });
});

test('docente can upload custom cover image for assigned curso-materia', function () {
    Storage::fake('public');
    Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('docente');
    $docente = Docente::create(['user_id' => $user->id, 'especialidad' => 'Psicología Clínica']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => 1,
        'fecha_inicio' => '2026-02-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'nombre' => '1er Semestre', 'turno' => 'mañana', 'paralelo' => 'A']);
    $materia = Materia::create(['nombre' => 'Psicología General', 'codigo' => 'PSI-101']);

    $cursoMateriaId = DB::table('curso_materia')->insertGetId([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'ayuda_ia_activa' => true,
    ]);

    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    $file = UploadedFile::fake()->createWithContent('portada.png', $png);

    $response = $this->actingAs($user)->post("/docente/curso-materia/{$cursoMateriaId}/imagen", [
        'imagen' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Portada de la materia actualizada correctamente.');

    $updated = DB::table('curso_materia')->where('id', $cursoMateriaId)->first();
    expect($updated->imagen)->not->toBeNull();
    expect($updated->imagen)->toStartWith('materias/portadas/');
    Storage::disk('public')->assertExists($updated->imagen);
});

test('subirImagen rejects invalid non-image files', function () {
    Storage::fake('public');
    Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole('docente');
    $docente = Docente::create(['user_id' => $user->id, 'especialidad' => 'Psicología']);

    $gestion = Gestion::create([
        'año' => 2026,
        'etapa' => 1,
        'fecha_inicio' => '2026-02-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'activo',
    ]);
    $curso = Curso::create(['gestion_id' => $gestion->id, 'nombre' => '2do Semestre', 'turno' => 'tarde', 'paralelo' => 'B']);
    $materia = Materia::create(['nombre' => 'Psicometría', 'codigo' => 'PSI-201']);

    $cursoMateriaId = DB::table('curso_materia')->insertGetId([
        'curso_id' => $curso->id,
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'ayuda_ia_activa' => false,
    ]);

    $file = UploadedFile::fake()->create('archivo.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)->post("/docente/curso-materia/{$cursoMateriaId}/imagen", [
        'imagen' => $file,
    ]);

    $response->assertSessionHasErrors('imagen');
});
