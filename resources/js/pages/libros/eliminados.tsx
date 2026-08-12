import { Head, router } from '@inertiajs/react';
import {
    BookOpen, RotateCcw, Trash2, LoaderCircle, AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface MateriaOption { id: number; nombre: string; codigo: string; }

interface Libro {
    id: number;
    nombre: string;
    autor: string | null;
    anio_lanzamiento: number | null;
    deleted_at: string;
    materia: MateriaOption;
}

interface Props {
    libros: Libro[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Libros', href: '/libros' },
    { title: 'Eliminados', href: '/libros/eliminados' },
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
    return new Date(fecha).toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function LibrosTrashed({ libros }: Props) {
    const [modalRestore, setModalRestore] = useState(false);
    const [modalDeleteForever, setModalDeleteForever] = useState(false);
    const [libroSelect, setLibroSelect] = useState<Libro | null>(null);
    const [processing, setProcessing] = useState(false);

    const openRestore = (libro: Libro) => { setLibroSelect(libro); setModalRestore(true); };
    const openDeleteForever = (libro: Libro) => { setLibroSelect(libro); setModalDeleteForever(true); };

    const handleRestore = () => {
        if (!libroSelect) return;
        setProcessing(true);
        router.post(`/libros/${libroSelect.id}/restore`, {}, {
            onSuccess: () => { setModalRestore(false); setLibroSelect(null); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    const handleDeleteForever = () => {
        if (!libroSelect) return;
        setProcessing(true);
        router.delete(`/libros/${libroSelect.id}/force`, {
            onSuccess: () => { setModalDeleteForever(false); setLibroSelect(null); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Libros Eliminados" />
            <div className="mx-auto max-w-[1400px] space-y-6 p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white">
                                <Trash2 className="h-4.5 w-4.5" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Libros Eliminados</h1>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                            Gestiona los libros que han sido eliminados del sistema.
                        </p>
                    </div>
                    <a href="/libros">
                        <Button variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" />Volver a activos
                        </Button>
                    </a>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Libros en papelera
                        </CardTitle>
                        <span className="text-xs text-neutral-400">{libros?.length ?? 0} resultado(s)</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-neutral-50/70 text-left text-xs uppercase tracking-wide text-neutral-500">
                                        <th className="px-4 py-3 font-medium">Libro</th>
                                        <th className="px-4 py-3 font-medium">Materia</th>
                                        <th className="px-4 py-3 font-medium">Autor</th>
                                        <th className="px-4 py-3 font-medium">Año</th>
                                        <th className="px-4 py-3 font-medium">Eliminado</th>
                                        <th className="px-4 py-3 text-right font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!libros || libros.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="py-14 text-center">
                                                <div className="flex flex-col items-center gap-2 text-neutral-400">
                                                    <BookOpen className="h-8 w-8" />
                                                    <p className="text-sm font-medium text-neutral-500">No hay libros eliminados</p>
                                                    <p className="text-xs">La papelera está vacía.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {libros?.map((l) => {
                                        const color = colorForMateria(l.materia?.codigo);
                                        return (
                                            <tr key={l.id} className="group border-b transition-colors last:border-b-0 hover:bg-neutral-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className={`mt-1 h-full min-h-8 w-1 rounded-full ${color.dot}`} />
                                                        <div>
                                                            <p className="font-medium leading-tight">{l.nombre}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.ring}`}>
                                                        {l.materia?.codigo}
                                                    </span>
                                                    <p className="text-xs text-neutral-500 mt-0.5">{l.materia?.nombre}</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-600">
                                                    {l.autor || <span className="text-neutral-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-600">
                                                    {l.anio_lanzamiento || <span className="text-neutral-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-500">
                                                    {formatoFecha(l.deleted_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                                                        <Button variant="outline" size="icon" onClick={() => openRestore(l)} title="Restaurar">
                                                            <RotateCcw className="h-4 w-4 text-emerald-500" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => openDeleteForever(l)} title="Eliminar permanentemente">
                                                            <Trash2 className="h-4 w-4 text-rose-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={modalRestore} onOpenChange={setModalRestore}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Restaurar libro</DialogTitle>
                            <DialogDescription>
                                ¿Deseas restaurar "{libroSelect?.nombre}"? Volverá a estar disponible en el sistema.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalRestore(false)}>Cancelar</Button>
                            <Button onClick={handleRestore} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restaurar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={modalDeleteForever} onOpenChange={setModalDeleteForever}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-rose-600">Eliminar permanentemente</DialogTitle>
                            <DialogDescription>
                                <span className="font-semibold text-rose-600">⚠️ Esta acción no se puede deshacer.</span>
                                <br /><br />
                                Se eliminará "{libroSelect?.nombre}" de forma permanente de la base de datos.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDeleteForever(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDeleteForever} disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Eliminar permanentemente
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}