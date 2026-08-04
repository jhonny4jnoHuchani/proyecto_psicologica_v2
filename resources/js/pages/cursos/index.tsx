import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Archive, Eye, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// ======================== TIPOS ========================
interface Gestion { id: number; año: number; etapa: string; }
interface Materia { id: number; nombre: string; codigo: string; }
interface UserData { id: number; nombre: string; apellido_paterno: string; apellido_materno: string; }
interface Docente { id: number; especialidad: string | null; user: UserData; }
interface DocenteOcupado { docente_id: number; materia_id: number; paralelo: string; materia_nombre: string; }

interface Curso {
    id: number; gestion_id: number; paralelo: string; estado: string;
    cupos: number; turno: string; gestion: Gestion;
    materias: { id: number; nombre: string; codigo: string; pivot: { docente_id: number } }[];
    estudiantes: { id: number }[];
    deleted_at: string | null;
}

interface Props { cursos: Curso[]; gestions: Gestion[]; materias: Materia[]; docentes: Docente[]; docentesOcupados: DocenteOcupado[]; }

interface MateriaCheck { materia_id: number; checked: boolean; docente_id: string; }

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cursos', href: '/cursos' }];

export default function CursosIndex({ cursos, gestions, materias, docentes, docentesOcupados }: Props) {
    const [modalCurso, setModalCurso] = useState(false);
    const [step, setStep] = useState(1);
    const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

    const [gestionId, setGestionId] = useState('');
    const [paralelo, setParalelo] = useState('');
    const [turno, setTurno] = useState('mañana');
    const [cupos, setCupos] = useState('30');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const [materiasCheck, setMateriasCheck] = useState<MateriaCheck[]>([]);

    const [modalDelete, setModalDelete] = useState(false);
    const [cursoSelect, setCursoSelect] = useState<Curso | null>(null);

    // ======================== HELPERS ========================
    const resetCursoForm = () => {
        setGestionId(''); setParalelo(''); setTurno('mañana'); setCupos('30');
        setMateriasCheck((materias || []).map(m => ({ materia_id: m.id, checked: false, docente_id: '' })));
        setErrors({}); setStep(1);
    };

    const openCreate = () => {
        setEditingCurso(null);
        resetCursoForm();
        setModalCurso(true);
    };

    const openEdit = (curso: Curso) => {
        setEditingCurso(curso);
        setGestionId(String(curso.gestion_id));
        setParalelo(curso.paralelo);
        setTurno(curso.turno);
        setCupos(String(curso.cupos));

        const asignadas = (materias || []).map(m => {
            const encontrada = curso.materias.find(cm => cm.id === m.id);
            return {
                materia_id: m.id,
                checked: !!encontrada,
                docente_id: encontrada ? String(encontrada.pivot.docente_id || 'none') : 'none',
            };
        });
        setMateriasCheck(asignadas);
        setErrors({});
        setStep(1);
        setModalCurso(true);
    };

    const openDelete = (curso: Curso) => { setCursoSelect(curso); setModalDelete(true); };

    const toggleMateria = (materiaId: number) => {
        setMateriasCheck(prev => prev.map(m => m.materia_id === materiaId ? { ...m, checked: !m.checked, docente_id: !m.checked ? 'none' : m.docente_id } : m));
    };

    const setDocente = (materiaId: number, docenteId: string) => {
        setMateriasCheck(prev => prev.map(m => m.materia_id === materiaId ? { ...m, docente_id: docenteId } : m));
    };

    const getDocenteOcupado = (docenteId: string, materiaId: number) => {
        if (!docenteId || docenteId === 'none') return null;
        return docentesOcupados.find(o => o.docente_id === Number(docenteId) && o.materia_id === materiaId);
    };

    const materiasSeleccionadas = materiasCheck.filter(m => m.checked);

    const handleNextStep = () => {
        if (!gestionId || !paralelo || !turno || !cupos) {
            setErrors({ general: 'Completa todos los campos' }); return;
        }
        setErrors({}); setStep(2);
    };

    // ======================== SUBMIT ========================
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (materiasSeleccionadas.length === 0) {
            setErrors({ materias: 'Selecciona al menos una materia' }); return;
        }
        setProcessing(true);

        const payload: {
            gestion_id: string; paralelo: string; turno: string; cupos: string; estado?: string;
            materias: { materia_id: number; docente_id: string | null }[];
        } = {
            gestion_id: gestionId, paralelo, turno, cupos,
            materias: materiasSeleccionadas.map(m => ({
                materia_id: m.materia_id,
                docente_id: m.docente_id && m.docente_id !== 'none' ? m.docente_id : null,
            })),
        };

        if (editingCurso) {
            payload.estado = editingCurso.estado;
            router.put(`/cursos/${editingCurso.id}`, payload, {
                onSuccess: () => {
                    setModalCurso(false);
                    setProcessing(false);
                    toast.success('Curso actualizado correctamente');
                },
                onError: (err) => { setErrors(err); setProcessing(false); },
            });
        } else {
            router.post('/cursos', payload, {
                onSuccess: () => {
                    setModalCurso(false);
                    setProcessing(false);
                    toast.success('Curso creado correctamente');
                },
                onError: (err) => { setErrors(err); setProcessing(false); },
            });
        }
    };

    const handleDelete = () => {
        if (!cursoSelect) return;
        router.delete(`/cursos/${cursoSelect.id}`, {
            onSuccess: () => {
                setModalDelete(false);
                toast.success('Curso desactivado');
            },
        });
    };

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    // ======================== RENDER ========================
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Cursos</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/cursos/eliminados"><Archive className="h-4 w-4 mr-2" />Ver Eliminados</Link></Button>
                        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo Curso</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Listado de Cursos</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b text-left">
                                    <th className="py-3 px-4">Gestión</th><th className="py-3 px-4">Paralelo</th><th className="py-3 px-4">Turno</th>
                                    <th className="py-3 px-4">Materias</th><th className="py-3 px-4">Estudiantes</th>
                                    <th className="py-3 px-4">Estado</th><th className="py-3 px-4 text-right">Acciones</th>
                                </tr></thead>
                                <tbody>
                                    {(!cursos || cursos.length === 0) && (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-muted-foreground">No hay cursos registrados</td>
                                        </tr>
                                    )}
                                    {cursos?.map((curso) => (
                                        <tr key={curso.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">{curso.gestion?.año} - {curso.gestion?.etapa}</td>
                                            <td className="py-3 px-4 font-medium">{curso.paralelo}</td>
                                            <td className="py-3 px-4 capitalize">{curso.turno}</td>
                                            <td className="py-3 px-4">{curso.materias?.length || 0}/6</td>
                                            <td className="py-3 px-4">{curso.estudiantes?.length || 0}/{curso.cupos}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={curso.estado === 'activo' ? 'default' : curso.estado === 'completado' ? 'secondary' : 'outline'}>
                                                    {curso.estado}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" asChild><a href={`/cursos/${curso.id}`}><Eye className="h-4 w-4" /></a></Button>
                                                    <Button variant="outline" size="icon" onClick={() => openEdit(curso)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="outline" size="icon" onClick={() => openDelete(curso)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* MODAL CURSO (2 PASOS) */}
                <Dialog open={modalCurso} onOpenChange={(open) => { if (!open) setModalCurso(false); }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>{editingCurso ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
                            <DialogDescription>{step === 1 ? 'Datos del curso' : 'Asignar materias y docentes'}</DialogDescription>
                        </DialogHeader>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>Gestión *</Label>
                                        <Select value={gestionId} onValueChange={setGestionId}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar gestión" /></SelectTrigger>
                                            <SelectContent>
                                                {(gestions || []).map(g => <SelectItem key={g.id} value={String(g.id)}>{g.año} - {g.etapa}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1"><Label>Paralelo *</Label><Input value={paralelo} onChange={(e) => setParalelo(e.target.value)} placeholder="A" /></div>
                                    <div className="space-y-1">
                                        <Label>Turno *</Label>
                                        <Select value={turno} onValueChange={setTurno}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mañana">Mañana</SelectItem>
                                                <SelectItem value="tarde">Tarde</SelectItem>
                                                <SelectItem value="noche">Noche</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1"><Label>Cupos *</Label><Input type="number" value={cupos} onChange={(e) => setCupos(e.target.value)} /></div>
                                </div>
                                {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setModalCurso(false)}>Cancelar</Button>
                                    <Button onClick={handleNextStep}>Siguiente: Materias y Docentes</Button>
                                </DialogFooter>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    {(materias || []).map((materia) => {
                                        const check = materiasCheck.find(mc => mc.materia_id === materia.id);
                                        const ocupado = getDocenteOcupado(check?.docente_id || 'none', materia.id);
                                        return (
                                            <div key={materia.id} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox id={`m-${materia.id}`} checked={check?.checked || false} onCheckedChange={() => toggleMateria(materia.id)} />
                                                    <Label htmlFor={`m-${materia.id}`} className="cursor-pointer font-medium">{materia.codigo} - {materia.nombre}</Label>
                                                </div>
                                                {check?.checked && (
                                                    <div className="ml-8 space-y-2">
                                                        <Select value={check.docente_id || 'none'} onValueChange={(v) => setDocente(materia.id, v)}>
                                                            <SelectTrigger><SelectValue placeholder="Asignar docente (opcional)" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">Sin docente</SelectItem>
                                                                {(docentes || []).map(d => <SelectItem key={d.id} value={String(d.id)}>{nombreCompleto(d.user)}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        {ocupado && (
                                                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-950/40 p-2 rounded">
                                                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                                                Ya asignado en Paralelo <strong>{ocupado.paralelo}</strong> para {ocupado.materia_nombre}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.materias && <p className="text-red-500 text-sm">{errors.materias}</p>}
                                <DialogFooter className="gap-2">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                                    <Button type="button" variant="outline" onClick={() => setModalCurso(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}{editingCurso ? 'Actualizar' : 'Crear Curso'}</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Modal Eliminar */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent aria-describedby={undefined}>
                        <DialogHeader><DialogTitle>Desactivar Curso</DialogTitle><DialogDescription>¿Desactivar "{cursoSelect?.gestion?.año} - Paralelo {cursoSelect?.paralelo}"?</DialogDescription></DialogHeader>
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