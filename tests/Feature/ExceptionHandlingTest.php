<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // Configurar rutas de prueba para simular excepciones
    Route::get('/test-database-error', function () {
        throw new QueryException(
            'mysql',
            'SELECT * FROM users',
            [],
            new Exception('SQLSTATE[HY000] [2002] Connection refused')
        );
    });

    Route::get('/test-server-error', function () {
        throw new Exception('Falla intencional en la lógica de procesamiento.');
    });

    Route::get('/test-http-error', function () {
        abort(403);
    });
});

test('configuracion de idioma del sistema esta en español', function () {
    expect(config('app.locale'))->toBe('es')
        ->and(config('app.fallback_locale'))->toBe('es');

    expect(__('auth.failed'))->toBe('Estas credenciales no coinciden con nuestros registros.');
    expect(__('passwords.reset'))->toBe('¡Tu contraseña ha sido restablecida exitosamente!');
});

test('falla de conexion a la base de datos retorna vista en español para navegadores web', function () {
    $response = $this->get('/test-database-error');

    $response->assertStatus(503);
    $response->assertSee('Error de Conexión a la Base de Datos');
    $response->assertSee('No se pudo establecer comunicación con el servidor de base de datos');
    $response->assertSee('Reintentar Conexión');
});

test('falla de conexion a la base de datos retorna json en español para peticiones inertia o ajax', function () {
    $response = $this->withHeaders([
        'X-Inertia' => 'true',
    ])->get('/test-database-error');

    $response->assertStatus(503);
    $response->assertJsonStructure([
        'message',
        'error',
        'tipo',
    ]);
    expect($response->json('message'))->toContain('Error de Conexión a la Base de Datos')
        ->and($response->json('tipo'))->toBe('database_connection_error');
});

test('error de servidor retorna mensaje descriptivo en español para inertia', function () {
    $response = $this->withHeaders([
        'X-Inertia' => 'true',
    ])->get('/test-server-error');

    $response->assertStatus(500);
    expect($response->json('message'))->toBe('Falla intencional en la lógica de procesamiento.');
});

test('error 403 retorna mensaje de acceso restringido en español para inertia', function () {
    $response = $this->withHeaders([
        'X-Inertia' => 'true',
    ])->get('/test-http-error');

    $response->assertStatus(403);
    expect($response->json('message'))->toContain('Acceso restringido');
});
