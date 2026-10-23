import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Bot,
<<<<<<< HEAD
=======
    BookOpen,
>>>>>>> f02ee8f72cd60c3e48d898cbed1151d84ae0f668
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    FileText,
    FileUp,
    GraduationCap,
    LoaderCircle,
    MessageSquare,
    Paperclip,
    Pencil,
    Sparkles,
    Upload,
    User as UserIcon,
} from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import AppLayout from '@/layouts/app-layout';
import {
    calcularTiempoRestanteMoodle,
    formatoFechaMoodle,
    obtenerEstadoVencimiento,
} from '@/lib/formatters';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface UserData {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
}

interface MateriaData {
    id: number;
    nombre: string;
    codigo: string;
}

interface TemaData {
    id: number;
    nombre: string;
    orden: number;
    paginas_libro?: string | null;
    resumen?: string | null;
}

interface DocenteData {
    id: number;
    user: UserData;
}

interface CursoData {
    id: number;
    paralelo: string;
    gestion: { año: number; etapa: string };
}

interface LeccionData {
    id: number;
    hash_id?: string;
    titulo: string;
    tema: string | null;
    descripcion: string | null;
    fecha_programada: string | null;
    fecha_entrega: string | null;
    imagen?: string | null;
    estado: string;
    materia: MateriaData;
    temario?: TemaData | null;
    docente: DocenteData;
    curso: CursoData;
}

interface CalificacionData {
    id: number;
    nota: number;
    comentarios: string | null;
    fecha_calificacion?: string | null;
    created_at?: string;
}

interface RefuerzoData {
    id: number;
    hash_id?: string;
    completado: boolean;
    preguntas: string[];
    recomendacion?: string | null;
}

interface EntregaData {
    id: number;
    estado_entrega: string;
    estado_calificacion: string;
    fecha_entrega: string | null;
    updated_at?: string | null;
    archivos_enviado: string[] | null;
    comentarios: string | null;
    calificacion: CalificacionData | null;
    refuerzo?: RefuerzoData | null;
}

interface Props {
    leccion: LeccionData;
    entrega: EntregaData | null;
    rol: string;
        // 👇LÍNEAS nuevas de ML:
    prediccion_ml?: {
        prediccion_sin_leer: number;
        prediccion_con_leer: number;
        beneficio: number;
    } | null;
    tema_siguiente?: string | null;
    paginas_siguiente?: string | null;
}

<<<<<<< HEAD
export default function LeccionesShow({ leccion, entrega: entregaInicial, rol }: Props) {
=======
export default function LeccionesShow({ leccion, entrega: entregaInicial, rol, prediccion_ml, tema_siguiente, paginas_siguiente  }: Props) {
>>>>>>> f02ee8f72cd60c3e48d898cbed1151d84ae0f668
    const pageProps = usePage<SharedData>().props;
    const authUser = pageProps.auth?.user;
    const { flash } = pageProps as { flash?: { success?: string; error?: string } };

    const [entrega, setEntrega] = useState<EntregaData | null>(entregaInicial);
    const [modalSubir, setModalSubir] = useState(false);
    const [archivos, setArchivos] = useState<FileList | null>(null);
    const [comentarios, setComentarios] = useState(entrega?.comentarios || '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mostrarResumen, setMostrarResumen] = useState(false);
    const [comentariosAbierto, setComentariosAbierto] = useState(false);

    useEffect(() => {
        setEntrega(entregaInicial);
        if (entregaInicial?.comentarios) {
            setComentarios(entregaInicial.comentarios);
        }
    }, [entregaInicial]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const nombreCompleto = (u?: UserData | null) => {
        if (!u) return 'Docente no asignado';
        return `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`.trim();
    };

    const inicialesDocente = useMemo(() => {
        if (!leccion.docente?.user) return 'DC';
        const { nombre, apellido_paterno } = leccion.docente.user;
        const n = nombre ? nombre.trim()[0] : 'D';
        const a = apellido_paterno ? apellido_paterno.trim()[0] : 'C';
        return `${n}${a}`.toUpperCase();
    }, [leccion.docente]);

    const esEstudiante = rol === 'estudiante';
    const estadoVenc = obtenerEstadoVencimiento(leccion.fecha_entrega, leccion.fecha_programada);

    // Permisos de edición de entrega
    const puedeEditarExistente =
        entrega &&
        entrega.estado_calificacion !== 'calificado' &&
        !estadoVenc?.vencido;
    const puedeEntregar = esEstudiante && (!entrega || puedeEditarExistente);

    // Cálculo estilo Moodle de tiempos
    const tiempoInfo = useMemo(() => {
        return calcularTiempoRestanteMoodle(entrega?.fecha_entrega, leccion.fecha_entrega);
    }, [entrega?.fecha_entrega, leccion.fecha_entrega]);

    // Información del refuerzo
    const calificacionNota = entrega?.calificacion ? Number(entrega.calificacion.nota) : null;
    const esNotaBaja = calificacionNota !== null && calificacionNota < 70;
    const tieneRefuerzo = !!entrega?.refuerzo;
    const refuerzoCompletado = entrega?.refuerzo?.completado ?? false;

    // Nombre amigable del estudiante para la tarjeta
    const estudianteNombre = authUser?.nombre || 'Estudiante';
    const temaNombre =
        leccion.temario?.nombre ||
        leccion.tema ||
        `Tema de ${leccion.materia.nombre}`;
    const paginasLibro = leccion.temario?.paginas_libro || '9-20';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mis Entregas', href: '/entregas' },
        {
            title: leccion.materia?.codigo || 'Materia',
            href: `/lecciones?materia_id=${leccion.materia?.id}`,
        },
        { title: leccion.titulo, href: '' },
    ];

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!archivos || archivos.length === 0) {
            setErrors({ archivos: 'Selecciona al menos un archivo para subir' });
            return;
        }

        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('leccion_id', String(leccion.id));
        for (let i = 0; i < archivos.length; i++) {
            formData.append('archivos[]', archivos[i]);
        }
        formData.append('comentarios', comentarios);

        router.post('/entregas', formData, {
            onSuccess: () => {
                setProcessing(false);
                setModalSubir(false);
                setArchivos(null);
                toast.success('Entrega guardada exitosamente');
                router.reload();
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
                toast.error('Hubo un error al subir la entrega');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={leccion.titulo} />

            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Botón de retroceso y enlace rápido */}
                <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
                        <Link href={esEstudiante ? '/entregas' : '/lecciones'}>
                            <ArrowLeft className="h-4 w-4" />
                            {esEstudiante ? 'Volver a Mis Entregas' : 'Volver a Lecciones'}
                        </Link>
                    </Button>

                    {!esEstudiante && (
                        <Button size="sm" asChild variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-200">
                            <Link href={`/lecciones/${leccion.hash_id || leccion.id}/entregas`}>
                                <FileText className="mr-1.5 h-4 w-4" />
                                Ver entregas del curso
                            </Link>
                        </Button>
                    )}
                </div>

                {/* ============================================================== */}
                {/* 1. CABECERA PRINCIPAL ESTILO MOODLE / LMS                      */}
                {/* ============================================================== */}
                <div className="space-y-3">
                    {/* Migas de pan de la materia y capítulo */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                        <span className="hover:text-indigo-600 transition-colors">
                            {leccion.materia.codigo}
                            {leccion.curso ? `_${leccion.curso.paralelo}_${leccion.curso.gestion?.año}` : ''}
                        </span>
                        <span>&gt;</span>
                        <span className="uppercase">{temaNombre}</span>
                        <span>&gt;</span>
                        <span className="text-foreground uppercase">{leccion.titulo}</span>
                    </div>

                    {/* Título de la tarea con icono rosado característico de Moodle */}
                    <div className="flex items-start gap-3.5">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 border border-pink-200 dark:border-pink-900/60 shadow-xs">
                            <FileUp className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
                                {leccion.titulo}
                            </h1>
                            {leccion.tema && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {leccion.tema}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================== */}
                {/* 2. BLOQUE DE APERTURA, CIERRE, DESCRIPCIÓN Y MATERIAL ADJUNTO  */}
                {/* ============================================================== */}
                <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
                    {/* Fechas de Apertura y Cierre exactas en español */}
                    <div className="space-y-1 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 w-20">Apertura:</span>
                            <span>{formatoFechaMoodle(leccion.fecha_programada)}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 w-20">Cierre:</span>
                            <span className="font-medium text-rose-600 dark:text-rose-400">
                                {formatoFechaMoodle(leccion.fecha_entrega)}
                            </span>
                        </div>
                    </div>

                    {/* Descripción de la tarea si existe */}
                    {leccion.descripcion && (
                        <div className="border-t pt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                            {leccion.descripcion}
                        </div>
                    )}

                    {/* Material o archivo de guía adjunto con botón ✨ Resumir */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            <Paperclip className="h-4 w-4" />
                            {leccion.imagen ? (
                                <a
                                    href={`/storage/${leccion.imagen}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline flex items-center gap-1.5"
                                >
                                    <span>Material / Guía de la Tarea</span>
                                    <Download className="h-3 w-3" />
                                </a>
                            ) : (
                                <span className="text-muted-foreground">
                                    Guía de actividades y especificaciones del laboratorio
                                </span>
                            )}
                            {leccion.fecha_programada && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    · {formatoFechaMoodle(leccion.fecha_programada)}
                                </span>
                            )}
                        </div>

                        {/* Botón Resumir con IA */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMostrarResumen(!mostrarResumen)}
                            className="h-8 gap-1.5 text-xs border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-200"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                            {mostrarResumen ? 'Ocultar Resumen' : 'Resumir'}
                        </Button>
                    </div>

                    {/* Panel desplegable con resumen inteligente */}
                    {mostrarResumen && (
                        <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 p-4 text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-200">
                                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Resumen de Instrucciones de la Lección</span>
                            </div>
                            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {leccion.temario?.resumen ||
                                    leccion.descripcion ||
                                    'Esta actividad evalúa los conceptos teóricos y prácticos del tema. Debes entregar los archivos requeridos antes de la fecha límite para asegurar tu calificación completa.'}
                            </p>
                            {leccion.temario?.paginas_libro && (
                                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium pt-1">
                                    📖 Referencia bibliográfica: {leccion.temario.paginas_libro} ({temaNombre})
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ============================================================== */}
                {/* 3. TABLA "ESTADO DE LA ENTREGA" (ESTRUCTURA IDÉNTICA A MOODLE) */}
                {/* ============================================================== */}
                <div className="space-y-3">
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Estado de la entrega
                    </h2>

                    <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                        <table className="w-full text-xs sm:text-sm border-collapse">
                            <tbody>
                                {/* Fila 1: Estado de la entrega */}
                                <tr className="border-b transition-colors hover:bg-muted/40">
                                    <th className="w-1/3 sm:w-1/4 py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                        Estado de la entrega
                                    </th>
                                    <td
                                        className={`py-3.5 px-4 font-medium ${
                                            entrega
                                                ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                : 'text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        {entrega ? 'Enviado para calificar' : 'No entregado'}
                                    </td>
                                </tr>

                                {/* Fila 2: Estado de la calificación */}
                                <tr className="border-b transition-colors hover:bg-muted/40">
                                    <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                        Estado de la calificación
                                    </th>
                                    <td
                                        className={`py-3.5 px-4 font-medium ${
                                            entrega?.estado_calificacion === 'calificado'
                                                ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                : 'text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        {entrega?.estado_calificacion === 'calificado'
                                            ? 'Calificado'
                                            : 'Sin calificar'}
                                    </td>
                                </tr>

                                {/* Fila 3: Tiempo restante */}
                                <tr className="border-b transition-colors hover:bg-muted/40">
                                    <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                        Tiempo restante
                                    </th>
                                    <td
                                        className={`py-3.5 px-4 font-medium ${
                                            tiempoInfo.esAnticipado
                                                ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                : tiempoInfo.esAtrasado
                                                ? 'bg-rose-100/70 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300'
                                                : 'text-neutral-700 dark:text-neutral-300'
                                        }`}
                                    >
                                        {tiempoInfo.texto}
                                    </td>
                                </tr>

                                {/* Fila 4: Última modificación */}
                                <tr className="border-b transition-colors hover:bg-muted/40">
                                    <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                        Última modificación
                                    </th>
                                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                                        {entrega?.fecha_entrega
                                            ? formatoFechaMoodle(entrega.fecha_entrega)
                                            : entrega?.updated_at
                                            ? formatoFechaMoodle(entrega.updated_at)
                                            : '-'}
                                    </td>
                                </tr>

                                {/* Fila 5: Archivos enviados */}
                                <tr className="border-b transition-colors hover:bg-muted/40">
                                    <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                        Archivos enviados
                                    </th>
                                    <td className="py-3.5 px-4">
                                        {entrega?.archivos_enviado && entrega.archivos_enviado.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {entrega.archivos_enviado.map((ruta, i) => {
                                                    const nombreLimpio = ruta.split('/').pop() || `Archivo_${i + 1}`;
                                                    return (
                                                        <div key={i} className="flex flex-wrap items-center gap-2">
                                                            <a
                                                                href={`/storage/${ruta}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-xs sm:text-sm"
                                                            >
                                                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                                                <span className="truncate max-w-xs sm:max-w-md">{nombreLimpio}</span>
                                                            </a>
                                                            {entrega.fecha_entrega && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatoFechaMoodle(entrega.fecha_entrega)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                </tr>

                                {/* Fila 6: Comentarios de la entrega */}
                                <tr className="transition-colors hover:bg-muted/40">
                                    <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                        Comentarios de la entrega
                                    </th>
                                    <td className="py-3.5 px-4">
                                        <button
                                            type="button"
                                            onClick={() => setComentariosAbierto(!comentariosAbierto)}
                                            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline cursor-pointer"
                                        >
                                            {comentariosAbierto ? (
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            )}
                                            <span>
                                                Comentarios ({entrega?.comentarios ? 1 : 0})
                                            </span>
                                        </button>

                                        {comentariosAbierto && (
                                            <div className="mt-2.5 rounded-md bg-muted/50 p-3 text-xs text-neutral-700 dark:text-neutral-300 border">
                                                {entrega?.comentarios ? (
                                                    <p className="whitespace-pre-line">{entrega.comentarios}</p>
                                                ) : (
                                                    <p className="text-muted-foreground italic">
                                                        No se agregaron comentarios para esta entrega.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Botón de acción para el estudiante (Subir / Editar entrega) */}
                    {esEstudiante && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {puedeEntregar && (
                                <Button
                                    onClick={() => setModalSubir(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                                >
                                    {entrega ? (
                                        <>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar entrega
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Agregar entrega
                                        </>
                                    )}
                                </Button>
                            )}

                            {entrega && !puedeEditarExistente && (
                                <p className="text-xs text-muted-foreground italic">
                                    {entrega.estado_calificacion === 'calificado'
                                        ? 'Esta entrega ya fue calificada y no admite cambios.'
                                        : 'El plazo límite de entrega ha concluido.'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ============================================================== */}
                {/* 4. SECCIÓN "COMENTARIO" / CALIFICACIÓN DEL DOCENTE             */}
                {/* ============================================================== */}
                {entrega?.calificacion && (
                    <div className="space-y-3 pt-2">
                        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Comentario
                        </h2>

                        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                            <table className="w-full text-xs sm:text-sm border-collapse">
                                <tbody>
                                    {/* Calificación */}
                                    <tr className="border-b transition-colors hover:bg-muted/40">
                                        <th className="w-1/3 sm:w-1/4 py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                            Calificación
                                        </th>
                                        <td className="py-3.5 px-4 font-bold text-base text-neutral-900 dark:text-neutral-100">
                                            {Number(entrega.calificacion.nota).toFixed(2).replace('.', ',')} / 100,00
                                        </td>
                                    </tr>

                                    {/* Calificado sobre */}
                                    <tr className="border-b transition-colors hover:bg-muted/40">
                                        <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                            Calificado sobre
                                        </th>
                                        <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                                            {formatoFechaMoodle(
                                                entrega.calificacion.fecha_calificacion ||
                                                    entrega.calificacion.created_at
                                            )}
                                        </td>
                                    </tr>

                                    {/* Calificado por (con avatar MM como en la imagen 2) */}
                                    <tr className="border-b transition-colors hover:bg-muted/40">
                                        <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                            Calificado por
                                        </th>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs uppercase shadow-xs">
                                                    {inicialesDocente}
                                                </div>
                                                <span className="font-semibold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 uppercase">
                                                    {nombreCompleto(leccion.docente?.user)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Comentarios de retroalimentación del docente */}
                                    {entrega.calificacion.comentarios && (
                                        <tr className="transition-colors hover:bg-muted/40">
                                            <th className="py-3.5 px-4 text-left font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50/70 dark:bg-neutral-900/40 border-r">
                                                Comentarios de retroalimentación
                                            </th>
                                            <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                                                {entrega.calificacion.comentarios}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* 5. DOS CUADROS DIVIDIDOS (MACHINE LEARNING + REFUERZO INMEDIATO)*/}
                {/* ============================================================== */}
                {Boolean(entrega?.calificacion && entrega?.estado_calificacion === 'calificado') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        {/* ------------------------------------------------------------ */}
                        {/* CUADRO 1 (IZQUIERDA): MACHINE LEARNING                       */}
                        {/* ------------------------------------------------------------ */}
<<<<<<< HEAD
                        <div className="rounded-xl border border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-background dark:from-indigo-950/30 dark:via-purple-950/20 dark:border-indigo-800 p-5 space-y-3.5 shadow-xs flex flex-col justify-between">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm tracking-wide">
                                        <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <span>MÓDULO DE MACHINE LEARNING</span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 font-medium"
                                    >
                                        Aquí hay que trabajar
                                    </Badge>
                                </div>

                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Espacio reservado para el modelo predictivo de Machine Learning. Aquí se procesará el historial académico, las calificaciones y patrones de asimilación del estudiante para emitir recomendaciones adaptativas.
                                </p>
                            </div>

                            <div className="rounded-lg bg-background/80 dark:bg-neutral-900/60 border p-3.5 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 font-semibold">
                                    <span>Predicción de Rendimiento:</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 text-[11px]">
                                        Integración pendiente
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-2/3 rounded-full animate-pulse" />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Datos esperados: Detección temprana de rezago y recomendación preventiva de contenidos.
                                </p>
                            </div>
                        </div>

=======
<div className="rounded-xl border border-indigo-300 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-background dark:from-indigo-950/40 dark:via-purple-950/30 dark:border-indigo-800 p-5 space-y-3.5 shadow-xs flex flex-col justify-between">
    <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm tracking-wide">
                <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>PREDICCIÓN DE RENDIMIENTO PARA EL PROXIMO TEMA</span>
            </div>
            <Badge
                variant="outline"
                className="text-[10px] bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 font-medium"
            >
                ML Predictivo
            </Badge>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Basado en tu historial académico y el análisis de {temaNombre}, nuestro modelo predice tu rendimiento en el próximo tema.
        </p>
    </div>

    {/* Mostrar predicciones si existen */}
    {prediccion_ml ? (
        <div className="space-y-3">
            {/* Próximo tema */}
            {tema_siguiente && (
                <div className="rounded-lg bg-indigo-100/60 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 p-2.5">
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mb-1">
                        Próximo tema:
                    </p>
                    <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100">
                        {tema_siguiente}
                    </p>
                    {paginas_siguiente && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                            📖 Lectura recomendada: {paginas_siguiente}
                        </p>
                    )}
                </div>
            )}

            {/* Dos predicciones */}
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-2.5">
                    <p className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold mb-1">
                        ⚠️ Sin prepararte:
                    </p>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        ~{prediccion_ml.prediccion_sin_leer}/100
                    </p>
                </div>
                <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5">
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                        ✅ Leyendo {paginas_siguiente || 'el material'}:
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ~{prediccion_ml.prediccion_con_leer}/100
                    </p>
                </div>
            </div>

            {/* Beneficio */}
            <div className="rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-800 p-2.5 text-center">
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                     Beneficio de prepararte:
                </p>
                <p className="text-base font-bold text-indigo-900 dark:text-indigo-100">
                    +{prediccion_ml.beneficio} puntos
                </p>
            </div>

            {/* Mensaje informativo (reemplaza al botón) */}
            {paginas_siguiente && (
                <div className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 shadow-sm text-xs mt-2">
                    <BookOpen className="h-4 w-4" />
                    Leer el texto guía ({paginas_siguiente})
                </div>
            )}
        </div>
    ) : (
        <div className="rounded-lg bg-background/80 dark:bg-neutral-900/60 border p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 font-semibold">
                <span>Estado del modelo:</span>
                <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                    Procesando datos
                </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-2/3 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] text-muted-foreground">
                El sistema está analizando tu desempeño para generar predicciones personalizadas.
            </p>
        </div>
    )}
</div>

>>>>>>> f02ee8f72cd60c3e48d898cbed1151d84ae0f668
                        {/* ------------------------------------------------------------ */}
                        {/* CUADRO 2 (DERECHA): REFUERZO INMEDIATO (CORRECTIVO) - IMAGEN 3*/}
                        {/* ------------------------------------------------------------ */}
                        <div className="rounded-xl border border-sky-300 bg-sky-50/70 dark:bg-sky-950/30 dark:border-sky-800/80 p-5 shadow-xs flex flex-col justify-between space-y-3.5 relative overflow-hidden">
                            {/* Acento lateral decorativo tipo corchete / wireframe */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500 dark:bg-sky-400" />

                            <div className="space-y-2.5 pl-1">
                                {/* Cabecera del cuadro idéntica a la Imagen 3 */}
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-bold text-sm tracking-wide text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                                        <span>🔧</span>
                                        <span>REFUERZO INMEDIATO (Correctivo)</span>
                                    </h3>
                                    {esNotaBaja && (
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                                            Acción requerida
                                        </Badge>
                                    )}
                                </div>

                                {/* Subtítulo dinámico con nombre y nota del estudiante */}
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {estudianteNombre}, tu nota en {temaNombre} fue{' '}
                                    <span className={esNotaBaja ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                        {calificacionNota !== null ? `${Math.round(calificacionNota)}/100` : 'pendiente'}
                                    </span>{' '}
                                    {esNotaBaja ? '⚠️' : '✅'}
                                </p>

                                {/* Sección Recomendación con viñetas idénticas a la Imagen 3 */}
                                <div className="space-y-1.5 pt-1 text-xs text-neutral-700 dark:text-neutral-300">
                                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        Recomendación:
                                    </p>
                                    <ul className="space-y-1 list-none pl-1">
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-neutral-500 shrink-0">•</span>
                                            <span>
                                                Vuelve a leer: <strong>pág. {paginasLibro}</strong> ({temaNombre})
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-neutral-500 shrink-0">•</span>
                                            <span>Responde estas 10 preguntas de práctica</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-neutral-500 shrink-0">•</span>
                                            <span>Esto te ayudará en el examen final</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Botón de acción: [📝 Iniciar práctica] redirigido al refuerzo */}
                            <div className="pt-2 pl-1">
                                {tieneRefuerzo ? (
                                    refuerzoCompletado ? (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="w-full sm:w-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200 text-xs"
                                        >
                                            <Link href={`/refuerzos/${entrega?.refuerzo?.hash_id || entrega?.refuerzo?.id}`}>
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                                                ✅ Práctica completada (Ver respuestas)
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            size="sm"
                                            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-xs text-xs"
                                        >
                                            <Link href={`/refuerzos/${entrega?.refuerzo?.hash_id || entrega?.refuerzo?.id}`}>
                                                <span className="mr-1.5">📝</span>
                                                Iniciar práctica
                                                <ExternalLink className="ml-1.5 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )
                                ) : esNotaBaja ? (
                                    <div className="rounded-md bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2 text-xs text-amber-800 dark:text-amber-300">
                                        El docente habilitará las 10 preguntas de práctica con IA en breve.
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                        {calificacionNota !== null
                                            ? '¡Felicidades! Has aprobado este tema exitosamente.'
                                            : 'Las preguntas de refuerzo se activarán cuando tu tarea sea calificada.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* 6. MODAL PARA SUBIR / EDITAR ENTREGA                           */}
                {/* ============================================================== */}
                <Dialog open={modalSubir} onOpenChange={setModalSubir}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {entrega ? 'Editar Entrega' : 'Agregar Entrega'}
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-1 text-xs">
                                    <p className="font-semibold text-foreground">{leccion.titulo}</p>
                                    {leccion.fecha_entrega && (
                                        <p className="text-rose-600 dark:text-rose-400">
                                            Límite: {formatoFechaMoodle(leccion.fecha_entrega)}
                                        </p>
                                    )}
                                </div>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="archivos_entrega">
                                    Archivos de la entrega *
                                </Label>
                                <Input
                                    id="archivos_entrega"
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        setArchivos(e.target.files);
                                        if (e.target.files && e.target.files.length > 0) {
                                            setErrors({});
                                        }
                                    }}
                                />
                                {archivos && archivos.length > 0 && (
                                    <p className="text-xs text-emerald-600 font-medium">
                                        {archivos.length} archivo(s) seleccionado(s)
                                    </p>
                                )}
                                {errors.archivos && (
                                    <p className="text-xs text-rose-500">{errors.archivos}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="comentarios_entrega">
                                    Comentarios de la entrega (opcional)
                                </Label>
                                <textarea
                                    id="comentarios_entrega"
                                    value={comentarios}
                                    onChange={(e) => setComentarios(e.target.value)}
                                    className="w-full rounded-md border p-2 text-xs sm:text-sm bg-background"
                                    rows={3}
                                    placeholder="Puedes escribir alguna observación o nota para tu docente..."
                                />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setModalSubir(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {entrega ? 'Guardar cambios' : 'Subir entrega'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}