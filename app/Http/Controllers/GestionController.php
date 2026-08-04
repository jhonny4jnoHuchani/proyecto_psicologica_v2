<?php

namespace App\Http\Controllers;

use App\Models\Gestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GestionController extends Controller
{
    /**
     * Mostrar lista de gestiones.
     */
    public function index(): Response
    {
        $gestions = Gestion::orderBy('año', 'desc')
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        return Inertia::render('gestiones/index', [
            'gestiones' => $gestions,  // ← CORREGIDO
        ]);
    }

    /**
     * Mostrar formulario de creación.
     */
    public function create(): Response
    {
        return Inertia::render('gestiones/create');
    }

    /**
     * Guardar nueva gestión.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'año' => 'required|integer|min:2000|max:2100',
            'etapa' => 'required|string|max:50',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'estado' => ['required', Rule::in(['activo', 'inactivo'])],
        ]);

        Gestion::create($request->all());

        return redirect()->route('gestiones.index')
            ->with('success', 'Gestión creada exitosamente.');
    }

    /**
     * Mostrar una gestión específica.
     */
    public function show(Gestion $gestione): Response
    {
        return Inertia::render('gestiones/show', [
            'gestion' => $gestione->load('cursos'),
        ]);
    }

    /**
     * Mostrar formulario de edición.
     */
    public function edit(Gestion $gestione): Response
    {
        return Inertia::render('gestiones/edit', [
            'gestion' => $gestione,
        ]);
    }

    /**
     * Actualizar gestión.
     */
    public function update(Request $request, Gestion $gestione): RedirectResponse
    {
        $request->validate([
            'año' => 'required|integer|min:2000|max:2100',
            'etapa' => 'required|string|max:50',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'estado' => ['required', Rule::in(['activo', 'inactivo'])],
        ]);

        $gestione->update($request->all());

        return redirect()->route('gestiones.index')
            ->with('success', 'Gestión actualizada exitosamente.');
    }

    /**
     * Eliminar gestión.
     */
    public function destroy(Gestion $gestione): RedirectResponse
    {
        $gestione->delete();

        return redirect()->route('gestiones.index')
            ->with('success', 'Gestión eliminada exitosamente.');
    }
}