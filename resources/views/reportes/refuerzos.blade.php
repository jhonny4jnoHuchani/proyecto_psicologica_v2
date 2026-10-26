<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Actividades de Refuerzo con IA</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; color: #222; }
        .header { text-align: center; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 15px; color: #111; }
        .header h4 { margin: 3px 0; color: #444; font-size: 11px; }
        .header h3 { margin: 4px 0 0; color: #1e40af; font-size: 13px; text-transform: uppercase; }
        .info { margin-bottom: 12px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
        .info p { margin: 2px 0; font-size: 10px; }
        
        .item-refuerzo {
            margin-bottom: 15px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            page-break-inside: avoid;
        }
        .item-header {
            background: #f1f5f9;
            padding: 6px 10px;
            border-bottom: 1px solid #cbd5e1;
            font-weight: bold;
        }
        .item-body {
            padding: 8px 10px;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-completado { background: #dcfce7; color: #15803d; }
        .badge-pendiente { background: #fef3c7; color: #b45309; }
        
        .nota-baja { color: #dc2626; font-weight: bold; }
        
        .preguntas-list {
            margin: 6px 0 0 15px;
            padding: 0;
        }
        .preguntas-list li {
            margin-bottom: 4px;
            line-height: 1.35;
        }
        .recomendacion-box {
            margin-top: 6px;
            padding: 6px;
            background: #faf5ff;
            border-left: 3px solid #9333ea;
            font-size: 9px;
            color: #581c87;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 8px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>UNIVERSIDAD PÚBLICA DE EL ALTO</h2>
        <h4>CARRERA DE PSICOLOGÍA</h4>
        <h3>Reporte de Actividades de Refuerzo Pedagógico con IA</h3>
    </div>

    <div class="info">
        <p><strong>Curso:</strong> {{ $curso->gestion->año }} - {{ $curso->gestion->etapa }} | Paralelo {{ $curso->paralelo }} (Turno: {{ ucfirst($curso->turno) }})</p>
        @if($materia)
            <p><strong>Materia:</strong> {{ $materia->codigo }} - {{ $materia->nombre }}</p>
        @else
            <p><strong>Materias:</strong> Consolidado de todas las materias del curso</p>
        @endif
        <p><strong>Total Refuerzos Registrados:</strong> {{ $refuerzos->count() }} | <strong>Fecha de Emisión:</strong> {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    @if($refuerzos->isEmpty())
        <div style="text-align: center; padding: 30px; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 4px;">
            <p>No se encontraron actividades de refuerzo generadas para los filtros seleccionados.</p>
        </div>
    @else
        @foreach($refuerzos as $index => $ref)
            <div class="item-refuerzo">
                <div class="item-header">
                    <span style="float: right;">
                        @if($ref->completado)
                            <span class="badge badge-completado">Completado por estudiante</span>
                        @else
                            <span class="badge badge-pendiente">Pendiente de respuesta</span>
                        @endif
                    </span>
                    #{{ $index + 1 }} &bull; {{ $ref->estudiante->user->apellido_paterno }} {{ $ref->estudiante->user->apellido_materno }}, {{ $ref->estudiante->user->nombre }}
                    (CI: {{ $ref->estudiante->user->ci }}{{ $ref->estudiante->user->expedido ? ' '.$ref->estudiante->user->expedido : '' }})
                </div>
                <div class="item-body">
                    <p style="margin: 0 0 6px 0;">
                        <strong>Materia:</strong> {{ $ref->leccion->materia->nombre ?? 'N/A' }} | 
                        <strong>Lección / Tarea:</strong> {{ $ref->leccion->titulo }} | 
                        <strong>Nota en entrega:</strong> 
                        <span class="nota-baja">
                            {{ $ref->entrega?->calificacion?->nota ?? 'S/N' }} / 100 pts
                        </span>
                    </p>

                    @if(!empty($ref->preguntas) && is_array($ref->preguntas))
                        <strong style="color: #334155; font-size: 9px;">Preguntas de Refuerzo Generadas con IA:</strong>
                        <ol class="preguntas-list">
                            @foreach($ref->preguntas as $pIdx => $pregunta)
                                <li>
                                    {{ $pregunta }}
                                    @if(!empty($ref->respuestas[$pIdx]))
                                        <div style="color: #0369a1; font-style: italic; margin-top: 2px;">
                                            &rarr; Respuesta: {{ $ref->respuestas[$pIdx] }}
                                        </div>
                                    @endif
                                </li>
                            @endforeach
                        </ol>
                    @endif

                    @if(!empty($ref->recomendacion))
                        <div class="recomendacion-box">
                            <strong>Recomendación pedagógica de la IA:</strong> {{ $ref->recomendacion }}
                        </div>
                    @endif
                </div>
            </div>
        @endforeach
    @endif

    <div class="footer">
        Documento generado automáticamente por el Sistema Académico de Psicología &bull; {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
