<?php

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Gestion;
use App\Models\Leccion;
use App\Models\Materia;
use App\Models\User;
use App\Services\IdObfuscator;
use Spatie\Permission\Models\Role;

test('leccion redirects numeric id to obfuscated url and resolves properly', function () {
    Role::firstOrCreate(['name' => 'docente']);
    $user = User::factory()->create();
    $user->assignRole('docente');

    $docente = Docente::create([
        'user_id' => $user->id,
        'especialidad' => 'Psicología Clínica',
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

    $leccion = Leccion::create([
        'materia_id' => $materia->id,
        'docente_id' => $docente->id,
        'curso_id' => $curso->id,
        'titulo' => 'Introducción a la Psicología',
        'estado' => 'activo',
    ]);

    $hashId = IdObfuscator::encode($leccion->id);
    expect($leccion->hash_id)->toBe($hashId);

    // 1. Direct access by numeric ID redirects to obfuscated URL
    $response = $this->actingAs($user)->get("/lecciones/{$leccion->id}");
    $response->assertRedirect("/lecciones/{$hashId}");

    // 2. Access with obfuscated hash returns 200 OK
    $responseHash = $this->actingAs($user)->get("/lecciones/{$hashId}");
    $responseHash->assertOk();

    // 3. Test that Curso also redirects numeric ID to hash_id
    Role::firstOrCreate(['name' => 'admin']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $cursoHash = IdObfuscator::encode($curso->id);
    $responseCurso = $this->actingAs($admin)->get("/cursos/{$curso->id}");
    $responseCurso->assertRedirect("/cursos/{$cursoHash}");
});
