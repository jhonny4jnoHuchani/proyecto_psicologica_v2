<?php

namespace App\Models;

use App\Traits\HasObfuscatedRouteKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Libro extends Model
{
    use HasFactory, HasObfuscatedRouteKey, SoftDeletes; // ← NUEVO: habilita soft deletes

    protected $table = 'libros';

    protected $appends = ['hash_id', 'archivo_url', 'portada_url'];

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

    public function getArchivoUrlAttribute(): ?string
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

    public function getPortadaUrlAttribute(): ?string
    {
        if (! $this->portada) {
            return null;
        }

        if (str_starts_with($this->portada, 'http://') || str_starts_with($this->portada, 'https://')) {
            return $this->portada;
        }

        $clean = preg_replace('/^\/?storage\//', '', $this->portada);

        return '/storage/'.ltrim($clean, '/');
    }

    /**
     * Un libro pertenece a una materia.
     */
    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }
}
