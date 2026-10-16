<?php

namespace App\Traits;

use App\Services\IdObfuscator;

trait HasObfuscatedRouteKey
{
    /**
     * Devuelve el código ofuscado como clave de ruta para las URLs.
     */
    public function getRouteKey(): string
    {
        return IdObfuscator::encode((int) $this->getKey());
    }

    /**
     * Resuelve el modelo en las rutas usando el código ofuscado (o el número directo si se ingresa).
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $id = IdObfuscator::decode((string) $value);

        if ($id !== null) {
            return $this->where($field ?? $this->getRouteKeyName(), $id)->first();
        }

        return parent::resolveRouteBinding($value, $field);
    }

    /**
     * Accesorio hash_id para que los modelos serializados hacia React lo incluyan automáticamente.
     */
    public function getHashIdAttribute(): string
    {
        return IdObfuscator::encode((int) $this->getKey());
    }
}
