<?php

namespace App\Http\Controllers;

use App\Models\Calificacion;
use App\Models\Entrega;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalificacionController extends Controller
{
    /**
     * Guardar o actualizar calificación.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'entrega_id' => 'required|exists:entregas,id',
            'nota' => 'required|numeric|min:0|max:100',
            'comentarios' => 'nullable|string',
        ]);

        $entrega = Entrega::findOrFail($request->entrega_id);

        // Crear o actualizar calificación
        Calificacion::updateOrCreate(
            ['entrega_id' => $entrega->id],
            [
                'nota' => $request->nota,
                'comentarios' => $request->comentarios,
                'fecha_calificacion' => now(),
            ]
        );

        // Actualizar estado de la entrega
        $entrega->update(['estado_calificacion' => 'calificado']);

        return back()->with('success', 'Calificación guardada.');
    }
}