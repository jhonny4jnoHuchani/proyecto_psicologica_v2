<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MachineLearningService
{
    // La dirección donde vive nuestro cerebro de Python
    protected $baseUrl = 'http://127.0.0.1:5000';

    /**
     * Pregunta al cerebro ML qué libro recomendar.
     */
    public function getRecomendacion($materiaId, $notaInicial)
    {
        try {
            // Laravel hace la petición HTTP a Python (El mesero va a la cocina)
            $response = Http::timeout(5)->get("{$this->baseUrl}/recomendar/{$materiaId}/{$notaInicial}");

            // Si Python responde bien, devolvemos el JSON
            if ($response->successful()) {
                return $response->json();
            }
            
            return ['recomendar' => false, 'mensaje' => 'El modelo no generó recomendación.'];

        } catch (\Exception $e) {
            // Si Python está apagado, NO rompemos la app, solo avisamos
            Log::error("Error conectando con ML: " . $e->getMessage());
            return ['recomendar' => false, 'mensaje' => 'El sistema de IA no está disponible en este momento.'];
        }
    }

        /**
     * Predice el rendimiento en el próximo tema (Sistema Preventivo)
     */
    public function getPrediccion($materiaId, $notaActual)
   {
        try {
            Log::info("🔍 ML Predictivo: Llamando a Python - materia_id: {$materiaId}, nota: {$notaActual}");
            
            $url = "{$this->baseUrl}/predecir/{$materiaId}/{$notaActual}";
            Log::info(" URL de petición: {$url}");
            
            $response = Http::timeout(10)->get($url); // Aumentamos timeout a 10 segundos
            
            Log::info("📡 Respuesta de Python: Status " . $response->status());
            
            if ($response->successful()) {
                $data = $response->json();
                Log::info("✅ Datos recibidos: ", $data);
                return $data;
            }
                       Log::error("❌ Respuesta no exitosa: " . $response->body());
            
            // Si hay error, devuelve valores por defecto
            return [
                'prediccion_sin_leer' => 0,
                'prediccion_con_leer' => 0,
                'beneficio' => 0
            ];
        } catch (\Exception $e) {
            Log::error("💥 Error en ML Predictivo: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            
            return [
                'prediccion_sin_leer' => 0,
                'prediccion_con_leer' => 0,
                'beneficio' => 0
            ];
        }
    }
}   