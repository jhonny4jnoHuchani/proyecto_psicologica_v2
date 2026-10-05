<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $table = 'notificaciones';

    protected $fillable = [
        'user_id',
        'tipo',
        'titulo',
        'mensaje',
        'url',
        'leida',
        'leida_at',
        'enviada_telegram',
        'enviada_telegram_at',
        'telegram_error',
    ];

    protected function casts(): array
    {
        return [
            'leida' => 'boolean',
            'leida_at' => 'datetime',
            'enviada_telegram' => 'boolean',
            'enviada_telegram_at' => 'datetime',
        ];
    }

    // ========================
    // RELACIONES
    // ========================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ========================
    // SCOPES
    // ========================

    public function scopeNoLeidas($query)
    {
        return $query->where('leida', false);
    }

    public function scopeRecientes($query, $limite = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limite);
    }

    // ========================
    // MÉTODOS
    // ========================

    public function marcarComoLeida(): void
    {
        if (!$this->leida) {
            $this->update([
                'leida' => true,
                'leida_at' => now(),
            ]);
        }
    }

    /**
     * Ícono según el tipo (para el frontend).
     */
    public function getIconoAttribute(): string
    {
        return match ($this->tipo) {
            'tarea_calificada' => '📝',
            'refuerzo_generado' => '🪄',
            'credenciales_enviadas' => '🔐',
            'tarea_nueva' => '📚',
            'sistema' => '🔔',
            default => '🔔',
        };
    }
}