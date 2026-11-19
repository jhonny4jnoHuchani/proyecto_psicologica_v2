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
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,txt|max:51200',
            'enlace_url' => 'nullable|string|max:500',
        ], [
            'materia_id.required' => 'Debes seleccionar una materia.',
            'titulo.required' => 'El título del recurso es obligatorio.',
            'tipo.required' => 'Debes indicar el tipo de recurso.',
            'archivo.mimes' => 'El formato del archivo adjunto no es compatible.',
            'archivo.max' => 'El archivo no debe superar los 50 MB de tamaño.',
        ]);

        $tipo = $request->tipo;
        $enlaceUrl = trim((string) $request->enlace_url);

        // Validación condicional según el tipo
        if ($tipo === 'enlace') {
            if (empty($enlaceUrl)) {
                return back()->withErrors(['enlace_url' => 'Debes ingresar un enlace web o link de YouTube/investigación.']);
            }
            if (preg_match('/^(javascript|data|vbscript):/i', $enlaceUrl)) {
                return back()->withErrors(['enlace_url' => 'El enlace ingresado contiene un protocolo no permitido.']);
            }
            if (! str_starts_with($enlaceUrl, 'http://') && ! str_starts_with($enlaceUrl, 'https://')) {
                $enlaceUrl = 'https://'.$enlaceUrl;
            }
            if (! filter_var($enlaceUrl, FILTER_VALIDATE_URL)) {
                return back()->withErrors(['enlace_url' => 'Debes ingresar una URL válida (ej. https://...).']);
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
        $user = Auth::user();
        if (! $user->hasRole('admin')) {
            $docente = Docente::where('user_id', $user->id)->first();
            if ($recurso->docente_id && $recurso->docente_id !== $docente?->id) {
                abort(403, 'No tienes permiso para modificar este recurso.');
            }
        }

        $request->validate([
            'titulo' => 'required|string|max:200',
            'tema_id' => 'nullable|exists:temas,id',
            'curso_id' => 'nullable|exists:cursos,id',
            'descripcion' => 'nullable|string',
            'tipo' => ['required', Rule::in(['pdf', 'enlace', 'documento'])],
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,txt|max:51200',
            'enlace_url' => 'nullable|string|max:500',
            'estado' => ['required', Rule::in(['activo', 'inactivo'])],
        ], [
            'titulo.required' => 'El título del recurso es obligatorio.',
            'tipo.required' => 'Debes indicar el tipo de recurso.',
            'archivo.mimes' => 'El formato del archivo adjunto no es compatible.',
            'archivo.max' => 'El archivo no debe superar los 50 MB de tamaño.',
            'estado.required' => 'El estado es obligatorio.',
        ]);

        $tipo = $request->tipo;
        $enlaceUrl = trim((string) $request->enlace_url);

        if ($tipo === 'enlace' && ! empty($enlaceUrl)) {
            if (preg_match('/^(javascript|data|vbscript):/i', $enlaceUrl)) {
                return back()->withErrors(['enlace_url' => 'El enlace ingresado contiene un protocolo no permitido.']);
            }
            if (! str_starts_with($enlaceUrl, 'http://') && ! str_starts_with($enlaceUrl, 'https://')) {
                $enlaceUrl = 'https://'.$enlaceUrl;
            }
            if (! filter_var($enlaceUrl, FILTER_VALIDATE_URL)) {
                return back()->withErrors(['enlace_url' => 'Debes ingresar una URL válida (ej. https://...).']);
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
        $user = Auth::user();
        if (! $user->hasRole('admin')) {
            $docente = Docente::where('user_id', $user->id)->first();
            if ($recurso->docente_id && $recurso->docente_id !== $docente?->id) {
                abort(403, 'No tienes permiso para eliminar este recurso.');
            }
        }

        if ($recurso->archivo && Storage::disk('public')->exists($recurso->archivo)) {
            Storage::disk('public')->delete($recurso->archivo);
        }

        $recurso->delete();

        return back()->with('success', 'Recurso de estudio eliminado.');
    }
}
