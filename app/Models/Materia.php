<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Materia extends Model
{
    use SoftDeletes;

    protected $table = 'materias';

    protected $fillable = [
        'nombre',
        'codigo',
    ];

    /** Cursos que tienen esta materia en su plan curricular. */
    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(Curso::class, 'curso_materia')
            ->withPivot('docente_id')
            ->withTimestamps();
    }

    /** Temario oficial de la materia ordenado secuencialmente. */
    public function temas(): HasMany
    {
        return $this->hasMany(Tema::class)->orderBy('orden');
    }

    /** Lecciones y tareas asociadas a esta materia. */
    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class);
    }

    /** Materiales de estudio (PDF, enlaces) asignados a esta materia. */
    public function recursos(): HasMany
    {
        return $this->hasMany(Recurso::class);
    }

    /** Libros de texto y bibliografía digital de la materia. */
    public function libros(): HasMany
    {
        return $this->hasMany(Libro::class);
    }
}
