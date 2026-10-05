<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CredencialTemporal extends Model
{
    protected $table = 'credenciales_temporales';

    protected $fillable = [
        'user_id',
        'password_temporal',
        'enviada',
        'enviada_at',
    ];

    protected function casts(): array
    {
        return [
            'enviada' => 'boolean',
            'enviada_at' => 'datetime',
        ];
    }

    // ========================
    // RELACIONES
    // ========================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}