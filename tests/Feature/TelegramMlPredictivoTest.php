<?php

use App\Jobs\EnviarNotificacionTelegram;
use App\Models\Estudiante;
use App\Models\Materia;
use App\Models\TelegramVinculacion;
use App\Models\Tema;
use App\Models\User;
use App\Services\MachineLearningService;
use App\Services\NotificacionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('notificacion telegram incluye prediccion ML con datos historicos sin revelar nota', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    $user = User::factory()->create();
    $estudiante = Estudiante::create([
        'user_id' => $user->id,
        'colegio_procedencia' => 'San Calixto',
        'tipo_inscripcion' => 'regular',
    ]);

    TelegramVinculacion::create([
        'user_id' => $user->id,
        'chat_id' => '12345678',
        'telegram_username' => 'estudiante_ml',
        'vinculado_at' => now(),
    ]);

    $materia = Materia::create(['nombre' => 'Introducción a la Psicología', 'codigo' => 'PSI-101']);
    $temaActual = Tema::create([
        'materia_id' => $materia->id,
        'nombre' => 'Tema 1: Qué es la Psicología',
        'orden' => 1,
        'paginas_libro' => 'págs. 5-8',
        'estado' => 'visto',
    ]);
    $temaSiguiente = Tema::create([
        'materia_id' => $materia->id,
        'nombre' => 'Tema 2: Historia y Evolución',
        'orden' => 2,
        'paginas_libro' => 'págs. 9-20',
        'estado' => 'programado',
    ]);

    // Mock del servicio de Machine Learning retornando predicción exitosa
    $this->mock(MachineLearningService::class, function ($mock) use ($temaSiguiente) {
        $mock->shouldReceive('getPrediccion')
            ->once()
            ->andReturn([
                'tiene_datos_historicos' => true,
                'prediccion_sin_leer' => 52.0,
                'prediccion_con_leer' => 74.5,
                'beneficio' => 22.5,
                'mensaje' => 'Proyección calculada',
                'siguiente_tema' => [
                    'tema_id' => $temaSiguiente->id,
                    'nombre' => $temaSiguiente->nombre,
                    'orden' => 2,
                    'paginas_libro' => $temaSiguiente->paginas_libro,
                ],
            ]);
    });

    $notificacion = NotificacionService::tareaCalificada(
        user: $user,
        nota: 75.0, // Nota real que NO debe ser expuesta en Telegram
        nombreTarea: 'Tarea 1: Resumen de Psicología',
        nombreMateria: $materia->nombre,
        comentarios: 'Buen esfuerzo conceptual.',
        url: '/lecciones/abc',
        mandarTelegram: true,
        estudianteId: $estudiante->id,
        materiaId: $materia->id,
        temaId: $temaActual->id,
    );

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    (new EnviarNotificacionTelegram($notificacion->id))->handle();

    Http::assertSent(function ($request) use ($temaSiguiente) {
        $text = $request['text'];

        $tieneEncabezado = str_contains($text, 'Predicción de rendimiento para el próximo tema');
        $tieneSubtitulo = str_contains($text, 'Ve lo que debes estudiar para la siguiente clase');
        $tieneSiguienteTema = str_contains($text, $temaSiguiente->nombre);
        $tienePaginas = str_contains($text, $temaSiguiente->paginas_libro);
        $tieneBeneficio = str_contains($text, '+22.5 puntos');
        $noDiceNota = ! str_contains($text, '75.0') && ! str_contains($text, '/100');

        return $request['chat_id'] === '12345678'
            && $tieneEncabezado
            && $tieneSubtitulo
            && $tieneSiguienteTema
            && $tienePaginas
            && $tieneBeneficio
            && $noDiceNota;
    });
});

test('notificacion telegram maneja arranque en frio cuando materia no tiene historial', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    $user = User::factory()->create();
    $estudiante = Estudiante::create([
        'user_id' => $user->id,
        'colegio_procedencia' => 'San Ignacio',
        'tipo_inscripcion' => 'regular',
    ]);

    TelegramVinculacion::create([
        'user_id' => $user->id,
        'chat_id' => '87654321',
        'telegram_username' => 'estudiante_nuevo',
        'vinculado_at' => now(),
    ]);

    $materia = Materia::create(['nombre' => 'Neurociencias Aplicadas', 'codigo' => 'NEU-201']);
    $temaActual = Tema::create([
        'materia_id' => $materia->id,
        'nombre' => 'Tema 1: Fundamentos de Sinapsis',
        'orden' => 1,
        'paginas_libro' => 'págs. 1-12',
        'estado' => 'visto',
    ]);
    $temaSiguiente = Tema::create([
        'materia_id' => $materia->id,
        'nombre' => 'Tema 2: Neurotransmisores',
        'orden' => 2,
        'paginas_libro' => 'págs. 13-28',
        'estado' => 'programado',
    ]);

    // Mock de Cold Start (tiene_datos_historicos = false)
    $this->mock(MachineLearningService::class, function ($mock) {
        $mock->shouldReceive('getPrediccion')
            ->once()
            ->andReturn([
                'tiene_datos_historicos' => false,
                'prediccion_sin_leer' => null,
                'prediccion_con_leer' => null,
                'beneficio' => 0,
                'mensaje' => 'Materia en recopilación de datos iniciales.',
                'siguiente_tema' => null,
            ]);
    });

    $notificacion = NotificacionService::refuerzoGenerado(
        user: $user,
        nombreTema: $temaActual->nombre,
        refuerzoId: 99,
        estudianteId: $estudiante->id,
        materiaId: $materia->id,
        temaId: $temaActual->id,
    );

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    (new EnviarNotificacionTelegram($notificacion->id))->handle();

    Http::assertSent(function ($request) use ($temaSiguiente) {
        $text = $request['text'];

        $tieneEncabezado = str_contains($text, 'Predicción de rendimiento para el próximo tema');
        $tieneSubtitulo = str_contains($text, 'Ve lo que debes estudiar para la siguiente clase');
        $tieneAvisoColdStart = str_contains($text, 'Materia en etapa inicial de recopilación de datos históricos');
        $tieneSiguienteTema = str_contains($text, $temaSiguiente->nombre);
        $noMuestraNulos = ! str_contains($text, 'null') && ! str_contains($text, '~undefined');

        return $request['chat_id'] === '87654321'
            && $tieneEncabezado
            && $tieneSubtitulo
            && $tieneAvisoColdStart
            && $tieneSiguienteTema
            && $noMuestraNulos;
    });
});

test('notificacion telegram es tolerante a fallos si microservicio ML esta caido', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    $user = User::factory()->create();
    $estudiante = Estudiante::create([
        'user_id' => $user->id,
        'colegio_procedencia' => 'Alemán',
        'tipo_inscripcion' => 'regular',
    ]);

    TelegramVinculacion::create([
        'user_id' => $user->id,
        'chat_id' => '55555555',
        'telegram_username' => 'estudiante_resiliente',
        'vinculado_at' => now(),
    ]);

    // Mock simulando falla catastrófica de conexión
    $this->mock(MachineLearningService::class, function ($mock) {
        $mock->shouldReceive('getPrediccion')
            ->once()
            ->andThrow(new RuntimeException('Connection refused to Python ML microservice'));
    });

    // Debe crearse la notificación sin arrojar excepciones
    $notificacion = NotificacionService::tareaCalificada(
        user: $user,
        nota: 90.0,
        nombreTarea: 'Tarea de Resiliencia',
        nombreMateria: 'Psicología General',
        comentarios: null,
        url: '/lecciones/1',
        mandarTelegram: true,
        estudianteId: $estudiante->id,
        materiaId: 1,
        temaId: 1,
    );

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    // El Job debe ejecutarse y enviar el mensaje principal sin romper la cola
    (new EnviarNotificacionTelegram($notificacion->id))->handle();

    Http::assertSent(function ($request) {
        return $request['chat_id'] === '55555555'
            && str_contains($request['text'], 'Tarea de Resiliencia');
    });
});
