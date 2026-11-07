<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\Recurso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RecursoController extends Controller
{
    /**
     * Publica un nuevo recurso de estudio.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'tema_id' => 'nullable|exists:temas,id',
            'curso_id' => 'nullable|exists:cursos,id',
            'titulo' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'tipo' => ['required', Rule::in(['pdf', 'enlace', 'documento'])],
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,txt|max:25600',
            'enlace_url' => 'nullable|string|max:500',
        ]);

        $tipo = $request->tipo;
        $enlaceUrl = trim((string) $request->enlace_url);

        // Validación condicional según el tipo
        if ($tipo === 'enlace') {
            if (empty($enlaceUrl)) {
                return back()->withErrors(['enlace_url' => 'Debes ingresar un enlace web o link de YouTube/investigación.']);
            }
            if (! str_starts_with($enlaceUrl, 'http://') && ! str_starts_with($enlaceUrl, 'https://')) {
                $enlaceUrl = 'https://'.$enlaceUrl;
            }
        } elseif (! $request->hasFile('archivo')) {
            return back()->withErrors(['archivo' => 'Debes seleccionar un archivo para el recurso de estudio.']);
        }

        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->first();
        $docenteId = $docente?->id ?? Docente::first()?->id;

        $archivoPath = null;
        if ($request->hasFile('archivo')) {
            $archivoPath = $request->file('archivo')->store('recursos', 'public');
        }

        $maxOrden = Recurso::where('materia_id', $request->materia_id)
            ->when($request->tema_id, fn ($q) => $q->where('tema_id', $request->tema_id))
            ->max('orden') ?? 0;

        Recurso::create([
            'materia_id' => $request->materia_id,
            'tema_id' => $request->tema_id ?: null,
            'curso_id' => $request->curso_id ?: null,
            'docente_id' => $docenteId,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'tipo' => $tipo,
            'archivo' => $archivoPath,
            'enlace_url' => $tipo === 'enlace' ? $enlaceUrl : null,
            'orden' => $maxOrden + 1,
            'estado' => 'activo',
        ]);

        return back()->with('success', 'Recurso de estudio publicado exitosamente.');
    }

    /**
     * Actualiza un recurso de estudio.
     */
    public function update(Request $request, Recurso $recurso): RedirectResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:200',
            'tema_id' => 'nullable|exists:temas,id',
            'curso_id' => 'nullable|exists:cursos,id',
            'descripcion' => 'nullable|string',
            'tipo' => ['required', Rule::in(['pdf', 'enlace', 'documento'])],
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,txt|max:25600',
            'enlace_url' => 'nullable|string|max:500',
            'estado' => ['required', Rule::in(['activo', 'inactivo'])],
        ]);

        $tipo = $request->tipo;
        $enlaceUrl = trim((string) $request->enlace_url);

        if ($tipo === 'enlace' && ! empty($enlaceUrl)) {
            if (! str_starts_with($enlaceUrl, 'http://') && ! str_starts_with($enlaceUrl, 'https://')) {
                $enlaceUrl = 'https://'.$enlaceUrl;
            }
        }

        $data = [
            'titulo' => $request->titulo,
            'tema_id' => $request->tema_id ?: null,
            'curso_id' => $request->curso_id ?: null,
            'descripcion' => $request->descripcion,
            'tipo' => $tipo,
            'enlace_url' => $tipo === 'enlace' ? $enlaceUrl : null,
            'estado' => $request->estado,
        ];

        if ($request->hasFile('archivo')) {
            if ($recurso->archivo && Storage::disk('public')->exists($recurso->archivo)) {
                Storage::disk('public')->delete($recurso->archivo);
            }
            $data['archivo'] = $request->file('archivo')->store('recursos', 'public');
        }

        $recurso->update($data);

        return back()->with('success', 'Recurso de estudio actualizado.');
    }

    /**
     * Elimina un recurso de estudio.
     */
    public function destroy(Recurso $recurso): RedirectResponse
    {
        if ($recurso->archivo && Storage::disk('public')->exists($recurso->archivo)) {
            Storage::disk('public')->delete($recurso->archivo);
        }

        $recurso->delete();

        return back()->with('success', 'Recurso de estudio eliminado.');
    }
}
