import { Head, router } from '@inertiajs/react';
import {
    BookOpen, Plus, Pencil, Trash2, LoaderCircle, Sparkles, Filter,
} from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// ======================== TIPOS ========================
interface MateriaOption { id: number; nombre: string; codigo: string; }

interface Libro {
    id: number;
    nombre: string;
    autor: string | null;
    anio_lanzamiento: number | null;
    materia: MateriaOption;
}

interface Filtros { materia_id: number | null; }

interface Props {
    libros: Libro[];
    materias: MateriaOption[];
    filtros: Filtros;
}

type LibroForm = {
    materia_id: string;
    nombre: string;
    autor: string;
    anio_lanzamiento: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Libros', href: '/libros' }];

const initialForm: LibroForm = {
    materia_id: '',
    nombre: '',
    autor: '',
    anio_lanzamiento: '',
};

const MATERIA_COLORS = [
    { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', dot: 'bg-indigo-500' },
    { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', dot: 'bg-teal-500' },
    { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
    { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500' },
    { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
];

function colorForMateria(codigo?: string) {
    if (!codigo) return MATERIA_COLORS[0];
    let hash = 0;
    for (let i = 0; i < codigo.length; i++) hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
    return MATERIA_COLORS[Math.abs(hash) % MATERIA_COLORS.length];
}

export default function LibrosIndex({ libros, materias, filtros }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [libroSelect, setLibroSelect] = useState<Libro | null>(null);

    const [form, setForm] = useState<LibroForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const [filtroMateria, setFiltroMateria] = useState(filtros.materia_id ? String(filtros.materia_id) : '');

    const resetForm = () => { setForm(initialForm); setErrors({}); };

    const aplicarFiltros = () => {
        const params = new URLSearchParams();
        if (filtroMateria) params.set('materia_id', filtroMateria);
        router.get(`/libros?${params.toString()}`);
    };

    const openCreate = () => {
        resetForm();
        setForm({ ...initialForm, materia_id: filtroMateria });
        setModalCreate(true);
    };

    const openEdit = (libro: Libro) => {
        setLibroSelect(libro);
        setForm({
            materia_id: String(libro.materia?.id || ''),
            nombre: libro.nombre,
            autor: libro.autor || '',
            anio_lanzamiento: libro.anio_lanzamiento ? String(libro.anio_lanzamiento) : '',
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (libro: Libro) => { setLibroSelect(libro); setModalDelete(true); };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault(); setProcessing(true);
        router.post('/libros', form, {
            onSuccess: () => { setModalCreate(false); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!libroSelect) return;
        setProcessing(true);
        router.put(`/libros/${libroSelect.id}`, form, {
            onSuccess: () => { setModalEdit(false); setLibroSelect(null); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        if (!libroSelect) return;
        router.delete(`/libros/${libroSelect.id}`, {
            onSuccess: () => { setModalDelete(false); setLibroSelect(null); },
        });
    };

    const stats = useMemo(() => {
        const total = libros?.length ?? 0;
        const materiasUnicas = new Set(libros?.map(l => l.materia?.id)).size;
        return { total, materias: materiasUnicas };
    }, [libros]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Libros" />
            <div className="mx-auto max-w-[1400px] space-y-6 p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                                <BookOpen className="h-4.5 w-4.5" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Libros</h1>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                            Gestiona los libros y recursos bibliográficos del sistema.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />Nuevo libro
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card className="border-none bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">Total</p>
                                <p className="mt-1 text-3xl font-bold">{stats.total}</p>
                                <p className="text-xs text-indigo-100">libros registrados</p>
                            </div>
                            <BookOpen className="h-9 w-9 text-indigo-200/70" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Materias</p>
                                <p className="mt-1 text-3xl font-bold text-emerald-600">{stats.materias}</p>
                                <p className="text-xs text-neutral-500">con libros asignados</p>
                            </div>
                            <Sparkles className="h-9 w-9 text-emerald-200" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs text-neutral-500">Materia</Label>
                            <Select value={filtroMateria} onValueChange={setFiltroMateria}>
                                <SelectTrigger><SelectValue placeholder="Todas las materias" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Todas</SelectItem>
                                    {(materias || []).map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.codigo} - {m.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={aplicarFiltros} variant="outline" className="sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />Filtrar
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Listado de libros</CardTitle>
                        <span className="text-xs text-neutral-400">{libros?.length ?? 0} resultado(s)</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-neutral-50/70 text-left text-xs uppercase tracking-wide text-neutral-500">
                                        <th className="px-4 py-3 font-medium">Libro</th>
                                        <th className="px-4 py-3 font-medium">Materia</th>
                                        <th className="px-4 py-3 font-medium">Autor</th>
                                        <th className="px-4 py-3 font-medium">Año</th>
                                        <th className="px-4 py-3 text-right font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!libros || libros.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-14 text-center">
                                                <div className="flex flex-col items-center gap-2 text-neutral-400">
                                                    <Sparkles className="h-8 w-8" />
                                                    <p className="text-sm font-medium text-neutral-500">Todavía no hay libros aquí</p>
                                                    <p className="text-xs">Crea el primer libro con el botón "Nuevo libro".</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {libros?.map((l) => {
                                        const color = colorForMateria(l.materia?.codigo);
                                        return (
                                            <tr key={l.id} className="group border-b transition-colors last:border-b-0 hover:bg-neutral-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className={`mt-1 h-full min-h-8 w-1 rounded-full ${color.dot}`} />
                                                        <div>
                                                            <p className="font-medium leading-tight">{l.nombre}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.ring}`}>
                                                        {l.materia?.codigo}
                                                    </span>
                                                    <p className="text-xs text-neutral-500 mt-0.5">{l.materia?.nombre}</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-600">
                                                    {l.autor || <span className="text-neutral-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-600">
                                                    {l.anio_lanzamiento || <span className="text-neutral-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                                                        <Button variant="outline" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                                                        <Button variant="outline" size="icon" onClick={() => openDelete(l)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Nuevo libro</DialogTitle>
                            <DialogDescription>Completa los datos para agregar un nuevo libro al sistema.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label>Materia *</Label>
                                    <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
                                        <SelectContent>
                                            {(materias || []).map(m => (
                                                <SelectItem key={m.id} value={String(m.id)}>{m.codigo} - {m.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.materia_id} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Nombre del libro *</Label>
                                    <Input
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        placeholder="Ej: Introducción a la Psicología"
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Autor</Label>
                                    <Input
                                        value={form.autor}
                                        onChange={(e) => setForm({ ...form, autor: e.target.value })}
                                        placeholder="Ej: Sigmund Freud"
                                    />
                                    <InputError message={errors.autor} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Año de lanzamiento</Label>
                                    <Input
                                        type="number"
                                        value={form.anio_lanzamiento}
                                        onChange={(e) => setForm({ ...form, anio_lanzamiento: e.target.value })}
                                        placeholder="Ej: 2020"
                                        min="1900"
                                        max="2100"
                                    />
                                    <InputError message={errors.anio_lanzamiento} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar libro
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Editar libro</DialogTitle>
                            <DialogDescription>Actualiza los datos de "{libroSelect?.nombre}".</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label>Materia *</Label>
                                    <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar materia" /></SelectTrigger>
                                        <SelectContent>
                                            {(materias || []).map(m => (
                                                <SelectItem key={m.id} value={String(m.id)}>{m.codigo} - {m.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.materia_id} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Nombre del libro *</Label>
                                    <Input
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        placeholder="Ej: Introducción a la Psicología"
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Autor</Label>
                                    <Input
                                        value={form.autor}
                                        onChange={(e) => setForm({ ...form, autor: e.target.value })}
                                        placeholder="Ej: Sigmund Freud"
                                    />
                                    <InputError message={errors.autor} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Año de lanzamiento</Label>
                                    <Input
                                        type="number"
                                        value={form.anio_lanzamiento}
                                        onChange={(e) => setForm({ ...form, anio_lanzamiento: e.target.value })}
                                        placeholder="Ej: 2020"
                                        min="1900"
                                        max="2100"
                                    />
                                    <InputError message={errors.anio_lanzamiento} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar libro</DialogTitle>
                            <DialogDescription>
                                Esta acción marcará el libro como eliminado. ¿Eliminar "{libroSelect?.nombre}"?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}