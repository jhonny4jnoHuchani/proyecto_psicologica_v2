<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Models\Tema;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TemaController extends Controller
{
    /**
     * Guarda un nuevo tema asignado a una materia.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'nombre' => 'required|string|max:200',
            'orden' => 'nullable|integer|min:1',
            'resumen' => 'nullable|string',
            'paginas_libro' => 'nullable|string|max:50',
            'estado' => ['nullable', Rule::in(['programado', 'visto', 'omitido', 'pospuesto'])],
        ]);

        $orden = $request->orden;
        if (! $orden) {
            $maxOrden = Tema::where('materia_id', $request->materia_id)->max('orden') ?? 0;
            $orden = $maxOrden + 1;
        }

        Tema::create([
            'materia_id' => $request->materia_id,
            'nombre' => $request->nombre,
            'orden' => $orden,
            'resumen' => $request->resumen,
            'paginas_libro' => $request->paginas_libro,
            'estado' => $request->estado ?? 'programado',
        ]);

        return back()->with('success', 'Tema agregado al temario exitosamente.');
    }

    /**
     * Actualiza un tema existente.
     */
    public function update(Request $request, Tema $tema): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:200',
            'orden' => 'required|integer|min:1',
            'resumen' => 'nullable|string',
            'paginas_libro' => 'nullable|string|max:50',
            'estado' => ['required', Rule::in(['programado', 'visto', 'omitido', 'pospuesto'])],
        ]);

        $tema->update($request->only([
            'nombre',
            'orden',
            'resumen',
            'paginas_libro',
            'estado',
        ]));

        return back()->with('success', 'Tema actualizado correctamente.');
    }

    /**
     * Elimina (soft delete) un tema.
     */
    public function destroy(Tema $tema): RedirectResponse
    {
        $tema->delete();

        return back()->with('success', 'Tema eliminado del temario.');
    }
}
