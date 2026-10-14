<?php

namespace App\Services;

use App\Models\Entrega;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IAService
{
    protected string $apiKey;

    protected string $apiUrl;

    protected string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.groq.key', '');
        $this->apiUrl = (string) config('services.groq.url', 'https://api.groq.com/openai/v1/chat/completions');
        $this->model = (string) config('services.groq.model', 'openai/gpt-oss-20b');
    }

    /**
     * Genera 10 preguntas + 1 recomendación para un estudiante reprobado.
     */
    public function generarPreguntas(Entrega $entrega): array
    {
        if (empty($this->apiKey)) {
            Log::error("No se pueden generar preguntas para la entrega #{$entrega->id}: GROQ_API_KEY no configurada.");
            throw new \Exception('La clave de la IA (GROQ_API_KEY) no está configurada en el servidor.');
        }

        // Cargar todas las relaciones necesarias
        $entrega->load([
            'leccion.materia',
            'leccion.temario',
            'calificacion',
        ]);

        $prompt = $this->construirPromptGenerar($entrega);

        Log::info("Enviando prompt a Groq para generar preguntas de refuerzo (Entrega #{$entrega->id}, Modelo: {$this->model})", [
            'entrega_id' => $entrega->id,
            'prompt' => $prompt,
        ]);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60)
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Eres un docente experto que genera preguntas abiertas para evaluar la comprensión de un tema. Las preguntas deben ser claras, específicas, basadas en el resumen del tema y enfocadas en reforzar los conceptos que el estudiante no comprendió.',
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.7,
                    'response_format' => ['type' => 'json_object'],
                ]);
        } catch (\Exception $httpException) {
            Log::error("Fallo de conexión HTTP con el servicio de IA para la entrega #{$entrega->id}: ".$httpException->getMessage(), [
                'exception' => $httpException,
            ]);
            throw new \Exception('No se pudo establecer conexión con el servicio de IA: '.$httpException->getMessage());
        }

        if (! $response->successful()) {
            $errorBody = $response->body();
            $decoded = json_decode($errorBody, true);
            $errorMessage = $decoded['error']['message'] ?? $errorBody;
            Log::error("Groq error al generar preguntas (HTTP {$response->status()}): {$errorBody}", [
                'entrega_id' => $entrega->id,
            ]);
            throw new \Exception("Error del proveedor de IA (HTTP {$response->status()}): {$errorMessage}");
        }

        $data = $response->json();
        $contenido = $data['choices'][0]['message']['content'] ?? '';

        $json = json_decode($contenido, true);

        if (! $json || ! isset($json['preguntas']) || ! is_array($json['preguntas'])) {
            Log::error("Respuesta de IA con formato JSON inválido para la entrega #{$entrega->id}: {$contenido}");
            throw new \Exception('La IA respondió pero no devolvió el listado de preguntas esperado.');
        }

        if (empty($json['preguntas'])) {
            Log::warning("La IA devolvió un listado vacío de preguntas para la entrega #{$entrega->id}.");
            throw new \Exception('La IA devolvió una lista vacía de preguntas.');
        }

        Log::info("Preguntas generadas exitosamente con IA para la entrega #{$entrega->id}", [
            'total' => count($json['preguntas']),
        ]);

        return [
            'preguntas' => array_slice($json['preguntas'], 0, 10),
            'recomendacion' => $json['recomendacion'] ?? null,
        ];
    }

    /**
     * Regenera UNA sola pregunta.
     */
    public function regenerarPregunta(Entrega $entrega, string $preguntaActual, array $otrasPreguntas): string
    {
        if (empty($this->apiKey)) {
            Log::error("No se puede regenerar pregunta para la entrega #{$entrega->id}: GROQ_API_KEY no configurada.");
            throw new \Exception('La clave de la IA (GROQ_API_KEY) no está configurada en el servidor.');
        }

        $entrega->load(['leccion.materia', 'leccion.temario']);

        $prompt = $this->construirPromptRegenerar($entrega, $preguntaActual, $otrasPreguntas);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'Eres un docente experto.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.9,
                ]);
        } catch (\Exception $httpException) {
            Log::error("Fallo de conexión HTTP al regenerar pregunta para entrega #{$entrega->id}: ".$httpException->getMessage());
            throw new \Exception('No se pudo conectar con el servicio de IA: '.$httpException->getMessage());
        }

        if (! $response->successful()) {
            $errorBody = $response->body();
            $decoded = json_decode($errorBody, true);
            $errorMessage = $decoded['error']['message'] ?? $errorBody;
            Log::error("Groq error al regenerar pregunta (HTTP {$response->status()}): {$errorBody}");
            throw new \Exception("Error al regenerar pregunta con IA (HTTP {$response->status()}): {$errorMessage}");
        }

        $contenido = trim($response->json('choices.0.message.content', ''));
        if (empty($contenido)) {
            Log::warning("La IA devolvió una respuesta vacía al regenerar pregunta para la entrega #{$entrega->id}.");
            throw new \Exception('La IA devolvió una respuesta vacía.');
        }

        return $contenido;
    }

    /**
     * Construye el prompt para generar las 10 preguntas.
     */
    protected function construirPromptGenerar(Entrega $entrega): string
    {
        $leccion = $entrega->leccion;
        $materia = $leccion->materia;
        $tema = $leccion->temario;
        $calificacion = $entrega->calificacion;

        // Datos de la materia
        $materiaTexto = "{$materia->nombre} ({$materia->codigo})";

        // Datos del tema
        $temaNombre = $tema?->nombre ?? 'Tema no especificado';
        $temaResumen = $tema?->resumen ?? 'Resumen no disponible.';
        $temaPaginas = $tema?->paginas_libro ?? 'No especificadas';

        // Datos de la lección
        $leccionTitulo = $leccion->titulo;
        $leccionDescripcion = $leccion->descripcion ?? 'Sin descripción.';

        // Datos de la calificación
        $nota = $calificacion?->nota ?? 'N/A';
        $comentarios = $calificacion?->comentarios ?? 'Sin comentarios del docente.';

        $prompt = "Necesito que generes 10 preguntas ABIERTAS de refuerzo para un estudiante que obtuvo una nota baja en una tarea.\n\n";

        $prompt .= "=== MATERIA ===\n";
        $prompt .= "{$materiaTexto}\n\n";

        $prompt .= "=== TEMA DEL TEMARIO ===\n";
        $prompt .= "Título: {$temaNombre}\n";
        $prompt .= "Páginas del libro: {$temaPaginas}\n";
        $prompt .= "Resumen del tema:\n{$temaResumen}\n\n";

        $prompt .= "=== LECCIÓN (TAREA) ===\n";
        $prompt .= "Título: {$leccionTitulo}\n";
        $prompt .= "Descripción: {$leccionDescripcion}\n\n";

        $prompt .= "=== RESULTADO DEL ESTUDIANTE ===\n";
        $prompt .= "Nota obtenida: {$nota}/100\n";
        $prompt .= "Comentarios del docente: {$comentarios}\n\n";

        $prompt .= "=== INSTRUCCIONES ===\n";
        $prompt .= "1. Genera EXACTAMENTE 10 preguntas abiertas de refuerzo.\n";
        $prompt .= "2. Las preguntas deben estar basadas en el RESUMEN DEL TEMA proporcionado.\n";
        $prompt .= "3. Las preguntas deben ayudar al estudiante a comprender los conceptos que no entendió.\n";
        $prompt .= "4. Las preguntas deben ser claras, específicas y reflexivas (no de sí/no).\n";
        $prompt .= "5. También genera una recomendación breve (máximo 3 líneas) sobre qué debería repasar el estudiante.\n\n";

        $prompt .= "=== FORMATO DE RESPUESTA ===\n";
        $prompt .= "Devuelve ÚNICAMENTE un JSON válido con este formato exacto:\n";
        $prompt .= '{"preguntas": ["pregunta 1", "pregunta 2", "pregunta 3", "pregunta 4", "pregunta 5", "pregunta 6", "pregunta 7", "pregunta 8", "pregunta 9", "pregunta 10"], "recomendacion": "texto de recomendación"}';

        return $prompt;
    }

    /**
     * Construye el prompt para regenerar UNA pregunta.
     */
    protected function construirPromptRegenerar(Entrega $entrega, string $preguntaActual, array $otrasPreguntas): string
    {
        $leccion = $entrega->leccion;
        $materia = $leccion->materia;
        $tema = $leccion->temario;

        $temaNombre = $tema?->nombre ?? 'Tema no especificado';
        $temaResumen = $tema?->resumen ?? 'Resumen no disponible.';

        $otras = implode("\n- ", $otrasPreguntas);

        $prompt = "Contexto:\n";
        $prompt .= "Materia: {$materia->nombre}\n";
        $prompt .= "Tema: {$temaNombre}\n";
        $prompt .= "Resumen del tema:\n{$temaResumen}\n\n";

        $prompt .= "El docente NO quedó conforme con esta pregunta:\n- {$preguntaActual}\n\n";

        $prompt .= "Estas son las OTRAS preguntas ya generadas (NO repitas el tema ni el enfoque):\n- {$otras}\n\n";

        $prompt .= "Genera UNA nueva pregunta abierta diferente, sobre el mismo tema pero con otro enfoque.\n";
        $prompt .= 'Devuelve ÚNICAMENTE la pregunta, sin numeración, sin comillas, sin texto adicional.';

        return $prompt;
    }
}
