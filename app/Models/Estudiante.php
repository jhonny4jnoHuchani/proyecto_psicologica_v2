<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estudiante extends Model
{
    use SoftDeletes;

    protected $table = 'estudiantes';

    protected $fillable = [
        'user_id',
        'colegio_procedencia',
        'tipo_inscripcion',
    ];

    protected $dates = ['deleted_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(Curso::class, 'curso_estudiante')
            ->withPivot('fecha_inscripcion', 'estado')
            ->withTimestamps();
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(Entrega::class);
    }

    public function getNombreCompletoAttribute(): string
    {
        return $this->user 
            ? "{$this->user->apellido_paterno} {$this->user->apellido_materno}, {$this->user->nombre}"
            : 'Sin usuario';
    }
}