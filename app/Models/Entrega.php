<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Entrega extends Model
{
    use SoftDeletes;

    protected $table = 'entregas';

    protected $fillable = [
        'leccion_id',
        'estudiante_id',
        'estado_entrega',
        'estado_calificacion',
        'fecha_entrega',
        'archivos_enviado',
        'comentarios',
    ];

    protected function casts(): array
    {
        return [
            'fecha_entrega' => 'datetime',
            'archivos_enviado' => 'array',
        ];
    }

    public function leccion(): BelongsTo
    {
        return $this->belongsTo(Leccion::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function calificacion(): HasOne
    {
        return $this->hasOne(Calificacion::class);
    }

    /**
     * ¿Se puede editar esta entrega?
     */
    public function sePuedeEditar(): bool
    {
        if ($this->estado_calificacion === 'calificado') return false;
        if ($this->leccion->fecha_entrega && now()->gt($this->leccion->fecha_entrega)) return false;
        return true;
    }
}