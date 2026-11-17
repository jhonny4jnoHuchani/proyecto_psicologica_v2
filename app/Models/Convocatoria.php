<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Convocatoria extends Model
{
    use SoftDeletes;

    protected $table = 'convocatorias';

    protected $fillable = [
        'titulo',
        'descripcion',
        'archivo',
        'link_video',   // ← CORREGIDO
        'fecha_inicio',
        'fecha_fin',
        'activo',
    ];

    protected $appends = [
        'imagen_url',
        'archivo_url',
        'vigente',
    ];

    public function getImagenUrlAttribute(): ?string
    {
        if (! $this->archivo) {
            return null;
        }

        if (str_starts_with($this->archivo, 'http://') || str_starts_with($this->archivo, 'https://')) {
            return $this->archivo;
        }

        $clean = preg_replace('/^\/?storage\//', '', $this->archivo);

        return '/storage/'.ltrim($clean, '/');
    }

    public function getArchivoUrlAttribute(): ?string
    {
        return $this->getImagenUrlAttribute();
    }

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'activo' => 'boolean',
        ];
    }

    /**
     * Scope: Solo convocatorias activas y vigentes.
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true)
            ->where(function ($q) {
                $q->whereNull('fecha_fin')
                    ->orWhere('fecha_fin', '>=', now());
            })
            ->orderBy('fecha_inicio', 'desc');
    }

    /**
     * Accesor: ¿La convocatoria sigue vigente?
     */
    public function getVigenteAttribute(): bool
    {
        if (! $this->activo) {
            return false;
        }
        if ($this->fecha_fin && $this->fecha_fin < now()) {
            return false;
        }

        return true;
    }
}
