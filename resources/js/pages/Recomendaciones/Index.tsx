import React from 'react';
import { Head } from '@inertiajs/react';

// Definimos los tipos de las props que llegan desde Laravel
interface Props {
    recomendacion: {
        recomendar: boolean;
        mensaje?: string;
        libro_nombre?: string;
        beneficio_de_leer?: number;
    };
    materia: string;
    nota: number;
}

export default function Index({ recomendacion, materia, nota }: Props) {
    return (
        <>
            <Head title="Recomendaciones Inteligentes" />

            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Recomendaciones Inteligentes 🤖
                    </h1>

                    {/* Tarjeta de la calificación detectada */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-500">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Calificación detectada
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Materia: <span className="font-bold">{materia}</span>
                        </p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                            {nota} / 100
                        </p>
                    </div>

                    {/* 🧠 LA MAGIA DEL MACHINE LEARNING */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                        <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                            🤖 Asistente Inteligente (IA)
                        </h2>

                        {recomendacion.recomendar ? (
                            <div className="mt-4">
                                <p className="text-gray-700 text-lg">
                                    {recomendacion.mensaje}
                                </p>
                                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Análisis del modelo:</p>
                                    <p className="text-gray-800">
                                        Si lees este material, tu rendimiento podría mejorar en{' '}
                                        <span className="font-bold text-green-600">
                                            +{recomendacion.beneficio_de_leer} puntos
                                        </span>.
                                    </p>
                                </div>
                                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                    📖 Abrir Material Recomendado
                                </button>
                            </div>
                        ) : (
                            <p className="mt-4 text-gray-500 italic">
                                {recomendacion.mensaje || 'No hay recomendaciones pendientes. ¡Sigue así!'}
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}