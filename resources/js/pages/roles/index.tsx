import { Head, Link, router } from '@inertiajs/react';
import { ShieldCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

interface Role {
    id: number;
    name: string;
    is_protected: boolean;
    created_at: string;
}

interface Props {
    roles: {
        data: Role[];
        links: any[];
    };
    flash: {
        success: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles y Permisos', href: '/roles' },
];

export default function RolesIndex({ roles, flash }: Props) {
    const [modalDelete, setModalDelete] = useState(false);
    const [roleSelect, setRoleSelect] = useState<Role | null>(null);

    const openDelete = (role: Role) => { 
        if (role.is_protected) return;
        setRoleSelect(role); 
        setModalDelete(true); 
    };

    const handleDelete = () => {
        if (!roleSelect) return;
        router.delete(`/roles/${roleSelect.id}`, {
            onSuccess: () => { setModalDelete(false); setRoleSelect(null); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="p-6 space-y-6">

                {flash?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{flash.success}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                        <ShieldCheck className="w-6 h-6" /> Roles del Sistema
                    </h1>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/roles/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Rol
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-neutral-500">
                                        <th className="py-3 px-4 font-medium">Nombre del Rol</th>
                                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!roles.data || roles.data.length === 0) && (
                                        <tr>
                                            <td colSpan={2} className="py-8 text-center text-neutral-500">
                                                No hay roles registrados
                                            </td>
                                        </tr>
                                    )}
                                    {roles.data?.map((role) => (
                                        <tr key={role.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                            <td className="py-3 px-4 font-medium uppercase text-foreground">
                                                {role.name}
                                                {role.is_protected && (
                                                    <span className="ml-3 text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700">
                                                        Sistema Core / Protegido
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild disabled={role.is_protected}>
                                                        {role.is_protected ? (
                                                            <span><Pencil className="h-4 w-4 opacity-50" /></span>
                                                        ) : (
                                                            <Link href={`/roles/${role.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                    </Button>
                                                    
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        onClick={() => openDelete(role)} 
                                                        disabled={role.is_protected}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${role.is_protected ? 'opacity-50' : 'text-red-500'}`} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                                ¿Estás muy seguro de que deseas eliminar permanentemente el rol "{roleSelect?.name}"? Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDelete}>Eliminar Definitivamente</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
