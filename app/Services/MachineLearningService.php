<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Servicio de integración con el Microservicio de Machine Learning (Python/Flask/Gunicorn).
 *
 * Funciones principales:
 * 1. getPrediccion(): Proyecta nota del próximo TEMA con/sin repaso (Scikit-Learn RandomForest).
 * 2. getRecomendacion(): Sugiere el repaso del tema relevante y sus páginas del texto guía.
 * 3. getRiesgoEstudiante(): Calcula semáforo de alerta temprana (Verde/Amarillo/Rojo) para docentes.
 * 4. getSalud(): Monitorea el estado operativo y metadatos CRISP-DM del modelo.
 *
 * Seguridad: Comunica internamente vía cabecera segura X-ML-API-KEY (ISO/IEC 27001).
 */
/**
 * Servicio de integración con el Microservicio de Machine Learning (Python/Flask/Gunicorn).
 *
 * Funciones principales:
 * 1. getPrediccion(): Proyecta nota del próximo TEMA con/sin repaso (Scikit-Learn RandomForest).
 * 2. getRecomendacion(): Sugiere el repaso del tema relevante y sus páginas del texto guía.
 * 3. getRiesgoEstudiante(): Calcula semáforo de alerta temprana (Verde/Amarillo/Rojo) para docentes.
 * 4. getSalud(): Monitorea el estado operativo y metadatos CRISP-DM del modelo.
 *
 * Seguridad: Comunica internamente vía cabecera segura X-ML-API-KEY (ISO/IEC 27001).
 */
class MachineLearningService
{
    /** URL base del microservicio Python (por defecto http://127.0.0.1:5000). */
    protected string $baseUrl;

    /** Token de autorización compartida para llamadas internas seguras. */
    protected ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.ml.url', 'http://127.0.0.1:5000'), '/');
        $this->apiKey = config('services.ml.key');
    }

    /**
     * Retorna un cliente HTTP preconfigurado con la cabecera de autenticación.
     */
    protected function client(int $timeout = 5)
    {
        $headers = [];
        if (! empty($this->apiKey)) {
            $headers['X-ML-API-KEY'] = $this->apiKey;
        }

        return Http::withHeaders($headers)->timeout($timeout);
    }

    /**
     * Pregunta al cerebro ML qué TEMA recomendar para repasar.
     */
    public function getRecomendacion($materiaId, $notaInicial)
    {
        try {
            $response = $this->client(5)->get("{$this->baseUrl}/recomendar/{$materiaId}/{$notaInicial}");

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'recomendar' => false,
                'tiene_datos_historicos' => false,
                'mensaje' => 'El modelo no generó recomendación para esta materia.',
            ];

        } catch (\Exception $e) {
            Log::error('Error conectando con ML Recomendación: '.$e->getMessage());

            return [
                'recomendar' => false,
                'tiene_datos_historicos' => false,
                'mensaje' => 'No se pudo conectar con el servicio de Machine Learning (ML).',
            ];
        }
    }

    /**
     * Predice el rendimiento en el próximo TEMA (Sistema Preventivo a nivel de Tema)
     */
    public function getPrediccion($materiaId, $notaActual, ?int $temaActualId = null)
    {
        try {
            $url = "{$this->baseUrl}/predecir/{$materiaId}/{$notaActual}";
            if ($temaActualId) {
                $url .= "?tema_actual_id={$temaActualId}";
            }

            $response = $this->client(8)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                return $data;
            }

            Log::error('❌ Respuesta no exitosa de ML: '.$response->body());

            return [
                'tiene_datos_historicos' => false,
                'prediccion_sin_leer' => null,
                'prediccion_con_leer' => null,
                'beneficio' => 0,
                'mensaje' => 'El modelo de Machine Learning no devolvió una predicción válida para esta materia.',
            ];
        } catch (\Exception $e) {
            Log::error('💥 Error en ML Predictivo: '.$e->getMessage());

            return [
                'tiene_datos_historicos' => false,
                'prediccion_sin_leer' => null,
                'prediccion_con_leer' => null,
                'beneficio' => 0,
                'mensaje' => 'No se pudo conectar con el servicio de Machine Learning (ML).',
            ];
        }
    }

    /**
     * Evalúa el semáforo de riesgo de reprobación / alerta temprana de un estudiante en una materia.
     */
    public function getRiesgoEstudiante($estudianteId, $materiaId)
    {
        try {
            $response = $this->client(5)->get("{$this->baseUrl}/riesgo/estudiante/{$estudianteId}/{$materiaId}");

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'nivel_riesgo' => 'sin_datos',
                'semaforo' => 'gris',
                'mensaje' => 'No se pudo calcular el indicador de riesgo.',
            ];
        } catch (\Exception $e) {
            Log::error('Error al consultar semáforo de riesgo ML: '.$e->getMessage());

            return [
                'nivel_riesgo' => 'sin_datos',
                'semaforo' => 'gris',
                'mensaje' => 'Servicio de alerta temprana temporalmente no disponible.',
            ];
        }
    }

    /**
     * Consulta el estado de salud del servicio y metadatos del modelo.
     */
    public function getSalud()
    {
        try {
            $response = Http::timeout(3)->get("{$this->baseUrl}/salud");

            return $response->successful() ? $response->json() : ['estado' => 'error'];
        } catch (\Exception $e) {
            return ['estado' => 'desconectado', 'error' => $e->getMessage()];
        }
    }
}
