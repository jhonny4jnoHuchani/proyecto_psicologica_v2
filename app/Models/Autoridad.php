<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Autoridad extends Model
{
    protected $table = 'autoridades';

    protected $fillable = [
        'nombre',
        'cargo',
        'foto',
        'mensaje',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
        ];
    }

    /**
     * Scope: Autoridades ordenadas.
     */
    public function scopeOrdenadas($query)
    {
        return $query->orderBy('orden', 'asc')->orderBy('nombre', 'asc');
    }
}