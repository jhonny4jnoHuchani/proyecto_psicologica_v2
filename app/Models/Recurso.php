<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recurso extends Model
{
    use SoftDeletes;

    protected $table = 'recursos';

    protected $fillable = [
        'materia_id',
        'tema_id',
        'curso_id',
        'docente_id',
        'titulo',
        'descripcion',
        'tipo',
        'archivo',
        'enlace_url',
        'orden',
        'estado',
    ];

    /** Materia académica a la que pertenece el recurso. */
    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    /** Tema del temario en el que se ubica el recurso. */
    public function tema(): BelongsTo
    {
        return $this->belongsTo(Tema::class);
    }

    /** Curso específico asignado (o null si es para todos los cursos de la materia). */
    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }

    /** Docente que publicó el recurso de estudio. */
    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }
}

