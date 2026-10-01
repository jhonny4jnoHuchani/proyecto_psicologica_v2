<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tema extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'materia_id',
        'nombre',
        'orden',
        'paginas_libro',
        'estado',
    ];

    /**
     * Un tema pertenece a una materia.
     */
    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }
}