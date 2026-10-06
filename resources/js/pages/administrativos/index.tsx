import { Head, router } from '@inertiajs/react';
import { UserCog, LoaderCircle, Pencil, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

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

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    roles?: Role[];
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
    roles_list: Role[];
    flash: {
        success: string;
        error?: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Personal Administrativo', href: '/administrativos' },
];

export default function AdministrativosIndex({ users, roles_list, flash }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    
    const [userSelect, setUserSelect] = useState<User | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialForm = {
        nombre: '', apellido_paterno: '', apellido_materno: '', 
        ci: '', celular: '', email: '', password: '', password_confirmation: '', role: ''
    };
    const [form, setForm] = useState(initialForm);

    const resetForm = () => { setForm(initialForm); setErrors({}); };

    const openCreate = () => { resetForm(); setModalCreate(true); };

    const openEdit = (user: User) => {
        setUserSelect(user);
        setForm({
            ...initialForm,
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno || '',
            ci: user.ci,
            celular: user.celular || '',
            email: user.email,
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : ''
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (user: User) => { setUserSelect(user); setModalDelete(true); };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/administrativos', form, {
            onSuccess: () => { setModalCreate(false); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); }
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!userSelect) return;
        setProcessing(true);
        router.put(`/administrativos/${userSelect.id}`, form, {
            onSuccess: () => { setModalEdit(false); setUserSelect(null); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); }
        });
    };

    const handleDelete = () => {
        if (!userSelect) return;
        router.delete(`/administrativos/${userSelect.id}`, {
            onSuccess: () => { setModalDelete(false); setUserSelect(null); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personal Administrativo" />

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
                        <UserCog className="w-6 h-6" /> Personal Administrativo
                    </h1>
                    <div className="flex gap-2">
                        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo Personal</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Usuarios (Staff)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-neutral-500">
                                        <th className="py-3 px-4 font-medium">Nombre Completo</th>
                                        <th className="py-3 px-4 font-medium">Cédula</th>
                                        <th className="py-3 px-4 font-medium">Correo Electrónico</th>
                                        <th className="py-3 px-4 font-medium">Rol del Sistema</th>
                                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!users.data || users.data.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-neutral-500">
                                                No hay personal administrativo registrado
                                            </td>
                                        </tr>
                                    )}
                                    {users.data?.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                            <td className="py-3 px-4 font-medium text-foreground">
                                                {user.nombre} {user.apellido_paterno} {user.apellido_materno}
                                            </td>
                                            <td className="py-3 px-4 text-foreground">{user.ci}</td>
                                            <td className="py-3 px-4 text-foreground">{user.email}</td>
                                            <td className="py-3 px-4 text-foreground">
                                                {user.roles && user.roles.length > 0 ? (
                                                    <span className="font-bold uppercase text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded">
                                                        {user.roles[0].name}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 italic">Sin Rol</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(user)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        onClick={() => openDelete(user)} 
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
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

                {/* MODAL ELIMINAR */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                                ¿Eliminar al usuario "{userSelect?.nombre} {userSelect?.apellido_paterno}" de manera definitiva? No podrá acceder al sistema.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDelete}>Desactivar/Eliminar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL CREAR USUARIO ADMIN */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Registrar Nuevo Administrador</DialogTitle>
                            <DialogDescription>Asigna el rol y datos personales básicos.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="c-nombre">Nombre(s) *</Label>
                                    <Input id="c-nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-pat">Apellido Paterno *</Label>
                                    <Input id="c-pat" value={form.apellido_paterno} onChange={e => setForm({...form, apellido_paterno: e.target.value})} required />
                                    <InputError message={errors.apellido_paterno} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-mat">Apellido Materno</Label>
                                    <Input id="c-mat" value={form.apellido_materno} onChange={e => setForm({...form, apellido_materno: e.target.value})} />
                                    <InputError message={errors.apellido_materno} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-ci">Cédula de Identidad *</Label>
                                    <Input id="c-ci" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} required />
                                    <InputError message={errors.ci} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-cel">Celular</Label>
                                    <Input id="c-cel" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} />
                                    <InputError message={errors.celular} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-mail">Correo Electrónico *</Label>
                                    <Input id="c-mail" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                            
                            <hr className="my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="c-pwd">Contraseña *</Label>
                                    <Input id="c-pwd" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-pwdc">Confirmar Contraseña *</Label>
                                    <Input id="c-pwdc" type="password" value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} required />
                                </div>
                            </div>

                            <Card className="mt-4 border border-border bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2 w-full max-w-sm">
                                        <Label htmlFor="role">Rol del Sistema *</Label>
                                        <select
                                            id="role"
                                            className="flex h-9 w-full rounded-md border border-input bg-background dark:bg-black px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={form.role}
                                            onChange={e => setForm({...form, role: e.target.value})}
                                            required
                                        >
                                            <option value="" disabled>-- Selecciona un Rol --</option>
                                            {roles_list.map((r, i) => (
                                                <option key={i} value={r.name} className="uppercase">{r.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.role} />
                                    </div>

                                    {form.role === 'admin' && (
                                        <div className="p-3 border border-red-500 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded flex items-start gap-3 animate-in fade-in">
                                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-sm">Advertencia de Seguridad Crítica</h3>
                                                <p className="text-xs">Estás otorgando un control absoluto del sistema a esta cuenta. Esto significa que tiene autoridad total en todo.</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Registrar Personal</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>


                {/* MODAL EDITAR USUARIO ADMIN */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Administrador / Personal</DialogTitle>
                            <DialogDescription>Edita los datos personales o cambia el rol de este usuario.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="e-nombre">Nombre(s) *</Label>
                                    <Input id="e-nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="e-pat">Apellido Paterno *</Label>
                                    <Input id="e-pat" value={form.apellido_paterno} onChange={e => setForm({...form, apellido_paterno: e.target.value})} required />
                                    <InputError message={errors.apellido_paterno} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="e-mat">Apellido Materno</Label>
                                    <Input id="e-mat" value={form.apellido_materno} onChange={e => setForm({...form, apellido_materno: e.target.value})} />
                                    <InputError message={errors.apellido_materno} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="e-ci">Cédula de Identidad *</Label>
                                    <Input id="e-ci" value={form.ci} onChange={e => setForm({...form, ci: e.target.value})} required />
                                    <InputError message={errors.ci} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="e-cel">Celular</Label>
                                    <Input id="e-cel" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} />
                                    <InputError message={errors.celular} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="e-mail">Correo Electrónico *</Label>
                                    <Input id="e-mail" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                            
                            <hr className="my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="e-pwd">Contraseña (opcional para mantenerla intacta)</Label>
                                    <Input id="e-pwd" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="e-pwdc">Confirmar Contraseña</Label>
                                    <Input id="e-pwdc" type="password" value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} />
                                </div>
                            </div>

                            <Card className="mt-4 border border-border bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2 w-full max-w-sm">
                                        <Label htmlFor="e-role">Rol del Sistema *</Label>
                                        <select
                                            id="e-role"
                                            className="flex h-9 w-full rounded-md border border-input bg-background dark:bg-black px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={form.role}
                                            onChange={e => setForm({...form, role: e.target.value})}
                                            required
                                        >
                                            <option value="" disabled>-- Selecciona un Rol --</option>
                                            {roles_list.map((r, i) => (
                                                <option key={i} value={r.name} className="uppercase">{r.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.role} />
                                    </div>

                                    {form.role === 'admin' && (
                                        <div className="p-3 border border-red-500 bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded flex items-start gap-3 animate-in fade-in">
                                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-sm">Advertencia de Seguridad Crítica</h3>
                                                <p className="text-xs">Estás otorgando un control absoluto del sistema a esta cuenta. Esto significa que tiene autoridad total en todo.</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
