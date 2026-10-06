import { Head, router } from '@inertiajs/react';
import { ShieldCheck, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    is_protected: boolean;
    created_at: string;
    permissions?: Permission[];
}

interface Props {
    roles: {
        data: Role[];
        links: any[];
    };
    permissions: Permission[];
    flash: {
        success: string;
        error?: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles y Permisos', href: '/roles' },
];

export default function RolesIndex({ roles, permissions, flash }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    
    const [roleSelect, setRoleSelect] = useState<Role | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState<{name: string; permissions: string[]}>({
        name: '', permissions: []
    });

    const resetForm = () => {
        setForm({ name: '', permissions: [] });
        setErrors({});
    };

    const openCreate = () => {
        resetForm();
        setModalCreate(true);
    };

    const openEdit = (role: Role) => {
        if (role.is_protected) return;
        setRoleSelect(role);
        setForm({
            name: role.name,
            permissions: role.permissions?.map(p => p.name) || []
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (role: Role) => { 
        if (role.is_protected) return;
        setRoleSelect(role); 
        setModalDelete(true); 
    };

    const togglePermission = (permName: string, checked: boolean) => {
        setForm(prev => {
            const nextPerms = checked 
                ? [...prev.permissions, permName] 
                : prev.permissions.filter(p => p !== permName);
            return { ...prev, permissions: nextPerms };
        });
    };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/roles', form, {
            onSuccess: () => { setModalCreate(false); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); }
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!roleSelect) return;
        setProcessing(true);
        router.put(`/roles/${roleSelect.id}`, form, {
            onSuccess: () => { setModalEdit(false); setRoleSelect(null); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); }
        });
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
                {flash?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{flash.error}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                        <ShieldCheck className="w-6 h-6" /> Roles del Sistema
                    </h1>
                    <div className="flex gap-2">
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Rol
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
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(role)} disabled={role.is_protected}>
                                                        <Pencil className={`h-4 w-4 ${role.is_protected ? 'opacity-50' : ''}`} />
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

                {/* MODAL CREAR ROL */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nuevo Rol</DialogTitle>
                            <DialogDescription>Define el nombre y sus permisos asignados.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">Nombre del Rol *</Label>
                                <Input id="create-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ej. Secretaria" />
                                <InputError message={errors.name} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Permisos Habilitados</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {permissions.map((perm) => (
                                        <label key={perm.id} className="flex items-center space-x-2 border p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
                                            <input type="checkbox" className="rounded" checked={form.permissions.includes(perm.name)} onChange={e => togglePermission(perm.name, e.target.checked)} />
                                            <span className="text-sm cursor-pointer">{perm.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.permissions} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar Rol</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL EDITAR ROL */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Rol</DialogTitle>
                            <DialogDescription>Modifica el nombre y reasigna los permisos necesarios.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nombre del Rol *</Label>
                                <Input id="edit-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                <InputError message={errors.name} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Permisos Habilitados</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {permissions.map((perm) => (
                                        <label key={perm.id} className="flex items-center space-x-2 border p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
                                            <input type="checkbox" className="rounded" checked={form.permissions.includes(perm.name)} onChange={e => togglePermission(perm.name, e.target.checked)} />
                                            <span className="text-sm cursor-pointer">{perm.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.permissions} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Actualizar Rol</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL ELIMINAR ROL */}
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
