<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles; // ← Para Spatie (próximamente)
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;
    // use HasRoles; ← Se activa cuando instalemos Spatie

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',              // ← NUEVO
        'apellido_paterno',    // ← NUEVO
        'apellido_materno',    // ← NUEVO
        'ci',                  // ← NUEVO
        'celular',             // ← NUEVO
        'email',
        'password',
        'genero',              // ← NUEVO
        'fecha_nacimiento',    // ← NUEVO
        'direccion',           // ← NUEVO
        'foto_perfil',         // ← NUEVO
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'fecha_nacimiento' => 'date', // ← NUEVO
        ];
    }

    // ========================
    // RELACIONES (Próximamente)
    // ========================
    
    // Agregar en app/Models/User.php
    public function docente(): HasOne
    {
        return $this->hasOne(Docente::class);
    }

    // En app/Models/User.php
    public function estudiante(): HasOne
    {
        return $this->hasOne(Estudiante::class);
    }


    // Nombre completo automático
    // public function getNombreCompletoAttribute(): string
    // {
    //     return "{$this->apellido_paterno} {$this->apellido_materno}, {$this->nombre}";
    // }
}