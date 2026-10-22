<?php

namespace App\Models;

use App\Traits\HasObfuscatedRouteKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refuerzo extends Model
{
    use HasObfuscatedRouteKey;

    protected $table = 'refuerzos';

    protected $appends = ['hash_id'];

    protected $fillable = [
        'entrega_id',
        'estudiante_id',
        'leccion_id',
        'curso_materia_id',
        'preguntas',
        'respuestas',
        'recomendacion',
        'completado',
        'nota',
        'evaluacion_ia',
        'fecha_evaluacion',
    ];

    protected function casts(): array
    {
        return [
            'preguntas' => 'array',
            'respuestas' => 'array',
            'completado' => 'boolean',
            'nota' => 'float',
            'evaluacion_ia' => 'array',
            'fecha_evaluacion' => 'datetime',
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
