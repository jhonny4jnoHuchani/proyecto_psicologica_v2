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
        $this->apiKey = config('services.groq.key');
        $this->apiUrl = config('services.groq.url');
        $this->model = config('services.groq.model');
    }

    /**
     * Genera 10 preguntas + 1 recomendación para un estudiante reprobado.
     */
    public function generarPreguntas(Entrega $entrega): array
    {
        // Cargar todas las relaciones necesarias
        $entrega->load([
            'leccion.materia',
            'leccion.temario',
            'calificacion',
        ]);

        $prompt = $this->construirPromptGenerar($entrega);

        Log::info('Prompt enviado a Groq:', ['prompt' => $prompt]);

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

        if (!$response->successful()) {
            Log::error('Groq error: ' . $response->body());
            throw new \Exception('Error al llamar a la IA: ' . $response->body());
        }

        $data = $response->json();
        $contenido = $data['choices'][0]['message']['content'] ?? '';

        $json = json_decode($contenido, true);

        if (!$json || !isset($json['preguntas'])) {
            Log::error('Respuesta IA inválida: ' . $contenido);
            throw new \Exception('Respuesta de IA inválida');
        }

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
        $entrega->load(['leccion.materia', 'leccion.temario']);

        $prompt = $this->construirPromptRegenerar($entrega, $preguntaActual, $otrasPreguntas);

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

        if (!$response->successful()) {
            Log::error('Groq error: ' . $response->body());
            throw new \Exception('Error al llamar a la IA');
        }

        return trim($response->json('choices.0.message.content', ''));
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
        $prompt .= "Devuelve ÚNICAMENTE la pregunta, sin numeración, sin comillas, sin texto adicional.";

        return $prompt;
    }
}