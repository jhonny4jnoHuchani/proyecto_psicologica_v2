<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Libro extends Model
{
    use HasFactory, SoftDeletes; // ← NUEVO: habilita soft deletes

    protected $table = 'libros';

    protected $fillable = [
        'materia_id',
        'nombre',
        'autor',
        'anio_lanzamiento',
        'archivo',
        'portada',
    ];

    protected $casts = [
        'anio_lanzamiento' => 'integer',
    ];

    /**
     * Un libro pertenece a una materia.
     */
    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }
}