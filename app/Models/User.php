<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles; 
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'nombre',             
        'apellido_paterno',    
        'apellido_materno',    
        'ci',                  
        'celular',             
        'email',
        'password',
        'genero',              
        'fecha_nacimiento',    
        'direccion',           
        'foto_perfil',        
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

    // ========================
    // RELACIONES DE NOTIFICACIONES Y TELEGRAM
    // ========================

    public function credencialTemporal(): HasOne
    {
        return $this->hasOne(CredencialTemporal::class);
    }

    public function telegramVinculacion(): HasOne
    {
        return $this->hasOne(TelegramVinculacion::class);
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }
}