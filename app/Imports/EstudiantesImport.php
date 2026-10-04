<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class EstudiantesImport implements ToCollection, WithHeadingRow
{
    /**
     * Filas leídas del Excel (sin contar el header).
     */
    public Collection $filas;

    public function __construct()
    {
        $this->filas = collect();
    }

    /**
     * Recibe todas las filas del Excel como una colección.
     */
    public function collection(Collection $rows)
    {
        $this->filas = $rows;
    }
}