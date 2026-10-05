import { Head } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, MessageSquare, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserData {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
}

interface Refuerzo {
    id: number;
    completado: boolean;
    created_at: string;
    preguntas: string[];
    respuestas: (string | null)[] | null;
    recomendacion: string | null;
    estudiante: {
        id: number;
        user: UserData;
    };
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
    refuerzos: Refuerzo[];
    filtroLeccionId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Refuerzos', href: '/refuerzos/docente' },
];

function formatoFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function RefuerzoDocente({ refuerzos,  }: Props) {
    const [abiertos, setAbiertos] = useState<Record<number, boolean>>({});

    const toggleRefuerzo = (id: number) => {
        setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const nombreCompleto = (u: UserData) =>
        `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const total = refuerzos.length;
    const completados = refuerzos.filter((r) => r.completado).length;
    const pendientes = total - completados;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Refuerzos de mis estudiantes" />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                {/* HEADER */}
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Refuerzos de mis estudiantes
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                        Preguntas generadas por la IA después de calificaciones menores a 70.
                    </p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-none bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-purple-100">
                                    Total
                                </p>
                                <p className="mt-1 text-3xl font-bold">{total}</p>
                                <p className="text-xs text-purple-100">refuerzos generados</p>
                            </div>
                            <Sparkles className="h-9 w-9 text-purple-200/70" />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Completados
                                </p>
                                <p className="mt-1 text-3xl font-bold text-emerald-600">
                                    {completados}
                                </p>
                                <p className="text-xs text-neutral-500">ya respondidos</p>
                            </div>
                            <CheckCircle2 className="h-9 w-9 text-emerald-200" />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Pendientes
                                </p>
                                <p className="mt-1 text-3xl font-bold text-amber-600">
                                    {pendientes}
                                </p>
                                <p className="text-xs text-neutral-500">sin responder</p>
                            </div>
                            <Clock className="h-9 w-9 text-amber-200" />
                        </CardContent>
                    </Card>
                </div>

                {/* LISTA DE REFUERZOS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Refuerzos ({total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {total === 0 && (
                            <div className="py-12 text-center">
                                <Sparkles className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
                                <p className="text-sm font-medium text-neutral-600">
                                    No hay refuerzos generados todavía
                                </p>
                                <p className="text-xs text-neutral-400 mt-1">
                                    Cuando califiques una entrega con nota menor a 70, aparecerá aquí.
                                </p>
                            </div>
                        )}

                        {refuerzos.map((r) => {
                            const abierto = !!abiertos[r.id];

                            return (
                                <Collapsible
                                    key={r.id}
                                    open={abierto}
                                    onOpenChange={() => toggleRefuerzo(r.id)}
                                >
                                    <div className="rounded-lg border overflow-hidden">
                                        <CollapsibleTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-neutral-50 transition-colors"
                                            >
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div
                                                        className={`rounded-lg p-2 shrink-0 ${
                                                            r.completado
                                                                ? 'bg-emerald-100'
                                                                : 'bg-amber-100'
                                                        }`}
                                                    >
                                                        {r.completado ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-amber-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                            <User className="h-3.5 w-3.5" />
                                                            <span className="font-medium text-neutral-700">
                                                                {nombreCompleto(r.estudiante.user)}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2 text-xs text-purple-600">
                                                            <BookOpen className="h-3.5 w-3.5" />
                                                            {r.leccion.materia.codigo} ·{' '}
                                                            {r.leccion.materia.nombre}
                                                        </div>
                                                        <p className="mt-1 text-sm text-neutral-600 truncate">
                                                            {r.leccion.titulo}
                                                        </p>
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            Generado el {formatoFecha(r.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge
                                                        variant={r.completado ? 'default' : 'outline'}
                                                        className={
                                                            r.completado
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                                : 'border-amber-200 text-amber-700'
                                                        }
                                                    >
                                                        {r.completado ? (
                                                            <>
                                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                Completado
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Pendiente
                                                            </>
                                                        )}
                                                    </Badge>
                                                </div>
                                            </button>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <div className="border-t bg-neutral-50/50 p-4 space-y-4">
                                                {r.recomendacion && (
                                                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                                                        <p className="text-xs font-medium text-purple-700">
                                                            📝 Recomendación de estudio
                                                        </p>
                                                        <p className="mt-1 text-sm text-purple-900 whitespace-pre-line">
                                                            {r.recomendacion}
                                                        </p>
                                                    </div>
                                                )}

                                                {r.completado ? (
                                                    <div className="space-y-3">
                                                        <p className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            Respuestas del estudiante
                                                        </p>
                                                        {r.preguntas.map((pregunta, i) => (
                                                            <div
                                                                key={i}
                                                                className="rounded-lg border bg-white p-3 space-y-2"
                                                            >
                                                                <p className="text-sm font-medium text-neutral-700">
                                                                    {i + 1}. {pregunta}
                                                                </p>
                                                                <div className="rounded-md bg-neutral-50 p-2 border-l-2 border-purple-400">
                                                                    <p className="text-sm text-neutral-600 whitespace-pre-line">
                                                                        {r.respuestas?.[i] ||
                                                                            '(sin respuesta)'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-6 text-center">
                                                        <Clock className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                                                        <p className="text-sm font-medium text-neutral-600">
                                                            El estudiante aún no ha respondido
                                                        </p>
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            Podrás ver sus respuestas cuando las envíe.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}