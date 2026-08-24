<?php

namespace App\Http\Controllers;

use App\Models\Autoridad;
use App\Models\Convocatoria;
use App\Models\Portada;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PaginaAdminController extends Controller
{
    /**
     * Muestra la página de administración del welcome.
     */
    public function index(): Response
    {
        return Inertia::render('pagina-admin/index', [
            'portadas' => Portada::orderBy('orden')->get(),
            'autoridades' => Autoridad::ordenadas()->get(),
            'convocatorias' => Convocatoria::withTrashed()->orderBy('created_at', 'desc')->get(),
        ]);
    }

    // ========================
    // PORTADAS
    // ========================
    public function storePortada(Request $request): RedirectResponse
    {
        $request->validate([
            'titulo' => 'nullable|string|max:200',
            'imagen' => 'required|image|max:2048',
            'orden' => 'nullable|integer|min:0',
        ]);

        $data = [
            'titulo' => $request->titulo,
            'orden' => $request->orden ?? 0,
            'activo' => true,
        ];

        if ($request->hasFile('imagen')) {
            $data['imagen'] = $request->file('imagen')->store('portadas', 'public');
        }

        Portada::create($data);

        return back()->with('success', 'Portada agregada.');
    }

    public function updatePortada(Request $request, Portada $portada): RedirectResponse
    {
        $request->validate([
            'titulo' => 'nullable|string|max:200',
            'imagen' => 'nullable|image|max:2048',
            'orden' => 'nullable|integer|min:0',
            'activo' => 'nullable|boolean',
        ]);

        $data = $request->only(['titulo', 'orden', 'activo']);

        if ($request->hasFile('imagen')) {
            if ($portada->imagen) Storage::disk('public')->delete($portada->imagen);
            $data['imagen'] = $request->file('imagen')->store('portadas', 'public');
        }

        $portada->update($data);

        return back()->with('success', 'Portada actualizada.');
    }

    public function destroyPortada(Portada $portada): RedirectResponse
    {
        if ($portada->imagen) Storage::disk('public')->delete($portada->imagen);
        $portada->delete();

        return back()->with('success', 'Portada eliminada.');
    }

    // ========================
    // AUTORIDADES
    // ========================
    public function storeAutoridad(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:200',
            'cargo' => 'required|string|max:100',
            'foto' => 'nullable|image|max:2048',
            'mensaje' => 'nullable|string',
            'orden' => 'nullable|integer|min:0',
        ]);

        $data = $request->only(['nombre', 'cargo', 'mensaje', 'orden']);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('autoridades', 'public');
        }

        Autoridad::create($data);

        return back()->with('success', 'Autoridad agregada.');
    }

    public function updateAutoridad(Request $request, Autoridad $autoridad): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:200',
            'cargo' => 'required|string|max:100',
            'foto' => 'nullable|image|max:2048',
            'mensaje' => 'nullable|string',
            'orden' => 'nullable|integer|min:0',
        ]);

        $data = $request->only(['nombre', 'cargo', 'mensaje', 'orden']);

        if ($request->hasFile('foto')) {
            if ($autoridad->foto) Storage::disk('public')->delete($autoridad->foto);
            $data['foto'] = $request->file('foto')->store('autoridades', 'public');
        }

        $autoridad->update($data);

        return back()->with('success', 'Autoridad actualizada.');
    }

    public function destroyAutoridad(Autoridad $autoridad): RedirectResponse
    {
        if ($autoridad->foto) Storage::disk('public')->delete($autoridad->foto);
        $autoridad->delete();

        return back()->with('success', 'Autoridad eliminada.');
    }

    // ========================
    // CONVOCATORIAS
    // ========================
    public function storeConvocatoria(Request $request): RedirectResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'archivo' => 'nullable|image|max:2048',
            'link_video' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'activo' => 'nullable|boolean',
        ]);

        $data = $request->only(['titulo', 'descripcion', 'link_video', 'fecha_inicio', 'fecha_fin', 'activo']);

        if ($request->hasFile('archivo')) {
            $data['archivo'] = $request->file('archivo')->store('convocatorias', 'public');
        }

        Convocatoria::create($data);

        return back()->with('success', 'Convocatoria publicada.');
    }
    
    
    public function updateConvocatoria(Request $request, Convocatoria $convocatoria): RedirectResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'archivo' => 'nullable|image|max:2048',
            'link_video' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'activo' => 'nullable|boolean',
        ]);

        $data = $request->only(['titulo', 'descripcion', 'link_video', 'fecha_inicio', 'fecha_fin', 'activo']);

        if ($request->hasFile('archivo')) {
            if ($convocatoria->archivo) Storage::disk('public')->delete($convocatoria->archivo);
            $data['archivo'] = $request->file('archivo')->store('convocatorias', 'public');
        }

        $convocatoria->update($data);

        return back()->with('success', 'Convocatoria actualizada.');
    }

    public function destroyConvocatoria(Convocatoria $convocatoria): RedirectResponse
    {
        $convocatoria->delete();

        return back()->with('success', 'Convocatoria eliminada.');
    }

    public function restoreConvocatoria(int $id): RedirectResponse
    {
        Convocatoria::withTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'Convocatoria restaurada.');
    }
}