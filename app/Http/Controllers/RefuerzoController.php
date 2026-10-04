<?php

namespace App\Http\Controllers;

use App\Models\Refuerzo;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RefuerzoController extends Controller
{
    /**
     * Lista de refuerzos del estudiante logueado.
     */
    public function index(): Response
    {
        $estudiante = Estudiante::where('user_id', Auth::id())->first();

        $refuerzos = Refuerzo::with(['leccion.materia', 'leccion.curso'])
            ->where('estudiante_id', $estudiante?->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('refuerzo/index', [
            'refuerzos' => $refuerzos,
        ]);
    }

    /**
     * Ver un refuerzo específico y responder las preguntas.
     */
    public function show(Refuerzo $refuerzo): Response
    {
        return Inertia::render('refuerzo/show', [
            'refuerzo' => $refuerzo->load(['leccion.materia', 'leccion.curso']),
        ]);
    }

    /**
     * Guardar las respuestas del estudiante.
     */
    public function responder(Request $request, Refuerzo $refuerzo)
    {
        $request->validate([
            'respuestas' => 'required|array|min:1',
            'respuestas.*' => 'nullable|string',
        ]);

        $refuerzo->update([
            'respuestas' => $request->respuestas,
            'completado' => true,
        ]);

        return back()->with('success', 'Respuestas guardadas.');
    }

    /**
     * Vista del docente: ver refuerzos de sus estudiantes.
     */
    public function docente(): Response
    {
        // ... por ahora vacío, lo armamos después
        return Inertia::render('refuerzo/docente');
    }
}