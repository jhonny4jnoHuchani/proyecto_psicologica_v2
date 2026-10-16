<?php

namespace App\Services;

use App\Models\Entrega;
use App\Models\Refuerzo;
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

    /**
     * Sugiere retroalimentación pedagógica y constructiva para el docente al calificar una entrega.
     */
    public function sugerirRetroalimentacion(Entrega $entrega, float $nota): string
    {
        $entrega->load(['leccion.materia', 'leccion.temario', 'estudiante.user']);

        $prompt = $this->construirPromptSugerenciaFeedback($entrega, $nota);

        if (! empty($this->apiKey)) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(30)
                    ->post($this->apiUrl, [
                        'model' => $this->model,
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'Eres un docente universitario experto en Pedagogía y Psicología. Tu tarea es redactar una retroalimentación concisa, respetuosa, constructiva y motivadora para un estudiante en su trabajo evaluado.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],
                        'temperature' => 0.7,
                    ]);

                if ($response->successful()) {
                    $content = trim($response->json('choices.0.message.content', ''));
                    if (! empty($content)) {
                        return $content;
                    }
                } else {
                    Log::warning("Groq API error al sugerir retroalimentación (HTTP {$response->status()}): {$response->body()}");
                }
            } catch (\Exception $e) {
                Log::warning("Excepción al conectar con IA para sugerencia de retroalimentación: {$e->getMessage()}");
            }
        }

        // Fallback pedagógico contextual inteligente si la IA remota no está disponible
        return $this->generarFallbackRetroalimentacion($entrega, $nota);
    }

    /**
     * Construye el prompt para la sugerencia de retroalimentación docente.
     */
    protected function construirPromptSugerenciaFeedback(Entrega $entrega, float $nota): string
    {
        $leccion = $entrega->leccion;
        $materia = $leccion->materia?->nombre ?? 'Psicología';
        $tema = $leccion->temario?->nombre ?? $leccion->titulo;
        $paginas = $leccion->temario?->paginas_libro;
        $paginasTxt = $paginas ? " (páginas {$paginas} de la bibliografía de referencia)" : '';

        $estudianteNombre = $entrega->estudiante?->user?->nombre ?? 'Estimado/a estudiante';

        $criterio = match (true) {
            $nota < 51 => "La nota obtenida es reprobatoria ({$nota}/100). Redacta una retroalimentación constructiva, empática y clara. Señala que es fundamental repasar los conceptos nucleares del tema{$paginasTxt}, reforzar la comprensión teórica y solicitar tutoría o completar el refuerzo de práctica. Anima a seguir perseverando sin desmotivarse.",
            $nota < 71 => "La nota obtenida es regular o suficiente ({$nota}/100). Reconoce el esfuerzo invertido y las ideas principales planteadas, pero señala que faltó mayor profundidad conceptual, precisión terminológica o análisis crítico según la bibliografía{$paginasTxt}. Invita a consolidar los puntos clave.",
            default => "La nota obtenida es sobresaliente ({$nota}/100). Felicita al estudiante por su excelente dominio teórico y argumentación sobre el tema{$paginasTxt}. Destaca su capacidad de análisis e invítalo a seguir aplicando estos conceptos en la práctica psicológica.",
        };

        return "Redacta un comentario de retroalimentación docente de entre 3 a 5 oraciones dirigido al estudiante '{$estudianteNombre}' para la materia '{$materia}' sobre la lección/tema '{$tema}'.\n\n".
            "Nota: {$nota}/100.\n".
            "Criterio pedagógico:\n{$criterio}\n\n".
            'Devuelve ÚNICAMENTE el texto de la retroalimentación, sin introducciones, sin encabezados ni comillas.';
    }

    /**
     * Fallback pedagógico contextual si la API de IA no responde.
     */
    protected function generarFallbackRetroalimentacion(Entrega $entrega, float $nota): string
    {
        $tema = $entrega->leccion->temario?->nombre ?? $entrega->leccion->titulo;
        $paginas = $entrega->leccion->temario?->paginas_libro;
        $paginasRef = $paginas ? " en las páginas {$paginas} de la bibliografía" : '';

        if ($nota < 51) {
            return "Se evidencia interés en la entrega, pero es indispensable reforzar los conceptos clave sobre '{$tema}'{$paginasRef}. Te sugiero revisar detenidamente la fundamentación teórica y apoyarte en las actividades de refuerzo para consolidar los aprendizajes esperados. ¡Ánimo, con dedicación lograrás mejorar!";
        }

        if ($nota < 71) {
            return "Buen trabajo en la presentación de '{$tema}'. Has identificado los aspectos generales del contenido; no obstante, te recomiendo profundizar más en la articulación conceptual y en los autores de referencia{$paginasRef} para alcanzar una argumentación más sólida.";
        }

        return "¡Excelente desempeño en esta entrega sobre '{$tema}'! Demuestras un dominio conceptual claro, buena capacidad de análisis y rigor teórico{$paginasRef}. Te motivo a continuar con este nivel de compromiso académico.";
    }

    /**
     * Evalúa las respuestas del estudiante en el cuestionario de refuerzo sobre 100
     * y genera un diagnóstico de conceptos dominados y qué aspectos debe mejorar.
     *
     * @return array{nota: float, conceptos_dominados: array<string>, que_mejorar: array<string>, recomendacion: string}
     */
    public function evaluarRefuerzo(Refuerzo $refuerzo, array $respuestas): array
    {
        $refuerzo->load(['leccion.materia', 'leccion.temario', 'estudiante.user']);

        $preguntas = $refuerzo->preguntas ?? [];
        $tema = $refuerzo->leccion->temario?->nombre ?? $refuerzo->leccion->titulo;
        $materia = $refuerzo->leccion->materia?->nombre ?? 'Psicología';
        $paginas = $refuerzo->leccion->temario?->paginas_libro;
        $resumen = $refuerzo->leccion->temario?->resumen ?? '';

        if (! empty($this->apiKey)) {
            try {
                $qaPairs = [];
                foreach ($preguntas as $i => $preg) {
                    $resp = trim((string) ($respuestas[$i] ?? ''));
                    $qaPairs[] = 'Pregunta '.($i + 1).": {$preg}\nRespuesta del estudiante: ".($resp !== '' ? $resp : '[Sin respuesta]');
                }
                $qaText = implode("\n\n", $qaPairs);

                $prompt = "Actúa como un docente evaluador de Psicología en la Universidad Pública de El Alto.\n\n".
                    "=== MATERIA Y TEMA ===\n".
                    "Materia: {$materia}\n".
                    "Tema: {$tema}\n".
                    ($paginas ? "Páginas del libro: {$paginas}\n" : '').
                    ($resumen ? "Resumen teórico del tema:\n{$resumen}\n\n" : "\n").
                    "=== CUESTIONARIO Y RESPUESTAS DEL ESTUDIANTE ===\n".
                    "{$qaText}\n\n".
                    "=== INSTRUCCIONES DE EVALUACIÓN ===\n".
                    "1. Evalúa la comprensión conceptual de las respuestas y asigna una calificación justa en escala de 0 a 100 puntos (número entero o con un decimal).\n".
                    "2. Identifica 2 a 4 'conceptos_dominados': conceptos o ideas donde el estudiante respondió correctamente o mostró buena asimilación.\n".
                    "3. Identifica 2 a 4 'que_mejorar': errores conceptuales, vacíos o temas donde debe profundizar, haciendo referencia al tema y páginas si aplica.\n".
                    "4. Redacta una 'recomendacion' pedagógica final motivadora (2-3 oraciones).\n\n".
                    "=== FORMATO DE RESPUESTA ===\n".
                    "Devuelve ÚNICAMENTE un JSON con esta estructura exacta:\n".
                    '{"nota": 75, "conceptos_dominados": ["...", "..."], "que_mejorar": ["...", "..."], "recomendacion": "..."}';

                $response = Http::withToken($this->apiKey)
                    ->timeout(45)
                    ->post($this->apiUrl, [
                        'model' => $this->model,
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'Eres un docente universitario riguroso, formativo y constructivo. Evalúa respuestas de psicología en formato JSON.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],
                        'temperature' => 0.4,
                        'response_format' => ['type' => 'json_object'],
                    ]);

                if ($response->successful()) {
                    $json = json_decode($response->json('choices.0.message.content', ''), true);
                    if ($json && isset($json['nota'])) {
                        $notaCalculada = min(100, max(0, (float) $json['nota']));

                        return [
                            'nota' => round($notaCalculada, 1),
                            'conceptos_dominados' => is_array($json['conceptos_dominados'] ?? null) ? $json['conceptos_dominados'] : [],
                            'que_mejorar' => is_array($json['que_mejorar'] ?? null) ? $json['que_mejorar'] : [],
                            'recomendacion' => (string) ($json['recomendacion'] ?? 'Continúa reforzando los contenidos de la materia.'),
                        ];
                    }
                } else {
                    Log::warning("Groq API error evaluando refuerzo (HTTP {$response->status()}): {$response->body()}");
                }
            } catch (\Exception $e) {
                Log::warning("Excepción al evaluar refuerzo con IA: {$e->getMessage()}");
            }
        }

        // Fallback pedagógico determinista cuando el servicio externo no está disponible
        return $this->generarFallbackEvaluacionRefuerzo($refuerzo, $respuestas);
    }

    /**
     * Fallback de evaluación de respuestas cuando la API no está disponible.
     * Analiza completitud y longitud sustantiva de respuestas para calificar justamente.
     */
    protected function generarFallbackEvaluacionRefuerzo(Refuerzo $refuerzo, array $respuestas): array
    {
        $preguntas = $refuerzo->preguntas ?? [];
        $total = count($preguntas);
        if ($total === 0) {
            return [
                'nota' => 100.0,
                'conceptos_dominados' => ['Participación completada'],
                'que_mejorar' => [],
                'recomendacion' => 'Actividad completada.',
            ];
        }

        $puntosPorPregunta = 100.0 / $total;
        $notaAcumulada = 0.0;
        $respondidasBien = 0;
        $respondidasParcial = 0;
        $vacias = 0;

        foreach ($preguntas as $idx => $pregunta) {
            $resp = trim((string) ($respuestas[$idx] ?? ''));
            $len = mb_strlen($resp);

            if ($len >= 40) {
                $notaAcumulada += $puntosPorPregunta;
                $respondidasBien++;
            } elseif ($len >= 15) {
                $notaAcumulada += ($puntosPorPregunta * 0.65);
                $respondidasParcial++;
            } else {
                $vacias++;
            }
        }

        $notaFinal = round(min(100, max(0, $notaAcumulada)), 1);

        $tema = $refuerzo->leccion->temario?->nombre ?? $refuerzo->leccion->titulo;
        $paginas = $refuerzo->leccion->temario?->paginas_libro;
        $paginasTxt = $paginas ? " (páginas {$paginas})" : '';

        $conceptosDominados = [];
        $queMejorar = [];

        if ($respondidasBien > 0) {
            $conceptosDominados[] = "Identificación de premisas principales del tema '{$tema}'.";
            $conceptosDominados[] = "Capacidad de articulación de respuestas fundamentadas en {$respondidasBien} de las preguntas.";
        } else {
            $conceptosDominados[] = 'Compromiso de entrega de la práctica formativa.';
        }

        if ($vacias > 0) {
            $queMejorar[] = "Completar la totalidad de las preguntas sin omitir respuestas ({$vacias} preguntas incompletas o muy breves).";
        }
        if ($respondidasParcial > 0 || $notaFinal < 70) {
            $queMejorar[] = "Profundizar en la terminología técnica y en el libro de consulta{$paginasTxt}.";
            $queMejorar[] = 'Desarrollar explicaciones más detalladas con ejemplos vinculados a la práctica psicológica.';
        }

        if ($notaFinal >= 70) {
            $recomendacion = "¡Excelente desempeño en tu práctica de refuerzo! Has demostrado asimilación sólida de los conceptos clave sobre '{$tema}'. Continúa con este nivel de compromiso académico.";
        } elseif ($notaFinal >= 51) {
            $recomendacion = "Buen avance en el cuestionario sobre '{$tema}'. Cuentas con nociones válidas, pero es clave que repases la bibliografía{$paginasTxt} para consolidar las respuestas parciales antes de las evaluaciones sumativas.";
        } else {
            $recomendacion = "El cuestionario muestra vacíos conceptuales que precisan atención inmediata sobre '{$tema}'. Te recomendamos repasar detenidamente las páginas indicadas{$paginasTxt} y solicitar retroalimentación directa a tu docente.";
        }

        return [
            'nota' => $notaFinal,
            'conceptos_dominados' => $conceptosDominados,
            'que_mejorar' => $queMejorar,
            'recomendacion' => $recomendacion,
        ];
    }
}
