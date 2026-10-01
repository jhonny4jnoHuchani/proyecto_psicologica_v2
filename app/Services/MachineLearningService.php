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
}