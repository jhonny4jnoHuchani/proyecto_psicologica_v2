<?php

namespace App\Http\Controllers;

use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Leccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EntregaController extends Controller
{
    /**
     * Vista Estudiante: Mis Entregas
     */
    public function index(): Response
    {
        $user = Auth::user();
        $estudiante = Estudiante::where('user_id', $user->id)->first();

        $entregas = Entrega::with(['leccion.materia', 'leccion.docente.user', 'calificacion'])
            ->where('estudiante_id', $estudiante->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Lecciones donde el estudiante aún no ha entregado
        $leccionesPendientes = Leccion::with(['materia', 'docente.user', 'curso'])
            ->whereHas('curso.estudiantes', fn($q) => $q->where('estudiante_id', $estudiante->id))
            ->whereDoesntHave('entregas', fn($q) => $q->where('estudiante_id', $estudiante->id))
            ->where('estado', 'activo')
            ->get();

        return Inertia::render('entregas/estudiante', [
            'entregas' => $entregas,
            'leccionesPendientes' => $leccionesPendientes,
        ]);
    }

    /**
     * Vista Docente: Entregas de mis lecciones
     */
    public function docente(): Response
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->first();

        $lecciones = Leccion::with('materia', 'curso')
            ->where('docente_id', $docente->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $leccionId = request('leccion_id');

        $entregas = Entrega::with(['estudiante.user', 'leccion.materia', 'calificacion'])
            ->whereHas('leccion', fn($q) => $q->where('docente_id', $docente->id))
            ->when($leccionId, fn($q) => $q->where('leccion_id', $leccionId))
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('entregas/docente', [
            'entregas' => $entregas,
            'lecciones' => $lecciones,
            'filtroLeccionId' => $leccionId ? (int) $leccionId : null,
        ]);
    }

    /**
     * Subir/Actualizar entrega (Estudiante)
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'leccion_id' => 'required|exists:lecciones,id',
            'archivos' => 'required|array|min:1',
            'archivos.*' => 'file|max:10240', // 10MB max
            'comentarios' => 'nullable|string',
        ]);

        $user = Auth::user();
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        $leccion = Leccion::findOrFail($request->leccion_id);

        // Verificar si ya existe entrega
        $entrega = Entrega::where('leccion_id', $leccion->id)
            ->where('estudiante_id', $estudiante->id)
            ->first();

        // Subir archivos
        $rutas = [];
        foreach ($request->file('archivos') as $archivo) {
            $ruta = $archivo->store("entregas/{$leccion->id}/{$estudiante->id}", 'public');
            $rutas[] = $ruta;
        }

        // Determinar estado
        $estadoEntrega = 'entregado';
        if ($leccion->fecha_entrega && now()->gt($leccion->fecha_entrega)) {
            $estadoEntrega = 'atrasado';
        }

        if ($entrega) {
            // Si ya existe y se puede editar
            if (!$entrega->sePuedeEditar()) {
                return back()->with('error', 'No puedes editar esta entrega.');
            }
            // Eliminar archivos antiguos
            if ($entrega->archivos_enviado) {
                foreach ($entrega->archivos_enviado as $rutaVieja) {
                    Storage::disk('public')->delete($rutaVieja);
                }
            }
            $entrega->update([
                'archivos_enviado' => $rutas,
                'comentarios' => $request->comentarios,
                'estado_entrega' => $estadoEntrega,
                'fecha_entrega' => now(),
            ]);
        } else {
            Entrega::create([
                'leccion_id' => $leccion->id,
                'estudiante_id' => $estudiante->id,
                'archivos_enviado' => $rutas,
                'comentarios' => $request->comentarios,
                'estado_entrega' => $estadoEntrega,
                'fecha_entrega' => now(),
            ]);
        }

        return back()->with('success', 'Entrega subida exitosamente.');
    }
}