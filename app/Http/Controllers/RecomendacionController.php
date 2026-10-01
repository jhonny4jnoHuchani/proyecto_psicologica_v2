<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Services\MachineLearningService;
use Inertia\Inertia;

class RecomendacionController extends Controller
{
    /**
     * Muestra la página de recomendaciones inteligentes del ML.
     */
    public function index(MachineLearningService $mlService)
    {
        // 📌 PARA LA DEMO: simulamos que el estudiante reprobó la materia 1 con 45.
        // (Más adelante esto saldrá de las calificaciones reales del estudiante logueado)
        $materia_id = 1;
        $nota_baja = 45;

        // El "mesero" (Laravel) le pregunta al "chef" (Python/ML)
        $recomendacion = $mlService->getRecomendacion($materia_id, $nota_baja);

        // Buscamos el nombre REAL de la materia en tu BD
        $materia = Materia::find($materia_id);

        // Enviamos todo a React por Inertia
        return Inertia::render('Recomendaciones/Index', [
            'recomendacion' => $recomendacion,
            'materia' => $materia?->nombre ?? 'Materia',
            'nota' => $nota_baja,
        ]);
    }
}