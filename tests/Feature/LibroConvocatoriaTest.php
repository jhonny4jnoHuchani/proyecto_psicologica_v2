<?php

use App\Models\Convocatoria;
use App\Models\Libro;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

test('welcome page renders successfully with convocatorias and libros', function () {
    $materia = Materia::create(['nombre' => 'Psicología General', 'codigo' => 'PSI-101']);

    Convocatoria::create([
        'titulo' => 'Convocatoria Admisión 2026',
        'descripcion' => 'Inscripciones abiertas para postulantes.',
        'archivo' => 'convocatorias/afiche_oficial.jpg',
        'activo' => true,
    ]);

    Libro::create([
        'materia_id' => $materia->id,
        'nombre' => 'Manual de Psicología Experimental',
        'autor' => 'Dr. René Zavaleta',
        'anio_lanzamiento' => 2024,
        'archivo' => 'libros/pdf/manual.pdf',
    ]);

    $response = $this->get('/');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->has('convocatorias')
        ->has('libros')
    );
});

test('convocatoria model resolves imagen_url and archivo_url without duplicates', function () {
    $c1 = new Convocatoria(['archivo' => 'convocatorias/afiche.jpg']);
    expect($c1->imagen_url)->toBe('/storage/convocatorias/afiche.jpg');
    expect($c1->imagen_url)->not->toContain('/storage/storage/');

    $c2 = new Convocatoria(['archivo' => '/storage/convocatorias/afiche2.jpg']);
    expect($c2->imagen_url)->toBe('/storage/convocatorias/afiche2.jpg');
    expect($c2->imagen_url)->not->toContain('/storage/storage/');

    $c3 = new Convocatoria(['archivo' => null]);
    expect($c3->imagen_url)->toBeNull();
});

test('admin can upload pdf when creating and updating a libro', function () {
    Storage::fake('public');
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $materia = Materia::create(['nombre' => 'Neurociencias', 'codigo' => 'PSI-105']);

    $pdfContent = '%PDF-1.4 mock pdf content';
    $pdf = UploadedFile::fake()->createWithContent('neurociencia.pdf', $pdfContent);

    // 1. Crear libro
    $response = $this->actingAs($admin)->post('/libros', [
        'materia_id' => $materia->id,
        'nombre' => 'Fundamentos de Neurociencias',
        'autor' => 'Eric Kandel',
        'anio_lanzamiento' => 2023,
        'archivo' => $pdf,
    ]);

    $response->assertRedirect('/libros');
    $libro = Libro::where('nombre', 'Fundamentos de Neurociencias')->first();
    expect($libro)->not->toBeNull();
    expect($libro->archivo)->not->toBeNull();
    Storage::disk('public')->assertExists($libro->archivo);

    // 2. Actualizar libro con _method PUT
    $newPdfContent = '%PDF-1.4 updated pdf content';
    $newPdf = UploadedFile::fake()->createWithContent('neurociencia_v2.pdf', $newPdfContent);

    $updateResponse = $this->actingAs($admin)->post("/libros/{$libro->id}", [
        '_method' => 'PUT',
        'materia_id' => $materia->id,
        'nombre' => 'Fundamentos de Neurociencias 2da Ed.',
        'autor' => 'Eric Kandel',
        'anio_lanzamiento' => 2024,
        'archivo' => $newPdf,
    ]);

    $updateResponse->assertRedirect('/libros');
    $libro->refresh();
    expect($libro->nombre)->toBe('Fundamentos de Neurociencias 2da Ed.');
    expect($libro->archivo)->not->toBeNull();
    Storage::disk('public')->assertExists($libro->archivo);
});
