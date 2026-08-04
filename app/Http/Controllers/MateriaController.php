<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MateriaController extends Controller
{
    public function index(): Response
    {
        $materias = Materia::orderBy('nombre')->get();

        return Inertia::render('materias/index', [
            'materias' => $materias,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'codigo' => 'required|string|max:20|unique:materias,codigo',
        ]);

        Materia::create($request->all());

        return redirect()->route('materias.index')
            ->with('success', 'Materia creada.');
    }

    public function update(Request $request, Materia $materia): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'codigo' => ['required', 'string', 'max:20', Rule::unique('materias', 'codigo')->ignore($materia->id)],
        ]);

        $materia->update($request->all());

        return redirect()->route('materias.index')
            ->with('success', 'Materia actualizada.');
    }

    public function destroy(Materia $materia): RedirectResponse
    {
        $materia->delete();

        return redirect()->route('materias.index')
            ->with('success', 'Materia desactivada.');
    }

    public function trashed(): Response
    {
        $materias = Materia::onlyTrashed()->orderBy('deleted_at', 'desc')->get();

        return Inertia::render('materias/eliminados', [
            'materias' => $materias,
        ]);
    }

    public function restore($id): RedirectResponse
    {
        Materia::onlyTrashed()->findOrFail($id)->restore();

        return redirect()->route('materias.trashed')
            ->with('success', 'Materia restaurada.');
    }
}