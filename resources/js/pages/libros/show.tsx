import { Head } from '@inertiajs/react';
import { BookOpen, ArrowLeft, Calendar, User, Hash, FileText, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface MateriaOption { id: number; nombre: string; codigo: string; }

interface Libro {
    id: number;
    nombre: string;
    autor: string | null;
    anio_lanzamiento: number | null;
    archivo: string | null;
    portada: string | null;
    created_at: string;
    updated_at: string;
    materia: MateriaOption;
}

interface Props { libro: Libro; }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Libros', href: '/libros' },
    { title: 'Detalle', href: '#' },
];

const MATERIA_COLORS = [
    { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', dot: 'bg-indigo-500' },
    { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', dot: 'bg-teal-500' },
    { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
    { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500' },
    { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
];

function colorForMateria(codigo?: string) {
    if (!codigo) return MATERIA_COLORS[0];
    let hash = 0;
    for (let i = 0; i < codigo.length; i++) hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
    return MATERIA_COLORS[Math.abs(hash) % MATERIA_COLORS.length];
}

function formatoFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LibroShow({ libro }: Props) {
    const color = colorForMateria(libro.materia?.codigo);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Libro: ${libro.nombre}`} />
            <div className="p-6 space-y-6">

                <a href="/libros">
                    <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
                </a>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Info Principal */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <div className={`h-2 ${color.dot}`} />
                        <CardHeader>
                            <div className="flex items-start gap-5">
                                {libro.portada ? (
                                    <img src={`/storage/${libro.portada}`} alt={libro.nombre} className="h-32 w-24 shrink-0 object-cover rounded-lg shadow" />
                                ) : (
                                    <div className={`flex h-32 w-24 shrink-0 items-center justify-center rounded-lg ${color.bg}`}>
                                        <BookOpen className={`h-10 w-10 ${color.text}`} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-2xl font-bold">{libro.nombre}</CardTitle>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.ring}`}>
                                            {libro.materia?.codigo}
                                        </span>
                                        <span className="text-sm text-neutral-500">{libro.materia?.nombre}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                        <User className="h-4 w-4 text-neutral-400" />Autor
                                    </div>
                                    <p className="text-sm text-neutral-600">{libro.autor || 'No especificado'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                        <Calendar className="h-4 w-4 text-neutral-400" />Año
                                    </div>
                                    <p className="text-sm text-neutral-600">{libro.anio_lanzamiento || 'No especificado'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                        <Hash className="h-4 w-4 text-neutral-400" />ID
                                    </div>
                                    <p className="text-sm text-neutral-600">#{libro.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                        <FileText className="h-4 w-4 text-neutral-400" />Materia
                                    </div>
                                    <p className="text-sm text-neutral-600">{libro.materia?.nombre}</p>
                                </div>
                            </div>
                            {libro.archivo && (
                                <div className="border-t pt-4">
                                    <a href={`/storage/${libro.archivo}`} target="_blank">
                                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                            <Download className="mr-2 h-4 w-4" />Ver / Descargar PDF
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info Secundaria */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm text-neutral-500">Registro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-neutral-500">Creado</p>
                                <p className="text-sm text-neutral-700">{formatoFecha(libro.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Última actualización</p>
                                <p className="text-sm text-neutral-700">{formatoFecha(libro.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}