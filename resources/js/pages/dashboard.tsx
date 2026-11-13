import { ModalCambiarPortadaMateria, type MateriaParaPortada } from "@/components/modal-cambiar-portada-materia";
import { Head, Link, router, usePage } from "@inertiajs/react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
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
  ChevronUp,
  Clock,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  ImagePlus,
  Inbox,
  LayoutGrid,
  PartyPopper,
  Plus,
  RefreshCw,
  School,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GeometricFallingBackground } from "@/components/geometric-background";
import { PolygonCollisionsRain } from "@/components/polygon-collisions-rain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { formatoFechaHora, obtenerEstadoVencimiento } from "@/lib/formatters";
import { type BreadcrumbItem, type SharedData } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
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
  nivel: "alto" | "medio" | "bajo";
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
  materia_id?: number;
  curso_id?: number;
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
  docente_stats?: DocenteStats;
  ultimas_entregas_pendientes?: UltimaEntregaPendiente[];
  tareas_pendientes?: TareaPendiente[];
  refuerzos_pendientes?: RefuerzoPendiente[];
  ultimas_calificaciones?: UltimaCalificacion[];
  resumen?: ResumenEstudiante;
}

// Contador numérico animado suave
function AnimatedNumber({ value }: { value: number | string }) {
  const target = typeof value === "number" ? value : parseFloat(value) || 0;
  const isDecimal = !Number.isInteger(target);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const frameRate = 1000 / 60;
    const totalFrames = Math.max(1, Math.round(duration / frameRate));
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (target - start) * ease;
      setDisplay(current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplay(target);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>{isDecimal ? display.toFixed(1) : Math.round(display).toLocaleString()}</span>
  );
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
  const pageProps = usePage<SharedData>().props;
  const user = pageProps.auth?.user;
  const [drawerTareasAbierto, setDrawerTareasAbierto] = useState(false);
  const [materiaParaPortada, setMateriaParaPortada] = useState<MateriaParaPortada | null>(null);

  // Saludo dinámico según la hora local
  const saludo = useMemo(() => {
    const hora = new Date().getHours();
    if (hora < 12) return "¡Buenos días";
    if (hora < 19) return "¡Buenas tardes";
    return "¡Buenas noches";
  }, []);

  const totalCalificaciones = stats?.total_calificaciones || 0;
  const tasaAprobacion = stats?.tasa_aprobacion || 0;
  const aprobados = stats?.aprobados || 0;
  const reprobados = stats?.reprobados || 0;
  const promedioGeneral = stats?.promedio_general || 0;

  const totalRefuerzos = stats?.total_refuerzos || 0;
  const refuerzosCompletados = stats?.refuerzos_completados || 0;
  const refuerzosPendientes = stats?.refuerzos_pendientes || 0;
  const tasaRefuerzosCompletados =
    totalRefuerzos > 0
      ? Math.round((refuerzosCompletados / totalRefuerzos) * 100)
      : 0;

  const totalEntregas = stats?.total_entregas || 0;
  const entregasCalificadas = stats?.entregas_calificadas || 0;
  const entregasPendientes = stats?.entregas_pendientes || 0;
  const tasaEntregasCalificadas =
    totalEntregas > 0
      ? Math.round((entregasCalificadas / totalEntregas) * 100)
      : 0;

  const dispararConfeti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"],
    });
  };

  // Datos para el gráfico de rendimiento interactivo
  const chartRendimientoData = useMemo(() => {
    return [
      { name: "Sem 1", promedio: 62, aprobacion: 68 },
      { name: "Sem 2", promedio: 66, aprobacion: 71 },
      { name: "Sem 3", promedio: 69, aprobacion: 74 },
      { name: "Sem 4", promedio: 71, aprobacion: 78 },
      { name: "Sem 5", promedio: 74, aprobacion: 82 },
      {
        name: "Actual",
        promedio: promedioGeneral > 0 ? promedioGeneral : 73,
        aprobacion: tasaAprobacion > 0 ? tasaAprobacion : 79,
      },
    ];
  }, [promedioGeneral, tasaAprobacion]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 p-4 sm:p-6 lg:p-7 space-y-6 max-w-7xl mx-auto">
          {/* ========================================================================= */}
          {/* HERO BANNER DINÁMICO (MATICES VIVOS CON COLOR PRIMARIO Y SECUNDARIO)      */}
          {/* ========================================================================= */}
          <div
            className="relative overflow-hidden rounded-3xl text-white shadow-2xl p-5 sm:p-6 lg:py-5 lg:px-7 border border-white/20 transition-all duration-500"
            style={{
              background:
                "var(--brand-hero-bg, linear-gradient(135deg, hsl(243, 75%, 20%), hsl(220, 60%, 15%)))",
            }}
          >
            {/* Lluvia y Choque Dinámico de Polígonos Reactivos con Colores Institucionales */}
            <PolygonCollisionsRain
              count={32}
              className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-75"
            />

            {/* Luces y auras de fondo difuminadas según la paleta institucional */}
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 transition-all duration-700 z-0"
              style={{
                background:
                  "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-35 transition-all duration-700 z-0"
              style={{
                background:
                  "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
              }}
            />

            {/* Anillos orbitales decorativos institucionales en el Hero */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border border-white/10 pointer-events-none animate-[spin_50s_linear_infinite] z-0" />
            <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full border border-dashed border-white/10 pointer-events-none animate-[spin_35s_linear_infinite_reverse] z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Sistema Activo
                  </span>
                  <span className="text-xs text-slate-200 font-medium">
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>{saludo},</span>
                    <span
                      className="bg-clip-text text-transparent font-extrabold"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #ffffff 25%, var(--secondary) 100%)",
                      }}
                    >
                      {user?.nombre || "Bienvenido"}!
                    </span>
                  </h1>
                  <p className="text-sm text-slate-200/90 max-w-2xl mt-1 leading-relaxed">
                    {rol === "admin" &&
                      "Panel ejecutivo de monitoreo integral: indicadores académicos, acompañamiento con IA y alertas preventivas en tiempo real."}
                    {rol === "docente" &&
                      "Espacio pedagógico central: supervisa tus materias, atiende revisiones pendientes e impulsa el aprendizaje con IA."}
                    {rol === "estudiante" &&
                      "Entrega tus tareas a tiempo, practica tus refuerzos interactivos y monitorea tu progreso académico."}
                  </p>
                </div>
              </div>

              {/* Widget de Cristal Rápido en el Hero */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-3.5 px-5 rounded-2xl border border-white/15 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300 flex items-center gap-4 shadow-inner group/capsule">
                  <div className="text-center border-r border-white/15 pr-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      Rol Actual
                    </p>
                    <p className="text-sm font-black capitalize text-white">
                      {rol || "Usuario"}
                    </p>
                  </div>
                  {rol === "admin" && (
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        Gestión
                      </p>
                      <p className="text-sm font-black text-secondary group-hover/capsule:scale-105 transition-transform">
                        {stats?.gestiones_activas || 1} Activa
                      </p>
                    </div>
                  )}
                  {rol === "docente" && (
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        Por Revisar
                      </p>
                      <p className="text-sm font-black text-amber-300 group-hover/capsule:scale-105 transition-transform">
                        {docente_stats?.entregas_pendientes || 0}
                      </p>
                    </div>
                  )}
                  {rol === "estudiante" && (
                    <button
                      type="button"
                      onClick={() => setDrawerTareasAbierto(true)}
                      className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                      title="Ver panel de tareas pendientes"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        Pendientes
                      </p>
                      <p className="text-sm font-black text-amber-300 group-hover/capsule:scale-105 transition-transform flex items-center justify-center gap-1">
                        <span>{resumen?.tareas_pendientes_count || 0}</span>
                        {(resumen?.tareas_pendientes_count || 0) > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </p>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={dispararConfeti}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white backdrop-blur-md border border-white/15 transition-all shadow-sm flex items-center justify-center cursor-pointer group hover:border-primary/50"
                  title="Celebrar logro del día"
                >
                  <PartyPopper className="h-5 w-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        {/* ========================================================================= */}
        {/* VISTA 1: ADMINISTRADOR (MÉTRICAS FLOTANTES VINCULADAS A COLOR INSTITUCIONAL) */}
        {/* ========================================================================= */}
        {rol === "admin" && stats && (
          <div className="space-y-8">
            {/* 1. ROW DE ACCIONES RÁPIDAS DINÁMICAS */}
            <div className="bg-card/85 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-border/80 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/30">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Acciones Rápidas del Administrador
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Operaciones académicas directas
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {gestiones && gestiones.length > 0 && (
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      Gestión:
                    </span>
                    <Select
                      value={filtro_gestion_id || "all"}
                      onValueChange={(val) => {
                        router.get(
                          "/dashboard",
                          val === "all" ? {} : { gestion_id: val },
                          { preserveState: true, preserveScroll: true },
                        );
                      }}
                    >
                      <SelectTrigger className="h-8.5 w-44 text-xs bg-card/75 backdrop-blur-md border-border/80 shadow-xs focus:ring-primary">
                        <SelectValue placeholder="Todas las gestiones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las gestiones</SelectItem>
                        {gestiones.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.año} - {g.etapa}{" "}
                            {g.estado === "activo" ? "(Activa)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Link href="/estudiantes">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span>Estudiante</span>
                  </Button>
                </Link>

                <Link href="/estudiantes/importar/plantilla">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                    <span>Importar Excel</span>
                  </Button>
                </Link>

                <Link href="/cursos">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span>Nuevo Curso</span>
                  </Button>
                </Link>

                <Link href="/reportes">
                  <Button variant="gradient" size="sm" className="text-xs gap-1.5 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Ver Reportes</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2. TARJETAS FLOTANTES DE KPIs SUPERIORES VINCULADAS AL COLOR INSTITUCIONAL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-5">
              {/* CARD 1: GESTIONES */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--primary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Gestiones
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={stats.gestiones_activas} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-primary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-primary font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Activas
                  </span>
                  <span className="text-muted-foreground text-[11px]">En curso</span>
                </div>
              </div>

              {/* CARD 2: CURSOS */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--secondary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-lg shadow-secondary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <School className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Cursos
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={stats.cursos_activos} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-secondary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-secondary font-bold">Paralelos</span>
                  <span className="text-muted-foreground text-[11px]">Activos</span>
                </div>
              </div>

              {/* CARD 3: DOCENTES */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary to-secondary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--primary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-primary/85 to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Docentes
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={stats.total_docentes} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-primary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-primary font-bold">100% Asignados</span>
                  <span className="text-muted-foreground text-[11px]">En aula</span>
                </div>
              </div>

              {/* CARD 4: ESTUDIANTES */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary via-secondary to-primary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--secondary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary via-secondary/85 to-primary flex items-center justify-center text-white shadow-lg shadow-secondary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Estudiantes
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={stats.total_estudiantes} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-secondary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-secondary font-bold">Matriculados</span>
                  <span className="text-muted-foreground text-[11px]">Activos</span>
                </div>
              </div>

              {/* CARD 5: LECCIONES */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 group col-span-1 sm:col-span-2 lg:col-span-1 overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--primary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Lecciones
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={stats.total_lecciones || 0} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-primary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-primary font-bold">Publicadas</span>
                  <span className="text-muted-foreground text-[11px]">Tareas</span>
                </div>
              </div>
            </div>

            {/* 3. SEMÁFORO DE REZAGO ESTUDIANTIL (RADAR DE ALERTA TEMPRANA) */}
            <SemaforoRezagoWidget semaforo={semaforo} rol={rol} />

            {/* 4. CUADRO ESTADÍSTICO INTERACTIVO CON RECHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Tarjeta A: Rendimiento Académico y Curva Interactiva */}
              <div className="lg:col-span-2 bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-md border border-border/80 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/30">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Cuadro Estadístico de Rendimiento
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Evolución de promedio y tasa de aprobación académica (Base 100 pts)
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning" className="w-fit text-xs px-3 py-1">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    Corte de Aprobación: 70 pts
                  </Badge>
                </div>

                {/* 3 Bloques métricos destacados */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Promedio General
                    </p>
                    <p className="text-3xl font-black text-foreground">
                      <AnimatedNumber value={promedioGeneral} />
                      <span className="text-xs font-normal text-muted-foreground ml-1">/100</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Calificaciones globales</p>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-border sm:pl-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tasa de Aprobación
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-emerald-500">
                        <AnimatedNumber value={tasaAprobacion} />%
                      </p>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Nota &ge; 70 puntos</p>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-border sm:pl-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Evaluados
                    </p>
                    <p className="text-3xl font-black text-foreground">
                      <AnimatedNumber value={totalCalificaciones} />
                    </p>
                    <p className="text-[11px] text-muted-foreground">Calificaciones emitidas</p>
                  </div>
                </div>

                {/* GRÁFICO RECHARTS AREA CHART */}
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartRendimientoData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAprobacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        domain={[0, 100]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "1rem",
                          color: "#fff",
                          fontSize: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="aprobacion"
                        name="Aprobación %"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorAprobacion)"
                      />
                      <Area
                        type="monotone"
                        dataKey="promedio"
                        name="Promedio"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPromedio)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Barra de progreso de dos tonos Aprobados vs Reprobados */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aprobados: {aprobados} ({tasaAprobacion}%)
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      Requieren Refuerzo: {reprobados} (
                      {totalCalificaciones > 0 ? (100 - tasaAprobacion).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${tasaAprobacion}%` }}
                      className="bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-700"
                    />
                    <div
                      style={{ width: `${100 - tasaAprobacion}%` }}
                      className="bg-gradient-to-r from-amber-500 to-rose-400 transition-all duration-700"
                    />
                  </div>
                </div>

                {/* Estado de entregas */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Estado global de revisión docente:</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      <strong className="text-emerald-500 font-bold">{entregasCalificadas}</strong>{" "}
                      calificadas ({tasaEntregasCalificadas}%)
                    </span>
                    <span className="text-muted-foreground">
                      <strong className="text-amber-500 font-bold">{entregasPendientes}</strong>{" "}
                      pendientes de revisión
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta B: Refuerzos Pedagógicos con Inteligencia Artificial */}
              <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-md border border-border/80 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Refuerzos con IA</h3>
                      <p className="text-xs text-muted-foreground">Acompañamiento adaptativo</p>
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Generados por IA
                      </span>
                      <span className="text-3xl font-black text-primary dark:text-secondary">
                        <AnimatedNumber value={totalRefuerzos} />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Preguntas pedagógicas adaptadas automáticamente para estudiantes que obtuvieron
                      calificaciones inferiores a 70 puntos.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Completados por estudiantes:
                      </span>
                      <span className="font-bold text-foreground">
                        {refuerzosCompletados} ({tasaRefuerzosCompletados}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        style={{ width: `${tasaRefuerzosCompletados}%` }}
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        En espera de respuesta:
                      </span>
                      <span className="font-bold text-foreground">{refuerzosPendientes}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Link href="/refuerzos/docente" className="w-full">
                    <Button variant="purple" className="w-full justify-center gap-2 text-xs">
                      <Sparkles className="h-4 w-4" />
                      <span>Monitorear Actividades de Refuerzo</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: DOCENTE (PANEL PEDAGÓGICO, REVISIONES Y CURSOS CON VITALIDAD)   */}
        {/* ========================================================================= */}
        {rol === "docente" && (
          <div className="space-y-8">
            {/* Banner de Acciones Rápidas del Docente */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-500" />
                  Panel Pedagógico y Gestión de Aula
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gestiona lecciones, revisa tareas pendientes y refuerza a estudiantes con IA.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href="/docente/estudiantes">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary/50 hover:text-primary">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>Lista de Estudiantes</span>
                  </Button>
                </Link>

                <Link href="/lecciones">
                  <Button variant="gradient" size="sm" className="text-xs gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nueva Lección / Tarea</span>
                  </Button>
                </Link>

                <Link href="/entregas/docente">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Revisar Entregas</span>
                    {(docente_stats?.entregas_pendientes || 0) > 0 && (
                      <Badge variant="warning" className="ml-1 h-4 px-1.5 text-[10px]">
                        {docente_stats?.entregas_pendientes}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href="/refuerzos/docente">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    <span>Refuerzos IA</span>
                  </Button>
                </Link>

                <Link href="/reportes">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Reportes</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4 KPIs FLOTANTES DEL DOCENTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
              {/* KPI 1: ENTREGAS POR CALIFICAR */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--primary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Por Calificar
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={docente_stats?.entregas_pendientes ?? 0} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-primary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-primary font-bold">
                    {(docente_stats?.entregas_pendientes ?? 0) === 0
                      ? "Al día"
                      : "Requieren revisión"}
                  </span>
                  {(docente_stats?.entregas_pendientes || 0) > 0 && (
                    <Link
                      href="/entregas/docente"
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Calificar</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* KPI 2: LECCIONES ASIGNADAS */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--secondary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-lg shadow-secondary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Lecciones
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={docente_stats?.total_lecciones ?? 0} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-secondary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-secondary font-bold">Publicadas</span>
                  <span className="text-muted-foreground text-[11px]">En tus cursos</span>
                </div>
              </div>

              {/* KPI 3: REFUERZOS IA */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary/85 to-secondary transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_var(--primary)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-primary/85 to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Refuerzos IA
                    </p>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">
                      <AnimatedNumber value={docente_stats?.total_refuerzos ?? 0} />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border group-hover:border-primary/30 transition-colors flex items-center justify-between text-xs relative z-1">
                  <span className="text-primary font-bold">Adaptativos</span>
                  <span className="text-muted-foreground text-[11px]">Generados</span>
                </div>
              </div>

              {/* KPI 4: ALERTA DE REZAGO */}
              <div className="relative bg-card/85 backdrop-blur-md rounded-2xl p-5 pt-3 shadow-md hover:shadow-xl border border-border/80 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500 ease-out group-hover:w-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: "radial-gradient(circle, rgba(244,63,94,0.3) 0%, transparent 70%)" }} />

                <div className="flex justify-between items-start relative z-1">
                  <div className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/35 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      En Observación
                    </p>
                    <h3 className="text-2xl font-black text-rose-500 mt-0.5">
                      <AnimatedNumber
                        value={(semaforo?.resumen.alto || 0) + (semaforo?.resumen.medio || 0)}
                      />
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-rose-600 font-bold">
                    {semaforo?.resumen.alto || 0} Críticos
                  </span>
                  <span className="text-muted-foreground text-[11px]">Acompañamiento</span>
                </div>
              </div>
            </div>

            {/* BANDEJA DE ENTREGAS RECIENTES POR CALIFICAR */}
            {ultimas_entregas_pendientes && ultimas_entregas_pendientes.length > 0 && (
              <div className="bg-card rounded-3xl p-6 shadow-md border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-card to-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Entregas Pendientes de Revisión Docente
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Estudiantes que enviaron su tarea y esperan calificación
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/entregas/docente"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Ver todas</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="divide-y divide-border">
                  {ultimas_entregas_pendientes.map((ent) => (
                    <div
                      key={ent.id}
                      className="py-3.5 flex items-center justify-between hover:bg-muted/40 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground truncate">
                            {ent.estudiante?.user?.apellido_paterno}{" "}
                            {ent.estudiante?.user?.apellido_materno},{" "}
                            {ent.estudiante?.user?.nombre}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {ent.leccion?.materia?.codigo}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          Lección:{" "}
                          <span className="text-foreground font-semibold">
                            {ent.leccion?.titulo}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {formatoFechaHora(ent.created_at)}
                        </span>
                        <Link href={`/entregas/docente?leccion_id=${ent.leccion?.id}`}>
                          <Button variant="emerald" size="sm" className="h-7 text-xs">
                            Calificar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEMÁFORO DE REZAGO */}
            <SemaforoRezagoWidget semaforo={semaforo} rol={rol} />

            {/* CURSOS Y MATERIAS ASIGNADAS */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Mis Cursos y Materias Asignadas
              </h3>

              {(!cursos || cursos.length === 0) ? (
                <div className="bg-card/85 backdrop-blur-md rounded-2xl p-8 text-center text-muted-foreground border border-dashed">
                  No tienes cursos asignados en la gestión activa.
                </div>
              ) : (
                cursos.map((curso) => (
                  <div
                    key={curso.id}
                    className="bg-card/85 backdrop-blur-md rounded-3xl p-6 shadow-md border border-border/80 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20">
                          <School className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground">
                            {curso.gestion?.año} - {curso.gestion?.etapa}
                          </h4>
                          <span className="text-xs text-muted-foreground capitalize">
                            Turno: {curso.turno} · Paralelo {curso.paralelo}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/docente/estudiantes?curso_id=${curso.id}`}>
                          <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary/40 hover:text-primary">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>Ver Estudiantes</span>
                          </Button>
                        </Link>
                        <Link href={`/cursos/${curso.id}`}>
                          <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary/40 hover:text-primary">
                            <span>Ver Curso</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                      {curso.materias?.map((m) => (
                        <div
                          key={m.id}
                          className="relative border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all group bg-card"
                        >
                          <Link
                            href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                            className="block"
                          >
                            {m.pivot?.imagen ? (
                              <div className="h-32 w-full overflow-hidden bg-muted">
                                <img
                                  src={`/storage/${m.pivot.imagen}`}
                                  alt={m.nombre}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="h-32 w-full bg-gradient-to-br from-primary via-primary-light to-secondary flex items-center justify-center text-white">
                                <BookOpen className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform" />
                              </div>
                            )}

                            <div className="p-4">
                              <span className="font-bold text-xs text-primary">{m.codigo}</span>
                              <h5 className="font-bold text-sm text-foreground truncate mt-0.5">
                                {m.nombre}
                              </h5>
                              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 group-hover:text-primary transition-colors">
                                <span>Gestionar lecciones</span>
                                <ArrowRight className="h-3 w-3" />
                              </p>
                            </div>
                          </Link>

                          {/* Botón flotante IA */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.post(
                                `/docente/curso-materia/${m.pivot?.id}/toggle-ia`,
                                {},
                                { preserveScroll: true },
                              );
                            }}
                            className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm transition-all cursor-pointer ${
                              m.pivot?.ayuda_ia_activa
                                ? "bg-primary text-primary-foreground shadow-primary/30 hover:opacity-90"
                                : "bg-black/50 text-white hover:bg-black/70"
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>IA {m.pivot?.ayuda_ia_activa ? "Activa" : "Off"}</span>
                          </button>

                          {/* Botón flotante Cambiar Imagen de Portada con Modal */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMateriaParaPortada({
                                id: m.id,
                                pivotId: m.pivot?.id,
                                nombre: m.nombre,
                                codigo: m.codigo,
                                imagenActual: m.pivot?.imagen,
                              });
                            }}
                            title="Personalizar portada de la materia"
                            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md bg-black/60 text-white cursor-pointer hover:bg-black/85 hover:border-primary border border-white/20 transition-all shadow-sm hover:scale-105 active:scale-95"
                          >
                            <ImagePlus className="h-3 w-3" />
                            <span>Portada</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: ESTUDIANTE (AULA VIRTUAL, TAREAS Y REFUERZOS INTERACTIVOS)       */}
        {/* ========================================================================= */}
        {rol === "estudiante" && (
          <div className="space-y-6">
            {/* 3 RESUMEN COMPACTO HORIZONTAL DEL ESTUDIANTE (MENOS ESPACIO VERTICAL, FOCO EN MATERIAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* STAT 1: TAREAS PENDIENTES (CLIC ABRE DRAWER DESLIZABLE) */}
              <div
                onClick={() => setDrawerTareasAbierto(true)}
                className={`relative bg-card/90 backdrop-blur-md rounded-2xl p-3 px-4 shadow-xs hover:shadow-md border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group flex items-center justify-between gap-3 ${
                  (resumen?.tareas_pendientes_count || 0) > 0
                    ? "border-amber-500/50 hover:border-amber-500 bg-amber-500/[0.03]"
                    : "border-border/80 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                      (resumen?.tareas_pendientes_count || 0) > 0
                        ? "bg-gradient-to-tr from-amber-500 via-amber-600 to-rose-500 text-white shadow-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      Tareas Pendientes
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-lg font-black leading-none ${
                          (resumen?.tareas_pendientes_count || 0) > 0
                            ? "text-amber-500 dark:text-amber-400"
                            : "text-foreground"
                        }`}
                      >
                        <AnimatedNumber value={resumen?.tareas_pendientes_count || 0} />
                      </span>
                      {(resumen?.tareas_pendientes_count || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                          </span>
                          <span>Por entregar</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Al día</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span className="hidden sm:inline">Deslizar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* STAT 2: REFUERZOS CON IA */}
              <Link
                href="/refuerzos"
                className="relative bg-card/90 backdrop-blur-md rounded-2xl p-3 px-4 shadow-xs hover:shadow-md border border-border/80 hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5 group flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      Refuerzos con IA
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-lg font-black text-foreground leading-none">
                        <AnimatedNumber value={resumen?.refuerzos_pendientes_count || 0} />
                      </span>
                      <span className="text-[11px] font-medium text-secondary truncate">
                        {(resumen?.refuerzos_pendientes_count || 0) === 0
                          ? "Completados"
                          : "Disponibles"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span className="hidden sm:inline">Practicar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              {/* STAT 3: PROMEDIO ACADÉMICO */}
              <div className="relative bg-card/90 backdrop-blur-md rounded-2xl p-3 px-4 shadow-xs hover:shadow-md border border-border/80 hover:border-secondary/50 transition-all duration-300 hover:-translate-y-0.5 group flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-secondary to-primary text-white flex items-center justify-center shrink-0 shadow-sm shadow-secondary/25 group-hover:scale-105 transition-transform">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      Rendimiento General
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-lg font-black text-foreground leading-none">
                        {resumen?.promedio_general !== null && resumen?.promedio_general !== undefined ? (
                          <>
                            <AnimatedNumber value={resumen.promedio_general} />
                            <span className="text-xs font-normal text-muted-foreground ml-0.5">/100</span>
                          </>
                        ) : (
                          "--"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-secondary shrink-0 px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
                  {resumen?.total_materias || 0} materias
                </span>
              </div>
            </div>

            {/* SECCIÓN PRINCIPAL: MIS MATERIAS Y AULAS VIRTUALES (FOCO TOTAL) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xs">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                      <span>Mis Materias y Asignaturas</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Accede a tus asignaturas inscritas, contenidos pedagógicos y entregas
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <Link href="/estudiante/recomendaciones">
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 hover:border-primary/50 hover:text-primary">
                      <Wand2 className="h-3.5 w-3.5 text-primary" />
                      <span>Recomendaciones Predictivas con ML</span>
                    </Button>
                  </Link>

                  {/* DETALLE CONTEXTUAL DEL CURSO DEL ESTUDIANTE */}
                  {cursos && cursos.length > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/90 border border-border/80 text-xs text-muted-foreground shadow-xs">
                      <School className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-bold text-foreground">
                        {cursos[0].gestion?.año} - {cursos[0].gestion?.etapa}
                      </span>
                      <span className="text-muted-foreground/60">·</span>
                      <span className="capitalize">Turno {cursos[0].turno}</span>
                      <span className="text-muted-foreground/60">·</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-2 font-black border-primary/40 text-primary bg-primary/5">
                        Paralelo {cursos[0].paralelo}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {!cursos || cursos.length === 0 ? (
                <div className="bg-card/85 backdrop-blur-md rounded-2xl p-8 text-center text-muted-foreground border border-dashed">
                  No estás inscrito en ningún curso actualmente.
                </div>
              ) : (
                cursos.map((curso) => (
                  <div key={curso.id} className="space-y-3">
                    {cursos.length > 1 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pt-2">
                        <School className="h-4 w-4 text-primary" />
                        <span>
                          {curso.gestion?.año} - {curso.gestion?.etapa} · Turno {curso.turno} · Paralelo {curso.paralelo}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {curso.materias?.map((m) => {
                        const tareasDeMateria = (tareas_pendientes || []).filter((t) => {
                          const targetMateriaId = Number(m.id ?? (m as any).materia_id ?? m.pivot?.materia_id);
                          const tMateriaId = Number(t.materia?.id ?? t.materia_id);
                          if (!targetMateriaId || !tMateriaId || targetMateriaId !== tMateriaId) {
                            return false;
                          }
                          const targetCursoId = Number(curso.id);
                          const tCursoId = Number(t.curso?.id ?? t.curso_id);
                          if (targetCursoId && tCursoId && targetCursoId !== tCursoId) {
                            return false;
                          }
                          return true;
                        });
                        const tieneTareas = tareasDeMateria.length > 0;

                        return (
                          <div
                            key={m.id}
                            className={`relative rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col justify-between bg-card/95 backdrop-blur-md ${
                              tieneTareas
                                ? "border-2 border-amber-500/60 hover:border-amber-500 shadow-md hover:shadow-xl shadow-amber-500/15 ring-2 ring-amber-500/20 hover:-translate-y-1"
                                : "border border-border/80 hover:border-primary/60 shadow-sm hover:shadow-lg hover:-translate-y-1"
                            }`}
                          >
                            {/* Barra superior de acento con gradiente */}
                            <div
                              className={`h-1.5 w-full ${
                                tieneTareas
                                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                                  : "bg-gradient-to-r from-emerald-500/70 to-primary/70"
                              }`}
                            />

                            <Link
                              href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                              className="block flex-1"
                            >
                              {/* PORTADA / CABECERA CON BADGES Y DECORACIONES */}
                              <div className="relative h-36 w-full overflow-hidden bg-muted">
                                {m.pivot?.imagen ? (
                                  <img
                                    src={`/storage/${m.pivot.imagen}`}
                                    alt={m.nombre}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div
                                    className="h-full w-full flex items-center justify-center text-white relative overflow-hidden"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                    }}
                                  >
                                    <div className="absolute inset-0 bg-black/15" />
                                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border border-white/20 bg-white/5" />
                                    <BookOpen className="h-12 w-12 text-white/90 group-hover:scale-110 transition-transform relative z-10" />
                                  </div>
                                )}

                                {/* Overlay degradado para legibilidad */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                                {/* Código de materia */}
                                <div className="absolute top-2.5 left-2.5 z-10">
                                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-black/65 text-white border border-white/25 backdrop-blur-md shadow-xs flex items-center gap-1.5">
                                    <BookOpen className="h-3 w-3 text-secondary" />
                                    <span>{m.codigo}</span>
                                  </span>
                                </div>

                                {/* BADGE NOTORIO DECORATIVO DE TAREAS */}
                                <div className="absolute top-2.5 right-2.5 z-10">
                                  {tieneTareas ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white shadow-lg shadow-amber-500/50 backdrop-blur-md animate-pulse border border-white/25">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                      </span>
                                      <span>
                                        {tareasDeMateria.length}{" "}
                                        {tareasDeMateria.length === 1 ? "tarea pendiente" : "tareas pendientes"}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-xs border border-white/20">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Al día</span>
                                    </div>
                                  )}
                                </div>

                                {/* Nombre rápido en la portada */}
                                <div className="absolute bottom-2.5 left-3 right-3 z-10">
                                  <p className="text-white font-extrabold text-sm line-clamp-1 drop-shadow-sm">
                                    {m.nombre}
                                  </p>
                                </div>
                              </div>

                              {/* CUERPO DE LA TARJETA */}
                              <div className="p-4 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <h5 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                    {m.nombre}
                                  </h5>
                                  {m.pivot?.ayuda_ia_activa && (
                                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                      <Sparkles className="h-3 w-3" />
                                      <span>Tutor IA</span>
                                    </span>
                                  )}
                                </div>

                                {/* Indicador claro de estado y botón al pie de la materia */}
                                <div
                                  className={`mt-2 pt-2.5 border-t flex items-center justify-between text-xs ${
                                    tieneTareas
                                      ? "border-amber-500/25"
                                      : "border-border/70"
                                  }`}
                                >
                                  {tieneTareas ? (
                                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                      <span>
                                        {tareasDeMateria.length === 1
                                          ? "1 entrega requerida"
                                          : `${tareasDeMateria.length} entregas requeridas`}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                      <span>Sin entregas pendientes</span>
                                    </span>
                                  )}

                                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200 flex items-center gap-1 shadow-2xs">
                                    <span>Entrar al Aula</span>
                                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SECCIÓN 2: REFUERZOS PEDAGÓGICOS CON IA ASIGNADOS */}
            {refuerzos_pendientes && refuerzos_pendientes.length > 0 && (
              <div className="bg-gradient-to-br from-primary/[0.07] via-card to-card rounded-3xl p-6 shadow-md border border-primary/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Refuerzos Pedagógicos con IA Asignados
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Preguntas adaptadas para fortalecer temas clave
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/refuerzos"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Ver todos</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="divide-y divide-border">
                  {refuerzos_pendientes.map((refuerzo) => (
                    <div
                      key={refuerzo.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/40 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                            {refuerzo.entrega?.leccion?.materia?.codigo || "Refuerzo"}
                          </Badge>
                          <span className="text-xs font-bold text-foreground">
                            {refuerzo.entrega?.leccion?.materia?.nombre || "Materia"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Lección:{" "}
                          <span className="text-foreground font-semibold">
                            {refuerzo.entrega?.leccion?.titulo || "Lección"}
                          </span>
                          {refuerzo.entrega?.calificacion?.nota !== undefined && (
                            <span className="ml-2 text-rose-500 font-bold">
                              (Nota previa: {refuerzo.entrega.calificacion.nota}/100)
                            </span>
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/refuerzos/${refuerzo.hash_id || refuerzo.id}`}
                        className="shrink-0"
                      >
                        <Button variant="gradient" size="sm" className="text-xs gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Resolver Refuerzo</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 3: ÚLTIMAS CALIFICACIONES Y RETROALIMENTACIÓN */}
            {ultimas_calificaciones && ultimas_calificaciones.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-secondary" />
                    Últimas Calificaciones y Retroalimentación
                  </h3>
                  <Link
                    href="/entregas"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Ver historial completo</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ultimas_calificaciones.map((cal) => {
                    const esAprobado = cal.calificacion.nota >= 70;
                    return (
                      <div
                        key={cal.id}
                        className="bg-card/85 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-border hover:border-primary/50 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-muted-foreground block truncate">
                              {cal.leccion?.materia?.nombre}
                            </span>
                            <h4 className="text-sm font-bold text-foreground truncate mt-0.5">
                              {cal.leccion?.titulo}
                            </h4>
                          </div>
                          <Badge
                            variant={esAprobado ? "success" : "warning"}
                            className="text-xs font-black px-2.5 py-0.5"
                          >
                            {cal.calificacion.nota}/100
                          </Badge>
                        </div>

                        {cal.calificacion.comentarios ? (
                          <div className="p-3 rounded-xl bg-muted/60 border border-border/80 text-xs text-muted-foreground italic">
                            &ldquo;{cal.calificacion.comentarios}&rdquo;
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic">
                            Sin comentarios adicionales
                          </p>
                        )}

                        <div className="text-[10px] text-muted-foreground text-right pt-1">
                          Revisado:{" "}
                          {formatoFechaHora(
                            cal.calificacion.fecha_calificacion || cal.fecha_entrega,
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE-OVER SIDEBAR DE TAREAS PENDIENTES DEL ESTUDIANTE (DESLIZA DERECHA) */}
        {/* ========================================================================= */}
        {rol === "estudiante" && drawerTareasAbierto && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setDrawerTareasAbierto(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
              <div className="w-screen max-w-md sm:max-w-lg bg-card/95 backdrop-blur-2xl border-l border-border/80 shadow-2xl flex flex-col p-6 overflow-hidden pointer-events-auto animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Tareas Pendientes ({tareas_pendientes?.length || 0})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Panel deslizable de actividades
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDrawerTareasAbierto(false)}
                    className="rounded-xl h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Listado de tareas */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                  {!tareas_pendientes || tareas_pendientes.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground space-y-2">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                      <p className="font-semibold text-sm text-foreground">¡Estás al día!</p>
                      <p className="text-xs">No tienes tareas pendientes por entregar en este momento.</p>
                    </div>
                  ) : (
                    tareas_pendientes.map((tarea) => {
                      const estadoVenc = obtenerEstadoVencimiento(tarea.fecha_entrega);
                      const esUrgente = estadoVenc?.vencido || estadoVenc?.esHoy;
                      return (
                        <div
                          key={tarea.id}
                          className={`relative rounded-2xl p-4 border transition-all duration-300 shadow-sm hover:shadow-md space-y-3 overflow-hidden ${
                            estadoVenc?.vencido
                              ? "bg-card border-rose-500/40 border-l-4 border-l-rose-500 shadow-rose-500/5"
                              : estadoVenc?.esHoy
                                ? "bg-card border-amber-500/50 border-l-4 border-l-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/15"
                                : "bg-card border-border/80 border-l-4 border-l-primary hover:border-primary/50"
                          }`}
                        >
                          {/* Forma geométrica decorativa en esquina */}
                          <div
                            className={`pointer-events-none absolute -right-4 -top-4 w-14 h-14 rounded-full blur-xs opacity-20 ${
                              esUrgente ? "bg-amber-500" : "bg-primary"
                            }`}
                          />

                          <div className="flex items-start justify-between gap-2 relative z-10">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-black tracking-wide border-primary/30 text-primary bg-primary/5"
                            >
                              {tarea.materia?.codigo} · {tarea.materia?.nombre}
                            </Badge>
                            {estadoVenc && (
                              <Badge
                                variant={
                                  estadoVenc.vencido
                                    ? "destructive"
                                    : estadoVenc.esHoy
                                      ? "warning"
                                      : "info"
                                }
                                className={`text-[10px] font-bold ${
                                  estadoVenc.esHoy ? "animate-pulse" : ""
                                }`}
                              >
                                {estadoVenc.textoBadge}
                              </Badge>
                            )}
                          </div>

                          <div className="relative z-10">
                            <h4 className="text-sm font-bold text-foreground leading-snug">
                              {tarea.titulo}
                            </h4>
                            {tarea.descripcion && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {tarea.descripcion}
                              </p>
                            )}
                          </div>

                          <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-xs relative z-10">
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                              <Clock
                                className={`h-3.5 w-3.5 ${
                                  esUrgente ? "text-amber-500 animate-pulse" : "text-primary"
                                }`}
                              />
                              <span>{formatoFechaHora(tarea.fecha_entrega)}</span>
                            </div>

                            <Link href={`/lecciones/${tarea.hash_id || tarea.id}`}>
                              <Button
                                size="sm"
                                variant="gradient"
                                className="h-7 text-xs px-3 shadow-xs gap-1 font-bold"
                              >
                                <Send className="h-3 w-3" />
                                <span>Entregar</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <Link href="/entregas" className="w-full block">
                    <Button variant="outline" className="w-full text-xs justify-center gap-1.5">
                      <span>Ir a Bandeja de Entregas</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}

// =========================================================================
// WIDGET: SEMÁFORO DE REZAGO ESTUDIANTIL (RADAR DE ALERTA TEMPRANA CON VIDA)
// =========================================================================
function SemaforoRezagoWidget({
  semaforo,
}: {
  semaforo?: SemaforoData;
  rol?: string;
}) {
  if (!semaforo) return null;
  const [filtro, setFiltro] = useState<"todos" | "alto" | "medio">("todos");
  const [expandido, setExpandido] = useState(false);

  const estudiantesFiltrados = (semaforo.estudiantes_riesgo || []).filter((e) => {
    if (filtro === "alto") return e.nivel === "alto";
    if (filtro === "medio") return e.nivel === "medio";
    return true;
  });

  const totalRiesgo = (semaforo.resumen.alto || 0) + (semaforo.resumen.medio || 0);

  return (
    <div className="bg-card/90 backdrop-blur-md rounded-3xl p-6 shadow-md border border-border/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Semáforo de Rezago Estudiantil
              </h3>
              <Badge variant="warning" className="text-[10px] uppercase font-bold">
                Alerta Temprana
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Identificación preventiva de estudiantes para evitar abandono y reprobación
            </p>
          </div>
        </div>

        {totalRiesgo > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpandido(!expandido)}
            className="text-xs h-8.5 gap-1.5"
          >
            {expandido ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Ocultar detalles ({totalRiesgo})</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Ver estudiantes en observación ({totalRiesgo})</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* 3 TARJETAS RADAR INTERACTIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 🔴 ALTO */}
        <div
          onClick={() => {
            setFiltro("alto");
            setExpandido(true);
          }}
          className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
            filtro === "alto" && expandido
              ? "border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30 shadow-md"
              : "border-rose-500/30 bg-rose-500/[0.06] hover:bg-rose-500/10 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              Riesgo Crítico (Rojo)
            </span>
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              <AnimatedNumber value={semaforo.resumen.alto} />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Promedio &lt; 51 pts o &ge; 2 tareas reprobadas. Requieren tutoría y seguimiento urgente.
          </p>
        </div>

        {/* 🟡 MEDIO */}
        <div
          onClick={() => {
            setFiltro("medio");
            setExpandido(true);
          }}
          className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
            filtro === "medio" && expandido
              ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30 shadow-md"
              : "border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/10 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              En Observación (Amarillo)
            </span>
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
              <AnimatedNumber value={semaforo.resumen.medio} />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Promedio entre 51 y 69 pts o refuerzos pendientes de resolución.
          </p>
        </div>

        {/* 🟢 BAJO */}
        <div className="rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Desempeño Óptimo (Verde)
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={semaforo.resumen.bajo} />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Promedio &ge; 70 pts y actividades de práctica al día.
          </p>
        </div>
      </div>

      {/* LISTADO EXPANDIBLE DE ESTUDIANTES */}
      {expandido && (
        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <span>Filtrar lista:</span>
              <button
                type="button"
                onClick={() => setFiltro("todos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filtro === "todos"
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Todos ({totalRiesgo})
              </button>
              <button
                type="button"
                onClick={() => setFiltro("alto")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  filtro === "alto"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping inline-block" />
                <span>Crítico ({semaforo.resumen.alto})</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltro("medio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  filtro === "medio"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                <span>Observación ({semaforo.resumen.medio})</span>
              </button>
            </div>
          </div>

          {estudiantesFiltrados.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl">
              No se registraron estudiantes con este criterio de filtro.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/70 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4 text-center">Promedio</th>
                    <th className="py-3 px-4 text-center">Tareas Reprobadas</th>
                    <th className="py-3 px-4 text-center">Refuerzos Pendientes</th>
                    <th className="py-3 px-4">Diagnóstico / Alerta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {estudiantesFiltrados.map((est) => (
                    <tr key={est.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                              est.nivel === "alto" ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          <span>{est.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{est.curso}</td>
                      <td className="py-3 px-4 text-center font-black">
                        {est.promedio !== null ? (
                          <span className={est.promedio < 51 ? "text-rose-500" : "text-amber-500"}>
                            {est.promedio} pts
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-normal">S/C</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {est.tareas_reprobadas > 0 ? (
                          <span className="font-bold text-rose-500">{est.tareas_reprobadas}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {est.refuerzos_pendientes > 0 ? (
                          <span className="font-bold text-amber-500">
                            {est.refuerzos_pendientes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            est.nivel === "alto"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                          }`}
                        >
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

      {/* MODAL DE PERSONALIZACIÓN VISUAL DE PORTADA DE LA MATERIA (ROL DOCENTE) */}
      <ModalCambiarPortadaMateria
        isOpen={!!materiaParaPortada}
        onClose={() => setMateriaParaPortada(null)}
        materia={materiaParaPortada}
      />
    </div>
  );
}
