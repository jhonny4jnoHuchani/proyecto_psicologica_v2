import React from 'react';
import { Head } from '@inertiajs/react';

interface Props {
    sin_datos: boolean;
    mensaje?: string;
    estudiante_nombre?: string;
    materia_nombre?: string;
    tema_actual_nombre?: string;
    nota_actual?: number;
    tema_siguiente?: string;
    paginas_siguiente?: string;
    prediccion?: {
        prediccion_sin_leer: number;
        prediccion_con_leer: number;
        beneficio: number;
    };
}

export default function Index({
    sin_datos,
    mensaje,
    estudiante_nombre,
    materia_nombre,
    tema_actual_nombre,
    nota_actual,
    tema_siguiente,
    paginas_siguiente,
    prediccion,
}: Props) {
    // ═══════════════════════════════════════════════════════════
    // CASO 1: Sin datos (estudiante nuevo o sin calificaciones)
    // ═══════════════════════════════════════════════════════════
    if (sin_datos) {
        return (
            <>
                <Head title="Asistente IA" />
                <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Aún no hay recomendaciones
                        </h2>
                        <p className="text-gray-600">{mensaje}</p>
                    </div>
                </div>
            </>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // CASO 2: Con datos reales (ML Predictivo funcionando)
    // ═══════════════════════════════════════════════════════════
    return (
        <>
            <Head title="Asistente IA - Recomendaciones" />
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Saludo personalizado */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">
                            🤖 Asistente Inteligente
                        </h1>
                        <span className="text-gray-600">
                            Hola, <span className="font-semibold">{estudiante_nombre}</span> 👋
                        </span>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/* SISTEMA 3: ML PREVENTIVO (PREDICTIVO)      */}
                    {/* ═══════════════════════════════════════════ */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                        <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                            🔮 Preparación para el Próximo Tema
                        </h2>

                        {/* Contexto: qué pasó y qué viene */}
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">
                                En <span className="font-bold text-indigo-600">{materia_nombre}</span>,
                                terminaste <span className="font-semibold">{tema_actual_nombre}</span> con un promedio de{' '}
                                <span className={`font-bold ${nota_actual! < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                    {nota_actual}/100
                                </span>.
                            </p>
                            <p className="text-gray-700 mt-2">
                                La próxima clase veremos:{' '}
                                <span className="font-bold text-indigo-600">{tema_siguiente}</span>
                            </p>
                        </div>

                        {/* Las dos predicciones del ML */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Escenario 1: Sin prepararse */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <p className="text-sm text-red-800 font-semibold">
                                    ⚠️ Si no te preparas:
                                </p>
                                <p className="text-3xl font-bold text-red-600 mt-1">
                                    ~{prediccion?.prediccion_sin_leer}/100
                                </p>
                                <p className="text-xs text-red-500 mt-2">
                                    Riesgo de reprobar el siguiente tema.
                                </p>
                            </div>

                            {/* Escenario 2: Leyendo el resumen */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="text-sm text-green-800 font-semibold">
                                    ✅ Leyendo {paginas_siguiente} antes:
                                </p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    ~{prediccion?.prediccion_con_leer}/100
                                </p>
                                <p className="text-xs text-green-500 mt-2">
                                    ¡Recuperas el ritmo y aseguras la nota!
                                </p>
                            </div>
                        </div>

                        {/* Beneficio neto del ML */}
                        <div className="mt-4 bg-indigo-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-indigo-700">
                                 Beneficio de prepararte:{' '}
                                <span className="font-bold text-lg">
                                    +{prediccion?.beneficio} puntos
                                </span>
                            </p>
                        </div>
                        {/* Mensaje informativo (reemplaza al botón) */}
                        <div className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 shadow-sm">
                        📖 Leer el texto guía ({paginas_siguiente})
                    </div>
                    </div>

                </div>
            </div>
        </>
    );
}