<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portada extends Model
{
    protected $table = 'portadas';

    protected $fillable = [
        'titulo',
        'imagen',
        'orden',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    /**
     * Scope: Solo portadas activas ordenadas.
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true)->orderBy('orden', 'asc');
    }
}