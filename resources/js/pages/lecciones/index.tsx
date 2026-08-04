import { Head, router } from '@inertiajs/react';
import {
    AlertCircle, BookOpen, CalendarClock, CalendarDays, CheckCircle2,
    ChevronLeft, ChevronRight, Clock, Eye, FileSpreadsheet, FileText,
    LoaderCircle, Pencil, Plus, Sparkles, Trash2, Send, Users,
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
interface Gestion { id: number; año: number; etapa: string; }
interface CursoOption { id: number; paralelo: string; gestion: Gestion; }
interface MateriaOption { id: number; nombre: string; codigo: string; }
interface UserData { id: number; nombre: string; apellido_paterno: string; apellido_materno: string; }
interface DocenteData { id: number; user: UserData; }

interface Leccion {
    id: number; titulo: string; descripcion: string | null;
    fecha_programada: string | null; fecha_entrega: string | null;
    estado: string; materia: MateriaOption; curso: CursoOption; docente: DocenteData;
}

interface Filtros { curso_id: number | null; materia_id: number | null; }

interface Props {
    lecciones: Leccion[];
    cursos: CursoOption[];
    materias: MateriaOption[];
    filtros: Filtros;
    rol: string;
}

type LeccionForm = {
    curso_id: string; materia_id: string; titulo: string;
    descripcion: string; fecha_programada: string; fecha_entrega: string;
    estado: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Lecciones', href: '/lecciones' }];

const initialForm: LeccionForm = {
    curso_id: '', materia_id: '', titulo: '', descripcion: '',
    fecha_programada: '', fecha_entrega: '', estado: 'activo',
};

const MATERIA_COLORS = [
    { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', dot: 'bg-indigo-500', bar: 'bg-indigo-500' },
    { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', dot: 'bg-teal-500', bar: 'bg-teal-500' },
    { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500', bar: 'bg-amber-500' },
    { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500', bar: 'bg-rose-500' },
    { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500', bar: 'bg-violet-500' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-200', dot: 'bg-cyan-500', bar: 'bg-cyan-500' },
];

function colorForMateria(codigo?: string) {
    if (!codigo) return MATERIA_COLORS[0];
    let hash = 0;
    for (let i = 0; i < codigo.length; i++) hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
    return MATERIA_COLORS[Math.abs(hash) % MATERIA_COLORS.length];
}

function iniciales(u?: UserData) {
    if (!u) return '?';
    return `${u.nombre?.[0] ?? ''}${u.apellido_paterno?.[0] ?? ''}`.toUpperCase();
}

function formatoFechaCorta(fecha?: string | null) {
    if (!fecha) return null;
    const d = new Date(`${fecha.split('T')[0]}T00:00:00`);
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
}

function diasRestantes(fecha?: string | null) {
    if (!fecha) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(`${fecha.split('T')[0]}T00:00:00`);
    return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
}

export default function LeccionesIndex({ lecciones, cursos, materias, filtros, rol }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [leccionSelect, setLeccionSelect] = useState<Leccion | null>(null);

    const [form, setForm] = useState<LeccionForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const [filtroCurso, setFiltroCurso] = useState(filtros.curso_id ? String(filtros.curso_id) : '');
    const [filtroMateria, setFiltroMateria] = useState(filtros.materia_id ? String(filtros.materia_id) : '');

    const isDocente = rol === 'docente' || rol === 'admin';
    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const resetForm = () => { setForm(initialForm); setErrors({}); };

    const aplicarFiltros = () => {
        const params = new URLSearchParams();
        if (filtroCurso) params.set('curso_id', filtroCurso);
        if (filtroMateria) params.set('materia_id', filtroMateria);
        router.get(`/lecciones?${params.toString()}`);
    };

    const openCreate = () => {
        resetForm();
        setForm({ ...initialForm, curso_id: filtroCurso, materia_id: filtroMateria });
        setModalCreate(true);
    };

    const openEdit = (leccion: Leccion) => {
        setLeccionSelect(leccion);
        setForm({
            curso_id: String(leccion.curso?.id || ''),
            materia_id: String(leccion.materia?.id || ''),
            titulo: leccion.titulo,
            descripcion: leccion.descripcion || '',
            fecha_programada: leccion.fecha_programada || '',
            fecha_entrega: leccion.fecha_entrega || '',
            estado: leccion.estado,
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (leccion: Leccion) => { setLeccionSelect(leccion); setModalDelete(true); };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault(); setProcessing(true);
        router.post('/lecciones', form, {
            onSuccess: () => { setModalCreate(false); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!leccionSelect) return;
        setProcessing(true);
        router.put(`/lecciones/${leccionSelect.id}`, form, {
            onSuccess: () => { setModalEdit(false); setLeccionSelect(null); resetForm(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        if (!leccionSelect) return;
        router.delete(`/lecciones/${leccionSelect.id}`, {
            onSuccess: () => { setModalDelete(false); setLeccionSelect(null); },
        });
    };

    const stats = useMemo(() => {
        const total = lecciones?.length ?? 0;
        const activas = lecciones?.filter(l => l.estado === 'activo').length ?? 0;
        const proximas = lecciones?.filter(l => {
            const d = diasRestantes(l.fecha_entrega);
            return d !== null && d >= 0 && d <= 7;
        }).length ?? 0;
        return { total, activas, proximas };
    }, [lecciones]);

    const proximasEntregas = useMemo(() => {
        return (lecciones ?? [])
            .filter(l => l.fecha_entrega && (diasRestantes(l.fecha_entrega) ?? -1) >= 0)
            .sort((a, b) => (a.fecha_entrega! > b.fecha_entrega! ? 1 : -1))
            .slice(0, 4);
    }, [lecciones]);

    const hoy = new Date();
    const [mes, setMes] = useState(hoy.getMonth());
    const [año, setAño] = useState(hoy.getFullYear());

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    const getDiasMes = (m: number, a: number) => {
        const primerDia = new Date(a, m, 1).getDay();
        const diasEnMes = new Date(a, m + 1, 0).getDate();
        const dias = [];
        for (let i = 0; i < primerDia; i++) dias.push(null);
        for (let d = 1; d <= diasEnMes; d++) dias.push(d);
        return dias;
    };

    const fechasEntrega = lecciones
        .filter(l => l.fecha_entrega)
        .map(l => l.fecha_entrega?.split('T')[0]);

    const esFechaEntrega = (dia: number) => {
        const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return fechasEntrega.includes(fecha);
    };

    const esHoy = (dia: number) => {
        return dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
    };

    const cambiarMes = (dir: number) => {
        let nuevoMes = mes + dir;
        let nuevoAño = año;
        if (nuevoMes < 0) { nuevoMes = 11; nuevoAño--; }
        if (nuevoMes > 11) { nuevoMes = 0; nuevoAño++; }
        setMes(nuevoMes);
        setAño(nuevoAño);
    };

    const leccionesDelDia = (dia: number) => {
        const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return lecciones.filter(l => l.fecha_entrega?.startsWith(fecha));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lecciones" />
            <div className="mx-auto max-w-[1400px] space-y-6 p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                                <BookOpen className="h-4.5 w-4.5" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Lecciones</h1>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                            Planifica, revisa y da seguimiento a las entregas de tus lecciones.
                        </p>
                    </div>
                    {isDocente && (
                        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" />Nueva lección
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-none bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">Total</p>
                                <p className="mt-1 text-3xl font-bold">{stats.total}</p>
                                <p className="text-xs text-indigo-100">lecciones registradas</p>
                            </div>
                            <BookOpen className="h-9 w-9 text-indigo-200/70" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Activas</p>
                                <p className="mt-1 text-3xl font-bold text-emerald-600">{stats.activas}</p>
                                <p className="text-xs text-neutral-500">en curso ahora</p>
                            </div>
                            <CheckCircle2 className="h-9 w-9 text-emerald-200" />
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="flex items-center justify-between py-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Próximas 7 días</p>
                                <p className="mt-1 text-3xl font-bold text-amber-600">{stats.proximas}</p>
                                <p className="text-xs text-neutral-500">entregas por vencer</p>
                            </div>
                            <CalendarClock className="h-9 w-9 text-amber-200" />
                        </CardContent>
                    </Card>
                </div>

                {/* FILTROS + BOTONES PDF/EXCEL */}
                <Card className="shadow-sm">
                    <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs text-neutral-500">Curso</Label>
                            <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                                <SelectTrigger><SelectValue placeholder="Todos los cursos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Todos</SelectItem>
                                    {(cursos || []).map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.gestion?.año} - {c.gestion?.etapa} | P.{c.paralelo}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                            <Eye className="mr-2 h-4 w-4" />Filtrar
                        </Button>
                        {/* BOTONES PDF/EXCEL */}
                        {isDocente && filtroCurso && filtroMateria && (
                            <>
                                <a href={`/reportes/pdf?curso_id=${filtroCurso}&materia_id=${filtroMateria}`}>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                        <FileText className="mr-1 h-4 w-4" />PDF
                                    </Button>
                                </a>
                                <a href={`/reportes/excel?curso_id=${filtroCurso}&materia_id=${filtroMateria}`}>
                                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                                        <FileSpreadsheet className="mr-1 h-4 w-4" />Excel
                                    </Button>
                                </a>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="shadow-sm lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Listado de lecciones</CardTitle>
                            <span className="text-xs text-neutral-400">{lecciones?.length ?? 0} resultado(s)</span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-neutral-50/70 text-left text-xs uppercase tracking-wide text-neutral-500">
                                            <th className="px-4 py-3 font-medium">Lección</th>
                                            <th className="px-4 py-3 font-medium">Curso</th>
                                            <th className="px-4 py-3 font-medium">Docente</th>
                                            <th className="px-4 py-3 font-medium">Entrega</th>
                                            <th className="px-4 py-3 font-medium">Estado</th>
                                            {!isDocente && <th className="px-4 py-3 text-right font-medium">Entregar</th>}
                                            {isDocente && <th className="px-4 py-3 text-right font-medium">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!lecciones || lecciones.length === 0) && (
                                            <tr>
                                                <td colSpan={isDocente ? 6 : 6} className="py-14 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                                                        <Sparkles className="h-8 w-8" />
                                                        <p className="text-sm font-medium text-neutral-500">Todavía no hay lecciones aquí</p>
                                                        <p className="text-xs">
                                                            {isDocente
                                                                ? 'Crea la primera lección con el botón "Nueva lección".'
                                                                : 'Cuando tu docente publique una lección, aparecerá en esta lista.'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {lecciones?.map((l) => {
                                            const color = colorForMateria(l.materia?.codigo);
                                            const restantes = diasRestantes(l.fecha_entrega);
                                            return (
                                                <tr key={l.id} className="group border-b transition-colors last:border-b-0 hover:bg-neutral-50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-start gap-2.5">
                                                            <span className={`mt-1 h-full min-h-8 w-1 rounded-full ${color.bar}`} />
                                                            <div>
                                                                {isDocente ? (
                                                                    <a href={`/lecciones/${l.id}/entregas`} className="font-medium leading-tight hover:text-indigo-600 transition-colors">
                                                                        {l.titulo}
                                                                    </a>
                                                                ) : (
                                                                    <a href={`/lecciones/${l.id}`} className="font-medium leading-tight hover:text-indigo-600 transition-colors">
                                                                        {l.titulo}
                                                                    </a>
                                                                )}
                                                                <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.ring}`}>
                                                                    {l.materia?.codigo}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-neutral-600">
                                                        {l.curso?.gestion?.año} · P.{l.curso?.paralelo}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {l.docente ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-700">
                                                                    {iniciales(l.docente.user)}
                                                                </span>
                                                                <span className="text-xs text-neutral-600">{nombreCompleto(l.docente.user)}</span>
                                                            </div>
                                                        ) : <span className="text-xs text-neutral-400">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {l.fecha_entrega ? (
                                                            <div className="flex items-center gap-1.5 text-xs">
                                                                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                                                <span className="text-neutral-700">{formatoFechaCorta(l.fecha_entrega)}</span>
                                                                {restantes !== null && restantes >= 0 && restantes <= 3 && (
                                                                    <Badge className="ml-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                                        {restantes === 0 ? 'Hoy' : `${restantes}d`}
                                                                    </Badge>
                                                                )}
                                                                {restantes !== null && restantes < 0 && l.estado === 'activo' && (
                                                                    <Badge className="ml-1 bg-rose-100 text-rose-700 hover:bg-rose-100">Vencida</Badge>
                                                                )}
                                                            </div>
                                                        ) : <span className="text-xs text-neutral-400">Sin fecha</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            l.estado === 'activo'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-neutral-100 text-neutral-500'
                                                        }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${l.estado === 'activo' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                                                            {l.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    {!isDocente && (
                                                        <td className="px-4 py-3 text-right">
                                                            <a href={`/lecciones/${l.id}`}>
                                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                                                    <Send className="mr-1.5 h-3.5 w-3.5" />
                                                                    Entregar
                                                                </Button>
                                                            </a>
                                                        </td>
                                                    )}
                                                    {isDocente && (
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                                                                <a href={`/lecciones/${l.id}/entregas`}>
                                                                    <Button variant="outline" size="icon" title="Ver entregas">
                                                                        <Users className="h-4 w-4 text-blue-500" />
                                                                    </Button>
                                                                </a>
                                                                <Button variant="outline" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                                                                <Button variant="outline" size="icon" onClick={() => openDelete(l)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardContent className="pt-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                                        <CalendarDays className="h-4 w-4 text-indigo-600" />
                                        {meses[mes]} {año}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => cambiarMes(-1)} className="rounded p-1 hover:bg-neutral-100">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => cambiarMes(1)} className="rounded p-1 hover:bg-neutral-100">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-y-1 text-center">
                                    {diasSemana.map((d, i) => (
                                        <div key={i} className="text-[10px] font-medium text-neutral-400">{d}</div>
                                    ))}
                                    {getDiasMes(mes, año).map((dia, i) => (
                                        <div key={i} className="group relative flex justify-center py-0.5">
                                            {dia && (
                                                <div className={`flex h-7 w-7 flex-col items-center justify-center rounded-full text-xs transition-colors
                                                    ${esHoy(dia) ? 'bg-indigo-600 font-semibold text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                                                    {dia}
                                                    {esFechaEntrega(dia) && !esHoy(dia) && (
                                                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-amber-500" />
                                                    )}
                                                </div>
                                            )}
                                            {dia && esFechaEntrega(dia) && (
                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 group-hover:block">
                                                    <div className="max-w-[180px] truncate rounded bg-neutral-800 px-2 py-1 text-[10px] text-white shadow-lg">
                                                        {leccionesDelDia(dia).map(l => l.titulo).join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-4 border-t pt-3 text-[11px] text-neutral-500">
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Entrega</span>
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Hoy</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-1.5 text-sm">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    Próximas entregas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {proximasEntregas.length === 0 && (
                                    <p className="py-4 text-center text-xs text-neutral-400">No hay entregas próximas.</p>
                                )}
                                {proximasEntregas.map((l) => {
                                    const color = colorForMateria(l.materia?.codigo);
                                    const restantes = diasRestantes(l.fecha_entrega);
                                    return (
                                        <div key={l.id} className="flex items-center gap-2.5">
                                            <span className={`h-2 w-2 shrink-0 rounded-full ${color.dot}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium">{l.titulo}</p>
                                                <p className="text-[11px] text-neutral-400">{l.materia?.codigo} · {formatoFechaCorta(l.fecha_entrega)}</p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0 text-[10px]">
                                                {restantes === 0 ? 'Hoy' : `${restantes}d`}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Nueva lección</DialogTitle><DialogDescription>Completa los datos para publicar una nueva lección.</DialogDescription></DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><Label>Curso *</Label>
                                    <Select value={form.curso_id} onValueChange={(v) => setForm({ ...form, curso_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent>{(cursos || []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.gestion?.año} - P.{c.paralelo}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1"><Label>Materia *</Label>
                                    <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent>{(materias || []).map(m => <SelectItem key={m.id} value={String(m.id)}>{m.codigo}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 space-y-1"><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /><InputError message={errors.titulo} /></div>
                                <div className="col-span-2 space-y-1"><Label>Descripción</Label><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full rounded-md border p-2 text-sm" rows={3} /></div>
                                <div className="space-y-1"><Label>Fecha programada</Label><Input type="date" value={form.fecha_programada} onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })} /></div>
                                <div className="space-y-1"><Label>Fecha de entrega</Label><Input type="date" value={form.fecha_entrega} onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })} /></div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">{processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Guardar lección</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Editar lección</DialogTitle><DialogDescription>Actualiza los datos de "{leccionSelect?.titulo}".</DialogDescription></DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1"><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
                                <div className="col-span-2 space-y-1"><Label>Descripción</Label><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full rounded-md border p-2 text-sm" rows={3} /></div>
                                <div className="space-y-1"><Label>Fecha programada</Label><Input type="date" value={form.fecha_programada} onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })} /></div>
                                <div className="space-y-1"><Label>Fecha de entrega</Label><Input type="date" value={form.fecha_entrega} onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })} /></div>
                                <div className="space-y-1"><Label>Estado</Label>
                                    <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="activo">Activo</SelectItem><SelectItem value="inactivo">Inactivo</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">{processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Actualizar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Eliminar lección</DialogTitle><DialogDescription>Esta acción no se puede deshacer. ¿Eliminar "{leccionSelect?.titulo}"?</DialogDescription></DialogHeader>
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