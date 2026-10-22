import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, ArrowLeft, Award, BookOpen, CheckCircle, CheckCircle2, LoaderCircle, Send, Sparkles, TrendingUp } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface EvaluacionIA {
    nota: number;
    conceptos_dominados: string[];
    que_mejorar: string[];
    recomendacion: string;
}

interface Refuerzo {
    id: number;
    hash_id?: string;
    preguntas: string[];
    respuestas: (string | null)[] | null;
    recomendacion: string | null;
    completado: boolean;
    nota?: number | null;
    evaluacion_ia?: EvaluacionIA | null;
    fecha_evaluacion?: string | null;
    leccion: {
        id: number;
        titulo: string;
        materia: {
            nombre: string;
            codigo: string;
        };
        temario?: {
            nombre: string;
            paginas_libro?: string;
        } | null;
    };
}

interface Props {
    refuerzo: Refuerzo;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mis Refuerzos', href: '/refuerzos' },
    { title: 'Responder', href: '' },
];

export default function RefuerzoShow({ refuerzo }: Props) {
    const [respuestas, setRespuestas] = useState<string[]>(
        refuerzo.respuestas?.map((r) => r || '') ||
        refuerzo.preguntas.map(() => '')
    );
    const [processing, setProcessing] = useState(false);

    const actualizarRespuesta = (index: number, valor: string) => {
        const nuevas = [...respuestas];
        nuevas[index] = valor;
        setRespuestas(nuevas);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const routeKey = refuerzo.hash_id || refuerzo.id;
        router.post(`/refuerzos/${routeKey}/responder`, {
            respuestas,
        }, {
            onSuccess: () => {
                toast.success('¡Respuestas evaluadas exitosamente!');
            },
            onError: () => {
                setProcessing(false);
                toast.error('Error al enviar las respuestas');
            },
        });
    };

    const respondidas = respuestas.filter((r) => r.trim().length > 0).length;
    const total = refuerzo.preguntas.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Refuerzo: ${refuerzo.leccion.titulo}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Button variant="outline" asChild>
                    <Link href="/refuerzos">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a mis refuerzos
                    </Link>
                </Button>

                {/* CABECERA */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                            <Sparkles className="h-4 w-4" />
                            Refuerzo con IA
                        </div>
                        <CardTitle className="text-xl">{refuerzo.leccion.titulo}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {refuerzo.leccion.materia.codigo} · {refuerzo.leccion.materia.nombre}
                        </div>
                    </CardHeader>

                    {refuerzo.recomendacion && (
                        <CardContent>
                            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                                <p className="text-xs font-medium text-purple-700">
                                    📝 Recomendación de estudio
                                </p>
                                <p className="mt-1 text-sm text-purple-900 whitespace-pre-line">
                                    {refuerzo.recomendacion}
                                </p>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* PREGUNTAS */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    Responde las siguientes {total} preguntas
                                </CardTitle>
                                {!refuerzo.completado && (
                                    <span className="text-xs text-neutral-500">
                                        {respondidas} / {total} respondidas
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500">
                                Este cuestionario formativo es evaluado sobre <strong>100 puntos</strong> y te indicará tus conceptos dominados y exactamente qué temas debes mejorar.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {refuerzo.preguntas.map((pregunta, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 shrink-0">
                                            {i + 1}
                                        </span>
                                        <Label className="text-sm font-medium leading-relaxed pt-0.5">
                                            {pregunta}
                                        </Label>
                                    </div>
                                    <textarea
                                        value={respuestas[i]}
                                        onChange={(e) => actualizarRespuesta(i, e.target.value)}
                                        className="w-full rounded-md border p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all disabled:bg-neutral-50 disabled:text-neutral-500"
                                        rows={3}
                                        placeholder="Escribe tu respuesta aquí..."
                                        disabled={refuerzo.completado}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* BOTÓN ENVIAR */}
                    {!refuerzo.completado && (
                        <div className="mt-4 flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Evaluando respuestas con IA...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Enviar y evaluar respuestas ({respondidas}/{total})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* RESULTADO Y EVALUACIÓN SOBRE 100 */}
                    {refuerzo.completado && (
                        <div className="mt-6 space-y-4">
                            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30 dark:from-neutral-900 dark:via-purple-950/20 dark:to-neutral-900 shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-5 w-5 text-purple-600" />
                                                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                                                    Evaluación Pedagógica del Cuestionario
                                                </span>
                                            </div>
                                            <CardTitle className="text-xl">
                                                Resultado del Refuerzo de Aprendizaje
                                            </CardTitle>
                                        </div>

                                        {/* Badge de Nota sobre 100 */}
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-xs text-neutral-500 font-medium">Calificación Obtenida</div>
                                                <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                                                    {refuerzo.nota !== null && refuerzo.nota !== undefined ? (
                                                        <>
                                                            <span className={refuerzo.nota >= 70 ? 'text-emerald-600' : refuerzo.nota >= 51 ? 'text-amber-600' : 'text-red-600'}>
                                                                {refuerzo.nota}
                                                            </span>
                                                            <span className="text-sm font-normal text-neutral-400"> / 100</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm font-medium text-neutral-500">Completado</span>
                                                    )}
                                                </div>
                                            </div>

                                            {refuerzo.nota !== null && refuerzo.nota !== undefined && (
                                                <Badge
                                                    className={
                                                        refuerzo.nota >= 70
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                            : refuerzo.nota >= 51
                                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                            : 'bg-red-100 text-red-800 border-red-300'
                                                    }
                                                    variant="outline"
                                                >
                                                    {refuerzo.nota >= 70 ? 'Aprobado Excelente' : refuerzo.nota >= 51 ? 'En Desarrollo' : 'Necesita Refuerzo'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-0">
                                    {/* Diagnóstico: Conceptos dominados y Qué mejorar */}
                                    {refuerzo.evaluacion_ia && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            {/* Conceptos Dominados */}
                                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2">
                                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    Conceptos que Dominas
                                                </div>
                                                <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                                                    {refuerzo.evaluacion_ia.conceptos_dominados?.map((cd, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-emerald-600 font-bold mt-0.5">•</span>
                                                            <span>{cd}</span>
                                                        </li>
                                                    ))}
                                                    {(!refuerzo.evaluacion_ia.conceptos_dominados || refuerzo.evaluacion_ia.conceptos_dominados.length === 0) && (
                                                        <li className="italic text-neutral-500">Se requiere mayor precisión conceptual.</li>
                                                    )}
                                                </ul>
                                            </div>

                                            {/* Qué debe mejorar */}
                                            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-2">
                                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    ¿Qué Tienes que Mejorar?
                                                </div>
                                                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                                                    {refuerzo.evaluacion_ia.que_mejorar?.map((qm, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-amber-600 font-bold mt-0.5">•</span>
                                                            <span>{qm}</span>
                                                        </li>
                                                    ))}
                                                    {(!refuerzo.evaluacion_ia.que_mejorar || refuerzo.evaluacion_ia.que_mejorar.length === 0) && (
                                                        <li className="text-emerald-700">¡Muy buen nivel de respuestas en general!</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recomendación final */}
                                    {refuerzo.evaluacion_ia?.recomendacion && (
                                        <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/20 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
                                            <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="font-semibold">Orientación del docente evaluador: </strong>
                                                <span>{refuerzo.evaluacion_ia.recomendacion}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                                Tus respuestas han quedado registradas. Puedes revisarlas y repasar los conceptos en cualquier momento.
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}