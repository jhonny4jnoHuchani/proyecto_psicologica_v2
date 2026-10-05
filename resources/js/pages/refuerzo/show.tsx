import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle2, LoaderCircle, Send, Sparkles } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Refuerzo {
    id: number;
    preguntas: string[];
    respuestas: (string | null)[] | null;
    recomendacion: string | null;
    completado: boolean;
    leccion: {
        id: number;
        titulo: string;
        materia: {
            nombre: string;
            codigo: string;
        };
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

        router.post(`/refuerzos/${refuerzo.id}/responder`, {
            respuestas,
        }, {
            onSuccess: () => {
                toast.success('Respuestas enviadas. ¡Gracias por practicar!');
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
                                Estas preguntas son solo de refuerzo. No tienen nota, pero te ayudarán a comprender mejor los conceptos.
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
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Enviar respuestas ({respondidas}/{total})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* MENSAJE SI YA COMPLETÓ */}
                    {refuerzo.completado && (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                <p className="text-sm font-medium text-emerald-700">
                                    Ya enviaste tus respuestas. ¡Gracias por practicar!
                                </p>
                            </div>
                            <p className="text-xs text-emerald-600 mt-1">
                                Puedes volver a revisar tus respuestas cuando quieras.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}