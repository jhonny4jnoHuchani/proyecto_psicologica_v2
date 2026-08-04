<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class GestionFactory extends Factory
{
    public function definition(): array
    {
        $año = fake()->numberBetween(2024, 2026);
        $etapas = ['1er Semestre', '2do Semestre', 'Verano', 'Invierno'];
        $etapa = fake()->randomElement($etapas);

        return [
            'año' => $año,
            'etapa' => $etapa,
            'fecha_inicio' => fake()->date(),
            'fecha_fin' => fake()->date(),
            'estado' => fake()->randomElement(['activo', 'inactivo']),
        ];
    }
}