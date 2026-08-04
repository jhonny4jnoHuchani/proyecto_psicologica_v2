<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\Entrega;
use App\Models\Leccion;
use App\Models\Materia;
use App\Exports\CalificacionesExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ReporteController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            $cursos = Curso::with('gestion')->orderBy('created_at', 'desc')->get();
            $materias = Materia::orderBy('nombre')->get();
        } else {
            $docente = Docente::where('user_id', $user->id)->first();
            $cursos = Curso::whereHas('materias', function ($q) use ($docente) {
                $q->where('curso_materia.docente_id', $docente->id);
            })->with('gestion')->get();

            $materias = Materia::whereHas('cursos', function ($q) use ($docente) {
                $q->where('curso_materia.docente_id', $docente->id);
            })->get();
        }

        return inertia('reportes/index', [
            'cursos' => $cursos,
            'materias' => $materias,
            'filtros' => [
                'curso_id' => $request->query('curso_id'),
                'materia_id' => $request->query('materia_id'),
            ],
        ]);
    }

    /**
     * Validar que el docente solo acceda a sus cursos.
     */
    private function validarAcceso($cursoId, $materiaId = null)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) return;

        $docente = Docente::where('user_id', $user->id)->first();

        $acceso = Curso::where('id', $cursoId)
            ->whereHas('materias', function ($q) use ($docente, $materiaId) {
                $q->where('curso_materia.docente_id', $docente->id);
                if ($materiaId) {
                    $q->where('materia_id', $materiaId);
                }
            })->exists();

        if (!$acceso) {
            abort(403, 'No tienes permiso para generar este reporte.');
        }
    }

    public function pdf(Request $request)
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'materia_id' => 'nullable|exists:materias,id',
        ]);

        $this->validarAcceso($request->curso_id, $request->materia_id);

        $curso = Curso::with('gestion')->findOrFail($request->curso_id);
        $materia = $request->materia_id ? Materia::find($request->materia_id) : null;

        // CORREGIDO: ordenar con sortBy en vez de orderBy
        $estudiantes = $curso->estudiantes()
            ->with('user')
            ->get()
            ->sortBy(fn($e) => $e->user->apellido_paterno);

        $lecciones = Leccion::where('curso_id', $curso->id)
            ->when($request->materia_id, fn($q) => $q->where('materia_id', $request->materia_id))
            ->orderBy('fecha_entrega')
            ->get();

        $entregas = Entrega::with('calificacion')
            ->whereIn('leccion_id', $lecciones->pluck('id'))
            ->get();

        $nombreArchivo = 'reporte-' . Str::slug($curso->gestion->año . '-' . $curso->paralelo) . '.pdf';

        $pdf = Pdf::loadView('reportes.calificaciones', [
            'curso' => $curso,
            'materia' => $materia,
            'estudiantes' => $estudiantes,
            'lecciones' => $lecciones,
            'entregas' => $entregas,
        ])->setPaper('a4', 'landscape');

        return $pdf->download($nombreArchivo);
    }

    public function excel(Request $request)
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'materia_id' => 'nullable|exists:materias,id',
        ]);

        $this->validarAcceso($request->curso_id, $request->materia_id);

        $curso = Curso::with('gestion')->findOrFail($request->curso_id);
        $nombreArchivo = 'reporte-' . Str::slug($curso->gestion->año . '-' . $curso->paralelo) . '.xlsx';

        return Excel::download(
            new CalificacionesExport($curso, $request->materia_id),
            $nombreArchivo
        );
    }
}