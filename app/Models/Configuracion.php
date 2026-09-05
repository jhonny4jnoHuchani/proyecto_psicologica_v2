<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuraciones';

    protected $fillable = [
        'color_primario',
        'color_secundario',
        'logo',
        'mision',
        'vision',
        'lema',
        'organigrama',
    ];
    //

    /**
     * Calcula si el texto sobre un color de fondo debe ser negro o blanco,
     * según la fórmula de brillo percibido (YIQ).
     */
    public static function colorContraste(?string $hex): string
    {
        if (! $hex || ! preg_match('/^#?[0-9A-Fa-f]{6}$/', $hex)) {
            return '#ffffff';
        }

        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        $brillo = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

        return $brillo >= 128 ? '#000000' : '#ffffff';
    }
}