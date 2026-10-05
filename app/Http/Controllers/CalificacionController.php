<?php

namespace App\Http\Controllers;

use App\Models\Calificacion;
use App\Models\Entrega;
use App\Models\Refuerzo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class CalificacionController extends Controller
{
    /**
     * Guardar o actualizar calificación.
     */
public function store(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
{
    if (!auth()->user()->hasRole('admin|docente')) {
        abort(403);
    }

    $request->validate([
        'entrega_id' => 'required|exists:entregas,id',
        'nota' => 'required|numeric|min:0|max:100',
        'comentarios' => 'nullable|string',
    ]);

    $entrega = Entrega::with('leccion')->findOrFail($request->entrega_id);

    Calificacion::updateOrCreate(
        ['entrega_id' => $entrega->id],
        [
            'nota' => $request->nota,
            'comentarios' => $request->comentarios,
            'fecha_calificacion' => now(),
        ]
    );

    $entrega->update(['estado_calificacion' => 'calificado']);

    $sugerirRefuerzo = $this->debeSugerirRefuerzo($entrega, $request->nota);

    // 👇 Si es AJAX (axios), devolver JSON
    if ($request->expectsJson() || $request->ajax()) {
        return response()->json([
            'success' => true,
            'message' => 'Calificación guardada.',
            'flash' => [
                'sugerir_refuerzo' => $sugerirRefuerzo,
                'entrega_refuerzo_id' => $sugerirRefuerzo ? $entrega->id : null,
            ],
        ]);
    }

    // Fallback para Inertia
    return back()->with([
        'success' => 'Calificación guardada.',
        'sugerir_refuerzo' => $sugerirRefuerzo,
        'entrega_refuerzo_id' => $sugerirRefuerzo ? $entrega->id : null,
    ]);
}

    /**
     * Verifica si se debe sugerir un refuerzo con IA.
     *
     * Requisitos:
     * 1. La nota debe ser menor a 70.
     * 2. No debe existir un refuerzo ya para esta entrega.
     * 3. El curso_materia debe tener el toggle IA activo.
     */
    private function debeSugerirRefuerzo(Entrega $entrega, $nota): bool
    {
        // 1. La nota debe ser menor a 70
        if ($nota >= 70) {
            return false;
        }

        // 2. No debe existir un refuerzo ya para esta entrega
        if (Refuerzo::where('entrega_id', $entrega->id)->exists()) {
            return false;
        }

        // 3. El curso_materia debe tener el toggle IA activo
        $cursoMateria = DB::table('curso_materia')
            ->where('curso_id', $entrega->leccion->curso_id)
            ->where('materia_id', $entrega->leccion->materia_id)
            ->first();

        if (!$cursoMateria || !$cursoMateria->ayuda_ia_activa) {
            return false;
        }

        return true;
    }
}