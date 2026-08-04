<?php

namespace Database\Seeders;

use App\Models\Gestion;
use Illuminate\Database\Seeder;

class GestionSeeder extends Seeder
{
    public function run(): void
    {
        Gestion::create([
            'año' => 2025,
            'etapa' => '1er Semestre',
            'fecha_inicio' => '2025-02-01',
            'fecha_fin' => '2025-06-30',
            'estado' => 'activo',
        ]);

        Gestion::create([
            'año' => 2025,
            'etapa' => '2do Semestre',
            'fecha_inicio' => '2025-08-01',
            'fecha_fin' => '2025-12-20',
            'estado' => 'activo',
        ]);

        Gestion::create([
            'año' => 2026,
            'etapa' => 'Verano',
            'fecha_inicio' => '2026-01-05',
            'fecha_fin' => '2026-02-28',
            'estado' => 'inactivo',
        ]);
    }
}