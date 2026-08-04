import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Gestion { id: number; año: number; etapa: string; }
interface Curso {
    id: number; paralelo: string; turno: string; estado: string; cupos: number;
    gestion: Gestion; deleted_at: string;
}

interface Props { cursos: Curso[]; }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cursos', href: '/cursos' },
    { title: 'Eliminados', href: '/cursos/eliminados' },
];

export default function CursosEliminados({ cursos }: Props) {
    const [modalRestore, setModalRestore] = useState(false);
    const [cursoSelect, setCursoSelect] = useState<Curso | null>(null);

    const openRestore = (curso: Curso) => { setCursoSelect(curso); setModalRestore(true); };

    const handleRestore = () => {
        if (!cursoSelect) return;
        router.post(`/cursos/${cursoSelect.id}/restore`, {}, {
            onSuccess: () => {
                setModalRestore(false);
                toast.success(`Curso "${cursoSelect.gestion?.año} - Paralelo ${cursoSelect.paralelo}" restaurado`);
                setCursoSelect(null);
            },
            onError: () => toast.error('No se pudo restaurar el curso'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos Eliminados" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Cursos Eliminados</h1>
                    <Button variant="outline" asChild><Link href="/cursos"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link></Button>
                </div>
                <Card>
                    <CardHeader><CardTitle>Papelera</CardTitle></CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead><tr className="border-b text-left">
                                <th className="py-3 px-4">Gestión</th><th className="py-3 px-4">Paralelo</th>
                                <th className="py-3 px-4">Turno</th><th className="py-3 px-4">Eliminado</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                            </tr></thead>
                            <tbody>
                                {(!cursos || cursos.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                            <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                            No hay cursos eliminados
                                        </td>
                                    </tr>
                                )}
                                {cursos?.map((c) => (
                                    <tr key={c.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4">{c.gestion?.año} - {c.gestion?.etapa}</td>
                                        <td className="py-3 px-4">{c.paralelo}</td>
                                        <td className="py-3 px-4 capitalize">{c.turno}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{new Date(c.deleted_at).toLocaleDateString('es-BO')}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Button variant="outline" size="sm" onClick={() => openRestore(c)}><RefreshCw className="h-4 w-4 mr-2" />Restaurar</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                <Dialog open={modalRestore} onOpenChange={setModalRestore}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Restaurar Curso</DialogTitle><DialogDescription>¿Restaurar "{cursoSelect?.gestion?.año} - Paralelo {cursoSelect?.paralelo}"?</DialogDescription></DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalRestore(false)}>Cancelar</Button>
                            <Button onClick={handleRestore}><RefreshCw className="h-4 w-4 mr-2" />Restaurar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}