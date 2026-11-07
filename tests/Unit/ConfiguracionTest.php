<?php

use App\Models\Configuracion;
use Tests\TestCase;

uses(TestCase::class);

test('calcula contraste de color blanco o negro correctamente', function () {
    expect(Configuracion::colorContraste('#ffffff'))->toBe('#000000')
        ->and(Configuracion::colorContraste('#000000'))->toBe('#ffffff')
        ->and(Configuracion::colorContraste('#4f46e5'))->toBe('#ffffff');
});

test('mezcla colores con ratio especificado', function () {
    $blanco = '#ffffff';
    $negro = '#000000';
    $mezcla = Configuracion::mixColors($negro, $blanco, 0.5);

    expect($mezcla)->toBe('#808080');
});

test('genera paleta completa derivada para modo claro y modo oscuro', function () {
    $palette = Configuracion::getThemePalette('#4f46e5', '#06b6d4');

    expect($palette)->toHaveKeys(['primary', 'primary_fg', 'secondary', 'secondary_fg', 'light', 'dark'])
        ->and($palette['light'])->toHaveKeys(['sidebar_background', 'sidebar_foreground', 'sidebar_accent', 'header_background', 'background', 'card'])
        ->and($palette['dark'])->toHaveKeys(['sidebar_background', 'sidebar_foreground', 'sidebar_accent', 'header_background', 'background', 'card'])
        ->and($palette['light']['sidebar_background'])->not->toBe('#ffffff')
        ->and($palette['dark']['sidebar_background'])->toStartWith('#');
});
