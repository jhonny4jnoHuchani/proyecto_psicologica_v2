<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramVinculacion extends Model
{
    protected $table = 'telegram_vinculaciones';

    protected $fillable = [
        'user_id',
        'chat_id',
        'telegram_username',
        'vinculado_at',
    ];

    protected function casts(): array
    {
        return [
            'vinculado_at' => 'datetime',
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