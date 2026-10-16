<?php

namespace App\Services;

class IdObfuscator
{
    private static function getKey(): string
    {
        try {
            if (function_exists('config') && app()->bound('config')) {
                return (string) config('app.key', 'antigravity-secret-salt-2026');
            }
        } catch (\Throwable $e) {
        }

        return (string) env('APP_KEY', 'antigravity-secret-salt-2026');
    }

    /**
     * Codifica un ID numérico entero en un código alfanumérico seguro y reversible.
     */
    public static function encode(int $id): string
    {
        if ($id <= 0) {
            return (string) $id;
        }

        $appKey = self::getKey();

        // Empaquetar el entero de 32 bits (4 bytes)
        $raw = pack('N', $id);

        // Máscara derivada de la clave de la app
        $mask = substr(hash('sha256', $appKey, true), 0, 4);
        $xored = $raw ^ $mask;

        // Checksum de 2 bytes para validación
        $check = substr(hash_hmac('sha256', $raw, $appKey, true), 0, 2);

        // Base64 URL-safe de 6 bytes (produce exactamente 8 caracteres limpios)
        return rtrim(strtr(base64_encode($xored.$check), '+/', '-_'), '=');
    }

    /**
     * Decodifica el código alfanumérico de vuelta al ID entero original.
     * Si recibe un ID numérico entero, lo acepta directamente como fallback.
     */
    public static function decode(string $code): ?int
    {
        $code = trim($code);

        if (ctype_digit($code)) {
            return (int) $code;
        }

        $appKey = self::getKey();

        $padded = strtr($code, '-_', '+/');
        $decoded = base64_decode($padded, true);

        if ($decoded === false || strlen($decoded) !== 6) {
            return null;
        }

        $xored = substr($decoded, 0, 4);
        $check = substr($decoded, 4, 2);

        $mask = substr(hash('sha256', $appKey, true), 0, 4);
        $raw = $xored ^ $mask;

        $expectedCheck = substr(hash_hmac('sha256', $raw, $appKey, true), 0, 2);
        if (! hash_equals($expectedCheck, $check)) {
            return null;
        }

        $unpacked = unpack('N', $raw);

        return isset($unpacked[1]) && $unpacked[1] > 0 ? (int) $unpacked[1] : null;
    }
}
