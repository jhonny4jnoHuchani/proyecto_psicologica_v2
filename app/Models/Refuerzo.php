<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refuerzo extends Model
{
    protected $table = 'refuerzos';

    protected $fillable = [
        'entrega_id',
        'estudiante_id',
        'leccion_id',
        'curso_materia_id',
        'preguntas',
        'respuestas',
        'recomendacion',
        'completado',
    ];

    protected function casts(): array
    {
        return [
            'preguntas' => 'array',
            'respuestas' => 'array',
            'completado' => 'boolean',
        ];
    }

    // ========================
    // RELACIONES
    // ========================

    public function entrega(): BelongsTo
    {
        return $this->belongsTo(Entrega::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function leccion(): BelongsTo
    {
        return $this->belongsTo(Leccion::class);
    }

    public function cursoMateria(): BelongsTo
    {
        return $this->belongsTo(CursoMateria::class, 'curso_materia_id');
    }
}