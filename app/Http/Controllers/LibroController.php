<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use App\Models\Materia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LibroController extends Controller
{
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

    public function trashed(): Response
    {
        $libros = Libro::onlyTrashed()
            ->with('materia')
            ->orderBy('deleted_at', 'desc')
            ->get();

        return Inertia::render('libros/eliminados', [
            'libros' => $libros,
        ]);
    }

    public function show(Libro $libro): Response
    {
        return Inertia::render('libros/show', [
            'libro' => $libro->load('materia'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'nombre' => 'required|string|max:200',
            'autor' => 'nullable|string|max:150',
            'anio_lanzamiento' => 'nullable|integer|min:1900|max:2100',
            'archivo' => 'nullable|file|mimes:pdf|max:10240',
            'portada' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['materia_id', 'nombre', 'autor', 'anio_lanzamiento']);

        if ($request->hasFile('archivo')) {
            $data['archivo'] = $request->file('archivo')->store('libros/pdf', 'public');
        }

        if ($request->hasFile('portada')) {
            $data['portada'] = $request->file('portada')->store('libros/portadas', 'public');
        }

        Libro::create($data);

        return redirect()->route('libros.index')->with('success', 'Libro creado exitosamente.');
    }

    public function update(Request $request, Libro $libro): RedirectResponse
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'nombre' => 'required|string|max:200',
            'autor' => 'nullable|string|max:150',
            'anio_lanzamiento' => 'nullable|integer|min:1900|max:2100',
            'archivo' => 'nullable|file|mimes:pdf|max:10240',
            'portada' => 'nullable|image|max:2048',
        ]);

        $data = $request->only(['materia_id', 'nombre', 'autor', 'anio_lanzamiento']);

        if ($request->hasFile('archivo')) {
            if ($libro->archivo) Storage::disk('public')->delete($libro->archivo);
            $data['archivo'] = $request->file('archivo')->store('libros/pdf', 'public');
        }

        if ($request->hasFile('portada')) {
            if ($libro->portada) Storage::disk('public')->delete($libro->portada);
            $data['portada'] = $request->file('portada')->store('libros/portadas', 'public');
        }

        $libro->update($data);

        return redirect()->route('libros.index')->with('success', 'Libro actualizado exitosamente.');
    }

    public function destroy(Libro $libro): RedirectResponse
    {
        $libro->delete();
        return redirect()->route('libros.index')->with('success', 'Libro eliminado exitosamente.');
    }

    public function restore(int $id): RedirectResponse
    {
        $libro = Libro::withTrashed()->findOrFail($id);
        $libro->restore();

        return redirect()->route('libros.index')->with('success', 'Libro restaurado exitosamente.');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        $libro = Libro::withTrashed()->findOrFail($id);
        
        // Eliminar archivos del storage
        if ($libro->archivo) Storage::disk('public')->delete($libro->archivo);
        if ($libro->portada) Storage::disk('public')->delete($libro->portada);
        
        $libro->forceDelete();

        return redirect()->route('libros.trashed')->with('success', 'Libro eliminado permanentemente.');
    }
}