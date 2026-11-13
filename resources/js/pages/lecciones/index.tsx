import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    BookOpen,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    ExternalLink,
    Eye,
    FileCheck,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    LoaderCircle,
    Mail,
    MessageCircle,
    Paperclip,
    Pencil,
    Phone,
    Plus,
    Printer,
    RotateCcw,
    Send,
    Sparkles,
    Trash2,
    User,
    Users,
    X,
    Youtube,
} from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { PageHeaderBanner } from '@/components/page-header-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUploadDropzone } from '@/components/ui/file-upload-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatoFecha, formatoFechaHora, toDatetimeLocal } from '@/lib/formatters';
import { type BreadcrumbItem } from '@/types';

// ======================== TIPOS ========================
interface Gestion {
    id: number;
    año: number;
    etapa: string;
}
interface CursoOption {
    id: number;
    paralelo: string;
    gestion: Gestion;
}
interface MateriaOption {
    id: number;
    nombre: string;
    codigo: string;
}
interface UserData {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
}
interface DocenteData {
    id: number;
    user: UserData;
}

interface Tema {
    id: number;
    materia_id: number;
    nombre: string;
    orden: number;
    paginas_libro: string | null;
    estado: string;
}

interface EntregaEstudiante {
    id: number;
    estado_calificacion: string;
    calificacion?: {
        nota: number;
    } | null;
    refuerzo?: {
        id: number;
        completado: boolean;
    } | null;
}

interface Recurso {
    id: number;
    materia_id: number;
    tema_id: number | null;
    curso_id: number | null;
    docente_id: number;
    titulo: string;
    descripcion?: string | null;
    tipo: 'pdf' | 'enlace' | 'documento';
    archivo?: string | null;
    enlace_url?: string | null;
    orden: number;
    estado: string;
    created_at: string;
}

interface Leccion {
    id: number;
    hash_id?: string;
    titulo: string;
    tema_id: number | null;
    temario: Tema | null;
    descripcion: string | null;
    fecha_programada: string | null;
    fecha_entrega: string | null;
    imagen?: string | null;
    estado: string;
    materia: MateriaOption;
    curso: CursoOption;
    docente: DocenteData;
    entregas?: EntregaEstudiante[];
}

interface Filtros {
    curso_id: number | null;
    materia_id: number | null;
}

interface Recurso {
    id: number;
    materia_id: number;
    tema_id: number | null;
    curso_id: number | null;
    docente_id?: number | null;
    titulo: string;
    descripcion: string | null;
    tipo: 'pdf' | 'enlace' | 'documento';
    archivo: string | null;
    enlace_url: string | null;
    estado?: string;
    created_at?: string;
}

interface EstudianteLeccionItem {
    id: number;
    user_id: number;
    colegio_procedencia: string | null;
    tipo_inscripcion: string | null;
    user: {
        id: number;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        ci: string;
        expedido: string | null;
        celular: string | null;
        email: string;
        genero: string | null;
        fecha_nacimiento: string | null;
        direccion: string | null;
    };
    cursos: {
        id: number;
        paralelo: string;
        turno?: string;
        gestion?: {
            año: number;
            etapa: string;
        };
        pivot?: {
            fecha_inscripcion: string;
            estado: 'activo' | 'abandonado' | 'completado';
        };
    }[];
}

interface Props {
    lecciones: Leccion[];
    recursos?: Recurso[];
    cursos: CursoOption[];
    materias: MateriaOption[];
    temas: Tema[];
    estudiantes?: EstudianteLeccionItem[];
    filtros: Filtros & { tab?: string | null };
    rol: string;
}

type LeccionForm = {
    curso_id: string;
    materia_id: string;
    tema_id: string;
    titulo: string;
    descripcion: string;
    fecha_programada: string;
    fecha_entrega: string;
    estado: string;
    [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Lecciones', href: '/lecciones' }];

const initialForm: LeccionForm = {
    curso_id: '',
    materia_id: '',
    tema_id: '',
    titulo: '',
    descripcion: '',
    fecha_programada: '',
    fecha_entrega: '',
    estado: 'activo',
};

const MATERIA_COLORS = [
    {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        ring: 'ring-indigo-200',
        dot: 'bg-indigo-500',
        bar: 'bg-indigo-500',
    },
    {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        ring: 'ring-teal-200',
        dot: 'bg-teal-500',
        bar: 'bg-teal-500',
    },
    {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        ring: 'ring-amber-200',
        dot: 'bg-amber-500',
        bar: 'bg-amber-500',
    },
    {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        ring: 'ring-rose-200',
        dot: 'bg-rose-500',
        bar: 'bg-rose-500',
    },
    {
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        ring: 'ring-violet-200',
        dot: 'bg-violet-500',
        bar: 'bg-violet-500',
    },
    {
        bg: 'bg-cyan-50',
        text: 'text-cyan-700',
        ring: 'ring-cyan-200',
        dot: 'bg-cyan-500',
        bar: 'bg-cyan-500',
    },
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
    return formatoFechaHora(fecha);
}

function diasRestantes(fecha?: string | null) {
    if (!fecha) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(`${fecha.split('T')[0]}T00:00:00`);
    return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
}

export default function LeccionesIndex({ lecciones, recursos = [], cursos, materias, temas, estudiantes = [], filtros, rol }: Props) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [leccionSelect, setLeccionSelect] = useState<Leccion | null>(null);

    // Archivo adjunto (PDF de la guía)
    const [archivo, setArchivo] = useState<File | null>(null);
    const [eliminarArchivo, setEliminarArchivo] = useState(false);

    // Modal para publicar recurso de estudio
    const [modalNuevoRecurso, setModalNuevoRecurso] = useState(false);
    const [recursoForm, setRecursoForm] = useState<{
        materia_id: number;
        tema_id: number | null;
        curso_id: number | null;
        titulo: string;
        descripcion: string;
        tipo: 'pdf' | 'enlace' | 'documento';
        enlace_url: string;
        archivo: File | null;
    }>({
        materia_id: 0,
        tema_id: null,
        curso_id: null,
        titulo: '',
        descripcion: '',
        tipo: 'pdf',
        enlace_url: '',
        archivo: null,
    });
    const [recursoErrors, setRecursoErrors] = useState<Record<string, string>>({});
    const [processingRecurso, setProcessingRecurso] = useState(false);

    const openCreateRecursoInTema = (materiaId: number, temaId: number | null) => {
        const curId = filtroCurso && filtroCurso !== 'none' ? Number(filtroCurso) : null;
        setRecursoForm({
            materia_id: materiaId,
            tema_id: temaId,
            curso_id: curId,
            titulo: '',
            descripcion: '',
            tipo: 'pdf',
            enlace_url: '',
            archivo: null,
        });
        setRecursoErrors({});
        setModalNuevoRecurso(true);
    };

    const handleSaveRecurso: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessingRecurso(true);

        const payload: Record<string, any> = {
            materia_id: recursoForm.materia_id,
            tema_id: recursoForm.tema_id,
            curso_id: recursoForm.curso_id,
            titulo: recursoForm.titulo,
            descripcion: recursoForm.descripcion,
            tipo: recursoForm.tipo,
            enlace_url: recursoForm.tipo === 'enlace' ? recursoForm.enlace_url : null,
        };

        if (recursoForm.tipo !== 'enlace' && recursoForm.archivo) {
            payload.archivo = recursoForm.archivo;
        }

        router.post('/recursos', payload, {
            forceFormData: true,
            onSuccess: () => {
                setModalNuevoRecurso(false);
                setProcessingRecurso(false);
                setRecursoErrors({});
            },
            onError: (err) => {
                setRecursoErrors(err);
                setProcessingRecurso(false);
            },
        });
    };

    const handleDeleteRecurso = (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este recurso de estudio?')) return;
        router.delete(`/recursos/${id}`);
    };

    // Modal rápido para crear tema
    const [modalNuevoTema, setModalNuevoTema] = useState(false);
    const [temaForm, setTemaForm] = useState({
        materia_id: 0,
        nombre: '',
        orden: '',
        paginas_libro: '',
        resumen: '',
        estado: 'programado',
    });
    const [temaErrors, setTemaErrors] = useState<Record<string, string>>({});
    const [processingTema, setProcessingTema] = useState(false);

    // Asistente IA para creación y resumen de tema
    const [modoCreacionTema, setModoCreacionTema] = useState<'pdf' | 'manual'>('manual');
    const [temaPdfFile, setTemaPdfFile] = useState<File | null>(null);
    const [temaTextoBruto, setTemaTextoBruto] = useState<string>('');
    const [generandoResumenIA, setGenerandoResumenIA] = useState<boolean>(false);
    const [iaMensajeError, setIaMensajeError] = useState<string | null>(null);
    const [iaMensajeExito, setIaMensajeExito] = useState<string | null>(null);

    const [form, setForm] = useState<LeccionForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const isDocente = rol === 'docente' || rol === 'admin';
    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    // Acordeón: set de temas abiertos (para estudiantes se abren por defecto los que tienen tareas)
    const [temasAbiertos, setTemasAbiertos] = useState<Record<string, boolean>>(() => {
        if (!isDocente) {
            const inicial: Record<string, boolean> = { 'sin-tema': true };
            temas.forEach((t) => {
                inicial[String(t.id)] = true;
            });
            return inicial;
        }
        return {};
    });

    const [filtroCurso, setFiltroCurso] = useState(filtros.curso_id ? String(filtros.curso_id) : '');
    const [filtroMateria, setFiltroMateria] = useState(filtros.materia_id ? String(filtros.materia_id) : '');

    // Apartado activo: "lecciones" o "estudiantes"
    const [apartadoActivo, setApartadoActivo] = useState<'lecciones' | 'estudiantes'>(filtros.tab === 'estudiantes' ? 'estudiantes' : 'lecciones');
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
    const [filtroEstadoEstudiante, setFiltroEstadoEstudiante] = useState('todos');
    const [estudianteModal, setEstudianteModal] = useState<EstudianteLeccionItem | null>(null);

    // Helpers para nómina de estudiantes
    const formatNombreEstudiante = (u?: any) => {
        if (!u) return 'Sin datos';
        const paterno = u.apellido_paterno || '';
        const materno = u.apellido_materno || '';
        const nombres = u.nombre || '';
        return `${paterno} ${materno}, ${nombres}`.trim();
    };

    const getInicialesEstudiante = (u?: any) => {
        if (!u) return 'ES';
        const p = u.apellido_paterno ? u.apellido_paterno.charAt(0) : '';
        const n = u.nombre ? u.nombre.charAt(0) : '';
        return (p + n).toUpperCase() || 'ES';
    };

    const formatTipoInscripcion = (tipo: string | null) => {
        const map: Record<string, string> = {
            preuniversitario: 'Preuniversitario',
            regular: 'Regular',
            dispensacion: 'Prueba de Suficiencia',
            cursillo: 'Curso Preuniversitario',
        };
        return tipo ? map[tipo] || tipo : 'Regular';
    };

    const getEstadoBadgeEstudiante = (estado?: string | null) => {
        switch (estado) {
            case 'activo':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Activo
                    </span>
                );
            case 'abandonado':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Abandonado
                    </span>
                );
            case 'completado':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                        <CheckCircle2 className="h-3 w-3 text-sky-500" />
                        Completado
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {estado || 'Inscrito'}
                    </span>
                );
        }
    };

    const cursoActual = useMemo(() => {
        if (!filtroCurso || filtroCurso === 'none') return null;
        return cursos.find((c) => String(c.id) === String(filtroCurso)) || null;
    }, [cursos, filtroCurso]);

    const materiaActual = useMemo(() => {
        if (!filtroMateria || filtroMateria === 'none') return null;
        return materias.find((m) => String(m.id) === String(filtroMateria)) || null;
    }, [materias, filtroMateria]);

    // Filtrado reactivo de estudiantes
    const estudiantesFiltrados = useMemo(() => {
        let result = estudiantes || [];

        if (filtroEstadoEstudiante !== 'todos') {
            result = result.filter((e) => (e.cursos?.[0]?.pivot?.estado || 'activo') === filtroEstadoEstudiante);
        }

        if (busquedaEstudiante.trim()) {
            const q = busquedaEstudiante.toLowerCase().trim();
            result = result.filter((e) => {
                const u = e.user;
                if (!u) return false;
                const nombreComp = `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}`.toLowerCase();
                const ci = (u.ci || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const cel = (u.celular || '').toLowerCase();
                return nombreComp.includes(q) || ci.includes(q) || email.includes(q) || cel.includes(q);
            });
        }

        return result;
    }, [estudiantes, filtroEstadoEstudiante, busquedaEstudiante]);

    // Filtrado instantáneo (al momento): al cambiar curso o materia se filtra sin pulsar botón
    const handleCursoChange = (val: string) => {
        const nuevoCurso = val === 'none' ? '' : val;
        setFiltroCurso(nuevoCurso);
        const params = new URLSearchParams();
        if (nuevoCurso) params.set('curso_id', nuevoCurso);
        if (filtroMateria && filtroMateria !== 'none') params.set('materia_id', filtroMateria);
        if (apartadoActivo === 'estudiantes') params.set('tab', 'estudiantes');
        router.get(`/lecciones?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    const handleMateriaChange = (val: string) => {
        const nuevaMateria = val === 'none' ? '' : val;
        setFiltroMateria(nuevaMateria);
        const params = new URLSearchParams();
        if (filtroCurso && filtroCurso !== 'none') params.set('curso_id', filtroCurso);
        if (nuevaMateria) params.set('materia_id', nuevaMateria);
        if (apartadoActivo === 'estudiantes') params.set('tab', 'estudiantes');
        router.get(`/lecciones?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    const resetForm = () => {
        setForm(initialForm);
        setArchivo(null);
        setEliminarArchivo(false);
        setErrors({});
    };

    const toggleTema = (key: string) => {
        setTemasAbiertos((prev) => {
            const isCurrentlyOpen = !!prev[key];
            // Si ya está abierto, lo minimiza. Si se despliega, minimiza los demás para enfocar los detalles de este tema
            if (isCurrentlyOpen) {
                return { ...prev, [key]: false };
            }
            return { [key]: true };
        });
    };

    const [todosExpandidos, setTodosExpandidos] = useState(false);
    const toggleTodosTemas = () => {
        const nuevo = !todosExpandidos;
        setTodosExpandidos(nuevo);
        const nuevoMapa: Record<string, boolean> = {};
        temasFiltrados.forEach((t) => {
            nuevoMapa[String(t.id)] = nuevo;
        });
        nuevoMapa['sin-tema'] = nuevo;
        setTemasAbiertos(nuevoMapa);
    };

    const aplicarFiltros = () => {
        const params = new URLSearchParams();
        if (filtroCurso && filtroCurso !== 'none') params.set('curso_id', filtroCurso);
        if (filtroMateria && filtroMateria !== 'none') params.set('materia_id', filtroMateria);
        router.get(`/lecciones?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    // Abre el modal para crear con valores precargados (curso, materia, tema)
    const openCreateInTema = (materiaId: number, temaId: number | null) => {
        resetForm();
        setForm({
            ...initialForm,
            curso_id: filtroCurso || '',
            materia_id: String(materiaId),
            tema_id: temaId ? String(temaId) : '',
        });
        setModalCreate(true);
    };

    const openEdit = (leccion: Leccion) => {
        setLeccionSelect(leccion);
        setArchivo(null);
        setEliminarArchivo(false);
        setForm({
            curso_id: String(leccion.curso?.id || ''),
            materia_id: String(leccion.materia?.id || ''),
            tema_id: String(leccion.tema_id || ''),
            titulo: leccion.titulo,
            descripcion: leccion.descripcion || '',
            fecha_programada: toDatetimeLocal(leccion.fecha_programada),
            fecha_entrega: toDatetimeLocal(leccion.fecha_entrega),
            estado: leccion.estado,
        });
        setErrors({});
        setModalEdit(true);
    };

    const openDelete = (leccion: Leccion) => {
        setLeccionSelect(leccion);
        setModalDelete(true);
    };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const data = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key]) data.append(key, form[key]);
        });
        if (archivo) {
            data.append('archivo', archivo);
        }
        router.post('/lecciones', data, {
            onSuccess: () => {
                setModalCreate(false);
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
        if (!leccionSelect) return;
        setProcessing(true);
        const data = new FormData();
        data.append('_method', 'put');
        Object.keys(form).forEach((key) => {
            if (form[key]) data.append(key, form[key]);
        });
        if (archivo) {
            data.append('archivo', archivo);
        }
        if (eliminarArchivo) {
            data.append('eliminar_archivo', '1');
        }
        router.post(`/lecciones/${leccionSelect.id}`, data, {
            onSuccess: () => {
                setModalEdit(false);
                setLeccionSelect(null);
                resetForm();
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    const handleGenerarResumenIA = async () => {
        if (!temaForm.materia_id) {
            setIaMensajeError('Por favor selecciona una materia primero.');
            return;
        }
        if (modoCreacionTema === 'pdf' && !temaPdfFile) {
            setIaMensajeError('Por favor selecciona un archivo PDF.');
            return;
        }
        if (modoCreacionTema === 'texto' && !temaTextoBruto.trim()) {
            setIaMensajeError('Por favor ingresa un texto para analizar.');
            return;
        }

        setGenerandoResumenIA(true);
        setIaMensajeError(null);
        setIaMensajeExito(null);

        try {
            const formData = new FormData();
            formData.append('materia_id', String(temaForm.materia_id));
            if (modoCreacionTema === 'pdf' && temaPdfFile) {
                formData.append('archivo_pdf', temaPdfFile);
            }
            if (modoCreacionTema === 'texto') {
                formData.append('texto', temaTextoBruto);
            }

            const res = await (window as any).axios.post('/temas/generar-resumen', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data && res.data.success) {
                setTemaForm((prev) => ({
                    ...prev,
                    nombre: res.data.nombre || prev.nombre,
                    paginas_libro: res.data.paginas_libro || prev.paginas_libro,
                    resumen: res.data.resumen || prev.resumen,
                }));
                setIaMensajeExito('¡Resumen y título generados exitosamente con IA!');
            } else {
                setIaMensajeError(res.data?.message || 'No se pudo generar el resumen con IA.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al procesar con IA. Inténtalo de nuevo.';
            setIaMensajeError(msg);
        } finally {
            setGenerandoResumenIA(false);
        }
    };

    const handleSaveTema: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessingTema(true);

        const payload: Record<string, any> = {
            materia_id: temaForm.materia_id,
            nombre: temaForm.nombre,
            orden: temaForm.orden,
            paginas_libro: temaForm.paginas_libro,
            resumen: temaForm.resumen,
            estado: temaForm.estado,
        };

        if (temaPdfFile) {
            payload.archivo_pdf = temaPdfFile;
        }

        router.post('/temas', payload, {
            forceFormData: !!temaPdfFile,
            onSuccess: () => {
                setModalNuevoTema(false);
                setProcessingTema(false);
                setTemaErrors({});
                setTemaPdfFile(null);
                setTemaTextoBruto('');
                setIaMensajeError(null);
                setIaMensajeExito(null);
            },
            onError: (err) => {
                setTemaErrors(err);
                setProcessingTema(false);
            },
        });
    };

    const openModalCreateTema = (materiaId?: number) => {
        const matId = materiaId || (filtroMateria && filtroMateria !== 'none' ? Number(filtroMateria) : materias[0]?.id || 0);
        const temasMat = temas.filter((t) => t.materia_id === matId);
        const maxOrden = temasMat.length > 0 ? Math.max(...temasMat.map((t) => t.orden)) : 0;
        setTemaForm({
            materia_id: matId,
            nombre: '',
            orden: String(maxOrden + 1),
            paginas_libro: '',
            resumen: '',
            estado: 'programado',
        });
        setTemaErrors({});
        setModoCreacionTema('pdf');
        setTemaPdfFile(null);
        setTemaTextoBruto('');
        setIaMensajeError(null);
        setIaMensajeExito(null);
        setModalNuevoTema(true);
    };

    const handleDelete = () => {
        if (!leccionSelect) return;
        router.delete(`/lecciones/${leccionSelect.id}`, {
            onSuccess: () => {
                setModalDelete(false);
                setLeccionSelect(null);
            },
        });
    };

    const stats = useMemo(() => {
        const total = lecciones?.length ?? 0;
        const activas = lecciones?.filter((l) => l.estado === 'activo').length ?? 0;
        const proximas =
            lecciones?.filter((l) => {
                const d = diasRestantes(l.fecha_entrega);
                return d !== null && d >= 0 && d <= 7;
            }).length ?? 0;
        return { total, activas, proximas };
    }, [lecciones]);

    const proximasEntregas = useMemo(() => {
        return (lecciones ?? [])
            .filter((l) => l.fecha_entrega && (diasRestantes(l.fecha_entrega) ?? -1) >= 0)
            .sort((a, b) => (a.fecha_entrega! > b.fecha_entrega! ? 1 : -1))
            .slice(0, 4);
    }, [lecciones]);

    // Agrupar lecciones por tema
    const leccionesPorTema = useMemo(() => {
        const grupos: Record<string, Leccion[]> = {};
        lecciones.forEach((l) => {
            const key = l.tema_id ? String(l.tema_id) : 'sin-tema';
            if (!grupos[key]) grupos[key] = [];
            grupos[key].push(l);
        });
        return grupos;
    }, [lecciones]);

    // Temas disponibles según filtros (materia seleccionada) y rol de usuario
    const temasFiltrados = useMemo(() => {
        let lista = temas;
        if (filtroMateria && filtroMateria !== 'none') {
            lista = lista.filter((t) => String(t.materia_id) === filtroMateria);
        }
        // En la vista de los estudiantes: mostrar temas que tengan al menos una tarea o un recurso de estudio
        if (!isDocente) {
            lista = lista.filter((t) => (leccionesPorTema[String(t.id)]?.length ?? 0) > 0 || (recursos || []).some((r) => r.tema_id === t.id));
        }
        return lista;
    }, [temas, filtroMateria, isDocente, leccionesPorTema, recursos]);

    const hoy = new Date();
    const [mes, setMes] = useState(hoy.getMonth());
    const [año, setAño] = useState(hoy.getFullYear());

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    const getDiasMes = (m: number, a: number) => {
        const primerDia = new Date(a, m, 1).getDay();
        const diasEnMes = new Date(a, m + 1, 0).getDate();
        const dias = [];
        for (let i = 0; i < primerDia; i++) dias.push(null);
        for (let d = 1; d <= diasEnMes; d++) dias.push(d);
        return dias;
    };

    const fechasEntrega = lecciones.filter((l) => l.fecha_entrega).map((l) => l.fecha_entrega?.split('T')[0]);

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
        if (nuevoMes < 0) {
            nuevoMes = 11;
            nuevoAño--;
        }
        if (nuevoMes > 11) {
            nuevoMes = 0;
            nuevoAño++;
        }
        setMes(nuevoMes);
        setAño(nuevoAño);
    };

    const leccionesDelDia = (dia: number) => {
        const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return lecciones.filter((l) => l.fecha_entrega?.startsWith(fecha));
    };

    // Temas del select del formulario, filtrados por la materia del form
    const temasDelForm = useMemo(() => {
        if (!form.materia_id) return [];
        return temas.filter((t) => String(t.materia_id) === String(form.materia_id));
    }, [temas, form.materia_id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lecciones" />
            <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
                <PageHeaderBanner
                    title="Lecciones y Actividades de Aula"
                    subtitle="Planificación pedagógica, material didáctico, publicación de tareas y seguimiento de entregas."
                    icon={BookOpen}
                    badgeText="GESTIÓN PEDAGÓGICA"
                    stats={[{ label: 'Lecciones', value: lecciones?.length || 0 }]}
                    actions={
                        isDocente ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => openModalCreateTema()}
                                    className="rounded-xl border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
                                >
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Nuevo Tema
                                </Button>
                                <Button
                                    onClick={() => {
                                        resetForm();
                                        setForm({
                                            ...initialForm,
                                            curso_id: filtroCurso && filtroCurso !== 'none' ? filtroCurso : '',
                                            materia_id: filtroMateria && filtroMateria !== 'none' ? filtroMateria : '',
                                        });
                                        setModalCreate(true);
                                    }}
                                    className="rounded-xl bg-white font-bold text-slate-950 shadow-lg transition-all hover:bg-white/90"
                                >
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Nueva Lección
                                </Button>
                            </>
                        ) : undefined
                    }
                />

                {/* 3 TARJETAS KPI DE LECCIONES CON IDENTIDAD INSTITUCIONAL */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="border-border/80 bg-card/85 group relative overflow-hidden rounded-3xl border p-5 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="from-primary to-secondary absolute top-0 left-0 h-1 w-0 rounded-t-2xl bg-gradient-to-r transition-all duration-500 group-hover:w-full" />
                        <div className="bg-primary/10 pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Total Lecciones</p>
                                <p className="text-foreground mt-1 text-3xl font-black">{stats.total}</p>
                                <p className="text-muted-foreground mt-0.5 text-xs">planificadas en el sistema</p>
                            </div>
                            <div className="from-primary to-secondary shadow-primary/25 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-md transition-transform group-hover:scale-110">
                                <BookOpen className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="border-border/80 bg-card/85 group relative overflow-hidden rounded-3xl border p-5 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="from-secondary to-primary absolute top-0 left-0 h-1 w-0 rounded-t-2xl bg-gradient-to-r transition-all duration-500 group-hover:w-full" />
                        <div className="bg-secondary/10 pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Activas</p>
                                <p className="text-primary mt-1 text-3xl font-black">{stats.activas}</p>
                                <p className="text-muted-foreground mt-0.5 text-xs">en curso ahora mismo</p>
                            </div>
                            <div className="from-secondary to-primary shadow-secondary/25 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-md transition-transform group-hover:scale-110">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="border-border/80 bg-card/85 group relative overflow-hidden rounded-3xl border p-5 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="to-primary absolute top-0 left-0 h-1 w-0 rounded-t-2xl bg-gradient-to-r from-amber-500 transition-all duration-500 group-hover:w-full" />
                        <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full bg-amber-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">Próximos 7 días</p>
                                <p className="mt-1 text-3xl font-black text-amber-500">{stats.proximas}</p>
                                <p className="text-muted-foreground mt-0.5 text-xs">entregas por vencer</p>
                            </div>
                            <div className="to-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 text-white shadow-md shadow-amber-500/25 transition-transform group-hover:scale-110">
                                <CalendarClock className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BARRA DE FILTRADO DINÁMICA E INSTANTÁNEA (AL MOMENTO) */}
                <div className="from-primary/[0.04] via-card to-secondary/[0.04] border-primary/20 space-y-3 rounded-3xl border bg-gradient-to-r p-5 shadow-sm">
                    <div className="border-border/70 flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2.5">
                            <div className="from-primary to-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-xs">
                                <Filter className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-foreground text-sm font-bold">Filtro de Contenidos del Aula</h3>
                                <p className="text-muted-foreground text-xs">Al elegir curso o materia se filtra automáticamente al instante</p>
                            </div>
                        </div>
                        {(filtroCurso || filtroMateria) && (
                            <span className="bg-primary/10 text-primary border-primary/25 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold shadow-xs">
                                <span className="bg-primary h-1.5 w-1.5 animate-ping rounded-full" />
                                Filtro activo al momento
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-foreground flex items-center gap-1 text-xs font-semibold">
                                <span>Curso / Paralelo</span>
                                {filtroCurso && <span className="bg-primary h-1.5 w-1.5 rounded-full" />}
                            </Label>
                            <Select value={filtroCurso || 'none'} onValueChange={handleCursoChange}>
                                <SelectTrigger className="bg-card border-border/80 focus:ring-primary focus:border-primary/50 h-10 rounded-xl text-xs shadow-xs">
                                    <SelectValue placeholder="Todos los cursos" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none">Todos los cursos</SelectItem>
                                    {(cursos || []).map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.gestion?.año} - {c.gestion?.etapa} | Paralelo {c.paralelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <Label className="text-foreground flex items-center gap-1 text-xs font-semibold">
                                <span>Materia Académica</span>
                                {filtroMateria && <span className="bg-secondary h-1.5 w-1.5 rounded-full" />}
                            </Label>
                            <Select value={filtroMateria || 'none'} onValueChange={handleMateriaChange}>
                                <SelectTrigger className="bg-card border-border/80 focus:ring-primary focus:border-primary/50 h-10 rounded-xl text-xs shadow-xs">
                                    <SelectValue placeholder="Todas las materias" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none">Todas las materias</SelectItem>
                                    {(materias || []).map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.codigo} - {m.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isDocente && filtroCurso && filtroMateria && (
                            <div className="flex shrink-0 items-center gap-2">
                                <a href={`/reportes/pdf?curso_id=${filtroCurso}&materia_id=${filtroMateria}`} target="_blank" rel="noreferrer">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 rounded-xl border-rose-500/30 px-3.5 text-xs text-rose-600 shadow-xs hover:bg-rose-500/10"
                                    >
                                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                                        PDF
                                    </Button>
                                </a>
                                <a href={`/reportes/excel?curso_id=${filtroCurso}&materia_id=${filtroMateria}`} target="_blank" rel="noreferrer">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 rounded-xl border-emerald-500/30 px-3.5 text-xs text-emerald-600 shadow-xs hover:bg-emerald-500/10"
                                    >
                                        <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                                        Excel
                                    </Button>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* PESTAÑAS DE NAVEGACIÓN: PLANIFICACIÓN Y LECCIONES vs LISTA DE ESTUDIANTES */}
                <div className="border-border/80 flex flex-col gap-3 border-b pt-1 pb-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setApartadoActivo('lecciones')}
                            className={`flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                                apartadoActivo === 'lecciones'
                                    ? 'from-primary to-secondary shadow-primary/25 ring-primary/20 bg-gradient-to-tr text-white shadow-md ring-2'
                                    : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/70 border'
                            }`}
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Contenidos y Lecciones</span>
                            <span
                                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                    apartadoActivo === 'lecciones' ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                                }`}
                            >
                                {lecciones?.length || 0}
                            </span>
                        </button>

                        {isDocente && (
                            <button
                                type="button"
                                onClick={() => setApartadoActivo('estudiantes')}
                                className={`flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                                    apartadoActivo === 'estudiantes'
                                        ? 'from-primary to-secondary shadow-primary/25 ring-primary/20 bg-gradient-to-tr text-white shadow-md ring-2'
                                        : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/70 border'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                <span>Nómina de Estudiantes</span>
                                <span
                                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                        apartadoActivo === 'estudiantes' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                    }`}
                                >
                                    {estudiantes?.length || 0}
                                </span>
                            </button>
                        )}
                    </div>

                    {isDocente && apartadoActivo === 'estudiantes' && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                                className="border-border/80 hover:border-primary/40 text-foreground h-9 gap-1.5 rounded-xl text-xs"
                            >
                                <Printer className="text-primary h-3.5 w-3.5" />
                                <span>Imprimir Nómina</span>
                            </Button>
                        </div>
                    )}
                </div>

                {apartadoActivo === 'lecciones' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Card className="bg-card/90 border-primary/20 flex flex-col overflow-hidden rounded-3xl border shadow-sm backdrop-blur-md lg:col-span-2">
                            <CardHeader className="border-border/80 from-primary/[0.04] to-secondary/[0.04] flex flex-col gap-3 border-b bg-gradient-to-r via-transparent px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="from-primary to-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-xs">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-foreground text-base font-bold">Listado por Temas</CardTitle>
                                        <CardDescription className="text-muted-foreground text-xs">
                                            {lecciones?.length ?? 0} lección{lecciones?.length !== 1 ? 'es' : ''} • {temasFiltrados.length} tema
                                            {temasFiltrados.length !== 1 ? 's' : ''}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isDocente && (
                                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-[10px] font-semibold">
                                            {temasFiltrados.length} con tareas
                                        </Badge>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleTodosTemas}
                                        className="border-border/80 hover:border-primary/40 text-foreground bg-card h-8 rounded-xl text-xs font-semibold shadow-2xs"
                                    >
                                        {todosExpandidos ? (
                                            <>
                                                <ChevronUp className="text-primary mr-1.5 h-3.5 w-3.5" />
                                                Minimizar todos
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="text-primary mr-1.5 h-3.5 w-3.5" />
                                                Desplegar todos
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 p-4 sm:p-5">
                                {temasFiltrados.length === 0 && (leccionesPorTema['sin-tema']?.length ?? 0) === 0 && (
                                    <div className="border-border/70 bg-muted/15 rounded-2xl border border-dashed py-14 text-center">
                                        <div className="text-muted-foreground flex flex-col items-center gap-2.5">
                                            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                            <p className="text-foreground text-sm font-semibold">
                                                {!isDocente
                                                    ? 'No tienes tareas ni lecciones asignadas en este momento'
                                                    : 'No hay temas registrados en esta materia'}
                                            </p>
                                            {!isDocente && (
                                                <p className="text-muted-foreground max-w-sm text-xs">
                                                    Los temas aparecerán aquí tan pronto como tus docentes asignen lecciones o actividades a tu curso.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {temasFiltrados.map((tema) => {
                                    const key = String(tema.id);
                                    const abierto = !!temasAbiertos[key];
                                    const leccionesTema = leccionesPorTema[key] ?? [];
                                    const recursosTema = (recursos || []).filter((r) => r.tema_id === tema.id);
                                    const totalElementos = leccionesTema.length + recursosTema.length;
                                    const materiaDelTema = materias.find((m) => m.id === tema.materia_id);
                                    const color = colorForMateria(materiaDelTema?.codigo);
                                    const tareasPendientesTema = isDocente ? [] : leccionesTema.filter((l) => !l.entregas || l.entregas.length === 0);
                                    const tienePendientesEstudiante = !isDocente && tareasPendientesTema.length > 0;
                                    const tieneTareas = leccionesTema.length > 0;

                                    if (!abierto) {
                                        return (
                                            <div
                                                key={tema.id}
                                                className={`group overflow-hidden rounded-2xl border shadow-2xs transition-all duration-200 ${
                                                    tienePendientesEstudiante
                                                        ? 'via-card to-card border-amber-500/50 bg-gradient-to-r from-amber-500/[0.06] ring-1 ring-amber-500/20 hover:border-amber-500'
                                                        : 'border-border/75 bg-card/60 hover:bg-card hover:border-primary/40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTema(key)}
                                                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                                                    >
                                                        <div
                                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                                tienePendientesEstudiante
                                                                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                                    : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                                                            }`}
                                                        >
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot} shadow-2xs`} />
                                                        <span className="text-foreground truncate text-xs font-semibold sm:text-sm">
                                                            {tema.orden}. {tema.nombre}
                                                        </span>

                                                        {/* BADGES NOTORIOS DE ESTADO DE TAREAS */}
                                                        <div className="ml-1 flex shrink-0 items-center gap-1.5">
                                                            {!isDocente ? (
                                                                tienePendientesEstudiante ? (
                                                                    <span className="flex animate-pulse items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        <span>
                                                                            {tareasPendientesTema.length}{' '}
                                                                            {tareasPendientesTema.length === 1
                                                                                ? 'tarea pendiente'
                                                                                : 'tareas pendientes'}
                                                                        </span>
                                                                    </span>
                                                                ) : tieneTareas ? (
                                                                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                                                        <span>Tareas al día</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                                        Sin tareas
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="bg-primary/10 text-primary border-primary/25 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                                                                    {leccionesTema.length} {leccionesTema.length === 1 ? 'tarea' : 'tareas'}
                                                                </span>
                                                            )}
                                                            {recursosTema.length > 0 && (
                                                                <span className="bg-muted/70 text-muted-foreground hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex">
                                                                    {recursosTema.length} {recursosTema.length === 1 ? 'recurso' : 'recursos'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>

                                                    {isDocente && (
                                                        <div className="flex shrink-0 items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-primary border-primary/25 hover:bg-primary/10 h-7 rounded-lg px-2 text-[11px]"
                                                                onClick={() => openCreateRecursoInTema(tema.materia_id, tema.id)}
                                                                title="Subir material de estudio"
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Recurso
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-secondary border-secondary/25 hover:bg-secondary/10 h-7 rounded-lg px-2 text-[11px]"
                                                                onClick={() => openCreateInTema(tema.materia_id, tema.id)}
                                                                title="Crear tarea o práctica evaluativa"
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Tarea
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={tema.id}
                                            className={`space-y-4 rounded-2xl border-2 p-4 shadow-md transition-all duration-300 sm:p-5 ${
                                                tienePendientesEstudiante
                                                    ? 'via-card to-card border-amber-500/50 bg-gradient-to-b from-amber-500/[0.04] ring-2 ring-amber-500/20'
                                                    : 'border-primary/40 from-primary/[0.03] via-card to-card ring-primary/10 bg-gradient-to-b ring-2'
                                            }`}
                                        >
                                            {/* HEADER DEL TEMA EXPANDIDO */}
                                            <div className="border-primary/15 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTema(key)}
                                                    className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                                                            tienePendientesEstudiante
                                                                ? 'bg-gradient-to-tr from-amber-500 to-rose-500 shadow-amber-500/30'
                                                                : 'from-primary to-secondary shadow-primary/20 bg-gradient-to-tr'
                                                        }`}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="bg-primary/15 text-primary border-primary/25 rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                                                                Tema #{tema.orden}
                                                            </span>
                                                            {!isDocente ? (
                                                                tienePendientesEstudiante ? (
                                                                    <span className="flex animate-pulse items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        <span>
                                                                            {tareasPendientesTema.length}{' '}
                                                                            {tareasPendientesTema.length === 1
                                                                                ? 'tarea por entregar'
                                                                                : 'tareas por entregar'}
                                                                        </span>
                                                                    </span>
                                                                ) : tieneTareas ? (
                                                                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                                                        <span>Tareas al día</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-[10px]">Sin tareas</span>
                                                                )
                                                            ) : (
                                                                <span className="text-muted-foreground text-[11px] font-medium">
                                                                    {leccionesTema.length} {leccionesTema.length === 1 ? 'tarea' : 'tareas'} •{' '}
                                                                    {recursosTema.length} {recursosTema.length === 1 ? 'recurso' : 'recursos'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-foreground group-hover:text-primary mt-0.5 text-sm font-bold transition-colors sm:text-base">
                                                            {tema.nombre}
                                                        </h3>
                                                    </div>
                                                </button>

                                                {isDocente && (
                                                    <div className="flex shrink-0 items-center gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-primary border-primary/30 hover:bg-primary/10 h-8 rounded-xl text-xs font-semibold shadow-2xs"
                                                            onClick={() => openCreateRecursoInTema(tema.materia_id, tema.id)}
                                                            title="Subir material de estudio (PDF o Enlace web)"
                                                        >
                                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                                            Recurso
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="from-primary to-secondary h-8 rounded-xl bg-gradient-to-r text-xs font-semibold text-white shadow-2xs hover:opacity-90"
                                                            onClick={() => openCreateInTema(tema.materia_id, tema.id)}
                                                            title="Crear nueva tarea o práctica evaluativa"
                                                        >
                                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                                            Tarea
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* SINOPSIS / RESUMEN DEL TEMA */}
                                            {(tema.resumen || tema.archivo_pdf || tema.paginas_libro) && (
                                                <div className="border-primary/20 bg-primary/[0.03] space-y-2 rounded-xl border p-3.5 shadow-2xs">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="text-primary flex items-center gap-1.5 text-xs font-bold">
                                                            <BookOpen className="h-3.5 w-3.5" />
                                                            Sinopsis del Tema
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {tema.paginas_libro && (
                                                                <span className="text-muted-foreground bg-card border-border/80 rounded-md border px-2.5 py-0.5 text-[11px] font-medium">
                                                                    📖 {tema.paginas_libro}
                                                                </span>
                                                            )}
                                                            {tema.archivo_pdf && (
                                                                <a
                                                                    href={`/storage/${tema.archivo_pdf}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-primary bg-card border-primary/30 inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold hover:underline"
                                                                >
                                                                    <FileText className="h-3 w-3" />
                                                                    Ver Recurso PDF
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {tema.resumen && (
                                                        <p className="text-foreground/80 text-xs leading-relaxed whitespace-pre-line">
                                                            {tema.resumen}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* RECURSOS DE ESTUDIO */}
                                            {recursosTema.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 px-0.5">
                                                        <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                                                            📚 Recursos de Estudio ({recursosTema.length})
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                        {recursosTema.map((r) => {
                                                            const esYoutube =
                                                                r.enlace_url &&
                                                                (r.enlace_url.includes('youtube.com') || r.enlace_url.includes('youtu.be'));
                                                            const href = r.tipo === 'enlace' ? r.enlace_url : `/storage/${r.archivo}`;
                                                            return (
                                                                <div
                                                                    key={r.id}
                                                                    className="group border-border/80 bg-card hover:border-primary/40 flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition-all hover:shadow-2xs"
                                                                >
                                                                    <a
                                                                        href={href || '#'}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="hover:text-primary flex min-w-0 flex-1 items-center gap-2.5 transition-colors"
                                                                    >
                                                                        <div className="bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary shrink-0 rounded-lg p-2 transition-colors">
                                                                            {r.tipo === 'enlace' ? (
                                                                                esYoutube ? (
                                                                                    <Youtube className="h-4 w-4 text-red-500" />
                                                                                ) : (
                                                                                    <ExternalLink className="h-4 w-4 text-emerald-500" />
                                                                                )
                                                                            ) : (
                                                                                <FileText className="text-primary h-4 w-4" />
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-foreground truncate text-xs font-semibold">
                                                                                    {r.titulo}
                                                                                </span>
                                                                            </div>
                                                                            {r.descripcion && (
                                                                                <p className="text-muted-foreground truncate text-[11px]">
                                                                                    {r.descripcion}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </a>
                                                                    <div className="flex shrink-0 items-center gap-1">
                                                                        <a
                                                                            href={href || '#'}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-primary bg-primary/10 hover:bg-primary/20 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors hover:underline"
                                                                        >
                                                                            <Eye className="h-3.5 w-3.5" />
                                                                            <span>Abrir</span>
                                                                        </a>
                                                                        {isDocente && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="text-muted-foreground h-7 gap-1 rounded-lg px-2 text-xs hover:text-rose-500"
                                                                                onClick={() => handleDeleteRecurso(r.id)}
                                                                                title="Eliminar recurso"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                                <span>Eliminar</span>
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* LISTADO DE TAREAS / LECCIONES */}
                                            {leccionesTema.length === 0 ? (
                                                <div className="text-muted-foreground border-border/80 bg-muted/20 rounded-xl border border-dashed py-6 text-center text-xs">
                                                    No hay tareas o lecciones en este tema todavía.
                                                    {isDocente && ' Usa el botón "+ Tarea" para crear una.'}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {leccionesTema.map((l) => {
                                                        const restantes = diasRestantes(l.fecha_entrega);
                                                        const miEntrega = l.entregas?.[0];
                                                        const yaEntregado = !!miEntrega;
                                                        const estaCalificado =
                                                            miEntrega?.estado_calificacion === 'calificado' &&
                                                            miEntrega?.calificacion?.nota !== undefined;
                                                        const tieneRefuerzo = !!miEntrega?.refuerzo && !miEntrega.refuerzo.completado;

                                                        return (
                                                            <div
                                                                key={l.id}
                                                                className="group border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm sm:flex-row sm:items-center"
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        {isDocente ? (
                                                                            <a
                                                                                href={`/entregas/docente?leccion_id=${l.id}`}
                                                                                className="text-foreground hover:text-primary text-sm leading-tight font-bold transition-colors"
                                                                            >
                                                                                {l.titulo}
                                                                            </a>
                                                                        ) : (
                                                                            <a
                                                                                href={`/lecciones/${l.hash_id || l.id}`}
                                                                                className="text-foreground hover:text-primary text-sm leading-tight font-bold transition-colors"
                                                                            >
                                                                                {l.titulo}
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            {l.fecha_entrega
                                                                                ? formatoFechaCorta(l.fecha_entrega)
                                                                                : 'Sin fecha límite'}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />
                                                                            {l.curso?.gestion?.año} · P.{l.curso?.paralelo}
                                                                        </span>
                                                                        {l.docente && (
                                                                            <span
                                                                                className="flex items-center gap-1"
                                                                                title={nombreCompleto(l.docente.user)}
                                                                            >
                                                                                <span className="bg-primary/10 text-primary flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold">
                                                                                    {iniciales(l.docente.user)}
                                                                                </span>
                                                                                <span className="max-w-[120px] truncate">
                                                                                    {nombreCompleto(l.docente.user)}
                                                                                </span>
                                                                            </span>
                                                                        )}
                                                                        {l.imagen && (
                                                                            <span className="text-primary flex items-center gap-1 font-semibold">
                                                                                <Paperclip className="h-3 w-3" />
                                                                                PDF adjunto
                                                                            </span>
                                                                        )}

                                                                        {/* Estado para Estudiantes */}
                                                                        {!isDocente && (
                                                                            <>
                                                                                {estaCalificado && (
                                                                                    <Badge
                                                                                        variant={
                                                                                            miEntrega!.calificacion!.nota >= 70
                                                                                                ? 'success'
                                                                                                : 'warning'
                                                                                        }
                                                                                        className="gap-1 text-[10px] font-bold"
                                                                                    >
                                                                                        <Award className="h-3 w-3" />
                                                                                        Nota: {miEntrega!.calificacion!.nota}/100
                                                                                    </Badge>
                                                                                )}
                                                                                {yaEntregado && !estaCalificado && (
                                                                                    <Badge variant="info" className="gap-1 text-[10px]">
                                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                                        Entregado
                                                                                    </Badge>
                                                                                )}
                                                                                {!yaEntregado && (
                                                                                    <Badge
                                                                                        variant={
                                                                                            restantes !== null && restantes < 0
                                                                                                ? 'destructive'
                                                                                                : 'warning'
                                                                                        }
                                                                                        className="text-[10px]"
                                                                                    >
                                                                                        {restantes !== null && restantes < 0
                                                                                            ? 'Sin entregar (Vencida)'
                                                                                            : 'Pendiente de entrega'}
                                                                                    </Badge>
                                                                                )}
                                                                                {tieneRefuerzo && (
                                                                                    <Badge variant="purple" className="gap-1 text-[10px]">
                                                                                        <Sparkles className="h-3 w-3" />
                                                                                        Refuerzo IA
                                                                                    </Badge>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {/* Estado para Docentes */}
                                                                        {isDocente && (
                                                                            <>
                                                                                {restantes !== null && restantes >= 0 && restantes <= 3 && (
                                                                                    <Badge className="border border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-600">
                                                                                        {restantes === 0 ? 'Vence Hoy' : `Vence en ${restantes}d`}
                                                                                    </Badge>
                                                                                )}
                                                                                {restantes !== null && restantes < 0 && l.estado === 'activo' && (
                                                                                    <Badge className="border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-600">
                                                                                        Vencida
                                                                                    </Badge>
                                                                                )}
                                                                                <span
                                                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                                        l.estado === 'activo'
                                                                                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                                                            : 'bg-muted text-muted-foreground'
                                                                                    }`}
                                                                                >
                                                                                    <span
                                                                                        className={`h-1.5 w-1.5 rounded-full ${l.estado === 'activo' ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                                                                                    />
                                                                                    {l.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                                                                    {!isDocente ? (
                                                                        <a href={`/lecciones/${l.hash_id || l.id}`}>
                                                                            <Button
                                                                                size="sm"
                                                                                className={`h-8 rounded-xl text-xs font-semibold shadow-2xs ${
                                                                                    estaCalificado
                                                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                                        : yaEntregado
                                                                                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary-hover'
                                                                                          : 'from-primary to-secondary bg-gradient-to-r text-white hover:opacity-90'
                                                                                }`}
                                                                            >
                                                                                {estaCalificado ? (
                                                                                    <>
                                                                                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                                        Ver Nota
                                                                                    </>
                                                                                ) : yaEntregado ? (
                                                                                    <>
                                                                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                                                                        Ver Entrega
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Send className="mr-1.5 h-3.5 w-3.5" />
                                                                                        Entregar Tarea
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </a>
                                                                    ) : (
                                                                        <>
                                                                            <a href={`/entregas/docente?leccion_id=${l.id}`}>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="border-primary/25 text-primary hover:bg-primary/10 h-8 gap-1.5 rounded-xl text-xs"
                                                                                    title="Revisar y calificar entregas"
                                                                                >
                                                                                    <FileCheck className="text-primary h-3.5 w-3.5" />
                                                                                    Entregas
                                                                                </Button>
                                                                            </a>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="border-border/80 hover:border-primary/40 text-foreground hover:text-primary h-8 gap-1.5 rounded-xl px-2.5 text-xs transition-colors"
                                                                                onClick={() => openEdit(l)}
                                                                                title="Editar lección"
                                                                            >
                                                                                <Pencil className="h-3.5 w-3.5 text-blue-500" />
                                                                                <span>Editar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="border-border/80 text-muted-foreground h-8 gap-1.5 rounded-xl px-2.5 text-xs transition-colors hover:border-rose-400 hover:text-rose-500"
                                                                                onClick={() => openDelete(l)}
                                                                                title="Eliminar lección"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                                                <span>Eliminar</span>
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* PANEL SIN TEMA */}
                                {(() => {
                                    const leccionesSinTema = leccionesPorTema['sin-tema'] ?? [];
                                    const recursosSinTema = (recursos || []).filter((r) => !r.tema_id);
                                    const totalSinTema = leccionesSinTema.length + recursosSinTema.length;
                                    if (totalSinTema === 0) return null;
                                    const abierto = !!temasAbiertos['sin-tema'];
                                    const tareasPendientesSinTema = isDocente
                                        ? []
                                        : leccionesSinTema.filter((l) => !l.entregas || l.entregas.length === 0);
                                    const tienePendientesEstudiante = !isDocente && tareasPendientesSinTema.length > 0;
                                    const tieneTareas = leccionesSinTema.length > 0;

                                    if (!abierto) {
                                        return (
                                            <div
                                                className={`group overflow-hidden rounded-2xl border shadow-2xs transition-all duration-200 ${
                                                    tienePendientesEstudiante
                                                        ? 'via-card to-card border-amber-500/50 bg-gradient-to-r from-amber-500/[0.06] ring-1 ring-amber-500/20 hover:border-amber-500'
                                                        : 'border-border/75 bg-card/60 hover:bg-card hover:border-primary/40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTema('sin-tema')}
                                                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                                                    >
                                                        <div
                                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                                tienePendientesEstudiante
                                                                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                                    : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                                                            }`}
                                                        >
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="bg-muted-foreground/40 h-2.5 w-2.5 shrink-0 rounded-full shadow-2xs" />
                                                        <span className="text-foreground truncate text-xs font-semibold sm:text-sm">
                                                            Sin tema específico (General)
                                                        </span>

                                                        <div className="ml-1 flex shrink-0 items-center gap-1.5">
                                                            {!isDocente ? (
                                                                tienePendientesEstudiante ? (
                                                                    <span className="flex animate-pulse items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        <span>
                                                                            {tareasPendientesSinTema.length}{' '}
                                                                            {tareasPendientesSinTema.length === 1
                                                                                ? 'tarea pendiente'
                                                                                : 'tareas pendientes'}
                                                                        </span>
                                                                    </span>
                                                                ) : tieneTareas ? (
                                                                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                                                        <span>Tareas al día</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                                        Sin tareas
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="bg-primary/10 text-primary border-primary/25 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                                                                    {leccionesSinTema.length} {leccionesSinTema.length === 1 ? 'tarea' : 'tareas'}
                                                                </span>
                                                            )}
                                                            {recursosSinTema.length > 0 && (
                                                                <span className="bg-muted/70 text-muted-foreground hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex">
                                                                    {recursosSinTema.length} {recursosSinTema.length === 1 ? 'recurso' : 'recursos'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                    {isDocente && (
                                                        <div className="flex shrink-0 items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-primary border-primary/25 hover:bg-primary/10 h-7 rounded-lg px-2 text-[11px]"
                                                                onClick={() => openCreateRecursoInTema(materias[0]?.id || 0, null)}
                                                                title="Subir material general"
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Recurso
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-secondary border-secondary/25 hover:bg-secondary/10 h-7 rounded-lg px-2 text-[11px]"
                                                                onClick={() => openCreateInTema(materias[0]?.id || 0, 0)}
                                                                title="Crear tarea general"
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Tarea
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="border-primary/40 from-primary/[0.03] via-card to-card ring-primary/10 space-y-4 rounded-2xl border-2 bg-gradient-to-b p-4 shadow-md ring-2 transition-all duration-300 sm:p-5">
                                            <div className="border-primary/15 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTema('sin-tema')}
                                                    className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                                                >
                                                    <div className="from-primary to-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-xs">
                                                        <ChevronUp className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-muted-foreground text-[11px] font-medium">
                                                            {totalSinTema} {totalSinTema === 1 ? 'elemento general' : 'elementos generales'}
                                                        </span>
                                                        <h3 className="text-foreground group-hover:text-primary mt-0.5 text-sm font-bold transition-colors sm:text-base">
                                                            Sin tema específico (General)
                                                        </h3>
                                                    </div>
                                                </button>
                                                {isDocente && (
                                                    <div className="flex shrink-0 items-center gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-primary border-primary/30 hover:bg-primary/10 h-8 rounded-xl text-xs font-semibold shadow-2xs"
                                                            onClick={() => openCreateRecursoInTema(materias[0]?.id || 0, null)}
                                                            title="Subir material de estudio general"
                                                        >
                                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                                            Recurso
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="from-primary to-secondary h-8 rounded-xl bg-gradient-to-r text-xs font-semibold text-white shadow-2xs hover:opacity-90"
                                                            onClick={() => openCreateInTema(materias[0]?.id || 0, 0)}
                                                            title="Crear nueva tarea general"
                                                        >
                                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                                            Tarea
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {leccionesPorTema['sin-tema'].map((l) => {
                                                    const restantes = diasRestantes(l.fecha_entrega);
                                                    return (
                                                        <div
                                                            key={l.id}
                                                            className="group border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm sm:flex-row sm:items-center"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    {isDocente ? (
                                                                        <a
                                                                            href={`/lecciones/${l.hash_id || l.id}/entregas`}
                                                                            className="text-foreground hover:text-primary text-sm leading-tight font-bold transition-colors"
                                                                        >
                                                                            {l.titulo}
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href={`/lecciones/${l.hash_id || l.id}`}
                                                                            className="text-foreground hover:text-primary text-sm leading-tight font-bold transition-colors"
                                                                        >
                                                                            {l.titulo}
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {l.fecha_entrega ? formatoFechaCorta(l.fecha_entrega) : 'Sin fecha'}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Users className="h-3 w-3" />
                                                                        {l.curso?.gestion?.año} · P.{l.curso?.paralelo}
                                                                    </span>
                                                                    {l.docente && (
                                                                        <span
                                                                            className="flex items-center gap-1"
                                                                            title={nombreCompleto(l.docente.user)}
                                                                        >
                                                                            <span className="bg-primary/10 text-primary flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold">
                                                                                {iniciales(l.docente.user)}
                                                                            </span>
                                                                            <span className="max-w-[120px] truncate">
                                                                                {nombreCompleto(l.docente.user)}
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                    {l.imagen && (
                                                                        <span className="text-primary flex items-center gap-1 font-semibold">
                                                                            <Paperclip className="h-3 w-3" />
                                                                            PDF adjunto
                                                                        </span>
                                                                    )}
                                                                    {restantes !== null && restantes >= 0 && restantes <= 3 && (
                                                                        <Badge className="border border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-600">
                                                                            {restantes === 0 ? 'Hoy' : `${restantes}d`}
                                                                        </Badge>
                                                                    )}
                                                                    {restantes !== null && restantes < 0 && l.estado === 'activo' && (
                                                                        <Badge className="border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-600">
                                                                            Vencida
                                                                        </Badge>
                                                                    )}
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                            l.estado === 'activo'
                                                                                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                                                : 'bg-muted text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        <span
                                                                            className={`h-1.5 w-1.5 rounded-full ${l.estado === 'activo' ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                                                                        />
                                                                        {l.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                                                                {isDocente && (
                                                                    <>
                                                                        <a href={`/lecciones/${l.hash_id || l.id}/entregas`}>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="border-primary/25 text-primary hover:bg-primary/10 h-8 gap-1.5 rounded-xl text-xs"
                                                                                title="Ver entregas"
                                                                            >
                                                                                <Users className="text-primary h-3.5 w-3.5" />
                                                                                Entregas
                                                                            </Button>
                                                                        </a>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-border/80 hover:border-primary/40 text-foreground hover:text-primary h-8 gap-1.5 rounded-xl px-2.5 text-xs transition-colors"
                                                                            onClick={() => openEdit(l)}
                                                                            title="Editar lección"
                                                                        >
                                                                            <Pencil className="h-3.5 w-3.5 text-blue-500" />
                                                                            <span>Editar</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-border/80 text-muted-foreground h-8 gap-1.5 rounded-xl px-2.5 text-xs transition-colors hover:border-rose-400 hover:text-rose-500"
                                                                            onClick={() => openDelete(l)}
                                                                            title="Eliminar lección"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                                            <span>Eliminar</span>
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* COLUMNA LATERAL: CALENDARIO Y PRÓXIMAS ENTREGAS */}
                        <div className="space-y-6">
                            {/* CALENDARIO ACADÉMICO */}
                            <Card className="border-primary/20 bg-card/90 overflow-hidden rounded-3xl border shadow-sm backdrop-blur-md">
                                <CardContent className="p-5">
                                    <div className="border-border/70 mb-4 flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="from-primary to-secondary flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-2xs">
                                                <CalendarDays className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-foreground text-sm font-bold capitalize">
                                                    {meses[mes]} {año}
                                                </h4>
                                                <p className="text-muted-foreground text-[10px]">Calendario de actividades</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => cambiarMes(-1)}
                                                className="hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg p-1.5 transition-colors"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => cambiarMes(1)}
                                                className="hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg p-1.5 transition-colors"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1.5 text-center">
                                        {diasSemana.map((d, i) => (
                                            <div key={i} className="text-muted-foreground/80 py-1 text-[10px] font-bold tracking-wider uppercase">
                                                {d}
                                            </div>
                                        ))}
                                        {getDiasMes(mes, año).map((dia, i) => (
                                            <div key={i} className="group relative flex justify-center py-0.5">
                                                {dia && (
                                                    <div
                                                        className={`flex h-7 w-7 flex-col items-center justify-center rounded-full text-xs transition-all ${esHoy(dia) ? 'from-primary to-secondary shadow-primary/30 ring-primary/20 bg-gradient-to-tr font-bold text-white shadow-md ring-2' : 'text-foreground hover:bg-primary/10 hover:text-primary'}`}
                                                    >
                                                        {dia}
                                                        {esFechaEntrega(dia) && !esHoy(dia) && (
                                                            <span className="absolute bottom-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                                        )}
                                                    </div>
                                                )}
                                                {dia && esFechaEntrega(dia) && (
                                                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden -translate-x-1/2 group-hover:block">
                                                        <div className="bg-popover border-border text-popover-foreground max-w-[200px] truncate rounded-xl border px-2.5 py-1 text-[11px] font-medium shadow-lg">
                                                            {leccionesDelDia(dia)
                                                                .map((l) => l.titulo)
                                                                .join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-border/70 text-muted-foreground mt-4 flex items-center justify-center gap-4 border-t pt-3 text-[11px]">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Entrega
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="bg-primary h-2 w-2 rounded-full" /> Hoy
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* PRÓXIMAS ENTREGAS */}
                            <Card className="border-secondary/20 bg-card/90 overflow-hidden rounded-3xl border shadow-sm backdrop-blur-md">
                                <CardHeader className="border-border/70 from-secondary/[0.04] border-b bg-gradient-to-r to-transparent px-5 pt-4 pb-3">
                                    <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        Próximas Entregas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2.5 p-5 pt-3">
                                    {proximasEntregas.length === 0 && (
                                        <div className="text-muted-foreground border-border/70 bg-muted/20 rounded-xl border border-dashed py-6 text-center text-xs">
                                            No hay entregas próximas pendientes.
                                        </div>
                                    )}
                                    {proximasEntregas.map((l) => {
                                        const color = colorForMateria(l.materia?.codigo);
                                        const restantes = diasRestantes(l.fecha_entrega);
                                        return (
                                            <div
                                                key={l.id}
                                                className="border-border/75 bg-card/60 hover:bg-card hover:border-primary/30 flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all"
                                            >
                                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-foreground truncate text-xs font-semibold">{l.titulo}</p>
                                                    <p className="text-muted-foreground text-[11px]">
                                                        {l.materia?.codigo} · {formatoFechaCorta(l.fecha_entrega)}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        restantes === 0
                                                            ? 'border border-rose-500/30 bg-rose-500/15 text-rose-600'
                                                            : 'bg-primary/10 text-primary border-primary/25 border'
                                                    }`}
                                                >
                                                    {restantes === 0 ? 'Hoy' : `${restantes}d`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* WIDGET LATERAL: ESTUDIANTES DEL PARALELO */}
                            {isDocente && (
                                <Card className="border-primary/20 bg-card/90 overflow-hidden rounded-3xl border shadow-sm backdrop-blur-md">
                                    <CardHeader className="border-border/70 from-primary/[0.04] border-b bg-gradient-to-r to-transparent px-5 pt-4 pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                                                <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <span>Estudiantes del Paralelo</span>
                                            </CardTitle>
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[10px] font-bold">
                                                {estudiantes?.length || 0} inscritos
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-5 pt-3">
                                        <p className="text-muted-foreground text-xs">
                                            {cursoActual
                                                ? `Alumnos matriculados en Paralelo ${cursoActual.paralelo} (${cursoActual.gestion?.año})`
                                                : 'Alumnos de tus materias y cursos asignados'}
                                        </p>

                                        {estudiantes && estudiantes.length > 0 ? (
                                            <div className="flex items-center -space-x-2 overflow-hidden py-1">
                                                {estudiantes.slice(0, 7).map((est) => (
                                                    <div
                                                        key={est.id}
                                                        title={formatNombreEstudiante(est.user)}
                                                        className="ring-card from-primary to-secondary flex inline-block h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr text-[10px] font-bold text-white shadow-xs ring-2"
                                                    >
                                                        {getInicialesEstudiante(est.user)}
                                                    </div>
                                                ))}
                                                {estudiantes.length > 7 && (
                                                    <div className="bg-muted text-muted-foreground ring-card inline-flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ring-2">
                                                        +{estudiantes.length - 7}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-xs italic">No hay estudiantes registrados en este curso aún.</p>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setApartadoActivo('estudiantes')}
                                            className="border-border hover:border-primary/50 text-foreground hover:text-primary h-8 w-full cursor-pointer gap-1.5 rounded-xl text-xs"
                                        >
                                            <Users className="text-primary h-3.5 w-3.5" />
                                            <span>Ver nómina completa</span>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* ===================== APARTADO DE ESTUDIANTES MATRICULADOS ===================== */}
                {apartadoActivo === 'estudiantes' && (
                    <div className="space-y-4">
                        {/* Header del apartado */}
                        <div className="bg-card border-primary/20 from-primary/[0.03] via-card to-card flex flex-col gap-4 rounded-3xl border bg-gradient-to-br p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="from-primary to-secondary shadow-primary/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-md">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                                        <span>Nómina de Estudiantes Matriculados</span>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-xs font-semibold">
                                            {estudiantesFiltrados.length} estudiantes
                                        </Badge>
                                    </h3>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        {cursoActual
                                            ? `Paralelo ${cursoActual.paralelo} • ${cursoActual.gestion?.año || ''} ${cursoActual.gestion?.etapa || ''}`
                                            : 'Todos los cursos'}
                                        {materiaActual ? ` — Materia: ${materiaActual.nombre} (${materiaActual.codigo})` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Controles de filtro interno del apartado */}
                            <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar estudiante..."
                                        value={busquedaEstudiante}
                                        onChange={(e) => setBusquedaEstudiante(e.target.value)}
                                        className="h-9 rounded-xl pr-8 pl-9 text-xs"
                                    />
                                    {busquedaEstudiante && (
                                        <button
                                            onClick={() => setBusquedaEstudiante('')}
                                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                <Select value={filtroEstadoEstudiante} onValueChange={setFiltroEstadoEstudiante}>
                                    <SelectTrigger className="h-9 w-full rounded-xl text-xs sm:w-36">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="todos">Todos los estados</SelectItem>
                                        <SelectItem value="activo">Solo Activos</SelectItem>
                                        <SelectItem value="abandonado">Abandonados</SelectItem>
                                        <SelectItem value="completado">Completados</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tabla de Estudiantes */}
                        {estudiantesFiltrados.length === 0 ? (
                            <Card className="bg-card/60 border-2 border-dashed p-12 text-center backdrop-blur-sm">
                                <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl">
                                    <Users className="h-7 w-7" />
                                </div>
                                <h4 className="text-foreground text-base font-bold">No se encontraron estudiantes</h4>
                                <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
                                    {!filtroCurso
                                        ? 'Selecciona un curso y materia en el filtro superior para ver a los estudiantes matriculados.'
                                        : 'No hay alumnos inscritos que coincidan con la búsqueda.'}
                                </p>
                                {(busquedaEstudiante || filtroEstadoEstudiante !== 'todos') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setBusquedaEstudiante('');
                                            setFiltroEstadoEstudiante('todos');
                                        }}
                                        className="mt-3 gap-1 rounded-xl text-xs"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        <span>Limpiar filtros</span>
                                    </Button>
                                )}
                            </Card>
                        ) : (
                            <Card className="border-border/80 bg-card overflow-hidden rounded-3xl border shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs sm:text-sm">
                                        <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                                            <tr>
                                                <th className="px-5 py-3">#</th>
                                                <th className="px-5 py-3">Estudiante</th>
                                                <th className="px-5 py-3">Cédula de Identidad</th>
                                                <th className="px-5 py-3">Curso / Paralelo</th>
                                                <th className="px-5 py-3">Contacto</th>
                                                <th className="px-5 py-3">Estado</th>
                                                <th className="px-5 py-3 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-border/60 divide-y">
                                            {estudiantesFiltrados.map((est, index) => {
                                                const u = est.user;
                                                const primerCurso = est.cursos?.[0];
                                                const estado = primerCurso?.pivot?.estado || 'activo';

                                                return (
                                                    <tr key={est.id} className="hover:bg-muted/40 group transition-colors">
                                                        <td className="text-muted-foreground px-5 py-3.5 text-xs font-semibold">{index + 1}</td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="from-primary to-secondary ring-background flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr text-xs font-bold text-white shadow-xs ring-2">
                                                                    {getInicialesEstudiante(u)}
                                                                </div>
                                                                <div>
                                                                    <p
                                                                        className="text-foreground hover:text-primary cursor-pointer font-bold transition-colors"
                                                                        onClick={() => setEstudianteModal(est)}
                                                                    >
                                                                        {formatNombreEstudiante(u)}
                                                                    </p>
                                                                    <span className="text-muted-foreground text-[11px]">
                                                                        {formatTipoInscripcion(est.tipo_inscripcion)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            <span className="text-foreground font-mono text-xs font-bold">{u?.ci || '—'}</span>
                                                            {u?.expedido && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-muted/60 ml-1.5 px-1 py-0 text-[10px] font-bold uppercase"
                                                                >
                                                                    {u.expedido}
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            {primerCurso ? (
                                                                <div className="text-xs">
                                                                    <Badge variant="outline" className="bg-muted/40 font-bold">
                                                                        Paralelo {primerCurso.paralelo}
                                                                    </Badge>
                                                                    {primerCurso.gestion && (
                                                                        <span className="text-muted-foreground ml-1 text-[11px]">
                                                                            {primerCurso.gestion.año}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                {u?.email && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(u.email);
                                                                            toast.success('Correo copiado');
                                                                        }}
                                                                        title={`Copiar: ${u.email}`}
                                                                        className="bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                                                                    >
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                                {u?.celular ? (
                                                                    <a
                                                                        href={`https://wa.me/591${u.celular.replace(/\D/g, '')}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        title={`WhatsApp: ${u.celular}`}
                                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                                                                    >
                                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-xs">—</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 whitespace-nowrap">{getEstadoBadgeEstudiante(estado)}</td>
                                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setEstudianteModal(est)}
                                                                className="border-border hover:border-primary/50 hover:text-primary h-8 gap-1.5 rounded-lg text-xs"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                <span>Ver Ficha</span>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* MODAL DE FICHA DEL ESTUDIANTE (SOLO LECTURA) */}
                <Dialog open={!!estudianteModal} onOpenChange={(open) => !open && setEstudianteModal(null)}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl p-6">
                        {estudianteModal && (
                            <>
                                <DialogHeader className="border-b pb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="from-primary to-secondary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr text-xl font-black text-white shadow-md">
                                            {getInicialesEstudiante(estudianteModal.user)}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-foreground text-lg font-black">
                                                {formatNombreEstudiante(estudianteModal.user)}
                                            </DialogTitle>
                                            <DialogDescription className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                                                <span>
                                                    C.I.: {estudianteModal.user.ci}{' '}
                                                    {estudianteModal.user.expedido && `(${estudianteModal.user.expedido})`}
                                                </span>
                                                <span>•</span>
                                                <span>{formatTipoInscripcion(estudianteModal.tipo_inscripcion)}</span>
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="space-y-4 py-3 text-xs">
                                    {/* Datos Personales */}
                                    <div>
                                        <h5 className="text-primary mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <User className="h-3.5 w-3.5" />
                                            Datos Personales
                                        </h5>
                                        <div className="bg-muted/30 border-border/80 grid grid-cols-1 gap-3 rounded-2xl border p-3.5 sm:grid-cols-2">
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Cédula de Identidad:</span>
                                                <span className="text-foreground font-mono font-semibold">
                                                    {estudianteModal.user.ci} {estudianteModal.user.expedido && `(${estudianteModal.user.expedido})`}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Género:</span>
                                                <span className="text-foreground font-semibold capitalize">
                                                    {estudianteModal.user.genero === 'M'
                                                        ? 'Masculino'
                                                        : estudianteModal.user.genero === 'F'
                                                          ? 'Femenino'
                                                          : estudianteModal.user.genero || 'No especificado'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Fecha de Nacimiento:</span>
                                                <span className="text-foreground font-semibold">
                                                    {estudianteModal.user.fecha_nacimiento
                                                        ? formatoFecha(estudianteModal.user.fecha_nacimiento)
                                                        : 'No registrada'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Dirección:</span>
                                                <span className="text-foreground font-semibold">
                                                    {estudianteModal.user.direccion || 'No registrada'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contacto */}
                                    <div>
                                        <h5 className="text-primary mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <Phone className="h-3.5 w-3.5" />
                                            Canales de Contacto
                                        </h5>
                                        <div className="bg-muted/30 border-border/80 grid grid-cols-1 gap-3 rounded-2xl border p-3.5 sm:grid-cols-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-muted-foreground block text-[11px]">Correo:</span>
                                                    <span className="text-foreground font-semibold break-all">{estudianteModal.user.email}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(estudianteModal.user.email);
                                                        toast.success('Correo copiado');
                                                    }}
                                                    className="text-primary h-7 px-2 text-xs"
                                                >
                                                    Copiar
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-muted-foreground block text-[11px]">Celular:</span>
                                                    <span className="text-foreground font-semibold">
                                                        {estudianteModal.user.celular || 'Sin celular'}
                                                    </span>
                                                </div>
                                                {estudianteModal.user.celular && (
                                                    <a
                                                        href={`https://wa.me/591${estudianteModal.user.celular.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20"
                                                    >
                                                        <MessageCircle className="h-3 w-3" />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Datos Académicos */}
                                    <div>
                                        <h5 className="text-primary mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            Información Académica
                                        </h5>
                                        <div className="bg-muted/30 border-border/80 grid grid-cols-1 gap-3 rounded-2xl border p-3.5 sm:grid-cols-2">
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Colegio de Procedencia:</span>
                                                <span className="text-foreground font-semibold">
                                                    {estudianteModal.colegio_procedencia || 'No registrado'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Tipo de Admisión:</span>
                                                <span className="text-foreground font-semibold">
                                                    {formatTipoInscripcion(estudianteModal.tipo_inscripcion)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="border-t pt-3">
                                    <Button variant="outline" onClick={() => setEstudianteModal(null)} className="w-full rounded-xl sm:w-auto">
                                        Cerrar
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* MODAL CREAR */}
                <Dialog open={modalCreate} onOpenChange={setModalCreate}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Nueva lección</DialogTitle>
                            <DialogDescription>Completa los datos para publicar una nueva lección.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label>Curso *</Label>
                                    <Select value={form.curso_id} onValueChange={(v) => setForm({ ...form, curso_id: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(cursos || []).map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.gestion?.año} - P.{c.paralelo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Materia *</Label>
                                    <Select value={form.materia_id} onValueChange={(v) => setForm({ ...form, materia_id: v, tema_id: '' })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(materias || []).map((m) => (
                                                <SelectItem key={m.id} value={String(m.id)}>
                                                    {m.codigo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Tema del temario</Label>
                                    <Select
                                        value={form.tema_id || 'none'}
                                        onValueChange={(v) => setForm({ ...form, tema_id: v === 'none' ? '' : v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sin tema específico" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin tema específico</SelectItem>
                                            {temasDelForm.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.orden}. {t.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.tema_id} />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Título *</Label>
                                    <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
                                    <InputError message={errors.titulo} />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Descripción</Label>
                                    <textarea
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        className="w-full rounded-md border p-2 text-sm"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Fecha y hora de inicio (programada)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.fecha_programada}
                                        onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })}
                                    />
                                    <InputError message={errors.fecha_programada} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label>Fecha y hora de entrega *</Label>
                                        {form.fecha_entrega && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const fechaBase = form.fecha_entrega.split('T')[0];
                                                    setForm({
                                                        ...form,
                                                        fecha_entrega: `${fechaBase}T23:59`,
                                                    });
                                                }}
                                                className="text-primary cursor-pointer text-[10px] hover:underline"
                                                title="Fijar a las 23:59 hrs de ese día"
                                            >
                                                Fijar 23:59
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        value={form.fecha_entrega}
                                        onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                                    />
                                    <InputError message={errors.fecha_entrega} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label htmlFor="create-archivo">Material / Guía de la lección (PDF opcional)</Label>
                                    <FileUploadDropzone
                                        id="create-archivo"
                                        iconType="pdf"
                                        accept=".pdf,application/pdf"
                                        onFileChange={(f) => setArchivo(f)}
                                        label="Arrastra el documento PDF de la lección"
                                        helperText="Instrucciones, lecturas o consigna académica en formato PDF (máx. 20MB)"
                                    />
                                    <InputError message={errors.archivo} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar lección
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL EDITAR */}
                <Dialog open={modalEdit} onOpenChange={setModalEdit}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Editar lección</DialogTitle>
                            <DialogDescription>Actualiza los datos de "{leccionSelect?.titulo}".</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Título *</Label>
                                    <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Tema del temario</Label>
                                    <Select
                                        value={form.tema_id || 'none'}
                                        onValueChange={(v) => setForm({ ...form, tema_id: v === 'none' ? '' : v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sin tema específico" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin tema específico</SelectItem>
                                            {temasDelForm.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.orden}. {t.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Descripción</Label>
                                    <textarea
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        className="w-full rounded-md border p-2 text-sm"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Fecha y hora de inicio (programada)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.fecha_programada}
                                        onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })}
                                    />
                                    <InputError message={errors.fecha_programada} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label>Fecha y hora de entrega *</Label>
                                        {form.fecha_entrega && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const fechaBase = form.fecha_entrega.split('T')[0];
                                                    setForm({
                                                        ...form,
                                                        fecha_entrega: `${fechaBase}T23:59`,
                                                    });
                                                }}
                                                className="text-primary cursor-pointer text-[10px] hover:underline"
                                                title="Fijar a las 23:59 hrs de ese día"
                                            >
                                                Fijar 23:59
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        value={form.fecha_entrega}
                                        onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                                    />
                                    <InputError message={errors.fecha_entrega} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Estado</Label>
                                    <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activo">Activo</SelectItem>
                                            <SelectItem value="inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label htmlFor="edit-archivo">Material / Guía de la lección (PDF)</Label>
                                    {leccionSelect?.imagen && !eliminarArchivo && (
                                        <div className="mb-1.5 flex items-center justify-between rounded border bg-neutral-50 p-2 text-xs dark:bg-neutral-900">
                                            <a
                                                href={`/storage/${leccionSelect.imagen}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary flex items-center gap-1.5 hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>Ver PDF adjunto actual</span>
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEliminarArchivo(true)}
                                                className="h-6 text-xs text-red-500 hover:text-red-600"
                                            >
                                                Quitar archivo
                                            </Button>
                                        </div>
                                    )}
                                    {eliminarArchivo && (
                                        <div className="mb-1.5 flex items-center justify-between rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                            <span>El archivo adjunto actual se eliminará al guardar.</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEliminarArchivo(false)}
                                                className="h-6 text-xs"
                                            >
                                                Deshacer
                                            </Button>
                                        </div>
                                    )}
                                    <FileUploadDropzone
                                        id="edit-archivo"
                                        iconType="pdf"
                                        accept=".pdf,application/pdf"
                                        onFileChange={(f) => {
                                            setArchivo(f);
                                            if (f) setEliminarArchivo(false);
                                        }}
                                        label="Reemplazar archivo PDF de la lección"
                                        helperText="Sube un archivo PDF para actualizar la guía (máx. 20MB)"
                                    />
                                    <InputError message={errors.archivo} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalEdit(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL ELIMINAR */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar lección</DialogTitle>
                            <DialogDescription>Esta acción no se puede deshacer. ¿Eliminar "{leccionSelect?.titulo}"?</DialogDescription>
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

                {/* MODAL CREAR TEMA RÁPIDO CON ASISTENTE IA */}
                <Dialog open={modalNuevoTema} onOpenChange={setModalNuevoTema}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="text-primary h-4 w-4" />
                                Nuevo Tema para el Temario
                            </DialogTitle>
                            <DialogDescription>
                                Estructura las lecciones agregando un tema manual o extrayendo y resumiendo el contenido automáticamente desde un PDF
                                o texto con IA.
                            </DialogDescription>
                        </DialogHeader>

                        {/* SELECTOR DE MODO DE INGESTA */}
                        <div className="bg-muted/60 border-border/70 flex rounded-xl border p-1 text-xs font-semibold">
                            <button
                                type="button"
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                    modoCreacionTema === 'manual'
                                        ? 'bg-card text-primary border-primary/20 border font-bold shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setModoCreacionTema('manual')}
                            >
                                <Pencil className="h-4 w-4" />
                                Creación Manual
                            </button>
                            <button
                                type="button"
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                    modoCreacionTema === 'pdf'
                                        ? 'bg-card text-primary border-primary/20 border font-bold shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setModoCreacionTema('pdf')}
                            >
                                <Sparkles className="text-primary h-4 w-4" />
                                Cargar PDF (con IA)
                            </button>
                        </div>

                        {/* SECCIÓN DE IA CUANDO SE USA PDF */}
                        {modoCreacionTema === 'pdf' && (
                            <div className="border-primary/25 from-primary/[0.04] to-secondary/[0.04] space-y-3 rounded-2xl border bg-gradient-to-r p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-primary flex items-center gap-1.5 text-xs font-bold">
                                        <Sparkles className="h-4 w-4" />
                                        Asistente de Resumen y Estructuración IA
                                    </span>
                                    <span className="text-muted-foreground bg-card border-border rounded-md border px-2 py-0.5 text-[10px] font-medium">
                                        Lector de PDF inteligente
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-foreground text-xs font-semibold">Archivo PDF del tema o capítulo (máx. 20MB)</Label>
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setTemaPdfFile(file);
                                            setIaMensajeError(null);
                                        }}
                                        className="file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-9 cursor-pointer text-xs file:h-7 file:rounded-md file:border-0 file:text-xs"
                                    />
                                    {temaPdfFile && (
                                        <p className="text-primary flex items-center gap-1.5 pt-1 text-[11px] font-medium">
                                            <Paperclip className="h-3.5 w-3.5" />
                                            Archivo seleccionado: <strong>{temaPdfFile.name}</strong> ({(temaPdfFile.size / 1024).toFixed(0)} KB)
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={generandoResumenIA || !temaPdfFile}
                                    onClick={handleGenerarResumenIA}
                                    className="from-primary to-secondary h-9 w-full gap-2 bg-gradient-to-r text-xs font-bold text-white shadow-xs hover:opacity-90"
                                >
                                    {generandoResumenIA ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Analizando documento y redactando resumen con IA...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Extraer y Redactar Resumen con IA
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* ALERTAS DE ESTADO IA */}
                        {iaMensajeError && (
                            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{iaMensajeError}</span>
                            </div>
                        )}
                        {iaMensajeExito && (
                            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{iaMensajeExito}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveTema} className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Materia *</Label>
                                <Select
                                    value={String(temaForm.materia_id || '')}
                                    onValueChange={(v) => {
                                        const mId = Number(v);
                                        const temasMat = temas.filter((t) => t.materia_id === mId);
                                        const maxOrden = temasMat.length > 0 ? Math.max(...temasMat.map((t) => t.orden)) : 0;
                                        setTemaForm({
                                            ...temaForm,
                                            materia_id: mId,
                                            orden: String(maxOrden + 1),
                                        });
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Seleccionar materia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(materias || []).map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.codigo} - {m.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1 space-y-1">
                                    <Label htmlFor="quick_orden" className="text-xs">
                                        N° Orden *
                                    </Label>
                                    <Input
                                        id="quick_orden"
                                        type="number"
                                        min="1"
                                        value={temaForm.orden}
                                        onChange={(e) => setTemaForm({ ...temaForm, orden: e.target.value })}
                                        required
                                        className="h-8 text-xs"
                                    />
                                    <InputError message={temaErrors.orden} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label htmlFor="quick_nombre" className="text-xs">
                                        Nombre del Tema *
                                    </Label>
                                    <Input
                                        id="quick_nombre"
                                        value={temaForm.nombre}
                                        onChange={(e) => setTemaForm({ ...temaForm, nombre: e.target.value })}
                                        required
                                        className="h-8 text-xs"
                                        placeholder="Ej: Tema 3: Memoria"
                                    />
                                    <InputError message={temaErrors.nombre} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="quick_paginas" className="text-xs">
                                    Páginas de referencia (Libro)
                                </Label>
                                <Input
                                    id="quick_paginas"
                                    value={temaForm.paginas_libro}
                                    onChange={(e) => setTemaForm({ ...temaForm, paginas_libro: e.target.value })}
                                    className="h-8 text-xs"
                                    placeholder="Ej: pág. 21-35"
                                />
                                <InputError message={temaErrors.paginas_libro} />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="quick_resumen" className="text-xs">
                                        Resumen o sinopsis (Muestra generada / editable)
                                    </Label>
                                    {temaForm.resumen && (
                                        <span className="text-muted-foreground text-[10px]">{temaForm.resumen.length} caracteres</span>
                                    )}
                                </div>
                                <textarea
                                    id="quick_resumen"
                                    value={temaForm.resumen}
                                    onChange={(e) => setTemaForm({ ...temaForm, resumen: e.target.value })}
                                    className="w-full rounded-md border p-2 text-xs leading-relaxed"
                                    rows={4}
                                    placeholder="Breve descripción pedagógica del tema..."
                                />
                                <InputError message={temaErrors.resumen} />
                            </div>

                            {temaPdfFile && (
                                <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
                                    <span className="flex items-center gap-1.5 truncate">
                                        <FileText className="text-primary h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            Se guardará adjunto: <strong>{temaPdfFile.name}</strong>
                                        </span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setTemaPdfFile(null)}
                                        className="ml-2 text-xs text-neutral-400 hover:text-red-500"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setModalNuevoTema(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={processingTema || generandoResumenIA}>
                                    {processingTema && <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                    Guardar tema
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* MODAL PUBLICAR RECURSO DE ESTUDIO */}
                <Dialog open={modalNuevoRecurso} onOpenChange={setModalNuevoRecurso}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                Nuevo Recurso de Estudio
                            </DialogTitle>
                            <DialogDescription>
                                Publica material didáctico (PDF, diapositivas o enlaces de investigación/YouTube) que los estudiantes podrán consultar
                                directamente.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveRecurso} className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Materia *</Label>
                                <Select
                                    value={String(recursoForm.materia_id || '')}
                                    onValueChange={(v) => setRecursoForm({ ...recursoForm, materia_id: Number(v) })}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Seleccionar materia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(materias || []).map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.codigo} - {m.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={recursoErrors.materia_id} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Tema del Temario</Label>
                                <Select
                                    value={recursoForm.tema_id ? String(recursoForm.tema_id) : 'none'}
                                    onValueChange={(v) =>
                                        setRecursoForm({
                                            ...recursoForm,
                                            tema_id: v === 'none' ? null : Number(v),
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Sin tema específico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin tema específico (General)</SelectItem>
                                        {temas
                                            .filter((t) => !recursoForm.materia_id || t.materia_id === recursoForm.materia_id)
                                            .map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.orden}. {t.nombre}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={recursoErrors.tema_id} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="rec_titulo" className="text-xs">
                                    Título del Recurso *
                                </Label>
                                <Input
                                    id="rec_titulo"
                                    value={recursoForm.titulo}
                                    onChange={(e) => setRecursoForm({ ...recursoForm, titulo: e.target.value })}
                                    required
                                    className="h-8 text-xs"
                                    placeholder="Ej: Diapositivas Unidad 3 o Video de la Sinapsis"
                                />
                                <InputError message={recursoErrors.titulo} />
                            </div>

                            {/* SELECTOR TIPO DE RECURSO */}
                            <div className="space-y-1">
                                <Label className="text-xs">Tipo de Recurso *</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-all ${
                                            recursoForm.tipo === 'pdf'
                                                ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400'
                                        }`}
                                        onClick={() => setRecursoForm({ ...recursoForm, tipo: 'pdf' })}
                                    >
                                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                                        Documento / PDF
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-all ${
                                            recursoForm.tipo === 'enlace'
                                                ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400'
                                        }`}
                                        onClick={() => setRecursoForm({ ...recursoForm, tipo: 'enlace' })}
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                                        Enlace Web / YouTube
                                    </button>
                                </div>
                            </div>

                            {/* SI ES ARCHIVO */}
                            {recursoForm.tipo !== 'enlace' ? (
                                <div className="space-y-1">
                                    <Label htmlFor="rec_archivo" className="text-xs">
                                        Seleccionar Archivo (PDF, Word, PPTX - máx 25MB) *
                                    </Label>
                                    <Input
                                        id="rec_archivo"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                                        onChange={(e) =>
                                            setRecursoForm({
                                                ...recursoForm,
                                                archivo: e.target.files?.[0] || null,
                                            })
                                        }
                                        className="h-8 text-xs file:h-6 file:text-xs"
                                    />
                                    <InputError message={recursoErrors.archivo} />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Label htmlFor="rec_url" className="text-xs">
                                        URL / Enlace externo (YouTube, Google Scholar, Scielo...) *
                                    </Label>
                                    <Input
                                        id="rec_url"
                                        type="url"
                                        value={recursoForm.enlace_url}
                                        onChange={(e) =>
                                            setRecursoForm({
                                                ...recursoForm,
                                                enlace_url: e.target.value,
                                            })
                                        }
                                        placeholder="https://www.youtube.com/watch?v=... o https://..."
                                        className="h-8 text-xs"
                                        required
                                    />
                                    <InputError message={recursoErrors.enlace_url} />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label htmlFor="rec_descripcion" className="text-xs">
                                    Orientación o descripción breve (Opcional)
                                </Label>
                                <textarea
                                    id="rec_descripcion"
                                    value={recursoForm.descripcion}
                                    onChange={(e) =>
                                        setRecursoForm({
                                            ...recursoForm,
                                            descripcion: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border p-2 text-xs"
                                    rows={2}
                                    placeholder="Nota breve para orientar la lectura o estudio..."
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setModalNuevoRecurso(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={processingRecurso}>
                                    {processingRecurso && <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                    Publicar recurso
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
