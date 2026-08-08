<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gestion extends Model
{
    protected $table = 'gestions';

    protected $fillable = [
        'año',
        'etapa',

        'fecha_inicio',
        'fecha_fin',

        'estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    /**
     * Relación: Una gestión tiene muchos cursos.
     */
    // Agregar en app/Models/Gestion.php
    public function cursos(): HasMany
    {
        return $this->hasMany(Curso::class);
    }

    /**
     * Scope: Solo gestiones activas.
     */
    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Accesor: Nombre completo de la gestión.
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->año} - {$this->etapa}";
        //  2026 - 1ra etapa
    }

    // app/Models/Gestion.php
    public function getRouteKeyName(): string
    {
        return 'id'; // O el campo que quieras usar
    }
}