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

interface Estudiante {
    id: number;
    user_id: number;
    colegio_procedencia: string | null;
    tipo_inscripcion: string | null;
    user: UserData;
    created_at: string;
    deleted_at: string;
}

interface Props {
    estudiantes: Estudiante[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Eliminados', href: '/estudiantes/eliminados' },
];

export default function EstudiantesEliminados({ estudiantes }: Props) {
    const [modalRestore, setModalRestore] = useState(false);
    const [estudianteSelect, setEstudianteSelect] = useState<Estudiante | null>(null);

    const openRestore = (estudiante: Estudiante) => {
        setEstudianteSelect(estudiante);
        setModalRestore(true);
    };

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const handleRestore = () => {
        if (!estudianteSelect) return;
        const nombre = nombreCompleto(estudianteSelect.user);
        router.post(`/estudiantes/${estudianteSelect.id}/restore`, {}, {
            onSuccess: () => {
                setModalRestore(false);
                toast.success(`Estudiante "${nombre}" restaurado`);
                setEstudianteSelect(null);
            },
            onError: () => toast.error('No se pudo restaurar el estudiante'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estudiantes Eliminados" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Estudiantes Eliminados</h1>
                    <Button variant="outline" asChild>
                        <Link href="/estudiantes">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Estudiantes
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Papelera de Estudiantes</CardTitle>
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
                                    {(!estudiantes || estudiantes.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                                <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                                No hay estudiantes eliminados
                                            </td>
                                        </tr>
                                    )}
                                    {estudiantes?.map((estudiante) => (
                                        <tr key={estudiante.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">{nombreCompleto(estudiante.user)}</td>
                                            <td className="py-3 px-4">{estudiante.user.ci}</td>
                                            <td className="py-3 px-4">{estudiante.user.celular}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{new Date(estudiante.deleted_at).toLocaleDateString('es-BO')}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => openRestore(estudiante)}>
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

                <Dialog open={modalRestore} onOpenChange={setModalRestore}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Restaurar Estudiante</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de restaurar al estudiante "{estudianteSelect ? nombreCompleto(estudianteSelect.user) : ''}"?
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