import { Head, Link, router } from '@inertiajs/react';

import { Archive, Download, Eye, LoaderCircle, LockKeyhole, Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// ======================== TIPOS ========================
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

interface CursoOption {
    id: number;
    paralelo: string;
    cupos: number;
    estudiantes_count: number;
    gestion: { año: number; etapa: string };
}

interface Estudiante {
    id: number;
    user_id: number;
    colegio_procedencia: string | null;
    tipo_inscripcion: string | null;
    user: UserData;
    cursos: {
        id: number;
        paralelo: string;
        gestion: { año: number; etapa: string };
    }[];
    created_at: string;
    deleted_at: string | null;
}

interface Props {
    estudiantes: Estudiante[];
    cursos: CursoOption[];
}

interface PreviewFila {
    fila: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    genero: string | null;
    fecha_nacimiento: string | null;
    direccion: string | null;
    colegio_procedencia: string | null;
    tipo_inscripcion: string | null;
    valido: boolean;
    errores: string[];
}

interface PreviewResult {
    total: number;
    validos: number;
    errores: number;
    curso_id: number;
    curso_label: string;
    cupo_disponible: number;
    filas: PreviewFila[];
}

type EstudianteForm = {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    password: string;
    colegio_procedencia: string;
    tipo_inscripcion: string;
    genero: string;
    fecha_nacimiento: string;
    direccion: string;
    curso_id: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Estudiantes', href: '/estudiantes' }];

const initialForm: EstudianteForm = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    celular: '',
    email: '',
    password: '',
    colegio_procedencia: '',
    tipo_inscripcion: '',
    genero: '',
    fecha_nacimiento: '',
    direccion: '',
    curso_id: '',
};

export default function EstudiantesIndex({ estudiantes, cursos }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalReset, setModalReset] = useState(false);
    const [estudianteSelect, setEstudianteSelect] = useState<Estudiante | null>(null);

    const [form, setForm] = useState<EstudianteForm>(initialForm);
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

    const openEdit = (estudiante: Estudiante) => {
        setEstudianteSelect(estudiante);
        setForm({
            nombre: estudiante.user.nombre,
            apellido_paterno: estudiante.user.apellido_paterno,
            apellido_materno: estudiante.user.apellido_materno,
            ci: estudiante.user.ci,
            celular: estudiante.user.celular,
            email: estudiante.user.email,
            password: '',
            colegio_procedencia: estudiante.colegio_procedencia || '',
            tipo_inscripcion: estudiante.tipo_inscripcion || '',
            genero: estudiante.user.genero || '',
            fecha_nacimiento: estudiante.user.fecha_nacimiento || '',
            direccion: estudiante.user.direccion || '',
            curso_id: estudiante.cursos?.[0]?.id ? String(estudiante.cursos[0].id) : '',
        });
        setErrors({});
        setModalEdit(true);
    };

    const [modalImport, setModalImport] = useState(false);
    const [importCursoId, setImportCursoId] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [modalPreview, setModalPreview] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewResult | null>(null);

    const openImport = () => {
        setImportCursoId('');
        setImportFile(null);
        setErrors({});
        setModalImport(true);
    };

const handleImportPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !importCursoId) return;

    const data = new FormData();
    data.append('archivo', importFile);
    data.append('curso_id', importCursoId);

    setProcessing(true);
    setErrors({});

    try {
        const csrfToken =
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        const res = await fetch('/estudiantes/importar/preview', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: data,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setErrors(err.errors || { archivo: 'Error al leer el archivo' });
            setProcessing(false);
            toast.error('Error al procesar el archivo');
            return;
        }

        const json = await res.json();
        setPreviewData(json.preview);
        setModalImport(false);
        setModalPreview(true);
        setProcessing(false);
    } catch (err) {
        console.error(err);
        setProcessing(false);
        toast.error('Error de conexión');
    }
};

const handleImportConfirm = async () => {
    if (!previewData) return;
    const total = previewData.validos;

    const data = new FormData();
    data.append('curso_id', String(previewData.curso_id));

    previewData.filas
        .filter((f) => f.valido)
        .forEach((f, i) => {
            data.append(`filas[${i}][nombre]`, f.nombre);
            data.append(`filas[${i}][apellido_paterno]`, f.apellido_paterno);
            data.append(`filas[${i}][apellido_materno]`, f.apellido_materno);
            data.append(`filas[${i}][ci]`, f.ci);
            data.append(`filas[${i}][celular]`, f.celular ?? '');
            data.append(`filas[${i}][email]`, f.email);
            data.append(`filas[${i}][genero]`, f.genero ?? '');
            data.append(`filas[${i}][fecha_nacimiento]`, f.fecha_nacimiento ?? '');
            data.append(`filas[${i}][direccion]`, f.direccion ?? '');
            data.append(`filas[${i}][colegio_procedencia]`, f.colegio_procedencia ?? '');
            data.append(`filas[${i}][tipo_inscripcion]`, f.tipo_inscripcion ?? '');
        });

    setProcessing(true);
    setErrors({});

    try {
        const metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        const cookieToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        const csrfToken = metaToken || decodeURIComponent(cookieToken || '');

        const res = await fetch('/estudiantes/importar/confirm', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/html,application/xhtml+xml',
            },
            credentials: 'same-origin',
            body: data,
            // 👇 NO usar redirect: 'manual'. Dejar que siga el 302.
        });

        // El navegador siguió el 302 → la respuesta final es 200 con el HTML de /estudiantes
        if (res.ok) {
            setModalPreview(false);
            setPreviewData(null);
            setImportFile(null);
            setImportCursoId('');
            setProcessing(false);
            toast.success(`${total} estudiantes importados correctamente`);

            // Recargar la página
            window.location.href = '/estudiantes';
            return;
        }

        if (res.status === 422) {
            const err = await res.json().catch(() => ({}));
            setErrors(err.errors || {});
            setProcessing(false);
            const mensaje = Object.values(err.errors || {}).flat().join(' ');
            toast.error(mensaje || 'Datos inválidos');
            return;
        }

        if (res.status === 419) {
            toast.error('Sesión expirada. Recarga la página');
            setProcessing(false);
            return;
        }

        toast.error('Error al importar');
        setProcessing(false);
    } catch (err) {
        console.error(err);
        setProcessing(false);
        toast.error('Error de conexión');
    }
};



    const openDelete = (e: Estudiante) => {
        setEstudianteSelect(e);
        setModalDelete(true);
    };
    const openReset = (e: Estudiante) => {
        setEstudianteSelect(e);
        setModalReset(true);
    };

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/estudiantes', form, {
            onSuccess: () => {
                setModalCreate(false);
                toast.success('Estudiante registrado correctamente');
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
        if (!estudianteSelect) return;
        setProcessing(true);
        const data = { ...form };
        if (!data.password) delete (data as { password?: string }).password;
        router.put(`/estudiantes/${estudianteSelect.id}`, data, {
            onSuccess: () => {
                setModalEdit(false);
                toast.success('Estudiante actualizado correctamente');
                setEstudianteSelect(null);
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
        if (!estudianteSelect) return;
        const nombre = nombreCompleto(estudianteSelect.user);
        router.delete(`/estudiantes/${estudianteSelect.id}`, {
            onSuccess: () => {
                setModalDelete(false);
                toast.success(`Estudiante "${nombre}" desactivado`);
                setEstudianteSelect(null);
            },
        });
    };

    const handleResetPassword = () => {
        if (!estudianteSelect) return;
        router.post(
            `/estudiantes/${estudianteSelect.id}/reset-password`,
            {},
            {
                onSuccess: () => {
                    setModalReset(false);
                    toast.success('Contraseña reseteada correctamente');
                    setEstudianteSelect(null);
                },
                onError: () => toast.error('No se pudo resetear la contraseña'),
            },
        );
    };

    const tipoBadge = (tipo: string | null) => {
        const map: Record<string, string> = { regular: 'Regular', dispensacion: 'Dispensación', cursillo: 'Cursillo' };
        return tipo ? map[tipo] || tipo : 'No definido';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estudiantes" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Estudiantes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/estudiantes/eliminados">
                                <Archive className="mr-2 h-4 w-4" />
                                Ver Eliminados
                            </Link>
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Estudiante
                        </Button>

                        <Button variant="outline" asChild>
                            <a href="/estudiantes/importar/plantilla">
                                <Download className="mr-2 h-4 w-4" />
                                Plantilla
                            </a>
                        </Button>

                        <Button variant="outline" onClick={openImport}>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar
                        </Button>
                    </div>
                </div>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Estudiantes Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">CI</th>
                                        <th className="px-4 py-3">Celular</th>
                                        <th className="px-4 py-3">Curso</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!estudiantes || estudiantes.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="text-muted-foreground py-12 text-center">
                                                No hay estudiantes
                                            </td>
                                        </tr>
                                    )}
                                    {estudiantes?.map((e) => (
                                        <tr key={e.id} className="hover:bg-muted/50 border-b transition-colors">
                                            <td className="px-4 py-3">{nombreCompleto(e.user)}</td>
                                            <td className="px-4 py-3">{e.user.ci}</td>
                                            <td className="px-4 py-3">{e.user.celular}</td>
                                            <td className="px-4 py-3 text-xs">
                                                {e.cursos?.[0]?.gestion
                                                    ? `${e.cursos[0].gestion.año} - ${e.cursos[0].gestion.etapa} | P.${e.cursos[0].paralelo}`
                                                    : 'Sin curso'}
                                            </td>
                                            <td className="px-4 py-3">{tipoBadge(e.tipo_inscripcion)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild>
                                                        <a href={`/estudiantes/${e.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(e)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openReset(e)} title="Resetear contraseña">
                                                        <LockKeyhole className="h-4 w-4 text-amber-500" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => openDelete(e)}>
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
                                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-950/50">
                                    <LockKeyhole className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <DialogTitle>¿Resetear Contraseña?</DialogTitle>
                                    <DialogDescription>Se generará una nueva contraseña.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                                <p className="font-medium text-amber-800 dark:text-amber-300">
                                    {estudianteSelect ? nombreCompleto(estudianteSelect.user) : ''}
                                </p>
                                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                                    Nueva:{' '}
                                    <strong>
                                        {estudianteSelect
                                            ? `${estudianteSelect.user.apellido_paterno.toLowerCase()}_${estudianteSelect.user.ci}`
                                            : ''}
                                    </strong>
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setModalReset(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleResetPassword}>
                                Resetear
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Crear */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nuevo Estudiante</DialogTitle>
                            <DialogDescription>Completa los datos. La contraseña se genera automáticamente.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="apellido_paterno">Ap. Paterno *</Label>
                                    <Input
                                        id="apellido_paterno"
                                        value={form.apellido_paterno}
                                        onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.apellido_paterno} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="apellido_materno">Ap. Materno *</Label>
                                    <Input
                                        id="apellido_materno"
                                        value={form.apellido_materno}
                                        onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.apellido_materno} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ci">CI *</Label>
                                    <Input id="ci" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required />
                                    <InputError message={errors.ci} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="celular">Celular *</Label>
                                    <Input
                                        id="celular"
                                        value={form.celular}
                                        onChange={(e) => setForm({ ...form, celular: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.celular} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="genero">Género</Label>
                                    <select
                                        id="genero"
                                        value={form.genero}
                                        onChange={(e) => setForm({ ...form, genero: e.target.value })}
                                        className="bg-background w-full rounded border p-2 text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="M">M</option>
                                        <option value="F">F</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="fecha_nacimiento">Fecha Nac.</Label>
                                    <Input
                                        id="fecha_nacimiento"
                                        type="date"
                                        value={form.fecha_nacimiento}
                                        onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        value={form.direccion}
                                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                        placeholder="Av. Sucre B..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="colegio_procedencia">Colegio</Label>
                                    <Input
                                        id="colegio_procedencia"
                                        value={form.colegio_procedencia}
                                        onChange={(e) => setForm({ ...form, colegio_procedencia: e.target.value })}
                                        placeholder="U.E. San Andrés"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="tipo_inscripcion">Tipo Inscripción</Label>
                                    <select
                                        id="tipo_inscripcion"
                                        value={form.tipo_inscripcion}
                                        onChange={(e) => setForm({ ...form, tipo_inscripcion: e.target.value })}
                                        className="bg-background w-full rounded border p-2 text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="regular">Regular</option>
                                        <option value="dispensacion">Dispensación</option>
                                        <option value="cursillo">Cursillo</option>
                                    </select>
                                </div>
                                {/* CURSO */}
                                <div className="col-span-2 space-y-1">
                                    <Label htmlFor="curso_id">Asignar a Curso *</Label>
                                    <select
                                        id="curso_id"
                                        value={form.curso_id}
                                        onChange={(e) => setForm({ ...form, curso_id: e.target.value })}
                                        className="bg-background w-full rounded border p-2 text-sm"
                                        required
                                    >
                                        <option value="">Seleccionar curso...</option>
                                        {cursos?.map((c) => (
                                            <option key={c.id} value={String(c.id)}>
                                                {c.gestion?.año} - {c.gestion?.etapa} | Paralelo {c.paralelo} ({c.estudiantes_count || 0}/{c.cupos})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.curso_id} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Estudiante</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="edit-nombre">Nombre *</Label>
                                    <Input
                                        id="edit-nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-ap">Ap. Paterno *</Label>
                                    <Input
                                        id="edit-ap"
                                        value={form.apellido_paterno}
                                        onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-am">Ap. Materno *</Label>
                                    <Input
                                        id="edit-am"
                                        value={form.apellido_materno}
                                        onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-ci">CI *</Label>
                                    <Input id="edit-ci" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-celular">Celular *</Label>
                                    <Input
                                        id="edit-celular"
                                        value={form.celular}
                                        onChange={(e) => setForm({ ...form, celular: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-email">Email *</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-password">Contraseña</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Vacío = no cambiar"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-genero">Género</Label>
                                    <select
                                        id="edit-genero"
                                        value={form.genero}
                                        onChange={(e) => setForm({ ...form, genero: e.target.value })}
                                        className="bg-background w-full rounded border p-2 text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="M">M</option>
                                        <option value="F">F</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-fecha">Fecha Nac.</Label>
                                    <Input
                                        id="edit-fecha"
                                        type="date"
                                        value={form.fecha_nacimiento}
                                        onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label htmlFor="edit-direccion">Dirección</Label>
                                    <Input
                                        id="edit-direccion"
                                        value={form.direccion}
                                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-colegio">Colegio</Label>
                                    <Input
                                        id="edit-colegio"
                                        value={form.colegio_procedencia}
                                        onChange={(e) => setForm({ ...form, colegio_procedencia: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-tipo">Tipo</Label>
                                    <select
                                        id="edit-tipo"
                                        value={form.tipo_inscripcion}
                                        onChange={(e) => setForm({ ...form, tipo_inscripcion: e.target.value })}
                                        className="bg-background w-full rounded border p-2 text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="regular">Regular</option>
                                        <option value="dispensacion">Dispensación</option>
                                        <option value="cursillo">Cursillo</option>
                                    </select>
                                </div>
                                {/* CURSO */}
                                <div className="col-span-2 space-y-1">
                                    <Label htmlFor="edit-curso">Curso *</Label>
                                    <select
                                        id="edit-curso"
                                        value={form.curso_id}
                                        onChange={(e) => setForm({ ...form, curso_id: e.target.value })}
                                        className="bg-background w-full rounded border p-2 text-sm"
                                        required
                                    >
                                        <option value="">Seleccionar curso...</option>
                                        {cursos?.map((c) => (
                                            <option key={c.id} value={String(c.id)}>
                                                {c.gestion?.año} - {c.gestion?.etapa} | Paralelo {c.paralelo} ({c.estudiantes_count || 0}/{c.cupos})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Actualizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>



                <Dialog open={modalPreview} onOpenChange={setModalPreview}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Previsualización</DialogTitle>
                            <DialogDescription>
                                Curso destino: {previewData?.curso_label}
                            </DialogDescription>
                        </DialogHeader>

                        {previewData && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="border rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold">{previewData.total}</p>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                    <div className="border rounded-lg p-3 text-center bg-green-50 dark:bg-green-950/30">
                                        <p className="text-2xl font-bold text-green-600">{previewData.validos}</p>
                                        <p className="text-xs text-muted-foreground">Válidos</p>
                                    </div>
                                    <div className="border rounded-lg p-3 text-center bg-red-50 dark:bg-red-950/30">
                                        <p className="text-2xl font-bold text-red-600">{previewData.errores}</p>
                                        <p className="text-xs text-muted-foreground">Errores</p>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <div className="max-h-80 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left">#</th>
                                                    <th className="p-2 text-left">Nombre</th>
                                                    <th className="p-2 text-left">CI</th>
                                                    <th className="p-2 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.filas.map((f) => (
                                                    <tr key={f.fila} className={f.valido ? '' : 'bg-red-50 dark:bg-red-950/20'}>
                                                        <td className="p-2">{f.fila}</td>
                                                        <td className="p-2">{f.apellido_paterno} {f.apellido_materno}, {f.nombre}</td>
                                                        <td className="p-2">{f.ci}</td>
                                                        <td className="p-2 text-xs">
                                                            {f.valido
                                                                ? <span className="text-green-600">✅ OK</span>
                                                                : <span className="text-red-600">❌ {f.errores.join(', ')}</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalPreview(false)}>Cancelar</Button>
                            <Button
                                onClick={handleImportConfirm}
                                disabled={processing || !previewData || previewData.validos === 0}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Confirmar importación ({previewData?.validos || 0})
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={modalImport} onOpenChange={setModalImport}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Importar Estudiantes</DialogTitle>
                            <DialogDescription>Descarga la plantilla, llénala y súbela. El curso se asigna aquí.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleImportPreview} className="space-y-4">
                            <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="text-sm font-medium">1. Descarga la plantilla</p>
                                    <p className="text-muted-foreground text-xs">Formato fijo .xlsx</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <a href="/estudiantes/importar/plantilla">
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar
                                    </a>
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="import-curso">2. Curso destino *</Label>
                                <select
                                    id="import-curso"
                                    value={importCursoId}
                                    onChange={(e) => setImportCursoId(e.target.value)}
                                    className="bg-background w-full rounded border p-2 text-sm"
                                    required
                                >
                                    <option value="">Seleccionar curso...</option>
                                    {cursos?.map((c) => (
                                        <option key={c.id} value={String(c.id)} disabled={(c.estudiantes_count || 0) >= c.cupos}>
                                            {c.gestion?.año} - {c.gestion?.etapa} | Paralelo {c.paralelo} ({c.estudiantes_count || 0}/{c.cupos})
                                            {(c.estudiantes_count || 0) >= c.cupos ? ' — SIN CUPOS' : ''}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.curso_id} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="import-file">3. Archivo Excel *</Label>
                                <Input
                                    id="import-file"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                    required
                                />
                                <InputError message={errors.archivo} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalImport(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing || !importFile || !importCursoId}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Previsualizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Modal Eliminar */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Desactivar</DialogTitle>
                            <DialogDescription>¿Desactivar a "{estudianteSelect ? nombreCompleto(estudianteSelect.user) : ''}"?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Desactivar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
