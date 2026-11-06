<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tema extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'materia_id',
        'nombre',
        'resumen',
        'orden',
        'paginas_libro',
        'archivo_pdf',
        'estado',
    ];

    /** Materia a la que pertenece este tema del temario. */
    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    /** Tareas y lecciones estructuradas dentro de este tema. */
    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class, 'tema_id');
    }

    /** Recursos de estudio (PDFs, enlaces) agrupados en este tema. */
    public function recursos(): HasMany
    {
        return $this->hasMany(Recurso::class, 'tema_id')->orderBy('orden');
    }
}
