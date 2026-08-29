<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        
        Configuracion::create([
            'color_primario' => '#4f46e5',
            'color_secundario' => '#06b6d4',
        ]);
    }
}