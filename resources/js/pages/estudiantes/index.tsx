import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, LoaderCircle, LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// ======================== TIPOS ========================
interface UserData {
    id: number; nombre: string; apellido_paterno: string; apellido_materno: string;
    ci: string; celular: string; email: string; genero: string | null;
    fecha_nacimiento: string | null; direccion: string | null;
}

interface CursoOption {
    id: number; paralelo: string; cupos: number; estudiantes_count: number;
    gestion: { año: number; etapa: string };
}

interface Estudiante {
    id: number; user_id: number; colegio_procedencia: string | null;
    tipo_inscripcion: string | null; user: UserData;
    cursos: {
        id: number;
        paralelo: string;
        gestion: { año: number; etapa: string }
    }[];
    created_at: string; deleted_at: string | null;
}

interface Props {
    estudiantes: Estudiante[];
    cursos: CursoOption[];
}

type EstudianteForm = {
    nombre: string; apellido_paterno: string; apellido_materno: string;
    ci: string; celular: string; email: string; password: string;
    colegio_procedencia: string; tipo_inscripcion: string;
    genero: string; fecha_nacimiento: string; direccion: string;
    curso_id: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Estudiantes', href: '/estudiantes' }];

const initialForm: EstudianteForm = {
    nombre: '', apellido_paterno: '', apellido_materno: '',
    ci: '', celular: '', email: '', password: '',
    colegio_procedencia: '', tipo_inscripcion: '',
    genero: '', fecha_nacimiento: '', direccion: '',
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

    const resetForm = () => { setForm(initialForm); setErrors({}); };

    const openCreate = () => { resetForm(); setModalCreate(true); };

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

    const openDelete = (e: Estudiante) => { setEstudianteSelect(e); setModalDelete(true); };
    const openReset = (e: Estudiante) => { setEstudianteSelect(e); setModalReset(true); };

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault(); setProcessing(true);
        router.post('/estudiantes', form, {
            onSuccess: () => {
                setModalCreate(false);
                toast.success('Estudiante registrado correctamente');
                resetForm();
                setProcessing(false);
            },
            onError: (err) => { setErrors(err); setProcessing(false); },
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
            onError: (err) => { setErrors(err); setProcessing(false); },
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
        router.post(`/estudiantes/${estudianteSelect.id}/reset-password`, {}, {
            onSuccess: () => {
                setModalReset(false);
                toast.success('Contraseña reseteada correctamente');
                setEstudianteSelect(null);
            },
            onError: () => toast.error('No se pudo resetear la contraseña'),
        });
    };

    const tipoBadge = (tipo: string | null) => {
        const map: Record<string, string> = { regular: 'Regular', dispensacion: 'Dispensación', cursillo: 'Cursillo' };
        return tipo ? map[tipo] || tipo : 'No definido';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estudiantes" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Estudiantes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/estudiantes/eliminados"><Archive className="h-4 w-4 mr-2" />Ver Eliminados</Link></Button>
                        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo Estudiante</Button>
                    </div>
                </div>

                {/* Tabla */}
                <Card>
                    <CardHeader><CardTitle>Listado de Estudiantes Activos</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b text-left">
                                    <th className="py-3 px-4">Nombre</th><th className="py-3 px-4">CI</th>
                                    <th className="py-3 px-4">Celular</th><th className="py-3 px-4">Curso</th>
                                    <th className="py-3 px-4">Tipo</th><th className="py-3 px-4 text-right">Acciones</th>
                                </tr></thead>
                                <tbody>
                                    {(!estudiantes || estudiantes.length === 0) && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No hay estudiantes</td></tr>}
                                    {estudiantes?.map((e) => (
                                        <tr key={e.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">{nombreCompleto(e.user)}</td>
                                            <td className="py-3 px-4">{e.user.ci}</td>
                                            <td className="py-3 px-4">{e.user.celular}</td>
                                            <td className="py-3 px-4 text-xs">
                                                {e.cursos?.[0]?.gestion ? `${e.cursos[0].gestion.año} - ${e.cursos[0].gestion.etapa} | P.${e.cursos[0].paralelo}` : 'Sin curso'}
                                            </td>
                                            <td className="py-3 px-4">{tipoBadge(e.tipo_inscripcion)}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild><a href={`/estudiantes/${e.id}`}><Eye className="h-4 w-4" /></a></Button>
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="icon" onClick={() => openReset(e)} title="Resetear contraseña"><LockKeyhole className="h-4 w-4 text-amber-500" /></Button>
                                                    <Button variant="outline" size="icon" onClick={() => openDelete(e)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
                                <div className="bg-amber-100 dark:bg-amber-950/50 p-2 rounded-full"><LockKeyhole className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div>
                                <div><DialogTitle>¿Resetear Contraseña?</DialogTitle><DialogDescription>Se generará una nueva contraseña.</DialogDescription></div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                                <p className="font-medium text-amber-800 dark:text-amber-300">{estudianteSelect ? nombreCompleto(estudianteSelect.user) : ''}</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Nueva: <strong>{estudianteSelect ? `${estudianteSelect.user.apellido_paterno.toLowerCase()}_${estudianteSelect.user.ci}` : ''}</strong></p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setModalReset(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleResetPassword}>Resetear</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Crear */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Nuevo Estudiante</DialogTitle><DialogDescription>Completa los datos. La contraseña se genera automáticamente.</DialogDescription></DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><Label htmlFor="nombre">Nombre *</Label><Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /><InputError message={errors.nombre} /></div>
                                <div className="space-y-1"><Label htmlFor="apellido_paterno">Ap. Paterno *</Label><Input id="apellido_paterno" value={form.apellido_paterno} onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })} required /><InputError message={errors.apellido_paterno} /></div>
                                <div className="space-y-1"><Label htmlFor="apellido_materno">Ap. Materno *</Label><Input id="apellido_materno" value={form.apellido_materno} onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })} required /><InputError message={errors.apellido_materno} /></div>
                                <div className="space-y-1"><Label htmlFor="ci">CI *</Label><Input id="ci" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required /><InputError message={errors.ci} /></div>
                                <div className="space-y-1"><Label htmlFor="celular">Celular *</Label><Input id="celular" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} required /><InputError message={errors.celular} /></div>
                                <div className="space-y-1"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><InputError message={errors.email} /></div>
                                <div className="space-y-1">
                                    <Label htmlFor="genero">Género</Label>
                                    <select id="genero" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} className="border rounded p-2 w-full text-sm bg-background">
                                        <option value="">Seleccionar...</option><option value="M">M</option><option value="F">F</option><option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-1"><Label htmlFor="fecha_nacimiento">Fecha Nac.</Label><Input id="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} /></div>
                                <div className="space-y-1 col-span-2"><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Sucre B..." /></div>
                                <div className="space-y-1"><Label htmlFor="colegio_procedencia">Colegio</Label><Input id="colegio_procedencia" value={form.colegio_procedencia} onChange={(e) => setForm({ ...form, colegio_procedencia: e.target.value })} placeholder="U.E. San Andrés" /></div>
                                <div className="space-y-1">
                                    <Label htmlFor="tipo_inscripcion">Tipo Inscripción</Label>
                                    <select id="tipo_inscripcion" value={form.tipo_inscripcion} onChange={(e) => setForm({ ...form, tipo_inscripcion: e.target.value })} className="border rounded p-2 w-full text-sm bg-background">
                                        <option value="">Seleccionar...</option><option value="regular">Regular</option><option value="dispensacion">Dispensación</option><option value="cursillo">Cursillo</option>
                                    </select>
                                </div>
                                {/* CURSO */}
                                <div className="space-y-1 col-span-2">
                                    <Label htmlFor="curso_id">Asignar a Curso *</Label>
                                    <select id="curso_id" value={form.curso_id} onChange={(e) => setForm({ ...form, curso_id: e.target.value })} className="border rounded p-2 w-full text-sm bg-background" required>
                                        <option value="">Seleccionar curso...</option>
                                        {cursos?.map((c) => (
                                            <option key={c.id} value={String(c.id)}>{c.gestion?.año} - {c.gestion?.etapa} | Paralelo {c.paralelo} ({c.estudiantes_count || 0}/{c.cupos})</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.curso_id} />
                                </div>
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
                        <DialogHeader><DialogTitle>Editar Estudiante</DialogTitle></DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><Label htmlFor="edit-nombre">Nombre *</Label><Input id="edit-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
                                <div className="space-y-1"><Label htmlFor="edit-ap">Ap. Paterno *</Label><Input id="edit-ap" value={form.apellido_paterno} onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })} required /></div>
                                <div className="space-y-1"><Label htmlFor="edit-am">Ap. Materno *</Label><Input id="edit-am" value={form.apellido_materno} onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })} required /></div>
                                <div className="space-y-1"><Label htmlFor="edit-ci">CI *</Label><Input id="edit-ci" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required /></div>
                                <div className="space-y-1"><Label htmlFor="edit-celular">Celular *</Label><Input id="edit-celular" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} required /></div>
                                <div className="space-y-1"><Label htmlFor="edit-email">Email *</Label><Input id="edit-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                                <div className="space-y-1"><Label htmlFor="edit-password">Contraseña</Label><Input id="edit-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Vacío = no cambiar" /></div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-genero">Género</Label>
                                    <select id="edit-genero" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} className="border rounded p-2 w-full text-sm bg-background">
                                        <option value="">Seleccionar...</option><option value="M">M</option><option value="F">F</option><option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-1"><Label htmlFor="edit-fecha">Fecha Nac.</Label><Input id="edit-fecha" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} /></div>
                                <div className="space-y-1 col-span-2"><Label htmlFor="edit-direccion">Dirección</Label><Input id="edit-direccion" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
                                <div className="space-y-1"><Label htmlFor="edit-colegio">Colegio</Label><Input id="edit-colegio" value={form.colegio_procedencia} onChange={(e) => setForm({ ...form, colegio_procedencia: e.target.value })} /></div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-tipo">Tipo</Label>
                                    <select id="edit-tipo" value={form.tipo_inscripcion} onChange={(e) => setForm({ ...form, tipo_inscripcion: e.target.value })} className="border rounded p-2 w-full text-sm bg-background">
                                        <option value="">Seleccionar...</option><option value="regular">Regular</option><option value="dispensacion">Dispensación</option><option value="cursillo">Cursillo</option>
                                    </select>
                                </div>
                                {/* CURSO */}
                                <div className="space-y-1 col-span-2">
                                    <Label htmlFor="edit-curso">Curso *</Label>
                                    <select id="edit-curso" value={form.curso_id} onChange={(e) => setForm({ ...form, curso_id: e.target.value })} className="border rounded p-2 w-full text-sm bg-background" required>
                                        <option value="">Seleccionar curso...</option>
                                        {cursos?.map((c) => (
                                            <option key={c.id} value={String(c.id)}>{c.gestion?.año} - {c.gestion?.etapa} | Paralelo {c.paralelo} ({c.estudiantes_count || 0}/{c.cupos})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
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
                        <DialogHeader><DialogTitle>Desactivar</DialogTitle><DialogDescription>¿Desactivar a "{estudianteSelect ? nombreCompleto(estudianteSelect.user) : ''}"?</DialogDescription></DialogHeader>
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