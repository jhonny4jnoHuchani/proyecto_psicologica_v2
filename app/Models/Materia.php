<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Materia extends Model
{
    use SoftDeletes;

    protected $table = 'materias';

    protected $fillable = [
        'nombre',
        'codigo',
    ];

    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(Curso::class, 'curso_materia')
            ->withPivot('docente_id')
            ->withTimestamps();
    }

    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class);
    }

    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class);
    }
}