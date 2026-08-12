<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Materia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibroController extends Controller
{
    /**
     * Muestra la lista de libros activos con filtros.
     */
    public function index(Request $request): Response
    {
        $materiaId = $request->query('materia_id');

        $libros = Libro::with('materia')
            ->when($materiaId, fn($q) => $q->where('materia_id', $materiaId))
            ->orderBy('created_at', 'desc')
            ->get();

        $materias = Materia::orderBy('nombre')->get();

        return Inertia::render('libros/index', [
            'libros' => $libros,
            'materias' => $materias,
            'filtros' => [
                'materia_id' => $materiaId ? (int) $materiaId : null,
            ],
        ]);
    }

    /**
     * Muestra la lista de libros eliminados (soft deleted).
     */
    public function trashed(): Response
    {
        $libros = Libro::onlyTrashed()
            ->with('materia')
            ->orderBy('deleted_at', 'desc')
            ->get();

        return Inertia::render('libros/trashed', [
            'libros' => $libros,
        ]);
    }

    /**
     * Muestra el detalle de un libro.
     */
    public function show(Libro $libro): Response
    {
        return Inertia::render('libros/show', [
            'libro' => $libro->load('materia'),
        ]);
    }

    /**
     * Guarda un libro nuevo.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'materia_id'        => 'required|exists:materias,id',
            'nombre'            => 'required|string|max:200',
            'autor'             => 'nullable|string|max:150',
            'anio_lanzamiento'  => 'nullable|integer|min:1900|max:2100',
        ]);

        Libro::create($request->only([
            'materia_id', 'nombre', 'autor', 'anio_lanzamiento'
        ]));

        return redirect()->route('libros.index')->with('success', 'Libro creado exitosamente.');
    }

    /**
     * Actualiza un libro existente.
     */
    public function update(Request $request, Libro $libro): RedirectResponse
    {
        $request->validate([
            'materia_id'        => 'required|exists:materias,id',
            'nombre'            => 'required|string|max:200',
            'autor'             => 'nullable|string|max:150',
            'anio_lanzamiento'  => 'nullable|integer|min:1900|max:2100',
        ]);

        $libro->update($request->only([
            'materia_id', 'nombre', 'autor', 'anio_lanzamiento'
        ]));

        return redirect()->route('libros.index')->with('success', 'Libro actualizado exitosamente.');
    }

    /**
     * Elimina un libro (soft delete).
     */
    public function destroy(Libro $libro): RedirectResponse
    {
        $libro->delete();
        return redirect()->route('libros.index')->with('success', 'Libro eliminado exitosamente.');
    }

    /**
     * Restaura un libro eliminado.
     */
    public function restore(int $id): RedirectResponse
    {
        $libro = Libro::withTrashed()->findOrFail($id);
        $libro->restore();

        return redirect()->route('libros.index')->with('success', 'Libro restaurado exitosamente.');
    }
}