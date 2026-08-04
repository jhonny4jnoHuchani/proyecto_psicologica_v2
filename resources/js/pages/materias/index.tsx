import { Head, Link, router } from '@inertiajs/react';
import { Archive, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    created_at: string;
    deleted_at: string | null;
}

interface Props {
    materias: Materia[];
}

type MateriaForm = {
    nombre: string;
    codigo: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Materias', href: '/materias' },
];

const initialForm: MateriaForm = { nombre: '', codigo: '' };

export default function MateriasIndex({ materias }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [materiaSelect, setMateriaSelect] = useState<Materia | null>(null);

    const [form, setForm] = useState<MateriaForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const resetForm = () => { setForm(initialForm); setErrors({}); };

    const openCreate = () => { resetForm(); setModalCreate(true); };

    const openEdit = (materia: Materia) => {
        setMateriaSelect(materia);
        setForm({ nombre: materia.nombre, codigo: materia.codigo });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (materia: Materia) => { setMateriaSelect(materia); setModalDelete(true); };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/materias', form, {
            onSuccess: () => { setModalCreate(false); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!materiaSelect) return;
        setProcessing(true);
        router.put(`/materias/${materiaSelect.id}`, form, {
            onSuccess: () => { setModalEdit(false); setMateriaSelect(null); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        if (!materiaSelect) return;
        router.delete(`/materias/${materiaSelect.id}`, {
            onSuccess: () => { setModalDelete(false); setMateriaSelect(null); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materias" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Materias</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/materias/eliminados"><Archive className="h-4 w-4 mr-2" />Ver Eliminadas</Link>
                        </Button>
                        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nueva Materia</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Listado de Materias</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-3 px-4 font-medium">Código</th>
                                        <th className="py-3 px-4 font-medium">Nombre</th>
                                        <th className="py-3 px-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!materias || materias.length === 0) && (
                                        <tr><td colSpan={3} className="py-8 text-center text-neutral-500">No hay materias registradas</td></tr>
                                    )}
                                    {materias?.map((materia) => (
                                        <tr key={materia.id} className="border-b hover:bg-neutral-50">
                                            <td className="py-3 px-4 font-medium">{materia.codigo}</td>
                                            <td className="py-3 px-4">{materia.nombre}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(materia)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="icon" onClick={() => openDelete(materia)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Nueva Materia</DialogTitle><DialogDescription>Completa los datos de la materia.</DialogDescription></DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1"><Label htmlFor="codigo">Código *</Label><Input id="codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required placeholder="PSI-101" /><InputError message={errors.codigo} /></div>
                            <div className="space-y-1"><Label htmlFor="nombre">Nombre *</Label><Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Psicología Cognitiva" /><InputError message={errors.nombre} /></div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Editar Materia</DialogTitle></DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1"><Label htmlFor="edit-codigo">Código *</Label><Input id="edit-codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required /><InputError message={errors.codigo} /></div>
                            <div className="space-y-1"><Label htmlFor="edit-nombre">Nombre *</Label><Input id="edit-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /><InputError message={errors.nombre} /></div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Actualizar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Eliminar */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Confirmar Desactivación</DialogTitle><DialogDescription>¿Desactivar la materia "{materiaSelect?.nombre}"?</DialogDescription></DialogHeader>
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