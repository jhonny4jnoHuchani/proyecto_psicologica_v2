<?php

namespace App\Http\Controllers;

use App\Models\Calificacion;
use App\Models\Entrega;
use App\Models\Refuerzo;
use App\Services\IAService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CalificacionController extends Controller
{
    /**
     * Guardar o actualizar calificación.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        if (! auth()->user()->hasRole('admin|docente')) {
            abort(403);
        }

        $request->validate([
            'entrega_id' => 'required|exists:entregas,id',
            'nota' => 'required|numeric|min:0|max:100',
            'comentarios' => 'nullable|string',
        ]);

        $entrega = Entrega::with(['leccion.materia', 'leccion.curso', 'estudiante.user'])->findOrFail($request->entrega_id);

        Calificacion::updateOrCreate(
            ['entrega_id' => $entrega->id],
            [
                'nota' => $request->nota,
                'comentarios' => $request->comentarios,
                'fecha_calificacion' => now(),
            ]
        );

        $entrega->update(['estado_calificacion' => 'calificado']);

        // Evaluar si se debe sugerir refuerzo o registrar por qué no se puede generar
        [$sugerirRefuerzo, $motivoNoRefuerzo] = $this->evaluarSugerirRefuerzo($entrega, (float) $request->nota);

        // Si es AJAX (axios), devolver JSON
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Calificación guardada.',
                'flash' => [
                    'sugerir_refuerzo' => $sugerirRefuerzo,
                    'entrega_refuerzo_id' => $sugerirRefuerzo ? $entrega->id : null,
                    'motivo_no_refuerzo' => $motivoNoRefuerzo,
                ],
            ]);
        }

        // Fallback para Inertia
        return back()->with([
            'success' => 'Calificación guardada.',
            'sugerir_refuerzo' => $sugerirRefuerzo,
            'entrega_refuerzo_id' => $sugerirRefuerzo ? $entrega->id : null,
            'motivo_no_refuerzo' => $motivoNoRefuerzo,
        ]);
    }

    /**
     * Genera una sugerencia de retroalimentación pedagógica con IA para el docente.
     */
    public function sugerirRetroalimentacion(Request $request, IAService $iaService): JsonResponse
    {
        if (! auth()->user()->hasRole('admin|docente')) {
            abort(403);
        }

        $request->validate([
            'entrega_id' => 'required|exists:entregas,id',
            'nota' => 'required|numeric|min:0|max:100',
        ]);

        $entrega = Entrega::findOrFail($request->entrega_id);
        $sugerencia = $iaService->sugerirRetroalimentacion($entrega, (float) $request->nota);

        return response()->json([
            'success' => true,
            'sugerencia' => $sugerencia,
        ]);
    }

    /**
     * Evalúa si se debe sugerir refuerzo con IA para una entrega.
     * Si la nota es reprobatoria (< 70) pero no se pueden generar preguntas,
     * registra la advertencia en los logs del sistema y devuelve el motivo para alertar al usuario.
     *
     * @return array{0: bool, 1: ?string}
     */
    public function evaluarSugerirRefuerzo(Entrega $entrega, float $nota): array
    {
        // 1. La nota debe ser menor a 70
        if ($nota >= 70) {
            return [false, null];
        }

        // 2. Verificar si ya existe un refuerzo para esta entrega
        if (Refuerzo::where('entrega_id', $entrega->id)->exists()) {
            $motivo = 'La nota es reprobatoria (< 70), pero esta entrega ya cuenta con preguntas de refuerzo registradas.';
            Log::info("Refuerzo no sugerido para la entrega #{$entrega->id}: {$motivo}");

            return [false, $motivo];
        }

        // 3. El curso_materia debe existir y tener el toggle IA activo
        $cursoMateria = DB::table('curso_materia')
            ->where('curso_id', $entrega->leccion->curso_id)
            ->where('materia_id', $entrega->leccion->materia_id)
            ->first();

        if (! $cursoMateria) {
            $motivo = 'La nota es reprobatoria (< 70), pero no se encontró la relación curso-materia para verificar los permisos de refuerzo.';
            Log::warning("Refuerzo no sugerido para la entrega #{$entrega->id}: No existe relación curso_materia para curso {$entrega->leccion->curso_id} y materia {$entrega->leccion->materia_id}.");

            return [false, $motivo];
        }

        if (! $cursoMateria->ayuda_ia_activa) {
            $nombreMateria = $entrega->leccion->materia?->nombre ?? 'la materia';
            $motivo = "La nota es reprobatoria (< 70), pero no se pueden generar preguntas porque la ayuda de IA está desactivada para {$nombreMateria} en este curso.";
            Log::warning("Refuerzo no sugerido para la entrega #{$entrega->id}: La opción 'ayuda_ia_activa' está deshabilitada en curso_materia.");

            return [false, $motivo];
        }

        // 4. Verificar configuración de Groq API Key
        if (empty(config('services.groq.key'))) {
            $motivo = 'La nota es reprobatoria (< 70), pero no se pueden generar preguntas porque la clave API de la IA (GROQ_API_KEY) no está configurada en el servidor.';
            Log::error("Refuerzo no sugerido para la entrega #{$entrega->id}: GROQ_API_KEY no está configurada.");

            return [false, $motivo];
        }

        Log::info("Refuerzo sugerido exitosamente para la entrega #{$entrega->id} (estudiante #{$entrega->estudiante_id}, nota: {$nota}/100).");

        return [true, null];
    }

    /**
     * Mantiene retrocompatibilidad con llamadas existentes a debeSugerirRefuerzo.
     */
    public function debeSugerirRefuerzo(Entrega $entrega, $nota): bool
    {
        return $this->evaluarSugerirRefuerzo($entrega, (float) $nota)[0];
    }
}
