import { Head, router } from '@inertiajs/react';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// ========================
// TIPOS
// ========================
interface Gestion {
    id: number;
    año: number;
    etapa: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    gestiones: Gestion[];
}

type GestionForm = {
    año: string;
    etapa: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestiones', href: '/gestiones' },
];

const initialForm: GestionForm = {
    año: '',
    etapa: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo',
};

// ========================
// HELPERS DE FECHA
// ========================

// Para mostrar en la tabla: "1 ago 2025"
const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Para precargar el <input type="date">, que exige formato YYYY-MM-DD
const toInputDate = (fecha: string) => {
    if (!fecha) return '';
    return fecha.split('T')[0];
};

// ========================
// COMPONENTE PRINCIPAL
// ========================
export default function GestionesIndex({ gestiones }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [gestionSelect, setGestionSelect] = useState<Gestion | null>(null);

    const [form, setForm] = useState<GestionForm>(initialForm);
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

    const openEdit = (gestion: Gestion) => {
        setGestionSelect(gestion);
        setForm({
            año: String(gestion.año),
            etapa: gestion.etapa,
            fecha_inicio: toInputDate(gestion.fecha_inicio),
            fecha_fin: toInputDate(gestion.fecha_fin),
            estado: gestion.estado,
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (gestion: Gestion) => {
        setGestionSelect(gestion);
        setModalDelete(true);
    };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/gestiones', form, {
            onSuccess: () => {
                setModalCreate(false);
                toast.success('Gestión creada correctamente');
                resetForm();
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!gestionSelect) return;
        setProcessing(true);
        router.put(`/gestiones/${gestionSelect.id}`, form, {
            onSuccess: () => {
                setModalEdit(false);
                toast.success('Gestión actualizada correctamente');
                setGestionSelect(null);
                resetForm();
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    const handleDelete = () => {
        if (!gestionSelect) return;
        const label = `${gestionSelect.año} - ${gestionSelect.etapa}`;
        router.delete(`/gestiones/${gestionSelect.id}`, {
            onSuccess: () => {
                setModalDelete(false);
                toast.success(`Gestión "${label}" eliminada`);
                setGestionSelect(null);
            },
        });
    };

    // ========================
    // RENDER
    // ========================
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestiones" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gestiones Académicas</h1>
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Gestión
                    </Button>
                </div>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Gestiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-3 px-4 font-medium">Año</th>
                                        <th className="py-3 px-4 font-medium">Etapa</th>
                                        <th className="py-3 px-4 font-medium">Inicio</th>
                                        <th className="py-3 px-4 font-medium">Fin</th>
                                        <th className="py-3 px-4 font-medium">Estado</th>
                                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gestiones.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                                No hay gestiones registradas
                                            </td>
                                        </tr>
                                    )}
                                    {gestiones.map((gestion) => (
                                        <tr key={gestion.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{gestion.año}</td>
                                            <td className="py-3 px-4">{gestion.etapa}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{formatFecha(gestion.fecha_inicio)}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{formatFecha(gestion.fecha_fin)}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={gestion.estado === 'activo' ? 'default' : 'secondary'}>
                                                    {gestion.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(gestion)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openDelete(gestion)}>
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

                {/* Modal Crear */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Gestión</DialogTitle>
                            <DialogDescription>Completa los datos de la gestión académica.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="año">Año</Label>
                                    <Input
                                        id="año"
                                        type="number"
                                        value={form.año}
                                        onChange={(e) => setForm({ ...form, año: e.target.value })}
                                        required
                                        placeholder="2025"
                                    />
                                    <InputError message={errors.año} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="etapa">Etapa</Label>
                                    <Input
                                        id="etapa"
                                        type="text"
                                        value={form.etapa}
                                        onChange={(e) => setForm({ ...form, etapa: e.target.value })}
                                        required
                                        placeholder="1er Semestre"
                                    />
                                    <InputError message={errors.etapa} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                                    <Input
                                        id="fecha_inicio"
                                        type="date"
                                        value={form.fecha_inicio}
                                        onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.fecha_inicio} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_fin">Fecha Fin</Label>
                                    <Input
                                        id="fecha_fin"
                                        type="date"
                                        value={form.fecha_fin}
                                        onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.fecha_fin} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select value={form.estado} onValueChange={(value) => setForm({ ...form, estado: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="activo">Activo</SelectItem>
                                        <SelectItem value="inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.estado} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Gestión</DialogTitle>
                            <DialogDescription>Modifica los datos de la gestión académica.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-año">Año</Label>
                                    <Input
                                        id="edit-año"
                                        type="number"
                                        value={form.año}
                                        onChange={(e) => setForm({ ...form, año: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.año} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-etapa">Etapa</Label>
                                    <Input
                                        id="edit-etapa"
                                        type="text"
                                        value={form.etapa}
                                        onChange={(e) => setForm({ ...form, etapa: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.etapa} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-fecha_inicio">Fecha Inicio</Label>
                                    <Input
                                        id="edit-fecha_inicio"
                                        type="date"
                                        value={form.fecha_inicio}
                                        onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.fecha_inicio} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-fecha_fin">Fecha Fin</Label>
                                    <Input
                                        id="edit-fecha_fin"
                                        type="date"
                                        value={form.fecha_fin}
                                        onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.fecha_fin} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-estado">Estado</Label>
                                <Select value={form.estado} onValueChange={(value) => setForm({ ...form, estado: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="activo">Activo</SelectItem>
                                        <SelectItem value="inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.estado} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                    Actualizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Eliminar */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de eliminar la gestión "{gestionSelect?.año} - {gestionSelect?.etapa}"?
                                Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}