import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserData {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
}

interface Docente {
    id: number;
    user_id: number;
    especialidad: string | null;
    titulo_profesional: string | null;
    user: UserData;
    created_at: string;
    deleted_at: string;
}

interface Props {
    docentes: Docente[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Docentes', href: '/docentes' },
    { title: 'Eliminados', href: '/docentes/eliminados' },
];

export default function DocentesEliminados({ docentes }: Props) {
    const [modalRestore, setModalRestore] = useState(false);
    const [docenteSelect, setDocenteSelect] = useState<Docente | null>(null);

    const openRestore = (docente: Docente) => {
        setDocenteSelect(docente);
        setModalRestore(true);
    };

    const handleRestore = () => {
        if (!docenteSelect) return;
        router.post(`/docentes/${docenteSelect.id}/restore`, {}, {
            onSuccess: () => {
                setModalRestore(false);
                toast.success(`Docente "${nombreCompleto(docenteSelect.user)}" restaurado`);
                setDocenteSelect(null);
            },
            onError: () => toast.error('No se pudo restaurar el docente'),
        });
    };

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Docentes Eliminados" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Docentes Eliminados</h1>
                    <Button variant="outline" asChild>
                        <Link href="/docentes">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Docentes
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Papelera de Docentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-3 px-4 font-medium">Nombre Completo</th>
                                        <th className="py-3 px-4 font-medium">CI</th>
                                        <th className="py-3 px-4 font-medium">Celular</th>
                                        <th className="py-3 px-4 font-medium">Eliminado el</th>
                                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!docentes || docentes.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                                <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                                No hay docentes eliminados
                                            </td>
                                        </tr>
                                    )}
                                    {docentes?.map((docente) => (
                                        <tr key={docente.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">{nombreCompleto(docente.user)}</td>
                                            <td className="py-3 px-4">{docente.user.ci}</td>
                                            <td className="py-3 px-4">{docente.user.celular}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{new Date(docente.deleted_at).toLocaleDateString('es-BO')}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => openRestore(docente)}>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Restaurar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal Restaurar */}
                <Dialog open={modalRestore} onOpenChange={setModalRestore}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Restaurar Docente</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de restaurar al docente "{docenteSelect ? nombreCompleto(docenteSelect.user) : ''}"?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalRestore(false)}>Cancelar</Button>
                            <Button onClick={handleRestore}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Restaurar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}