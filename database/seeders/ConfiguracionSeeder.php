<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::firstOrCreate(
            ['id' => 1],
            [
                'color_primario' => '#4f46e5',
                'color_secundario' => '#06b6d4',
                'lema' => 'Formando profesionales con excelencia científica y compromiso social',
                'mision' => 'Formar profesionales en psicología con pensamiento crítico, bases científicas sólidas y alta sensibilidad social.',
                'vision' => 'Ser la carrera líder en formación psicológica e investigación en salud mental de la región.',
                'telegram_activo' => false,
            ]
        );
    }
}
