<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Libro;
use App\Models\Materia;

class LibrosSeeder extends Seeder
{
    /**
     * Crea un libro-resumen por cada materia existente.
     * Es seguro ejecutarlo varias veces: NO duplica datos.
     */
    public function run(): void
    {
        foreach (Materia::all() as $materia) {
            // Busca si ya existe el libro de esta materia (que no esté borrado)
            $libro = Libro::firstOrNew([
                'materia_id' => $materia->id,
                'deleted_at' => null,
            ]);

            $libro->nombre = 'Resumen: ' . $materia->nombre;
            $libro->autor = 'UPEA Psicología';
            $libro->anio_lanzamiento = 2026;
            $libro->save();
        }
    }
}