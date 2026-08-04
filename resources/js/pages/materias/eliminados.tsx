import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    deleted_at: string;
}

interface Props {
    materias: Materia[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Materias', href: '/materias' },
    { title: 'Eliminadas', href: '/materias/eliminados' },
];

export default function MateriasEliminadas({ materias }: Props) {
    const [modalRestore, setModalRestore] = useState(false);
    const [materiaSelect, setMateriaSelect] = useState<Materia | null>(null);

    const openRestore = (materia: Materia) => { setMateriaSelect(materia); setModalRestore(true); };
    const handleRestore = () => {
        if (!materiaSelect) return;
        router.post(`/materias/${materiaSelect.id}/restore`, {}, {
            onSuccess: () => { setModalRestore(false); setMateriaSelect(null); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias Eliminadas" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Materias Eliminadas</h1>
                    <Button variant="outline" asChild><Link href="/materias"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link></Button>
                </div>
                <Card>
                    <CardHeader><CardTitle>Papelera</CardTitle></CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead><tr className="border-b text-left"><th className="py-3 px-4">Código</th><th className="py-3 px-4">Nombre</th><th className="py-3 px-4">Eliminada</th><th className="py-3 px-4 text-right">Acciones</th></tr></thead>
                            <tbody>
                                {(!materias || materias.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-neutral-500">No hay materias eliminadas</td></tr>}
                                {materias?.map((m) => (
                                    <tr key={m.id} className="border-b hover:bg-neutral-50">
                                        <td className="py-3 px-4">{m.codigo}</td><td className="py-3 px-4">{m.nombre}</td><td className="py-3 px-4">{new Date(m.deleted_at).toLocaleDateString('es-BO')}</td>
                                        <td className="py-3 px-4 text-right"><Button variant="outline" size="sm" onClick={() => openRestore(m)}><RefreshCw className="h-4 w-4 mr-2" />Restaurar</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                <Dialog open={modalRestore} onOpenChange={setModalRestore}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Restaurar Materia</DialogTitle><DialogDescription>¿Restaurar "{materiaSelect?.nombre}"?</DialogDescription></DialogHeader>
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