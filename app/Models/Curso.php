<?php

namespace App\Models;

use App\Traits\HasObfuscatedRouteKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Curso extends Model
{
    use HasObfuscatedRouteKey, SoftDeletes;

    protected $table = 'cursos';

    protected $appends = ['hash_id'];

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

    /** Gestión académica anual/semestral a la que pertenece el curso. */
    public function gestion(): BelongsTo
    {
        return $this->belongsTo(Gestion::class);
    }

    /** Materias asignadas al curso con su respectivo docente e indicador de IA. */
    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'curso_materia')
            ->withPivot('docente_id', 'ayuda_ia_activa', 'imagen')
            ->withTimestamps();
    }

    /** Estudiantes matriculados en este curso y paralelo. */
    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(Estudiante::class, 'curso_estudiante')
            ->withPivot('fecha_inscripcion', 'estado')
            ->withTimestamps();
    }

    /** Nombre compuesto del curso con año, etapa y paralelo. */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->gestion->nombre_completo} - Paralelo {$this->paralelo}";
    }

    /** Lecciones y tareas publicadas en este curso. */
    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class);
    }

    /** Recursos y materiales de estudio asignados a este curso. */
    public function recursos(): HasMany
    {
        return $this->hasMany(Recurso::class);
    }
}
