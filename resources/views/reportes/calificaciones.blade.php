<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Calificaciones</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 15px; }
        .header { text-align: center; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 16px; }
        .header h4 { margin: 3px 0; color: #555; font-size: 12px; }
        .info { margin-bottom: 10px; }
        .info p { margin: 2px 0; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #1e40af; color: white; padding: 6px 4px; text-align: center; font-size: 9px; }
        td { padding: 4px; border: 1px solid #ccc; text-align: center; font-size: 10px; }
        .nombre { text-align: left; }
        .ci { text-align: center; }
        .nota { text-align: center; font-weight: bold; }
        .sin-nota { color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h2>UNIVERSIDAD PÚBLICA DEL ALTO</h2>
        <h4>CARRERA DE PSICOLOGÍA</h4>
        <h3>REPORTE DE CALIFICACIONES</h3>
    </div>

    <div class="info">
        <p><strong>Curso:</strong> {{ $curso->gestion->año }} - {{ $curso->gestion->etapa }} | Paralelo {{ $curso->paralelo }}</p>
        @if($materia)
            <p><strong>Materia:</strong> {{ $materia->codigo }} - {{ $materia->nombre }}</p>
        @endif
        <p><strong>Fecha:</strong> {{ now()->format('d/m/Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="4%">#</th>
                <th width="22%" class="nombre">Estudiante</th>
                <th width="12%">CI</th>
                @foreach($lecciones as $leccion)
                    <th>{{ $leccion->titulo }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($estudiantes as $index => $estudiante)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="nombre">{{ $estudiante->user->apellido_paterno }} {{ $estudiante->user->apellido_materno }}, {{ $estudiante->user->nombre }}</td>
                    <td class="ci">{{ $estudiante->user->ci }}</td>
                    @foreach($lecciones as $leccion)
                        @php
                            $entrega = $entregas->where('estudiante_id', $estudiante->id)->where('leccion_id', $leccion->id)->first();
                        @endphp
                        <td class="nota">
                            @if($entrega && $entrega->calificacion)
                                {{ $entrega->calificacion->nota }}
                            @elseif($entrega)
                                <span class="sin-nota">S/C</span>
                            @else
                                <span class="sin-nota">-</span>
                            @endif
                        </td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>