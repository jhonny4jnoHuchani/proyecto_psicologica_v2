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
        'estado',
    ];

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class, 'tema_id');
    }
}