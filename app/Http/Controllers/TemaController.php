<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Models\Tema;
use App\Services\IAService;
use App\Services\PdfTextExtractor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TemaController extends Controller
{
    /**
     * Genera automáticamente nombre, páginas y resumen para un tema
     * a partir de un texto provisto o un archivo PDF subido.
     */
    public function generarResumen(Request $request, IAService $iaService): JsonResponse
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'texto' => 'nullable|string',
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:20480', // 20MB máx
        ]);

        $texto = (string) $request->input('texto', '');

        if ($request->hasFile('archivo_pdf')) {
            $textoExtraido = PdfTextExtractor::extraer($request->file('archivo_pdf'));
            if (! empty($textoExtraido)) {
                $texto = $textoExtraido;
            } elseif (empty(trim($texto))) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo extraer texto legible del PDF provisto. Es posible que sea un PDF escaneado (imagen). Por favor copia y pega el texto directamente en la pestaña "Pegar Texto".',
                ], 422);
            }
        }

        if (empty(trim($texto))) {
            return response()->json([
                'success' => false,
                'message' => 'Debes proporcionar un archivo PDF con texto legible o pegar el contenido en el área de texto.',
            ], 422);
        }

        $materia = Materia::find($request->materia_id);
        $materiaNombre = $materia ? $materia->nombre : 'Psicología';

        try {
            $resultado = $iaService->generarResumenTema($texto, $materiaNombre);

            return response()->json([
                'success' => true,
                'nombre' => $resultado['nombre'],
                'paginas_libro' => $resultado['paginas_libro'],
                'resumen' => $resultado['resumen'],
                'longitud_texto' => mb_strlen($texto),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar resumen con IA: '.IAService::traducirErrorIA($e),
            ], 500);
        }
    }

    /**
     * Guarda un nuevo tema asignado a una materia.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'nombre' => 'required|string|max:200',
            'orden' => 'nullable|integer|min:1',
            'resumen' => 'nullable|string',
            'paginas_libro' => 'nullable|string|max:50',
            'estado' => ['nullable', Rule::in(['programado', 'visto', 'omitido', 'pospuesto'])],
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        $orden = $request->orden;
        if (! $orden) {
            $maxOrden = Tema::where('materia_id', $request->materia_id)->max('orden') ?? 0;
            $orden = $maxOrden + 1;
        }

        $rutaPdf = null;
        if ($request->hasFile('archivo_pdf')) {
            $rutaPdf = $request->file('archivo_pdf')->store('temas/pdf', 'public');
        }

        Tema::create([
            'materia_id' => $request->materia_id,
            'nombre' => $request->nombre,
            'orden' => $orden,
            'resumen' => $request->resumen,
            'paginas_libro' => $request->paginas_libro,
            'archivo_pdf' => $rutaPdf,
            'estado' => $request->estado ?? 'programado',
        ]);

        return back()->with('success', 'Tema agregado al temario exitosamente.');
    }

    /**
     * Actualiza un tema existente.
     */
    public function update(Request $request, Tema $tema): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:200',
            'orden' => 'required|integer|min:1',
            'resumen' => 'nullable|string',
            'paginas_libro' => 'nullable|string|max:50',
            'estado' => ['required', Rule::in(['programado', 'visto', 'omitido', 'pospuesto'])],
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        $data = $request->only([
            'nombre',
            'orden',
            'resumen',
            'paginas_libro',
            'estado',
        ]);

        if ($request->hasFile('archivo_pdf')) {
            if ($tema->archivo_pdf && Storage::disk('public')->exists($tema->archivo_pdf)) {
                Storage::disk('public')->delete($tema->archivo_pdf);
            }
            $data['archivo_pdf'] = $request->file('archivo_pdf')->store('temas/pdf', 'public');
        }

        $tema->update($data);

        return back()->with('success', 'Tema actualizado correctamente.');
    }

    /**
     * Elimina (soft delete) un tema.
     */
    public function destroy(Tema $tema): RedirectResponse
    {
        $tema->delete();

        return back()->with('success', 'Tema eliminado del temario.');
    }
}
