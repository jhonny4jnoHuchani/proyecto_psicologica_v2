import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, LoaderCircle, LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// ========================
// TIPOS
// ========================
interface UserData {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    genero: string | null;
    fecha_nacimiento: string | null;
    direccion: string | null;
}

interface Docente {
    id: number;
    user_id: number;
    especialidad: string | null;
    titulo_profesional: string | null;
    user: UserData;
    created_at: string;
    deleted_at: string | null;
}

interface Props {
    docentes: Docente[];
}

type DocenteForm = {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    password: string;
    especialidad: string;
    titulo_profesional: string;
    genero: string;
    fecha_nacimiento: string;
    direccion: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Docentes', href: '/docentes' },
];

const initialForm: DocenteForm = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    celular: '',
    email: '',
    password: '',
    especialidad: '',
    titulo_profesional: '',
    genero: '',
    fecha_nacimiento: '',
    direccion: '',
};

export default function DocentesIndex({ docentes }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalReset, setModalReset] = useState(false);
    const [docenteSelect, setDocenteSelect] = useState<Docente | null>(null);

    const [form, setForm] = useState<DocenteForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const resetForm = () => {
        setForm(initialForm);
        setErrors({});
    };

    const openCreate = () => {
        resetForm();
        setModalCreate(true);
    };

    const openEdit = (docente: Docente) => {
        setDocenteSelect(docente);
        setForm({
            nombre: docente.user.nombre,
            apellido_paterno: docente.user.apellido_paterno,
            apellido_materno: docente.user.apellido_materno,
            ci: docente.user.ci,
            celular: docente.user.celular,
            email: docente.user.email,
            password: '',
            especialidad: docente.especialidad || '',
            titulo_profesional: docente.titulo_profesional || '',
            genero: docente.user.genero || '',
            fecha_nacimiento: docente.user.fecha_nacimiento || '',
            direccion: docente.user.direccion || '',
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (docente: Docente) => {
        setDocenteSelect(docente);
        setModalDelete(true);
    };

    const openReset = (docente: Docente) => {
        setDocenteSelect(docente);
        setModalReset(true);
    };

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/docentes', form, {
            onSuccess: () => {
                setModalCreate(false);
                toast.success('Docente registrado correctamente');
                resetForm();
                setProcessing(false);
            },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!docenteSelect) return;
        setProcessing(true);
        const payload = { ...form };
        if (!payload.password) delete (payload as { password?: string }).password;
        router.put(`/docentes/${docenteSelect.id}`, payload, {
            onSuccess: () => {
                setModalEdit(false);
                toast.success('Docente actualizado correctamente');
                setDocenteSelect(null);
                resetForm();
                setProcessing(false);
            },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        if (!docenteSelect) return;
        const nombre = nombreCompleto(docenteSelect.user);
        router.delete(`/docentes/${docenteSelect.id}`, {
            onSuccess: () => {
                setModalDelete(false);
                toast.success(`Docente "${nombre}" desactivado`);
                setDocenteSelect(null);
            },
        });
    };

    const handleResetPassword = () => {
        if (!docenteSelect) return;
        router.post(`/docentes/${docenteSelect.id}/reset-password`, {}, {
            onSuccess: () => {
                setModalReset(false);
                toast.success('Contraseña reseteada correctamente');
                setDocenteSelect(null);
            },
            onError: () => toast.error('No se pudo resetear la contraseña'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Docentes" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Docentes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/docentes/eliminados">
                                <Archive className="h-4 w-4 mr-2" />
                                Ver Eliminados
                            </Link>
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Docente
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Docentes Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-3 px-4 font-medium">Nombre Completo</th>
                                        <th className="py-3 px-4 font-medium">CI</th>
                                        <th className="py-3 px-4 font-medium">Celular</th>
                                        <th className="py-3 px-4 font-medium">Especialidad</th>
                                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!docentes || docentes.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                                No hay docentes registrados
                                            </td>
                                        </tr>
                                    )}
                                    {docentes?.map((docente) => (
                                        <tr key={docente.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">{nombreCompleto(docente.user)}</td>
                                            <td className="py-3 px-4">{docente.user.ci}</td>
                                            <td className="py-3 px-4">{docente.user.celular}</td>
                                            <td className="py-3 px-4">{docente.especialidad || '-'}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild>
                                                        <a href={`/docentes/${docente.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(docente)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openReset(docente)} title="Resetear contraseña">
                                                        <LockKeyhole className="h-4 w-4 text-amber-500" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openDelete(docente)} title="Desactivar docente">
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

                {/* Modal Resetear Contraseña */}
                <Dialog open={modalReset} onOpenChange={setModalReset}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 dark:bg-amber-950/50 p-2 rounded-full">
                                    <LockKeyhole className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <DialogTitle>¿Resetear Contraseña?</DialogTitle>
                                    <DialogDescription>
                                        Se generará una nueva contraseña para el docente.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                                <p className="font-medium text-amber-800 dark:text-amber-300">
                                    {docenteSelect ? nombreCompleto(docenteSelect.user) : ''}
                                </p>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    Nueva contraseña: <strong>{docenteSelect ? `${docenteSelect.user.apellido_paterno.toLowerCase()}_${docenteSelect.user.ci}` : ''}</strong>
                                </p>
                            </div>

                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc pl-4">
                                    <li>Esta acción es <strong>irreversible</strong></li>
                                    <li>La contraseña anterior dejará de funcionar</li>
                                    <li>El docente deberá usar la nueva contraseña</li>
                                </ul>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setModalReset(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleResetPassword}>Sí, Resetear</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Crear */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nuevo Docente</DialogTitle>
                            <DialogDescription>Completa los datos del docente. La contraseña se generará automáticamente.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><Label htmlFor="nombre">Nombre *</Label><Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /><InputError message={errors.nombre} /></div>
                                <div className="space-y-1"><Label htmlFor="apellido_paterno">Apellido Paterno *</Label><Input id="apellido_paterno" value={form.apellido_paterno} onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })} required /><InputError message={errors.apellido_paterno} /></div>
                                <div className="space-y-1"><Label htmlFor="apellido_materno">Apellido Materno *</Label><Input id="apellido_materno" value={form.apellido_materno} onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })} required /><InputError message={errors.apellido_materno} /></div>
                                <div className="space-y-1"><Label htmlFor="ci">CI *</Label><Input id="ci" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required /><InputError message={errors.ci} /></div>
                                <div className="space-y-1"><Label htmlFor="celular">Celular *</Label><Input id="celular" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} required /><InputError message={errors.celular} /></div>
                                <div className="space-y-1"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><InputError message={errors.email} /></div>
                                <div className="space-y-1">
                                    <Label htmlFor="genero">Género</Label>
                                    <select id="genero" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} className="border rounded p-2 w-full text-sm bg-background">
                                        <option value="">Seleccionar...</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-1"><Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label><Input id="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} /></div>
                                <div className="space-y-1 col-span-2"><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Sucre B..." /></div>
                                <div className="space-y-1"><Label htmlFor="especialidad">Especialidad</Label><Input id="especialidad" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="titulo_profesional">Título Profesional</Label><Input id="titulo_profesional" value={form.titulo_profesional} onChange={(e) => setForm({ ...form, titulo_profesional: e.target.value })} /></div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Editar Docente</DialogTitle></DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><Label htmlFor="edit-nombre">Nombre *</Label><Input id="edit-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /><InputError message={errors.nombre} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-ap">Apellido Paterno *</Label><Input id="edit-ap" value={form.apellido_paterno} onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })} required /><InputError message={errors.apellido_paterno} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-am">Apellido Materno *</Label><Input id="edit-am" value={form.apellido_materno} onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })} required /><InputError message={errors.apellido_materno} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-ci">CI *</Label><Input id="edit-ci" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required /><InputError message={errors.ci} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-celular">Celular *</Label><Input id="edit-celular" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} required /><InputError message={errors.celular} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-email">Email *</Label><Input id="edit-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><InputError message={errors.email} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-password">Contraseña (vacío = no cambiar)</Label><Input id="edit-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-genero">Género</Label>
                                    <select id="edit-genero" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} className="border rounded p-2 w-full text-sm bg-background">
                                        <option value="">Seleccionar...</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-1"><Label htmlFor="edit-fecha_nacimiento">Fecha Nacimiento</Label><Input id="edit-fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} /></div>
                                <div className="space-y-1 col-span-2"><Label htmlFor="edit-direccion">Dirección</Label><Input id="edit-direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-especialidad">Especialidad</Label><Input id="edit-especialidad" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-titulo">Título Profesional</Label><Input id="edit-titulo" value={form.titulo_profesional} onChange={(e) => setForm({ ...form, titulo_profesional: e.target.value })} /></div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Actualizar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Eliminar (Soft Delete) */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Desactivación</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de desactivar al docente "{docenteSelect ? nombreCompleto(docenteSelect.user) : ''}"? Podrás restaurarlo después.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDelete}>Desactivar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}