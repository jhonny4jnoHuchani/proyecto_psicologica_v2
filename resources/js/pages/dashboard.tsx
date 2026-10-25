import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    FileCheck,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    ImagePlus,
    Inbox,
    LayoutGrid,
    Plus,
    School,
    Send,
    Sparkles,
    TrendingUp,
    UserCheck,
    Users,
    Wand2,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatoFechaHora, obtenerEstadoVencimiento } from '@/lib/formatters';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface Stats {
    gestiones_activas: number;
    cursos_activos: number;
    total_docentes: number;
    total_estudiantes: number;
    total_lecciones?: number;
    total_entregas?: number;
    entregas_calificadas?: number;
    entregas_pendientes?: number;
    total_calificaciones?: number;
    aprobados?: number;
    reprobados?: number;
    promedio_general?: number;
    tasa_aprobacion?: number;
    total_refuerzos?: number;
    refuerzos_completados?: number;
    refuerzos_pendientes?: number;
}

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    pivot: {
        id: number;
        docente_id: number;
        ayuda_ia_activa: boolean;
        imagen: string | null;
    };
}

interface Curso {
    id: number;
    paralelo: string;
    estado: string;
    turno: string;
    gestion: { año: number; etapa: string };
    materias: Materia[];
}

interface GestionItem {
    id: number;
    año: number;
    etapa: string;
    estado: string;
}

export interface EstudianteRiesgo {
    id: number;
    hash_id?: string;
    nombre: string;
    codigo: string;
    curso: string;
    promedio: number | null;
    tareas_reprobadas: number;
    refuerzos_pendientes: number;
    nivel: 'alto' | 'medio' | 'bajo';
    motivo: string;
}

export interface SemaforoData {
    resumen: {
        alto: number;
        medio: number;
        bajo: number;
        total: number;
    };
    estudiantes_riesgo: EstudianteRiesgo[];
}

interface DocenteStats {
    entregas_pendientes: number;
    total_lecciones: number;
    total_refuerzos: number;
}

interface UltimaEntregaPendiente {
    id: number;
    created_at: string;
    estudiante: {
        user: {
            nombre: string;
            apellido_paterno: string;
            apellido_materno: string;
        };
    };
    leccion: {
        id: number;
        titulo: string;
        materia: {
            id: number;
            nombre: string;
            codigo: string;
        };
    };
}

interface TareaPendiente {
    id: number;
    hash_id?: string;
    titulo: string;
    descripcion?: string | null;
    fecha_entrega: string | null;
    materia: {
        id: number;
        nombre: string;
        codigo: string;
    };
    docente?: {
        user: {
            nombre: string;
            apellido_paterno: string;
        };
    };
    curso?: {
        paralelo: string;
        gestion: {
            año: number;
            etapa: string;
        };
    };
}

interface RefuerzoPendiente {
    id: number;
    hash_id?: string;
    completado: boolean;
    created_at: string;
    entrega?: {
        leccion?: {
            titulo?: string;
            materia?: {
                id: number;
                nombre: string;
                codigo: string;
            };
        };
        calificacion?: {
            nota: number;
        };
    };
}

interface UltimaCalificacion {
    id: number;
    fecha_entrega: string;
    leccion: {
        titulo: string;
        materia: {
            nombre: string;
        };
    };
    calificacion: {
        nota: number;
        comentarios: string | null;
        fecha_calificacion: string | null;
    };
}

interface ResumenEstudiante {
    total_materias: number;
    tareas_pendientes_count: number;
    refuerzos_pendientes_count: number;
    promedio_general: number | null;
}

interface Props {
    rol?: string;
    stats?: Stats;
    cursos?: Curso[];
    gestiones?: GestionItem[];
    filtro_gestion_id?: string;
    semaforo?: SemaforoData;
    // Docente
    docente_stats?: DocenteStats;
    ultimas_entregas_pendientes?: UltimaEntregaPendiente[];
    // Estudiante
    tareas_pendientes?: TareaPendiente[];
    refuerzos_pendientes?: RefuerzoPendiente[];
    ultimas_calificaciones?: UltimaCalificacion[];
    resumen?: ResumenEstudiante;
}

export default function Dashboard({
    rol,
    stats,
    cursos,
    gestiones,
    filtro_gestion_id,
    semaforo,
    docente_stats,
    ultimas_entregas_pendientes,
    tareas_pendientes,
    refuerzos_pendientes,
    ultimas_calificaciones,
    resumen,
}: Props) {
    const totalCalificaciones = stats?.total_calificaciones || 0;
    const tasaAprobacion = stats?.tasa_aprobacion || 0;
    const aprobados = stats?.aprobados || 0;
    const reprobados = stats?.reprobados || 0;
    const promedioGeneral = stats?.promedio_general || 0;

    const totalRefuerzos = stats?.total_refuerzos || 0;
    const refuerzosCompletados = stats?.refuerzos_completados || 0;
    const refuerzosPendientes = stats?.refuerzos_pendientes || 0;
    const tasaRefuerzosCompletados = totalRefuerzos > 0 ? Math.round((refuerzosCompletados / totalRefuerzos) * 100) : 0;

    const totalEntregas = stats?.total_entregas || 0;
    const entregasCalificadas = stats?.entregas_calificadas || 0;
    const entregasPendientes = stats?.entregas_pendientes || 0;
    const tasaEntregasCalificadas = totalEntregas > 0 ? Math.round((entregasCalificadas / totalEntregas) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {rol === 'admin' && 'Panel de Control y Estadísticas'}
                            {rol === 'docente' && 'Mis Cursos y Materias'}
                            {rol === 'estudiante' && 'Mi Aula Virtual'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {rol === 'admin' && 'Monitoreo en tiempo real del rendimiento académico, entregas y asistencia con IA.'}
                            {rol === 'docente' && 'Gestiona tus materias asignadas, lecciones y apoyo a estudiantes.'}
                            {rol === 'estudiante' && 'Revisa tus lecciones asignadas, tareas pendientes y actividades de refuerzo.'}
                        </p>
                    </div>

                    {rol === 'admin' && (
                        <div className="flex flex-wrap items-center gap-2">
                            {gestiones && gestiones.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                                        <Filter className="h-3.5 w-3.5" />
                                        Gestión:
                                    </span>
                                    <Select
                                        value={filtro_gestion_id || 'all'}
                                        onValueChange={(val) => {
                                            router.get(
                                                '/dashboard',
                                                val === 'all' ? {} : { gestion_id: val },
                                                { preserveState: true, preserveScroll: true }
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-44 text-xs bg-card">
                                            <SelectValue placeholder="Todas las gestiones" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las gestiones</SelectItem>
                                            {gestiones.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>
                                                    {g.año} - {g.etapa} {g.estado === 'activo' ? '(Activa)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Link
                                href="/reportes"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted transition-colors shadow-xs"
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Ver Reportes</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ======================== ADMIN: MÉTRICAS Y CUADROS ESTADÍSTICOS ======================== */}
                {rol === 'admin' && stats && (
                    <div className="space-y-6">
                        {/* Atajos y Acciones Rápidas del Administrador */}
                        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent shadow-xs">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">Atajos y Acciones Rápidas</p>
                                            <p className="text-[11px] text-muted-foreground">Acceso directo a las tareas frecuentes del sistema</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link href="/estudiantes" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs">
                                            <Plus className="h-3.5 w-3.5 text-blue-500" />
                                            <span>Estudiante</span>
                                        </Link>
                                        <Link href="/estudiantes/importar/plantilla" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs">
                                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>Importar Excel</span>
                                        </Link>
                                        <Link href="/cursos" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs">
                                            <Plus className="h-3.5 w-3.5 text-indigo-500" />
                                            <span>Nuevo Curso</span>
                                        </Link>
                                        <Link href="/gestiones" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs">
                                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                            <span>Gestiones</span>
                                        </Link>
                                        <Link href="/reportes" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs">
                                            <BarChart3 className="h-3.5 w-3.5 text-amber-500" />
                                            <span>Reportes</span>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 1. KPIs Superiores */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <Card className="shadow-xs hover:border-primary/40 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Gestiones</CardTitle>
                                    <LayoutGrid className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{stats.gestiones_activas}</p>
                                    <span className="text-[11px] text-muted-foreground">Activas en curso</span>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xs hover:border-primary/40 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Cursos</CardTitle>
                                    <School className="h-4 w-4 text-indigo-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{stats.cursos_activos}</p>
                                    <span className="text-[11px] text-muted-foreground">Paralelos activos</span>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xs hover:border-primary/40 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Docentes</CardTitle>
                                    <GraduationCap className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{stats.total_docentes}</p>
                                    <span className="text-[11px] text-muted-foreground">Docentes registrados</span>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xs hover:border-primary/40 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Estudiantes</CardTitle>
                                    <Users className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{stats.total_estudiantes}</p>
                                    <span className="text-[11px] text-muted-foreground">Matriculados</span>
                                </CardContent>
                            </Card>

                            <Card className="col-span-2 sm:col-span-1 shadow-xs hover:border-primary/40 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Lecciones</CardTitle>
                                    <BookOpen className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{stats.total_lecciones || 0}</p>
                                    <span className="text-[11px] text-muted-foreground">Actividades publicadas</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Semáforo de Rezago Estudiantil (Alerta Temprana) */}
                        <SemaforoRezagoWidget semaforo={semaforo} rol={rol} />

                        {/* 2. Cuadro Estadístico Principal */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Tarjeta A: Rendimiento Académico y Tasa de Aprobación */}
                            <Card className="shadow-xs lg:col-span-2">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                                <BarChart3 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">
                                                    Cuadro Estadístico de Rendimiento
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Distribución global de calificaciones y aprobación (base 100 pts)
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                            <Award className="h-3.5 w-3.5 text-amber-500" />
                                            Corte: 70 pts
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Métricas destacadas */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800/80">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Promedio General</p>
                                            <p className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                                                {promedioGeneral}
                                                <span className="text-xs text-muted-foreground font-normal ml-1">/100</span>
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">Todas las calificaciones</p>
                                        </div>

                                        <div className="space-y-1 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-800 sm:pl-4">
                                            <p className="text-xs text-muted-foreground">Tasa de Aprobación</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                                    {tasaAprobacion}%
                                                </p>
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">Nota &ge; 70 pts</p>
                                        </div>

                                        <div className="space-y-1 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-800 sm:pl-4">
                                            <p className="text-xs text-muted-foreground">Total Evaluados</p>
                                            <p className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                                                {totalCalificaciones}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">Calificaciones emitidas</p>
                                        </div>
                                    </div>

                                    {/* Barra visual de distribución Aprobados vs Reprobados */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Aprobados: {aprobados} ({tasaAprobacion}%)
                                            </span>
                                            <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Requieren Refuerzo: {reprobados} ({totalCalificaciones > 0 ? (100 - tasaAprobacion).toFixed(1) : 0}%)
                                            </span>
                                        </div>
                                        {/* Barra de progreso de dos tonos */}
                                        <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex shadow-inner">
                                            <div
                                                style={{ width: `${tasaAprobacion}%` }}
                                                className="bg-emerald-500 dark:bg-emerald-600 transition-all duration-500"
                                                title={`Aprobados: ${tasaAprobacion}%`}
                                            />
                                            <div
                                                style={{ width: `${100 - tasaAprobacion}%` }}
                                                className="bg-amber-500 dark:bg-amber-600 transition-all duration-500"
                                                title={`Requieren refuerzo: ${(100 - tasaAprobacion).toFixed(1)}%`}
                                            />
                                        </div>
                                    </div>

                                    {/* Estado de revisión de entregas */}
                                    <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <FileCheck className="h-4 w-4 text-primary" />
                                            <span className="font-medium">Estado de revisión de entregas:</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-neutral-600 dark:text-neutral-300">
                                                <strong className="text-emerald-600 dark:text-emerald-400">{entregasCalificadas}</strong> calificadas ({tasaEntregasCalificadas}%)
                                            </span>
                                            <span className="text-neutral-600 dark:text-neutral-300">
                                                <strong className="text-amber-600 dark:text-amber-400">{entregasPendientes}</strong> pendientes de revisión
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tarjeta B: Refuerzos con Inteligencia Artificial */}
                            <Card className="shadow-xs flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                Refuerzos con IA
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Acompañamiento a estudiantes
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-purple-900 dark:text-purple-300">
                                                Total Generados por IA
                                            </span>
                                            <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">
                                                {totalRefuerzos}
                                            </span>
                                        </div>
                                        <p className="text-xs text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                                            Preguntas adaptadas generadas automáticamente para reforzar estudiantes con notas menores a 70 puntos.
                                        </p>
                                    </div>

                                    {/* Indicadores de resolución */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                Completados por estudiante:
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {refuerzosCompletados} ({tasaRefuerzosCompletados}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                                            <div
                                                style={{ width: `${tasaRefuerzosCompletados}%` }}
                                                className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-500"
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs pt-1 text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                En espera de respuesta:
                                            </span>
                                            <span className="font-medium text-foreground">{refuerzosPendientes}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-border">
                                        <Link
                                            href="/refuerzos/docente"
                                            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg text-purple-700 bg-purple-100/70 hover:bg-purple-200/70 dark:text-purple-300 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 transition-colors"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Monitorear Actividades de Refuerzo &rarr;
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ======================== DOCENTE ======================== */}
                {rol === 'docente' && (
                    <div className="space-y-6">
                        {/* Barra de Acciones Rápidas del Docente */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-blue-950/20 dark:via-indigo-950/10 dark:border-blue-900/40">
                            <div>
                                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Panel Pedagógico del Docente
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Gestiona lecciones, revisa tareas pendientes y apoya a estudiantes en riesgo con IA.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    href="/lecciones"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Nueva Lección / Tarea
                                </Link>
                                <Link
                                    href="/entregas/docente"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs"
                                >
                                    <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Revisar Entregas
                                    {(docente_stats?.entregas_pendientes || 0) > 0 && (
                                        <Badge variant="warning" className="ml-1 h-4 px-1.5 text-[10px]">
                                            {docente_stats?.entregas_pendientes}
                                        </Badge>
                                    )}
                                </Link>
                                <Link
                                    href="/refuerzos/docente"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                    Refuerzos IA
                                </Link>
                                <Link
                                    href="/reportes"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-2xs"
                                >
                                    <BarChart3 className="h-3.5 w-3.5 text-neutral-600" />
                                    Reportes
                                </Link>
                            </div>
                        </div>

                        {/* 4 KPIs Clave del Docente */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Entregas por Calificar</CardTitle>
                                    <Inbox className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-2xl font-bold">{docente_stats?.entregas_pendientes ?? 0}</p>
                                        {(docente_stats?.entregas_pendientes || 0) > 0 && (
                                            <Link href="/entregas/docente" className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5">
                                                Calificar &rarr;
                                            </Link>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {(docente_stats?.entregas_pendientes ?? 0) === 0 ? 'Al día con tus revisiones' : 'Requieren tu retroalimentación'}
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Lecciones Asignadas</CardTitle>
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{docente_stats?.total_lecciones ?? 0}</p>
                                    <span className="text-[11px] text-muted-foreground">En tus cursos activos</span>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Refuerzos Generados</CardTitle>
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold">{docente_stats?.total_refuerzos ?? 0}</p>
                                    <span className="text-[11px] text-muted-foreground">Con asistencia de IA</span>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Alerta de Rezago</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-2xl font-bold">
                                            {(semaforo?.resumen.alto || 0) + (semaforo?.resumen.medio || 0)}
                                        </p>
                                        <span className="text-[11px] text-rose-600 font-medium">
                                            {semaforo?.resumen.alto || 0} críticos
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">Estudiantes a monitorear</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bandeja de Entregas Recientes por Calificar */}
                        {ultimas_entregas_pendientes && ultimas_entregas_pendientes.length > 0 && (
                            <Card className="border-amber-200/80 bg-amber-50/20 dark:bg-amber-950/10 dark:border-amber-900/40 shadow-xs">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <CardTitle className="text-sm font-semibold">Entregas Pendientes de Revisión</CardTitle>
                                        </div>
                                        <Link href="/entregas/docente" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                            Ver todas &rarr;
                                        </Link>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Estudiantes que enviaron su tarea recientemente y están esperando tu calificación
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {ultimas_entregas_pendientes.map((ent) => (
                                            <div key={ent.id} className="p-3.5 px-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="min-w-0 flex-1 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs text-foreground truncate">
                                                            {ent.estudiante?.user?.apellido_paterno} {ent.estudiante?.user?.apellido_materno}, {ent.estudiante?.user?.nombre}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {ent.leccion?.materia?.codigo}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        Lección: <span className="text-foreground font-medium">{ent.leccion?.titulo}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                                        {formatoFechaHora(ent.created_at)}
                                                    </span>
                                                    <Link
                                                        href={`/entregas/docente?leccion_id=${ent.leccion?.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                                                    >
                                                        Calificar
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Semáforo de Rezago Estudiantil (Alerta Temprana para el Docente) */}
                        <SemaforoRezagoWidget semaforo={semaforo} rol={rol} />

                        {(!cursos || cursos.length === 0) && (
                            <Card>
                                <CardContent className="py-8 text-center text-neutral-500">
                                    No tienes cursos asignados.
                                </CardContent>
                            </Card>
                        )}
                        {cursos?.map((curso) => (
                            <Card key={curso.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <School className="h-5 w-5 text-blue-500" />
                                                <h2 className="text-lg font-bold">
                                                    {curso.gestion?.año} - {curso.gestion?.etapa}
                                                </h2>
                                                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                                                    Paralelo {curso.paralelo}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-500 mt-1 capitalize">
                                                Turno: {curso.turno}
                                            </p>
                                        </div>
                                        <a
                                            href={`/cursos/${curso.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Ver Curso →
                                        </a>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                                            <BookOpen className="h-4 w-4" />
                                            Mis Materias ({curso.materias?.length || 0})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {curso.materias?.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="relative border rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group"
                                                >
                                                    {/* LINK A LA CARD (con imagen o degradado) */}
                                                    <a
                                                        href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                                                        className="block"
                                                    >
                                                        {m.pivot?.imagen ? (
                                                            <div className="h-28 w-full overflow-hidden bg-neutral-100">
                                                                <img
                                                                    src={`/storage/${m.pivot.imagen}`}
                                                                    alt={m.nombre}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="h-28 w-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                                <BookOpen className="h-10 w-10 text-blue-400" />
                                                            </div>
                                                        )}

                                                        <div className="p-3">
                                                            <span className="font-medium text-sm">{m.codigo}</span>
                                                            <span className="text-xs text-neutral-500 block truncate">{m.nombre}</span>
                                                        </div>
                                                    </a>

                                                    {/* TOGGLE IA */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            router.post(
                                                                `/docente/curso-materia/${m.pivot?.id}/toggle-ia`,
                                                                {},
                                                                { preserveScroll: true }
                                                            );
                                                        }}
                                                        className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur transition-colors ${
                                                            m.pivot?.ayuda_ia_activa
                                                                ? 'bg-purple-600/90 text-white hover:bg-purple-700/90'
                                                                : 'bg-white/80 text-neutral-500 hover:bg-white'
                                                        }`}
                                                        title={m.pivot?.ayuda_ia_activa ? 'IA activada' : 'IA desactivada'}
                                                    >
                                                        <Sparkles className="h-3 w-3" />
                                                        IA
                                                    </button>

                                                    {/* BOTÓN SUBIR IMAGEN */}
                                                    <label
                                                        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur bg-white/80 text-neutral-600 cursor-pointer hover:bg-white transition-colors"
                                                        title="Cambiar imagen"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ImagePlus className="h-3 w-3" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append('imagen', file);
                                                                router.post(
                                                                    `/docente/curso-materia/${m.pivot?.id}/imagen`,
                                                                    formData,
                                                                    {
                                                                        forceFormData: true,
                                                                        preserveScroll: true,
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ======================== ESTUDIANTE ======================== */}
                {rol === 'estudiante' && (
                    <div className="space-y-6">
                        {/* Banner de Bienvenida y Estado Rápido */}
                        <div className="p-5 rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 dark:border-emerald-900/40">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        Espacio del Estudiante
                                    </span>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                                        ¡Bienvenido a tu Aula Virtual!
                                    </h2>
                                    <p className="text-xs text-muted-foreground max-w-xl">
                                        Revisa tus tareas pendientes de entrega, resuelve tus actividades de refuerzo con IA y consulta tus notas y comentarios pedagógicos.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/entregas"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                                    >
                                        <FileCheck className="h-4 w-4" />
                                        Mis Tareas y Entregas
                                    </Link>
                                    <Link
                                        href="/refuerzos"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition-colors"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Mis Refuerzos
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* 3 KPIs Directos del Estudiante */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Tareas Pendientes</CardTitle>
                                    <Clock className={`h-4 w-4 ${(resumen?.tareas_pendientes_count || 0) > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-2xl font-bold">{resumen?.tareas_pendientes_count || 0}</p>
                                        {(resumen?.tareas_pendientes_count || 0) > 0 && (
                                            <Badge variant="warning" className="text-[10px]">Por presentar</Badge>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {(resumen?.tareas_pendientes_count || 0) === 0 ? '¡Estás al día con tus tareas!' : 'Lecciones que requieren tu entrega'}
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Refuerzos con IA</CardTitle>
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-2xl font-bold">{resumen?.refuerzos_pendientes_count || 0}</p>
                                        {(resumen?.refuerzos_pendientes_count || 0) > 0 && (
                                            <Badge variant="purple" className="text-[10px]">Pendientes</Badge>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {(resumen?.refuerzos_pendientes_count || 0) === 0 ? 'Sin refuerzos pendientes' : 'Actividades para afianzar temas'}
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className="hover:border-primary/40 transition-colors shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                                    <CardTitle className="text-xs font-medium text-muted-foreground">Rendimiento Académico</CardTitle>
                                    <Award className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-2xl font-bold">
                                            {resumen?.promedio_general !== null && resumen?.promedio_general !== undefined ? `${resumen.promedio_general}/100` : '--'}
                                        </p>
                                        <span className="text-[11px] text-muted-foreground">
                                            {resumen?.total_materias || 0} materias inscritas
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {resumen?.promedio_general !== null && resumen?.promedio_general !== undefined && resumen.promedio_general >= 70
                                            ? 'Buen desempeño general'
                                            : (resumen?.promedio_general !== null ? 'Requiere seguimiento' : 'Aún sin calificaciones')}
                                    </span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 1. SECCIÓN DE TAREAS PENDIENTES (AL TOQUE) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-amber-500" />
                                    Tareas Pendientes por Entregar ({tareas_pendientes?.length || 0})
                                </h3>
                                <Link href="/entregas" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                    Ver todas mis tareas &rarr;
                                </Link>
                            </div>

                            {(!tareas_pendientes || tareas_pendientes.length === 0) ? (
                                <Card className="border-dashed bg-muted/20">
                                    <CardContent className="py-8 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">¡Estás al día!</p>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                No tienes tareas pendientes por entregar en este momento. Revisa tus materias para consultar contenidos o materiales.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {tareas_pendientes.map((tarea) => {
                                        const estadoVenc = obtenerEstadoVencimiento(tarea.fecha_entrega);
                                        return (
                                            <Card key={tarea.id} className="hover:border-primary/50 transition-all hover:shadow-sm flex flex-col justify-between">
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <Badge variant="outline" className="text-[10px] font-medium shrink-0">
                                                            {tarea.materia?.codigo} · {tarea.materia?.nombre}
                                                        </Badge>
                                                        {estadoVenc && (
                                                            <Badge
                                                                variant={estadoVenc.vencido ? 'destructive' : estadoVenc.esHoy ? 'warning' : 'info'}
                                                                className="text-[10px] shrink-0"
                                                            >
                                                                {estadoVenc.textoBadge}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-sm font-semibold leading-snug line-clamp-2 mt-2">
                                                        {tarea.titulo}
                                                    </CardTitle>
                                                    {tarea.descripcion && (
                                                        <CardDescription className="text-xs line-clamp-2 mt-1">
                                                            {tarea.descripcion}
                                                        </CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="p-4 pt-2">
                                                    <div className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>Fecha límite: {formatoFechaHora(tarea.fecha_entrega)}</span>
                                                    </div>
                                                    <Link
                                                        href={`/lecciones/${tarea.hash_id || tarea.id}`}
                                                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                                                    >
                                                        <Send className="h-3.5 w-3.5" />
                                                        Entregar Tarea
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. SECCIÓN DE REFUERZOS PENDIENTES CON IA */}
                        {refuerzos_pendientes && refuerzos_pendientes.length > 0 && (
                            <Card className="border-purple-200 bg-purple-50/20 dark:bg-purple-950/10 dark:border-purple-900/40 shadow-xs">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            <CardTitle className="text-sm font-semibold">Refuerzos Pedagógicos con IA Asignados</CardTitle>
                                        </div>
                                        <Link href="/refuerzos" className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                                            Ver todos &rarr;
                                        </Link>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Tu docente te asignó preguntas de práctica asistidas por inteligencia artificial para fortalecer temas clave.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {refuerzos_pendientes.map((refuerzo) => (
                                            <div key={refuerzo.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/40 transition-colors">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="purple" className="text-[10px]">
                                                            {refuerzo.entrega?.leccion?.materia?.codigo || 'Refuerzo'}
                                                        </Badge>
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {refuerzo.entrega?.leccion?.materia?.nombre || 'Materia'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Tarea: <span className="text-foreground font-medium">{refuerzo.entrega?.leccion?.titulo || 'Lección'}</span>
                                                        {refuerzo.entrega?.calificacion?.nota !== undefined && (
                                                            <span className="ml-2 text-rose-600 font-medium">(Nota: {refuerzo.entrega.calificacion.nota}/100)</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/refuerzos/${refuerzo.hash_id || refuerzo.id}`}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs shrink-0"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    Resolver Refuerzo &rarr;
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 3. CALIFICACIONES Y RETROALIMENTACIÓN RECIENTE */}
                        {ultimas_calificaciones && ultimas_calificaciones.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Award className="h-4 w-4 text-blue-500" />
                                        Últimas Calificaciones y Retroalimentación
                                    </h3>
                                    <Link href="/entregas" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                        Ver historial completo &rarr;
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {ultimas_calificaciones.map((cal) => {
                                        const esAprobado = cal.calificacion.nota >= 70;
                                        return (
                                            <Card key={cal.id} className="shadow-xs hover:border-primary/40 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[11px] font-medium text-muted-foreground block truncate">
                                                                {cal.leccion?.materia?.nombre}
                                                            </span>
                                                            <h4 className="text-sm font-semibold text-foreground truncate mt-0.5">
                                                                {cal.leccion?.titulo}
                                                            </h4>
                                                        </div>
                                                        <Badge variant={esAprobado ? 'success' : 'warning'} className="text-xs font-bold shrink-0">
                                                            {cal.calificacion.nota}/100
                                                        </Badge>
                                                    </div>
                                                    {cal.calificacion.comentarios ? (
                                                        <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground italic">
                                                            &ldquo;{cal.calificacion.comentarios}&rdquo;
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-[11px] text-muted-foreground">Sin comentarios adicionales</p>
                                                    )}
                                                    <div className="mt-2 text-[10px] text-muted-foreground text-right">
                                                        Revisado: {formatoFechaHora(cal.calificacion.fecha_calificacion || cal.fecha_entrega)}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 4. MIS MATERIAS E INSCRIPCIONES */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-emerald-500" />
                                Mis Materias y Aulas
                            </h3>
                            {(!cursos || cursos.length === 0) ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-neutral-500">
                                        No estás inscrito en ningún curso.
                                    </CardContent>
                                </Card>
                            ) : (
                                cursos.map((curso) => (
                                    <Card key={curso.id} className="shadow-xs">
                                        <CardContent className="pt-5">
                                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                                <div className="flex items-center gap-2">
                                                    <School className="h-5 w-5 text-emerald-500" />
                                                    <h2 className="text-base font-bold">
                                                        {curso.gestion?.año} - {curso.gestion?.etapa}
                                                    </h2>
                                                    <Badge variant="outline" className="text-xs">
                                                        Paralelo {curso.paralelo}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    Turno: {curso.turno}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {curso.materias?.map((m) => (
                                                        <Link
                                                            key={m.id}
                                                            href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                                                            className="border rounded-lg overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all group bg-card flex flex-col justify-between"
                                                        >
                                                            {m.pivot?.imagen ? (
                                                                <div className="h-24 w-full overflow-hidden bg-neutral-100">
                                                                    <img
                                                                        src={`/storage/${m.pivot.imagen}`}
                                                                        alt={m.nombre}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="h-24 w-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center">
                                                                    <BookOpen className="h-8 w-8 text-emerald-500/70" />
                                                                </div>
                                                            )}
                                                            <div className="p-3">
                                                                <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">{m.codigo}</span>
                                                                <span className="text-xs text-foreground font-medium block truncate mt-0.5">{m.nombre}</span>
                                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2 group-hover:text-primary transition-colors">
                                                                    Ver lecciones y tareas &rarr;
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function SemaforoRezagoWidget({ semaforo }: { semaforo?: SemaforoData; rol?: string }) {
    if (!semaforo) return null;
    const [filtro, setFiltro] = useState<'todos' | 'alto' | 'medio'>('todos');
    const [expandido, setExpandido] = useState(false);

    const estudiantesFiltrados = (semaforo.estudiantes_riesgo || []).filter((e) => {
        if (filtro === 'alto') return e.nivel === 'alto';
        if (filtro === 'medio') return e.nivel === 'medio';
        return true;
    });

    const totalRiesgo = (semaforo.resumen.alto || 0) + (semaforo.resumen.medio || 0);

    return (
        <Card className="border-2 border-neutral-200/90 dark:border-neutral-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-neutral-900/60 dark:via-neutral-900 dark:to-neutral-900/60 pb-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-amber-500 to-emerald-500 text-white shadow-xs">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-bold">
                                    Semáforo de Rezago Estudiantil
                                </CardTitle>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                    Alerta Temprana
                                </span>
                            </div>
                            <CardDescription className="text-xs mt-0.5">
                                Identificación preventiva de estudiantes para evitar abandono y reprobación académica.
                            </CardDescription>
                        </div>
                    </div>

                    {totalRiesgo > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandido(!expandido)}
                            className="text-xs h-8 border-neutral-300 dark:border-neutral-700"
                        >
                            {expandido ? (
                                <>
                                    <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                                    Ocultar detalles ({totalRiesgo})
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                                    Ver estudiantes en observación ({totalRiesgo})
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
                {/* 3 Tarjetas del Semáforo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* 🔴 ALTO */}
                    <div
                        onClick={() => { setFiltro('alto'); setExpandido(true); }}
                        className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                            filtro === 'alto' && expandido
                                ? 'border-red-400 bg-red-50/90 dark:bg-red-950/40 ring-2 ring-red-400/40 shadow-xs'
                                : 'border-red-200 bg-red-50/40 hover:bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                Riesgo Crítico (Rojo)
                            </span>
                            <span className="text-2xl font-extrabold text-red-700 dark:text-red-400">
                                {semaforo.resumen.alto}
                            </span>
                        </div>
                        <p className="text-[11px] text-red-600/90 dark:text-red-300/80 leading-snug">
                            Promedio &lt; 51 pts o &ge; 2 tareas reprobadas. Requieren atención y tutoría docente urgente.
                        </p>
                    </div>

                    {/* 🟡 MEDIO */}
                    <div
                        onClick={() => { setFiltro('medio'); setExpandido(true); }}
                        className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                            filtro === 'medio' && expandido
                                ? 'border-amber-400 bg-amber-50/90 dark:bg-amber-950/40 ring-2 ring-amber-400/40 shadow-xs'
                                : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                En Observación (Amarillo)
                            </span>
                            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                                {semaforo.resumen.medio}
                            </span>
                        </div>
                        <p className="text-[11px] text-amber-600/90 dark:text-amber-300/80 leading-snug">
                            Promedio entre 51 y 69 pts o actividades de refuerzo pendientes por responder.
                        </p>
                    </div>

                    {/* 🟢 BAJO */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Desempeño Óptimo (Verde)
                            </span>
                            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                {semaforo.resumen.bajo}
                            </span>
                        </div>
                        <p className="text-[11px] text-emerald-600/90 dark:text-emerald-300/80 leading-snug">
                            Promedio &ge; 70 pts y actividades de práctica al día.
                        </p>
                    </div>
                </div>

                {/* Listado desplegable de estudiantes en riesgo */}
                {expandido && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                <span>Filtrar lista:</span>
                                <button
                                    type="button"
                                    onClick={() => setFiltro('todos')}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${filtro === 'todos' ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 font-bold' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'}`}
                                >
                                    Todos ({totalRiesgo})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFiltro('alto')}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${filtro === 'alto' ? 'bg-red-600 text-white font-bold' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                >
                                    🔴 Crítico ({semaforo.resumen.alto})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFiltro('medio')}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${filtro === 'medio' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                                >
                                    🟡 Observación ({semaforo.resumen.medio})
                                </button>
                            </div>
                        </div>

                        {estudiantesFiltrados.length === 0 ? (
                            <div className="py-6 text-center text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                                No se registraron estudiantes con este criterio de filtro.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 font-semibold border-b">
                                        <tr>
                                            <th className="py-2.5 px-3">Estudiante</th>
                                            <th className="py-2.5 px-3">Curso</th>
                                            <th className="py-2.5 px-3 text-center">Promedio</th>
                                            <th className="py-2.5 px-3 text-center">Tareas Reprobadas</th>
                                            <th className="py-2.5 px-3 text-center">Refuerzos Pendientes</th>
                                            <th className="py-2.5 px-3">Diagnóstico / Alerta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
                                        {estudiantesFiltrados.map((est) => (
                                            <tr key={est.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                                                <td className="py-2.5 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2 w-2 rounded-full shrink-0 ${est.nivel === 'alto' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                        <span>{est.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-neutral-500">{est.curso}</td>
                                                <td className="py-2.5 px-3 text-center font-bold">
                                                    {est.promedio !== null ? (
                                                        <span className={est.promedio < 51 ? 'text-red-600' : 'text-amber-600'}>
                                                            {est.promedio} pts
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400 font-normal">S/C</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {est.tareas_reprobadas > 0 ? (
                                                        <span className="font-semibold text-red-600">{est.tareas_reprobadas}</span>
                                                    ) : (
                                                        <span className="text-neutral-400">0</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {est.refuerzos_pendientes > 0 ? (
                                                        <span className="font-semibold text-amber-600">{est.refuerzos_pendientes}</span>
                                                    ) : (
                                                        <span className="text-neutral-400">0</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${est.nivel === 'alto' ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                                                        {est.motivo}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}