import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Refuerzo {
    id: number;
    completado: boolean;
    created_at: string;
    leccion: {
        id: number;
        titulo: string;
        materia: {
            id: number;
            nombre: string;
            codigo: string;
        };
    };
}

interface Props {
    refuerzos: Refuerzo[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mis Refuerzos', href: '/refuerzos' },
];

function formatoFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function agruparPorMateria(refuerzos: Refuerzo[]) {
    const grupos: Record<number, { materia: Refuerzo['leccion']['materia']; refuerzos: Refuerzo[] }> = {};

    refuerzos.forEach((r) => {
        const key = r.leccion.materia.id;
        if (!grupos[key]) {
            grupos[key] = { materia: r.leccion.materia, refuerzos: [] };
        }
        grupos[key].refuerzos.push(r);
    });

    return Object.values(grupos);
}

type Tab = 'pendientes' | 'completados';

export default function RefuerzoIndex({ refuerzos }: Props) {
    const [tabActiva, setTabActiva] = useState<Tab>('pendientes');

    const pendientesPorMateria = useMemo(() => {
        const pendientes = refuerzos.filter((r) => !r.completado);
        return agruparPorMateria(pendientes);
    }, [refuerzos]);

    const completadosPorMateria = useMemo(() => {
        const completados = refuerzos.filter((r) => r.completado);
        return agruparPorMateria(completados);
    }, [refuerzos]);

    const totalPendientes = refuerzos.filter((r) => !r.completado).length;
    const totalCompletados = refuerzos.filter((r) => r.completado).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Refuerzos" />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                {/* HEADER */}
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Mis Refuerzos</h1>
                            <p className="text-sm text-neutral-500 mt-0.5">
                                Preguntas generadas por la IA para reforzar tus temas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="border-b border-neutral-200">
                    <div className="flex gap-1 relative">
                        {/* Botón Pendientes */}
                        <button
                            type="button"
                            onClick={() => setTabActiva('pendientes')}
                            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                                tabActiva === 'pendientes'
                                    ? 'text-purple-700'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            <Clock className="h-4 w-4" />
                            Pendientes
                            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                tabActiva === 'pendientes'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-neutral-100 text-neutral-600'
                            }`}>
                                {totalPendientes}
                            </span>
                            {/* Indicador activo */}
                            <span
                                className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-purple-600 transition-all duration-300 ${
                                    tabActiva === 'pendientes' ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        </button>

                        {/* Botón Completados */}
                        <button
                            type="button"
                            onClick={() => setTabActiva('completados')}
                            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                                tabActiva === 'completados'
                                    ? 'text-emerald-700'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Completados
                            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                tabActiva === 'completados'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-neutral-100 text-neutral-600'
                            }`}>
                                {totalCompletados}
                            </span>
                            {/* Indicador activo */}
                            <span
                                className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-emerald-600 transition-all duration-300 ${
                                    tabActiva === 'completados' ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* CONTENEDOR CON DESLIZAMIENTO */}
                <div className="relative overflow-hidden">
                    <div
                        className="flex transition-transform duration-400 ease-out"
                        style={{
                            width: '200%',
                            transform: `translateX(${tabActiva === 'pendientes' ? '0%' : '-50%'})`,
                        }}
                    >
                        {/* VISTA PENDIENTES */}
                        <div className="w-1/2 shrink-0 pr-3">
                            <div className="space-y-4">
                                {totalPendientes === 0 && (
                                    <Card>
                                        <CardContent className="py-14 text-center">
                                            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                                            <p className="text-sm font-medium text-neutral-600">
                                                No tienes refuerzos pendientes
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-1">
                                                ¡Bien hecho! Sigue así.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {pendientesPorMateria.map(({ materia, refuerzos: refuerzosMateria }) => (
                                    <Card key={materia.id} className="overflow-hidden border-amber-200/60">
                                        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-lg bg-amber-100 p-1.5">
                                                        <BookOpen className="h-4 w-4 text-amber-700" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-semibold">
                                                            {materia.codigo}
                                                        </CardTitle>
                                                        <p className="text-xs text-neutral-500 mt-0.5">
                                                            {materia.nombre}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                                                    {refuerzosMateria.length} pendiente{refuerzosMateria.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2 pt-3">
                                            {refuerzosMateria.map((r) => (
                                                <div
                                                    key={r.id}
                                                    className="group flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <div className="rounded-lg bg-purple-100 p-1.5 shrink-0">
                                                            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">
                                                                {r.leccion.titulo}
                                                            </p>
                                                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                                                Generado el {formatoFecha(r.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        className="bg-purple-600 hover:bg-purple-700 shrink-0 h-8 text-xs"
                                                    >
                                                        <Link href={`/refuerzos/${r.id}`}>
                                                            Responder
                                                            <ArrowRight className="ml-1 h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* VISTA COMPLETADOS */}
                        <div className="w-1/2 shrink-0 pr-3">
                            <div className="space-y-4">
                                {totalCompletados === 0 && (
                                    <Card>
                                        <CardContent className="py-14 text-center">
                                            <Sparkles className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                                            <p className="text-sm font-medium text-neutral-600">
                                                Aún no has completado ningún refuerzo
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-1">
                                                Responde los pendientes para verlos aquí.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {completadosPorMateria.map(({ materia, refuerzos: refuerzosMateria }) => (
                                    <Card key={materia.id} className="overflow-hidden border-emerald-200/60">
                                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-lg bg-emerald-100 p-1.5">
                                                        <BookOpen className="h-4 w-4 text-emerald-700" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-semibold">
                                                            {materia.codigo}
                                                        </CardTitle>
                                                        <p className="text-xs text-neutral-500 mt-0.5">
                                                            {materia.nombre}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">
                                                    {refuerzosMateria.length} completado{refuerzosMateria.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2 pt-3">
                                            {refuerzosMateria.map((r) => (
                                                <Link
                                                    key={r.id}
                                                    href={`/refuerzos/${r.id}`}
                                                    className="group flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <div className="rounded-lg bg-emerald-100 p-1.5 shrink-0">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate text-neutral-700">
                                                                {r.leccion.titulo}
                                                            </p>
                                                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                                                Completado el {formatoFecha(r.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-emerald-200 text-emerald-600 shrink-0 text-[10px]"
                                                    >
                                                        ✅ Completado
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}