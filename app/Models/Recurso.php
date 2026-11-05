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

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function tema(): BelongsTo
    {
        return $this->belongsTo(Tema::class);
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }
}

