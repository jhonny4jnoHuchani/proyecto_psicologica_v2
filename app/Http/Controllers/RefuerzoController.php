<?php

namespace App\Http\Controllers;

use App\Models\Refuerzo;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Services\IAService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class RefuerzoController extends Controller
{
    protected IAService $iaService;

    public function __construct(IAService $iaService)
    {
        $this->iaService = $iaService;
    }

    // ============================================================
    // ENDPOINTS DEL DOCENTE
    // ============================================================

    /**
     * Genera 10 preguntas + recomendación (SIN guardar).
     * El docente las revisa en el modal antes de guardar.
     */
    public function generar(Request $request)
    {
        if (!auth()->user()->hasRole('admin|docente')) {
            abort(403);
        }

        $request->validate([
            'entrega_id' => 'required|exists:entregas,id',
        ]);

        $entrega = Entrega::with([
            'leccion.materia',
            'leccion.temario',
            'calificacion',
        ])->findOrFail($request->entrega_id);

        // Validar que tenga calificación
        if (!$entrega->calificacion) {
            return response()->json([
                'success' => false,
                'error' => 'La entrega no tiene calificación todavía.',
            ], 422);
        }

        try {
            $resultado = $this->iaService->generarPreguntas($entrega);

            return response()->json([
                'success' => true,
                'preguntas' => $resultado['preguntas'],
                'recomendacion' => $resultado['recomendacion'],
            ]);
        } catch (\Exception $e) {
            Log::error('Error generando preguntas IA: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'No se pudieron generar las preguntas. Intenta de nuevo.',
            ], 500);
        }
    }

    /**
     * Regenera UNA sola pregunta (SIN guardar).
     */
    public function regenerarPregunta(Request $request)
    {
        if (!auth()->user()->hasRole('admin|docente')) {
            abort(403);
        }

        $request->validate([
            'entrega_id' => 'required|exists:entregas,id',
            'pregunta_actual' => 'required|string',
            'otras_preguntas' => 'nullable|array',
        ]);

        $entrega = Entrega::with([
            'leccion.materia',
            'leccion.temario',
        ])->findOrFail($request->entrega_id);

        try {
            $nuevaPregunta = $this->iaService->regenerarPregunta(
                $entrega,
                $request->pregunta_actual,
                $request->otras_preguntas ?? []
            );

            return response()->json([
                'success' => true,
                'pregunta' => $nuevaPregunta,
            ]);
        } catch (\Exception $e) {
            Log::error('Error regenerando pregunta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'No se pudo regenerar la pregunta.',
            ], 500);
        }
    }

    /**
     * Guarda el refuerzo completo en la BD.
     */
    public function guardar(Request $request): RedirectResponse
    {
        if (!auth()->user()->hasRole('admin|docente')) {
            abort(403);
        }

        $request->validate([
            'entrega_id' => 'required|exists:entregas,id',
            'preguntas' => 'required|array|min:1',
            'preguntas.*' => 'required|string',
            'recomendacion' => 'nullable|string',
        ]);

        $entrega = Entrega::with('leccion')->findOrFail($request->entrega_id);

        // Verificar que no exista un refuerzo para esa entrega
        if (Refuerzo::where('entrega_id', $entrega->id)->exists()) {
            return back()->with('error', 'Ya existe un refuerzo para esta entrega.');
        }

        // Buscar el curso_materia_id
        $cursoMateria = DB::table('curso_materia')
            ->where('curso_id', $entrega->leccion->curso_id)
            ->where('materia_id', $entrega->leccion->materia_id)
            ->first();

        if (!$cursoMateria) {
            return back()->with('error', 'No se encontró la relación curso-materia.');
        }

        // Crear el refuerzo
        Refuerzo::create([
            'entrega_id' => $entrega->id,
            'estudiante_id' => $entrega->estudiante_id,
            'leccion_id' => $entrega->leccion_id,
            'curso_materia_id' => $cursoMateria->id,
            'preguntas' => $request->preguntas,
            'respuestas' => array_fill(0, count($request->preguntas), null),
            'recomendacion' => $request->recomendacion,
            'completado' => false,
        ]);

        return back()->with('success', 'Refuerzo guardado y enviado al estudiante.');
    }

    // ============================================================
    // ENDPOINTS DEL ESTUDIANTE
    // ============================================================

    /**
     * Lista de refuerzos del estudiante logueado.
     */
    public function index(): Response
    {
        $estudiante = Estudiante::where('user_id', Auth::id())->first();

        $refuerzos = Refuerzo::with(['leccion.materia', 'leccion.temario', 'leccion.curso'])
            ->where('estudiante_id', $estudiante?->id)
            ->orderBy('completado', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('refuerzo/index', [
            'refuerzos' => $refuerzos,
        ]);
    }

    /**
     * Ver un refuerzo específico y responderlo.
     */
    public function show(Refuerzo $refuerzo): Response
    {
        // Seguridad: solo el dueño puede verlo
        $estudiante = Estudiante::where('user_id', Auth::id())->first();

        if ($refuerzo->estudiante_id !== $estudiante?->id) {
            abort(403, 'No tienes permiso para ver este refuerzo.');
        }

        return Inertia::render('refuerzo/show', [
            'refuerzo' => $refuerzo->load([
                'leccion.materia',
                'leccion.temario',
                'leccion.curso',
            ]),
        ]);
    }

    /**
     * Guardar las respuestas del estudiante.
     */
    public function responder(Request $request, Refuerzo $refuerzo): RedirectResponse
    {
        // Seguridad: solo el dueño puede responder
        $estudiante = Estudiante::where('user_id', Auth::id())->first();

        if ($refuerzo->estudiante_id !== $estudiante?->id) {
            abort(403, 'No tienes permiso para responder este refuerzo.');
        }

        if ($refuerzo->completado) {
            return back()->with('error', 'Este refuerzo ya fue completado.');
        }

        $request->validate([
            'respuestas' => 'required|array|min:1',
            'respuestas.*' => 'nullable|string',
        ]);

        $refuerzo->update([
            'respuestas' => $request->respuestas,
            'completado' => true,
        ]);

        return redirect()->route('refuerzos.index')
            ->with('success', 'Respuestas enviadas. ¡Gracias por practicar!');
    }

    // ============================================================
    // ENDPOINTS DEL DOCENTE (VISTAS)
    // ============================================================

    /**
     * Vista del docente: ver refuerzos de sus estudiantes.
     */
    public function docente(Request $request): Response
    {
        $docente = Docente::where('user_id', Auth::id())->first();

        $leccionId = $request->query('leccion_id');

        $refuerzos = Refuerzo::with([
                'estudiante.user',
                'leccion.materia',
                'leccion.temario',
            ])
            ->whereHas('leccion', fn($q) => $q->where('docente_id', $docente?->id))
            ->when($leccionId, fn($q) => $q->where('leccion_id', $leccionId))
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('refuerzo/docente', [
            'refuerzos' => $refuerzos,
            'filtroLeccionId' => $leccionId ? (int) $leccionId : null,
        ]);
    }
}