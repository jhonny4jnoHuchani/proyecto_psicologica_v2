import { Head, router } from "@inertiajs/react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  GraduationCap,
  Grid,
  Info,
  LayoutList,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  RotateCcw,
  School,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeaderBanner } from "@/components/page-header-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { formatoFecha } from "@/lib/formatters";
import { type BreadcrumbItem } from "@/types";

// ======================== TIPOS ========================
interface UserData {
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
  foto_perfil?: string | null;
}

interface MateriaItem {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  color?: string | null;
}

interface CursoItem {
  id: number;
  paralelo: string;
  turno: string;
  gestion?: {
    id: number;
    año: number;
    etapa: string;
  } | null;
  materias?: MateriaItem[];
  pivot?: {
    fecha_inscripcion: string;
    estado: "activo" | "abandonado" | "completado";
  };
}

interface EstudianteItem {
  id: number;
  user_id: number;
  colegio_procedencia: string | null;
  tipo_inscripcion: string | null;
  user: UserData;
  cursos: CursoItem[];
  created_at: string;
}

interface DocenteItem {
  id: number;
  user?: UserData;
  especialidad?: string | null;
  titulo_profesional?: string | null;
}

interface Props {
  docente?: DocenteItem | null;
  estudiantes: EstudianteItem[];
  cursos: CursoItem[];
  materias: MateriaItem[];
  filtros: {
    curso_id: number | null;
    materia_id: number | null;
    estado: string | null;
    buscar: string;
  };
  stats: {
    total_estudiantes: number;
    total_cursos: number;
    total_materias: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Panel Docente", href: "/dashboard" },
  { title: "Lista de Estudiantes", href: "/docente/estudiantes" },
];

export default function EstudiantesDocente({
  docente,
  estudiantes = [],
  cursos = [],
  materias = [],
  filtros,
  stats,
}: Props) {
  // Filtros locales
  const [busqueda, setBusqueda] = useState(filtros.buscar || "");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>(
    filtros.curso_id ? String(filtros.curso_id) : "todos"
  );
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>(
    filtros.materia_id ? String(filtros.materia_id) : "todas"
  );
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>(
    filtros.estado || "todos"
  );

  // Modo de visualización: tabla o cuadrícula (cards)
  const [modoVista, setModoVista] = useState<"tabla" | "grid">("tabla");

  // Modal de detalle de estudiante (Ficha)
  const [estudianteModal, setEstudianteModal] = useState<EstudianteItem | null>(
    null
  );

  // Helper para nombre completo
  const formatNombreCompleto = (u?: UserData | null) => {
    if (!u) return "Sin datos";
    const paterno = u.apellido_paterno || "";
    const materno = u.apellido_materno || "";
    const nombres = u.nombre || "";
    return `${paterno} ${materno}, ${nombres}`.trim();
  };

  // Helper para iniciales de avatar
  const getIniciales = (u?: UserData | null) => {
    if (!u) return "ES";
    const p = u.apellido_paterno ? u.apellido_paterno.charAt(0) : "";
    const n = u.nombre ? u.nombre.charAt(0) : "";
    return (p + n).toUpperCase() || "ES";
  };

  // Helper tipo de inscripción
  const formatTipoInscripcion = (tipo: string | null) => {
    const map: Record<string, string> = {
      preuniversitario: "Preuniversitario",
      regular: "Regular",
      dispensacion: "Prueba de Suficiencia",
      cursillo: "Curso Preuniversitario",
    };
    return tipo ? map[tipo] || tipo : "Regular";
  };

  // Helper para estado
  const getEstadoBadge = (estado?: string | null) => {
    switch (estado) {
      case "activo":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activo
          </span>
        );
      case "abandonado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Abandonado
          </span>
        );
      case "completado":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <CheckCircle2 className="w-3 h-3 text-sky-500" />
            Completado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {estado || "Inscrito"}
          </span>
        );
    }
  };

  // Manejar cambio de filtros hacia el servidor
  const aplicarFiltrosServidor = (
    nuevoCurso = cursoSeleccionado,
    nuevaMateria = materiaSeleccionada,
    nuevoEstado = estadoSeleccionado
  ) => {
    const params: Record<string, string | number> = {};

    if (nuevoCurso !== "todos") params.curso_id = Number(nuevoCurso);
    if (nuevaMateria !== "todas") params.materia_id = Number(nuevaMateria);
    if (nuevoEstado !== "todos") params.estado = nuevoEstado;
    if (busqueda.trim()) params.buscar = busqueda.trim();

    router.get("/docente/estudiantes", params, {
      preserveState: true,
      replace: true,
    });
  };

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setCursoSeleccionado("todos");
    setMateriaSeleccionada("todas");
    setEstadoSeleccionado("todos");

    router.get(
      "/docente/estudiantes",
      {},
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  // Filtrado local reactivo e instantáneo para búsqueda por texto
  const estudiantesFiltrados = useMemo(() => {
    let result = estudiantes;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      result = result.filter((e) => {
        const u = e.user;
        if (!u) return false;
        const nombreComp = `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}`.toLowerCase();
        const ci = (u.ci || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const cel = (u.celular || "").toLowerCase();
        return (
          nombreComp.includes(q) ||
          ci.includes(q) ||
          email.includes(q) ||
          cel.includes(q)
        );
      });
    }

    return result;
  }, [estudiantes, busqueda]);

  // Copiar email al portapapeles
  const handleCopiarEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Correo copiado al portapapeles");
  };

  // Imprimir nómina
  const handleImprimirNomina = () => {
    window.print();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Lista de Estudiantes - Panel Docente" />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto print:p-0 print:space-y-4">
        {/* Banner de Cabecera Oficial */}
        <div className="print:hidden">
          <PageHeaderBanner
            title="Lista de Estudiantes"
            subtitle="Nómina y registro académico oficial de los alumnos matriculados en tus asignaturas y paralelos."
            icon={Users}
            badgeText="ROL DOCENTE • NÓMINA OFICIAL"
            stats={[
              {
                label: "Estudiantes Matriculados",
                value: stats?.total_estudiantes ?? estudiantes.length,
              },
              {
                label: "Materias Asignadas",
                value: stats?.total_materias ?? materias.length,
              },
              {
                label: "Cursos / Paralelos",
                value: stats?.total_cursos ?? cursos.length,
              },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleImprimirNomina}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md rounded-xl transition-all font-semibold gap-1.5 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir Nómina</span>
                </Button>
              </div>
            }
          />
        </div>

        {/* Encabezado exclusivo para vista de impresión */}
        <div className="hidden print:block text-center border-b pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Universidad Pública de El Alto — Carrera de Psicología
          </h1>
          <h2 className="text-lg font-semibold text-slate-800">
            Nómina de Estudiantes Matriculados
          </h2>
          {docente?.user && (
            <p className="text-sm text-slate-600 mt-1">
              Docente: {formatNombreCompleto(docente.user)}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-0.5">
            Fecha de emisión: {new Date().toLocaleDateString("es-BO")}
          </p>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card className="border-border/80 shadow-sm print:hidden">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Buscador de texto reactivo */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar estudiante por nombre, apellidos, C.I. o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 pr-9 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Borrar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Controles de vista: Tabla / Cuadrícula */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  Vista:
                </span>
                <div className="flex items-center p-1 bg-muted rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setModoVista("tabla")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      modoVista === "tabla"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    <span>Tabla</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoVista("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      modoVista === "grid"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>Tarjetas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Fila de Filtros Desplegables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60">
              {/* Filtro por Materia */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Materia Asignada
                </Label>
                <Select
                  value={materiaSeleccionada}
                  onValueChange={(val) => {
                    setMateriaSeleccionada(val);
                    aplicarFiltrosServidor(cursoSeleccionado, val, estadoSeleccionado);
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Todas las materias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas mis materias</SelectItem>
                    {materias.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.codigo} - {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Curso / Paralelo */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-primary" />
                  Curso y Paralelo
                </Label>
                <Select
                  value={cursoSeleccionado}
                  onValueChange={(val) => {
                    setCursoSeleccionado(val);
                    aplicarFiltrosServidor(val, materiaSeleccionada, estadoSeleccionado);
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Todos los cursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los paralelos</SelectItem>
                    {cursos.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.gestion ? `${c.gestion.año} ${c.gestion.etapa} · ` : ""}
                        Paralelo {c.paralelo} ({c.turno})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Estado */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  Estado de Inscripción
                </Label>
                <Select
                  value={estadoSeleccionado}
                  onValueChange={(val) => {
                    setEstadoSeleccionado(val);
                    aplicarFiltrosServidor(cursoSeleccionado, materiaSeleccionada, val);
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Solo Activos</SelectItem>
                    <SelectItem value="abandonado">Abandonados</SelectItem>
                    <SelectItem value="completado">Completados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botón Reset / Contador */}
              <div className="flex items-end justify-between gap-2">
                <div className="text-xs text-muted-foreground pb-2">
                  Mostrando:{" "}
                  <span className="font-bold text-foreground">
                    {estudiantesFiltrados.length}
                  </span>{" "}
                  de {estudiantes.length}
                </div>

                {(busqueda ||
                  cursoSeleccionado !== "todos" ||
                  materiaSeleccionada !== "todas" ||
                  estadoSeleccionado !== "todos") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLimpiarFiltros}
                    className="text-xs h-9 gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Limpiar</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===================== LISTADO DE ESTUDIANTES ===================== */}

        {/* Estado Vacío */}
        {estudiantesFiltrados.length === 0 ? (
          <Card className="border-dashed border-2 p-12 text-center bg-card/50 backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No se encontraron estudiantes
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              {cursos.length === 0
                ? "Aún no tienes cursos o materias asignadas para esta gestión académica. Comunícate con la dirección para habilitar tus materias."
                : "No hay estudiantes que coincidan con los criterios o filtros seleccionados."}
            </p>
            {(busqueda ||
              cursoSeleccionado !== "todos" ||
              materiaSeleccionada !== "todas" ||
              estadoSeleccionado !== "todos") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLimpiarFiltros}
                className="mt-4 gap-1.5 rounded-xl"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restablecer filtros</span>
              </Button>
            )}
          </Card>
        ) : modoVista === "tabla" ? (
          /* ===================== VISTA TABLA ===================== */
          <Card className="overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="py-3.5 px-6 border-b bg-muted/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span>Padrón de Alumnos Asignados</span>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {estudiantesFiltrados.length} estudiantes
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estudiantes matriculados en tus cursos y materias habilitadas
                </p>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Estudiante</th>
                    <th className="px-5 py-3.5">Cédula de Identidad</th>
                    <th className="px-5 py-3.5">Materia(s) Asignada(s)</th>
                    <th className="px-5 py-3.5">Curso / Paralelo</th>
                    <th className="px-5 py-3.5">Contacto</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5 text-right print:hidden">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {estudiantesFiltrados.map((est, index) => {
                    const u = est.user;
                    const primerCurso = est.cursos?.[0];
                    const materiasDocente = primerCurso?.materias || [];
                    const estadoInscripcion = primerCurso?.pivot?.estado || "activo";

                    return (
                      <tr
                        key={est.id}
                        className="hover:bg-muted/40 transition-colors group"
                      >
                        {/* Índice correlativo */}
                        <td className="px-5 py-4 text-xs font-semibold text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Estudiante con Avatar */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/80 to-secondary/80 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ring-2 ring-background">
                              {getIniciales(u)}
                            </div>
                            <div>
                              <p className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => setEstudianteModal(est)}>
                                {formatNombreCompleto(u)}
                              </p>
                              <span className="text-[11px] text-muted-foreground">
                                {formatTipoInscripcion(est.tipo_inscripcion)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cédula de Identidad */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {u?.ci || "—"}
                            </span>
                            {u?.expedido && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold py-0 px-1 bg-muted/60"
                              >
                                {u.expedido}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Materias que cursa con este docente */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {materiasDocente.length > 0 ? (
                              materiasDocente.map((m) => (
                                <Badge
                                  key={m.id}
                                  variant="secondary"
                                  className="text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                  {m.codigo}: {m.nombre}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                General
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Curso y Paralelo */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {primerCurso ? (
                            <div className="text-xs space-y-0.5">
                              <span className="font-bold text-foreground inline-flex items-center gap-1">
                                <Badge variant="outline" className="font-bold bg-muted/40">
                                  Paralelo {primerCurso.paralelo}
                                </Badge>
                                <span className="capitalize text-muted-foreground">
                                  · {primerCurso.turno}
                                </span>
                              </span>
                              {primerCurso.gestion && (
                                <p className="text-[11px] text-muted-foreground">
                                  {primerCurso.gestion.año} - {primerCurso.gestion.etapa}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sin curso
                            </span>
                          )}
                        </td>

                        {/* Contacto: Email & WhatsApp */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {u?.email && (
                              <button
                                type="button"
                                onClick={() => handleCopiarEmail(u.email)}
                                title={`Copiar correo: ${u.email}`}
                                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {u?.celular ? (
                              <a
                                href={`https://wa.me/591${u.celular.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                title={`Enviar WhatsApp al ${u.celular}`}
                                className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {getEstadoBadge(estadoInscripcion)}
                        </td>

                        {/* Botón Ver Ficha (solo lectura) */}
                        <td className="px-5 py-4 text-right whitespace-nowrap print:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEstudianteModal(est)}
                            className="text-xs h-8 gap-1.5 rounded-lg border-border hover:border-primary/50 hover:text-primary"
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
        ) : (
          /* ===================== VISTA TARJETAS (GRID) ===================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estudiantesFiltrados.map((est) => {
              const u = est.user;
              const primerCurso = est.cursos?.[0];
              const materiasDocente = primerCurso?.materias || [];
              const estadoInscripcion = primerCurso?.pivot?.estado || "activo";

              return (
                <Card
                  key={est.id}
                  className="rounded-2xl border-border/80 hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden bg-card"
                >
                  <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {getIniciales(u)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {formatNombreCompleto(u)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            CI: {u?.ci} {u?.expedido && `(${u.expedido})`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>{getEstadoBadge(estadoInscripcion)}</div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3 text-xs">
                    {/* Materias asignadas */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Materia(s):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {materiasDocente.length > 0 ? (
                          materiasDocente.map((m) => (
                            <Badge
                              key={m.id}
                              variant="secondary"
                              className="text-[10px] bg-primary/10 text-primary border border-primary/20"
                            >
                              {m.codigo}: {m.nombre}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic">
                            Psicología
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Paralelo y Gestión */}
                    {primerCurso && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                        <span className="font-semibold text-foreground">
                          Paralelo {primerCurso.paralelo}
                        </span>
                        <span className="text-muted-foreground capitalize">
                          Turno {primerCurso.turno}
                        </span>
                      </div>
                    )}

                    {/* Contacto & Acción */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {u?.email && (
                          <button
                            type="button"
                            onClick={() => handleCopiarEmail(u.email)}
                            title={u.email}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {u?.celular && (
                          <a
                            href={`https://wa.me/591${u.celular.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            title={`WhatsApp: ${u.celular}`}
                            className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEstudianteModal(est)}
                        className="text-xs h-8 gap-1 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Ficha</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ===================== MODAL DE FICHA DEL ESTUDIANTE (SOLO LECTURA) ===================== */}
        <Dialog
          open={!!estudianteModal}
          onOpenChange={(open) => !open && setEstudianteModal(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            {estudianteModal && (
              <>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                      {getIniciales(estudianteModal.user)}
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-black text-foreground">
                        {formatNombreCompleto(estudianteModal.user)}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>
                          C.I.: {estudianteModal.user.ci}{" "}
                          {estudianteModal.user.expedido &&
                            `(${estudianteModal.user.expedido})`}
                        </span>
                        <span>•</span>
                        <span>
                          {formatTipoInscripcion(
                            estudianteModal.tipo_inscripcion
                          )}
                        </span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-5 py-3">
                  {/* Bloque 1: Información Personal */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2.5">
                      <User className="h-3.5 w-3.5" />
                      Datos Personales del Estudiante
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Cédula de Identidad:
                        </span>
                        <span className="font-semibold text-foreground font-mono">
                          {estudianteModal.user.ci}{" "}
                          {estudianteModal.user.expedido &&
                            `(${estudianteModal.user.expedido})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Género:
                        </span>
                        <span className="font-semibold text-foreground capitalize">
                          {estudianteModal.user.genero === "M"
                            ? "Masculino"
                            : estudianteModal.user.genero === "F"
                            ? "Femenino"
                            : estudianteModal.user.genero || "No especificado"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Fecha de Nacimiento:
                        </span>
                        <span className="font-semibold text-foreground">
                          {estudianteModal.user.fecha_nacimiento
                            ? formatoFecha(estudianteModal.user.fecha_nacimiento)
                            : "No registrada"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Dirección Domiciliaria:
                        </span>
                        <span className="font-semibold text-foreground">
                          {estudianteModal.user.direccion || "No registrada"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 2: Canales de Contacto */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2.5">
                      <Phone className="h-3.5 w-3.5" />
                      Canales de Contacto
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">
                            Correo Electrónico:
                          </span>
                          <span className="font-semibold text-foreground break-all">
                            {estudianteModal.user.email}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopiarEmail(estudianteModal.user.email)
                          }
                          className="h-7 px-2 text-xs text-primary"
                        >
                          Copiar
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">
                            Celular / WhatsApp:
                          </span>
                          <span className="font-semibold text-foreground">
                            {estudianteModal.user.celular || "Sin celular"}
                          </span>
                        </div>
                        {estudianteModal.user.celular && (
                          <a
                            href={`https://wa.me/591${estudianteModal.user.celular.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>Chat</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque 3: Antecedentes e Inscripción */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Antecedentes Académicos
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Colegio de Procedencia:
                        </span>
                        <span className="font-semibold text-foreground">
                          {estudianteModal.colegio_procedencia ||
                            "No registrado"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Tipo de Admisión / Inscripción:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatTipoInscripcion(
                            estudianteModal.tipo_inscripcion
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 4: Cursos y Materias que Cursa con este Docente */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2.5">
                      <School className="h-3.5 w-3.5" />
                      Cursos y Materias que Cursa Contigo
                    </h5>
                    <div className="space-y-2">
                      {estudianteModal.cursos &&
                      estudianteModal.cursos.length > 0 ? (
                        estudianteModal.cursos.map((c) => (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">
                                {c.gestion
                                  ? `${c.gestion.año} - ${c.gestion.etapa} · `
                                  : ""}
                                Paralelo {c.paralelo} ({c.turno})
                              </span>
                              {getEstadoBadge(c.pivot?.estado)}
                            </div>

                            {c.pivot?.fecha_inscripcion && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Inscrito el{" "}
                                {formatoFecha(c.pivot.fecha_inscripcion)}
                              </p>
                            )}

                            {c.materias && c.materias.length > 0 && (
                              <div className="pt-1.5 border-t border-border/60">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                  Materias con tu docencia:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {c.materias.map((m) => (
                                    <Badge
                                      key={m.id}
                                      variant="secondary"
                                      className="text-xs bg-primary/15 text-primary border border-primary/25 font-semibold"
                                    >
                                      {m.codigo}: {m.nombre}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic p-3">
                          No tiene cursos asignados registrados.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setEstudianteModal(null)}
                    className="rounded-xl w-full sm:w-auto"
                  >
                    Cerrar Ficha
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

