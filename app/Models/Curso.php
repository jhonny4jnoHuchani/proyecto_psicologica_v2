<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;


class Curso extends Model
{
    use SoftDeletes;

    protected $table = 'cursos';

    protected $fillable = [
        'gestion_id',
        'paralelo',
        'estado',
        'cupos',
        'turno',
    ];

    protected function casts(): array
    {
        return [
            'cupos' => 'integer',
        ];
    }

    public function gestion(): BelongsTo
    {
        return $this->belongsTo(Gestion::class);
    }

    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'curso_materia')
            ->withPivot('docente_id')
            ->withTimestamps();
    }

    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(Estudiante::class, 'curso_estudiante')
            ->withPivot('fecha_inscripcion', 'estado')
            ->withTimestamps();
    }

    public function getNombreCompletoAttribute(): string
    {
        return "{$this->gestion->nombre_completo} - Paralelo {$this->paralelo}";
    }

    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class);
    }
}