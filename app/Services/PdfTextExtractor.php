<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class PdfTextExtractor
{
    /**
     * Extrae texto de un archivo PDF (instancia UploadedFile o ruta de archivo en disco).
     */
    public static function extraer(UploadedFile|string $archivo, int $maxCaracteres = 12000): string
    {
        $ruta = is_string($archivo) ? $archivo : $archivo->getRealPath();

        if (! file_exists($ruta) || ! is_readable($ruta)) {
            return '';
        }

        // 1. Intentar con pdftotext si está disponible en el servidor (Poppler utils)
        if (function_exists('shell_exec')) {
            try {
                $cmd = 'pdftotext -enc UTF-8 -f 1 -l 15 '.escapeshellarg($ruta).' - 2>/dev/null';
                $output = @shell_exec($cmd);
                if (! empty($output) && mb_strlen(trim($output)) > 40) {
                    return self::limpiarTexto($output, $maxCaracteres);
                }
            } catch (\Throwable $e) {
                Log::debug('pdftotext CLI no disponible o falló: '.$e->getMessage());
            }
        }

        // 2. Extractor nativo en PHP decodificando streams FlateDecode / texto PDF
        try {
            $textoNativo = self::extraerConPhp($ruta);
            if (! empty($textoNativo) && mb_strlen(trim($textoNativo)) > 40) {
                return self::limpiarTexto($textoNativo, $maxCaracteres);
            }
        } catch (\Throwable $e) {
            Log::warning('Fallo al extraer texto nativo de PDF: '.$e->getMessage());
        }

        return '';
    }

    /**
     * Extractor nativo puro en PHP leyendo streams de PDF descomprimidos con gzuncompress.
     */
    protected static function extraerConPhp(string $ruta): string
    {
        $contenido = @file_get_contents($ruta);
        if (! $contenido) {
            return '';
        }

        $texto = '';

        // Buscar bloques stream ... endstream
        if (preg_match_all('#stream[\r\n]+(.*?)[\r\n]+endstream#s', $contenido, $streams)) {
            foreach ($streams[1] as $stream) {
                // Intentar descomprimir stream FlateDecode
                $datos = @gzuncompress($stream);
                if ($datos === false) {
                    $datos = $stream;
                }

                // Extraer operadores Tj: (texto) Tj
                if (preg_match_all('#\((.*?)\)\s*Tj#s', $datos, $tjMatches)) {
                    foreach ($tjMatches[1] as $t) {
                        $texto .= self::decodificarCadenaPdf($t).' ';
                    }
                    $texto .= "\n";
                }

                // Extraer operadores TJ: [(texto) 20 (mas texto)] TJ
                if (preg_match_all('#\[(.*?)\]\s*TJ#s', $datos, $tjArrMatches)) {
                    foreach ($tjArrMatches[1] as $arr) {
                        if (preg_match_all('#\((.*?)\)#s', $arr, $subMatches)) {
                            foreach ($subMatches[1] as $t) {
                                $texto .= self::decodificarCadenaPdf($t);
                            }
                            $texto .= ' ';
                        }
                    }
                    $texto .= "\n";
                }
            }
        }

        return $texto;
    }

    /**
     * Limpia y normaliza caracteres escapados en strings PDF.
     */
    protected static function decodificarCadenaPdf(string $str): string
    {
        $str = str_replace(
            ['\\n', '\\r', '\\t', '\\\\', '\\(', '\\)'],
            ["\n", "\r", "\t", '\\', '(', ')'],
            $str
        );

        // Reemplazar secuencias octales \ddd
        return (string) preg_replace_callback('/\\\([0-7]{1,3})/', function ($m) {
            return chr((int) octdec($m[1]));
        }, $str);
    }

    /**
     * Normaliza saltos de línea y limita tamaño.
     */
    protected static function limpiarTexto(string $texto, int $maxCaracteres): string
    {
        $texto = preg_replace('/[ \t]+/', ' ', $texto);
        $texto = preg_replace('/(\r?\n){3,}/', "\n\n", $texto);
        $texto = trim((string) $texto);

        if (mb_strlen($texto) > $maxCaracteres) {
            $texto = mb_substr($texto, 0, $maxCaracteres);
        }

        return $texto;
    }
}
