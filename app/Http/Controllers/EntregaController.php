<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Estudiante;
use App\Models\Leccion;
use App\Services\NotificacionService;
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

        if (! $estudiante) {
            return Inertia::render('entregas/estudiante', [
                'entregas' => collect(),
                'leccionesPendientes' => collect(),
            ]);
        }

        $entregas = Entrega::with([
            'leccion.materia',
            'leccion.docente.user',
            'calificacion',
            'refuerzo',  // 👈 NUEVO
        ])
            ->where('estudiante_id', $estudiante->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $leccionesPendientes = Leccion::with(['materia', 'docente.user', 'curso'])
            ->whereHas('curso.estudiantes', fn ($q) => $q->where('estudiante_id', $estudiante->id))
            ->whereDoesntHave('entregas', fn ($q) => $q->where('estudiante_id', $estudiante->id))
            ->where('estado', 'activo')
            ->get();

        return Inertia::render('entregas/estudiante', [
            'entregas' => $entregas,
            'leccionesPendientes' => $leccionesPendientes,
        ]);
    }

    /**
     * Vista Docente: Entregas de mis lecciones (/entregas/docente)
     */
    public function docente(): Response
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');
        $docente = Docente::where('user_id', $user->id)->first();

        if (! $isAdmin && ! $docente) {
            return Inertia::render('entregas/docente', [
                'entregas' => collect(),
                'lecciones' => collect(),
                'filtroLeccionId' => null,
                'estudiantesSinEntregar' => collect(),
            ]);
        }

        $lecciones = Leccion::with('materia', 'curso')
            ->when(! $isAdmin && $docente, fn ($q) => $q->where('docente_id', $docente->id))
            ->orderBy('created_at', 'desc')
            ->get();

        $leccionId = request('leccion_id');

        $entregas = Entrega::with(['estudiante.user', 'leccion.materia', 'calificacion', 'refuerzo'])
            ->when(! $isAdmin && $docente, fn ($q) => $q->whereHas('leccion', fn ($sq) => $sq->where('docente_id', $docente->id)))
            ->when($leccionId, fn ($q) => $q->where('leccion_id', $leccionId))
            ->orderBy('created_at', 'desc')
            ->get();

        $estudiantesSinEntregar = collect();
        if ($leccionId) {
            $leccionActual = $lecciones->firstWhere('id', (int) $leccionId);
            if ($leccionActual) {
                $estudiantesSinEntregar = Estudiante::whereHas('cursos', function ($q) use ($leccionActual) {
                    $q->where('cursos.id', $leccionActual->curso_id);
                })
                    ->whereDoesntHave('entregas', function ($q) use ($leccionActual) {
                        $q->where('leccion_id', $leccionActual->id);
                    })
                    ->with('user')
                    ->get();
            }
        }

        return Inertia::render('entregas/docente', [
            'entregas' => $entregas,
            'lecciones' => $lecciones,
            'filtroLeccionId' => $leccionId ? (int) $leccionId : null,
            'estudiantesSinEntregar' => $estudiantesSinEntregar,
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
            'archivos.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png,webp,zip,rar|max:25600',
            'comentarios' => 'nullable|string',
        ], [
            'leccion_id.required' => 'La tarea o lección no fue especificada.',
            'archivos.required' => 'Debes adjuntar al menos un archivo para tu entrega.',
            'archivos.min' => 'Debes adjuntar al menos un archivo para tu entrega.',
            'archivos.*.file' => 'Uno de los elementos adjuntos no es un archivo válido.',
            'archivos.*.mimes' => 'Formato de archivo no permitido. Usa PDF, Word, PowerPoint, Excel, imágenes (JPG/PNG/WebP), TXT o ZIP/RAR.',
            'archivos.*.max' => 'Cada archivo entregado no debe superar los 25 MB.',
        ]);

        $user = Auth::user();
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        if (! $estudiante) {
            abort(403, 'No tienes un perfil de estudiante asociado.');
        }

        $leccion = Leccion::findOrFail($request->leccion_id);

        // Verificar que el estudiante esté matriculado en el curso de esta lección
        $estaMatriculado = $estudiante->cursos()->where('cursos.id', $leccion->curso_id)->exists();
        if (! $estaMatriculado) {
            abort(403, 'No estás inscrito en el curso correspondiente a esta tarea.');
        }

        // Verificar si ya existe entrega
        $entrega = Entrega::where('leccion_id', $leccion->id)
            ->where('estudiante_id', $estudiante->id)
            ->first();

        // Validar antes de subir archivos nuevos para no dejar archivos huérfanos en disco
        if ($entrega && ! $entrega->sePuedeEditar()) {
            return back()->with('error', 'No puedes editar esta entrega.');
        }

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

        NotificacionService::sistema(
            user: $user,
            titulo: 'Tarea entregada',
            mensaje: "Tu entrega para la tarea \"{$leccion->titulo}\" fue recibida correctamente.",
            url: "/lecciones/{$leccion->id}",
            // mandarTelegram: true, // Podemos notificar tanto por web como por telegram
        );

        return back()->with('success', 'Entrega subida exitosamente.');
    }
}
