<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class PlantillaEstudiantesExport implements
    FromArray,
    WithHeadings,
    WithStyles,
    WithTitle,
    WithColumnWidths,
    WithEvents
{
    public function title(): string
    {
        return 'Estudiantes';
    }

    /**
     * Encabezados exactos que el importador espera.
     */
    public function headings(): array
    {
        return [
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'ci',
            'celular',
            'email',
            'genero',
            'fecha_nacimiento',
            'direccion',
            'colegio_procedencia',
            'tipo_inscripcion',
        ];
    }

    /**
     * Filas de ejemplo (el admin las borra antes de subir).
     */
    public function array(): array
    {
        return [
            [
                'Juan', 'Pérez', 'Gómez', '12345678', '71234567',
                'juan.perez@mail.com', 'M', '2000-05-15',
                'Av. Sucre 123', 'U.E. San Andrés', 'regular',
            ],
            [
                'María', 'López', 'Rojas', '87654321', '76543210',
                'maria.lopez@mail.com', 'F', '1999-11-02',
                'Calle Bolívar 45', 'U.E. San Simón', 'dispensacion',
            ],
            [
                'Carlos', 'Mamani', 'Quispe', '11223344', '70000000',
                'carlos.mamani@mail.com', 'M', '2001-03-20',
                'Av. América 78', 'U.E. Bolívar', 'cursillo',
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15, 'B' => 18, 'C' => 18, 'D' => 14, 'E' => 14,
            'F' => 28, 'G' => 10, 'H' => 18, 'I' => 30, 'J' => 25, 'K' => 18,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Encabezados en negrita con fondo
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = 500; // permitir hasta 500 filas

                // 🔹 Dropdown de género (columna G)
                for ($row = 2; $row <= $highestRow; $row++) {
                    $validation = $sheet->getCell("G{$row}")->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setFormula1('"M,F,Otro"');
                    $validation->setAllowBlank(true);
                    $validation->setShowDropDown(true);
                }

                // 🔹 Dropdown de tipo_inscripcion (columna K)
                for ($row = 2; $row <= $highestRow; $row++) {
                    $validation = $sheet->getCell("K{$row}")->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setFormula1('"regular,dispensacion,cursillo"');
                    $validation->setAllowBlank(true);
                    $validation->setShowDropDown(true);
                }

                // 🔹 Congelar la fila de encabezados
                $sheet->freezePane('A2');

                // 🔹 Nota arriba (fila 1 oculta) — la ponemos como comentario en la hoja
                $sheet->getComment('A1')->getText()->createTextRun(
                    'No modifiques los encabezados. Borra las filas de ejemplo antes de subir.'
                );
            },
        ];
    }
}