<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Leccion extends Model
{
    use SoftDeletes;

    protected $table = 'lecciones';

    protected $fillable = [
        'materia_id',
        'docente_id',
        'curso_id',
        'titulo',
        'tema',
        'descripcion',
        'fecha_programada',
        'fecha_entrega',
        'imagen',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_programada' => 'date',
            'fecha_entrega' => 'date',
        ];
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(Entrega::class);
    }
}