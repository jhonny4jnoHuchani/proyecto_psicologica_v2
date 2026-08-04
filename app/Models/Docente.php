<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Docente extends Model
{
    use SoftDeletes;

    protected $table = 'docentes';

    protected $fillable = [
        'user_id',
        'especialidad',
        'titulo_profesional',
    ];

    protected $dates = ['deleted_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ❌ ELIMINAR - Ya no hay docente_id en materias
    // public function materias(): HasMany
    // {
    //     return $this->hasMany(Materia::class);
    // }

    // ✅ NUEVO - Docente se relaciona con cursos a través de curso_materia
    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(Curso::class, 'curso_materia')
            ->withPivot('materia_id')
            ->withTimestamps();
    }

    // ✅ NUEVO - Materias que imparte a través de curso_materia
    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'curso_materia')
            ->withPivot('curso_id')
            ->withTimestamps();
    }

    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class);
    }

    public function getNombreCompletoAttribute(): string
    {
        return $this->user 
            ? "{$this->user->apellido_paterno} {$this->user->apellido_materno}, {$this->user->nombre}"
            : 'Sin usuario';
    }
}