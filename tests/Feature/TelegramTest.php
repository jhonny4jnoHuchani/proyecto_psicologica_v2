<?php

use App\Jobs\EnviarNotificacionTelegram;
use App\Models\Notificacion;
use App\Models\TelegramVinculacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('telegram webhook returns disabled response when telegram is not enabled in config', function () {
    Config::set('services.telegram.enabled', false);

    $response = $this->postJson('/telegram/webhook', [
        'message' => [
            'chat' => ['id' => 123456],
            'text' => '/start',
        ],
    ]);

    $response->assertOk();
    $response->assertJson([
        'ok' => false,
        'message' => 'Telegram deshabilitado en configuración',
    ]);
});

test('telegram webhook handles /start command and prompts for CI', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $response = $this->postJson('/telegram/webhook', [
        'message' => [
            'chat' => ['id' => 99999],
            'from' => ['username' => 'testuser'],
            'text' => '/start',
        ],
    ]);

    $response->assertOk();
    $response->assertJson(['ok' => true]);
    expect(Cache::get('tg:99999'))->toBe('esperando_ci');

    Http::assertSent(function ($request) {
        return str_contains($request->url(), 'sendMessage')
            && $request['chat_id'] === 99999
            && str_contains($request['text'], 'envíame tu CI');
    });
});

test('telegram webhook processes CI and prompts for phone contact', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    $user = User::factory()->create([
        'ci' => '1234567',
        'celular' => '76543210',
        'nombre' => 'Carlos',
    ]);

    Cache::put('tg:88888', 'esperando_ci', 600);

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $response = $this->postJson('/telegram/webhook', [
        'message' => [
            'chat' => ['id' => 88888],
            'from' => ['username' => 'carlos_dev'],
            'text' => '1234567',
        ],
    ]);

    $response->assertOk();
    expect(Cache::get('tg:88888'))->toBe("esperando_contacto:{$user->id}");

    Http::assertSent(function ($request) use ($user) {
        return str_contains($request->url(), 'sendMessage')
            && $request['chat_id'] === 88888
            && str_contains($request['text'], "Te encontré, {$user->nombre}");
    });
});

test('telegram webhook links account when phone number matches', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    $user = User::factory()->create([
        'ci' => '9876543',
        'celular' => '71234567',
    ]);

    Cache::put('tg:77777', "esperando_contacto:{$user->id}", 600);

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $response = $this->postJson('/telegram/webhook', [
        'message' => [
            'chat' => ['id' => 77777],
            'from' => ['username' => 'juanp'],
            'contact' => [
                'phone_number' => '+59171234567',
            ],
        ],
    ]);

    $response->assertOk();
    expect(Cache::get('tg:77777'))->toBeNull();

    $this->assertDatabaseHas('telegram_vinculaciones', [
        'user_id' => $user->id,
        'chat_id' => '77777',
        'telegram_username' => 'juanp',
    ]);
});

test('enviar notificacion telegram job sends notification to vinculated user', function () {
    Config::set('services.telegram.enabled', true);
    Config::set('services.telegram.bot_token', 'fake-token');

    $user = User::factory()->create();
    TelegramVinculacion::create([
        'user_id' => $user->id,
        'chat_id' => '12345678',
        'telegram_username' => 'usuario_prueba',
        'vinculado_at' => now(),
    ]);

    $notificacion = Notificacion::create([
        'user_id' => $user->id,
        'tipo' => 'tarea_nueva',
        'titulo' => 'Nueva Lección Asignada',
        'mensaje' => 'Revisa la plataforma para ver los detalles.',
        'url' => '/lecciones',
        'leida' => false,
        'enviada_telegram' => false,
    ]);

    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    (new EnviarNotificacionTelegram($notificacion->id))->handle();

    $notificacion->refresh();
    expect($notificacion->enviada_telegram)->toBeTrue()
        ->and($notificacion->enviada_telegram_at)->not->toBeNull()
        ->and($notificacion->telegram_error)->toBeNull();

    Http::assertSent(function ($request) use ($notificacion) {
        return str_contains($request->url(), 'sendMessage')
            && $request['chat_id'] === '12345678'
            && str_contains($request['text'], $notificacion->titulo);
    });
});
