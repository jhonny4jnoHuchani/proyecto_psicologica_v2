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
        'telegram_bot_token',
        'telegram_chat_id',
        'telegram_bot_username',
        'telegram_activo',
    ];

    /**
     * Ocultar el token sensible de serializaciones JSON globales de Inertia
     */
    protected $hidden = [
        'telegram_bot_token',
    ];

    protected $casts = [
        'telegram_activo' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saved(function () {
            static::clearTelegramCache();
        });

        static::deleted(function () {
            static::clearTelegramCache();
        });
    }

    /**
     * Limpia la caché en memoria de la configuración de Telegram.
     */
    public static function clearTelegramCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('telegram_config_token');
        \Illuminate\Support\Facades\Cache::forget('telegram_config_chat_id');
        \Illuminate\Support\Facades\Cache::forget('telegram_config_activo');
        \Illuminate\Support\Facades\Cache::forget('telegram_config_username');
    }

    /**
     * Obtiene el token activo de Telegram (con caché y fallback a .env).
     */
    public static function getTelegramToken(): ?string
    {
        return \Illuminate\Support\Facades\Cache::remember('telegram_config_token', now()->addDay(), function () {
            $config = static::query()->select(['telegram_bot_token'])->first();
            if ($config && ! empty($config->telegram_bot_token)) {
                return $config->telegram_bot_token;
            }
            return config('services.telegram.bot_token');
        });
    }

    /**
     * Obtiene el Chat ID institucional / responsable configurado.
     */
    public static function getTelegramChatId(): ?string
    {
        return \Illuminate\Support\Facades\Cache::remember('telegram_config_chat_id', now()->addDay(), function () {
            $config = static::query()->select(['telegram_chat_id'])->first();
            return $config?->telegram_chat_id;
        });
    }

    /**
     * Indica si las notificaciones de Telegram están activas.
     */
    public static function isTelegramActivo(): bool
    {
        return \Illuminate\Support\Facades\Cache::remember('telegram_config_activo', now()->addDay(), function () {
            $config = static::query()->select(['telegram_activo', 'telegram_bot_token'])->first();
            if ($config && ! is_null($config->telegram_activo)) {
                return (bool) $config->telegram_activo && ! empty($config->telegram_bot_token);
            }
            return (bool) config('services.telegram.enabled', false);
        });
    }

    /**
     * Obtiene el username del bot (@mi_bot).
     */
    public static function getTelegramBotUsername(): ?string
    {
        return \Illuminate\Support\Facades\Cache::remember('telegram_config_username', now()->addDay(), function () {
            $config = static::query()->select(['telegram_bot_username'])->first();
            return $config?->telegram_bot_username;
        });
    }

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

    /**
     * Ajusta el brillo de un color hex (positivo = más claro hacia blanco, negativo = más oscuro hacia negro).
     * $porcentaje entre -100 y 100.
     */
    public static function colorAjustar(?string $hex, int $porcentaje): string
    {
        if (! $hex || ! preg_match('/^#?[0-9A-Fa-f]{6}$/', $hex)) {
            return $hex ?? '#4f46e5';
        }

        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        if ($porcentaje > 0) {
            $factor = $porcentaje / 100;
            $r = (int) round($r + (255 - $r) * $factor);
            $g = (int) round($g + (255 - $g) * $factor);
            $b = (int) round($b + (255 - $b) * $factor);
        } else {
            $factor = 1 + ($porcentaje / 100);
            $r = (int) round($r * $factor);
            $g = (int) round($g * $factor);
            $b = (int) round($b * $factor);
        }

        $r = max(0, min(255, $r));
        $g = max(0, min(255, $g));
        $b = max(0, min(255, $b));

        return sprintf('#%02x%02x%02x', $r, $g, $b);
    }

    /**
     * Tono hover para modo claro (12% más oscuro).
     */
    public static function colorHover(?string $hex): string
    {
        return self::colorAjustar($hex, -12);
    }

    /**
     * Tono hover para modo oscuro (15% más claro).
     */
    public static function colorHoverDark(?string $hex): string
    {
        return self::colorAjustar($hex, 15);
    }

    /**
     * Tono suave con opacidad para fondos sutiles, badges o tarjetas (formato rgba).
     */
    public static function colorLightRgba(?string $hex, float $alpha = 0.12): string
    {
        if (! $hex || ! preg_match('/^#?[0-9A-Fa-f]{6}$/', $hex)) {
            return "rgba(79, 70, 229, {$alpha})";
        }

        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        return sprintf('rgba(%d, %d, %d, %.2f)', $r, $g, $b, $alpha);
    }

    /**
     * Tono para bordes sutiles o anillos con transparencia (formato rgba).
     */
    public static function colorBorderRgba(?string $hex, float $alpha = 0.28): string
    {
        return self::colorLightRgba($hex, $alpha);
    }
}
