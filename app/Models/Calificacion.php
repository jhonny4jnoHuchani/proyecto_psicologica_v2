<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calificacion extends Model
{
    protected $table = 'calificaciones';

    protected $fillable = [
        'entrega_id',
        'nota',
        'fecha_calificacion',
        'comentarios',
    ];

    protected function casts(): array
    {
        return [
            'nota' => 'decimal:2',
            'fecha_calificacion' => 'date',
        ];
    }

    public function entrega(): BelongsTo
    {
        return $this->belongsTo(Entrega::class);
    }
}