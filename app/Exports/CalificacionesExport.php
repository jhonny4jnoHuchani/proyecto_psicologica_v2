<?php

namespace App\Exports;

use App\Models\Curso;
use App\Models\Entrega;
use App\Models\Leccion;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CalificacionesExport implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    protected $curso;
    protected $materiaId;

    public function __construct(Curso $curso, $materiaId = null)
    {
        $this->curso = $curso;
        $this->materiaId = $materiaId;
    }

    public function title(): string
    {
        return 'Calificaciones';
    }

    public function headings(): array
    {
        $lecciones = Leccion::where('curso_id', $this->curso->id)
            ->when($this->materiaId, fn($q) => $q->where('materia_id', $this->materiaId))
            ->orderBy('fecha_entrega')
            ->get();

        $headers = ['#', 'Estudiante', 'CI'];
        foreach ($lecciones as $leccion) {
            $headers[] = $leccion->titulo;
        }
        return $headers;
    }

    public function collection()
    {
        // CORREGIDO: usar sortBy en vez de orderBy
        $estudiantes = $this->curso->estudiantes()
            ->with('user')
            ->get()
            ->sortBy(fn($e) => $e->user->apellido_paterno);

        $lecciones = Leccion::where('curso_id', $this->curso->id)
            ->when($this->materiaId, fn($q) => $q->where('materia_id', $this->materiaId))
            ->orderBy('fecha_entrega')
            ->get();

        $entregas = Entrega::with('calificacion')
            ->whereIn('leccion_id', $lecciones->pluck('id'))
            ->get();

        $data = [];
        $index = 1;
        foreach ($estudiantes as $estudiante) {
            $row = [
                $index++,
                $estudiante->user->apellido_paterno . ' ' . $estudiante->user->apellido_materno . ', ' . $estudiante->user->nombre,
                $estudiante->user->ci,
            ];
            foreach ($lecciones as $leccion) {
                $entrega = $entregas->where('estudiante_id', $estudiante->id)->where('leccion_id', $leccion->id)->first();
                if ($entrega && $entrega->calificacion) {
                    $row[] = $entrega->calificacion->nota;
                } elseif ($entrega) {
                    $row[] = 'S/C';
                } else {
                    $row[] = '-';
                }
            }
            $data[] = $row;
        }
        return collect($data);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1E40AF']]],
        ];
    }
}