import { Head, router } from "@inertiajs/react";
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
  LoaderCircle,
  Paperclip,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Send,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { FormEventHandler, useMemo, useState } from "react";

import InputError from "@/components/input-error";
import { PageHeaderBanner } from "@/components/page-header-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FileUploadDropzone } from "@/components/ui/file-upload-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import {
  formatoFechaHora,
  formatoRangoFechas,
  toDatetimeLocal,
} from "@/lib/formatters";
import { type BreadcrumbItem } from "@/types";

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
  tipo: "pdf" | "enlace" | "documento";
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
  tipo: "pdf" | "enlace" | "documento";
  archivo: string | null;
  enlace_url: string | null;
  estado?: string;
  created_at?: string;
}

interface Props {
  lecciones: Leccion[];
  recursos?: Recurso[];
  cursos: CursoOption[];
  materias: MateriaOption[];
  temas: Tema[];
  filtros: Filtros;
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

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Lecciones", href: "/lecciones" },
];

const initialForm: LeccionForm = {
  curso_id: "",
  materia_id: "",
  tema_id: "",
  titulo: "",
  descripcion: "",
  fecha_programada: "",
  fecha_entrega: "",
  estado: "activo",
};

const MATERIA_COLORS = [
  {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
    dot: "bg-indigo-500",
    bar: "bg-indigo-500",
  },
  {
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-200",
    dot: "bg-teal-500",
    bar: "bg-teal-500",
  },
  {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
  },
  {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    ring: "ring-cyan-200",
    dot: "bg-cyan-500",
    bar: "bg-cyan-500",
  },
];

function colorForMateria(codigo?: string) {
  if (!codigo) return MATERIA_COLORS[0];
  let hash = 0;
  for (let i = 0; i < codigo.length; i++)
    hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
  return MATERIA_COLORS[Math.abs(hash) % MATERIA_COLORS.length];
}

function iniciales(u?: UserData) {
  if (!u) return "?";
  return `${u.nombre?.[0] ?? ""}${u.apellido_paterno?.[0] ?? ""}`.toUpperCase();
}

function formatoFechaCorta(fecha?: string | null) {
  if (!fecha) return null;
  return formatoFechaHora(fecha);
}

function diasRestantes(fecha?: string | null) {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = new Date(`${fecha.split("T")[0]}T00:00:00`);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
}

export default function LeccionesIndex({
  lecciones,
  recursos = [],
  cursos,
  materias,
  temas,
  filtros,
  rol,
}: Props) {
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
    tipo: "pdf" | "enlace" | "documento";
    enlace_url: string;
    archivo: File | null;
  }>({
    materia_id: 0,
    tema_id: null,
    curso_id: null,
    titulo: "",
    descripcion: "",
    tipo: "pdf",
    enlace_url: "",
    archivo: null,
  });
  const [recursoErrors, setRecursoErrors] = useState<Record<string, string>>(
    {},
  );
  const [processingRecurso, setProcessingRecurso] = useState(false);

  const openCreateRecursoInTema = (
    materiaId: number,
    temaId: number | null,
  ) => {
    const curId =
      filtroCurso && filtroCurso !== "none" ? Number(filtroCurso) : null;
    setRecursoForm({
      materia_id: materiaId,
      tema_id: temaId,
      curso_id: curId,
      titulo: "",
      descripcion: "",
      tipo: "pdf",
      enlace_url: "",
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
      enlace_url: recursoForm.tipo === "enlace" ? recursoForm.enlace_url : null,
    };

    if (recursoForm.tipo !== "enlace" && recursoForm.archivo) {
      payload.archivo = recursoForm.archivo;
    }

    router.post("/recursos", payload, {
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
    if (!confirm("¿Estás seguro de eliminar este recurso de estudio?")) return;
    router.delete(`/recursos/${id}`);
  };

  // Modal rápido para crear tema
  const [modalNuevoTema, setModalNuevoTema] = useState(false);
  const [temaForm, setTemaForm] = useState({
    materia_id: 0,
    nombre: "",
    orden: "",
    paginas_libro: "",
    resumen: "",
    estado: "programado",
  });
  const [temaErrors, setTemaErrors] = useState<Record<string, string>>({});
  const [processingTema, setProcessingTema] = useState(false);

  // Asistente IA para creación y resumen de tema
  const [modoCreacionTema, setModoCreacionTema] = useState<"pdf" | "manual">("manual");
  const [temaPdfFile, setTemaPdfFile] = useState<File | null>(null);
  const [temaTextoBruto, setTemaTextoBruto] = useState<string>("");
  const [generandoResumenIA, setGenerandoResumenIA] = useState<boolean>(false);
  const [iaMensajeError, setIaMensajeError] = useState<string | null>(null);
  const [iaMensajeExito, setIaMensajeExito] = useState<string | null>(null);

  const [form, setForm] = useState<LeccionForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const isDocente = rol === "docente" || rol === "admin";
  const nombreCompleto = (u: UserData) =>
    `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

  // Acordeón: set de temas abiertos (para estudiantes se abren por defecto los que tienen tareas)
  const [temasAbiertos, setTemasAbiertos] = useState<Record<string, boolean>>(
    () => {
      if (!isDocente) {
        const inicial: Record<string, boolean> = { "sin-tema": true };
        temas.forEach((t) => {
          inicial[String(t.id)] = true;
        });
        return inicial;
      }
      return {};
    },
  );

  const [filtroCurso, setFiltroCurso] = useState(
    filtros.curso_id ? String(filtros.curso_id) : "",
  );
  const [filtroMateria, setFiltroMateria] = useState(
    filtros.materia_id ? String(filtros.materia_id) : "",
  );

  // Filtrado instantáneo (al momento): al cambiar curso o materia se filtra sin pulsar botón
  const handleCursoChange = (val: string) => {
    const nuevoCurso = val === "none" ? "" : val;
    setFiltroCurso(nuevoCurso);
    const params = new URLSearchParams();
    if (nuevoCurso) params.set("curso_id", nuevoCurso);
    if (filtroMateria && filtroMateria !== "none") params.set("materia_id", filtroMateria);
    router.get(`/lecciones?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  const handleMateriaChange = (val: string) => {
    const nuevaMateria = val === "none" ? "" : val;
    setFiltroMateria(nuevaMateria);
    const params = new URLSearchParams();
    if (filtroCurso && filtroCurso !== "none") params.set("curso_id", filtroCurso);
    if (nuevaMateria) params.set("materia_id", nuevaMateria);
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
    nuevoMapa["sin-tema"] = nuevo;
    setTemasAbiertos(nuevoMapa);
  };

  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    if (filtroCurso && filtroCurso !== "none") params.set("curso_id", filtroCurso);
    if (filtroMateria && filtroMateria !== "none") params.set("materia_id", filtroMateria);
    router.get(`/lecciones?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  // Abre el modal para crear con valores precargados (curso, materia, tema)
  const openCreateInTema = (materiaId: number, temaId: number | null) => {
    resetForm();
    setForm({
      ...initialForm,
      curso_id: filtroCurso || "",
      materia_id: String(materiaId),
      tema_id: temaId ? String(temaId) : "",
    });
    setModalCreate(true);
  };

  const openEdit = (leccion: Leccion) => {
    setLeccionSelect(leccion);
    setArchivo(null);
    setEliminarArchivo(false);
    setForm({
      curso_id: String(leccion.curso?.id || ""),
      materia_id: String(leccion.materia?.id || ""),
      tema_id: String(leccion.tema_id || ""),
      titulo: leccion.titulo,
      descripcion: leccion.descripcion || "",
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
      data.append("archivo", archivo);
    }
    router.post("/lecciones", data, {
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
    data.append("_method", "put");
    Object.keys(form).forEach((key) => {
      if (form[key]) data.append(key, form[key]);
    });
    if (archivo) {
      data.append("archivo", archivo);
    }
    if (eliminarArchivo) {
      data.append("eliminar_archivo", "1");
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
      setIaMensajeError("Por favor selecciona una materia primero.");
      return;
    }
    if (modoCreacionTema === "pdf" && !temaPdfFile) {
      setIaMensajeError("Por favor selecciona un archivo PDF.");
      return;
    }
    if (modoCreacionTema === "texto" && !temaTextoBruto.trim()) {
      setIaMensajeError("Por favor ingresa un texto para analizar.");
      return;
    }

    setGenerandoResumenIA(true);
    setIaMensajeError(null);
    setIaMensajeExito(null);

    try {
      const formData = new FormData();
      formData.append("materia_id", String(temaForm.materia_id));
      if (modoCreacionTema === "pdf" && temaPdfFile) {
        formData.append("archivo_pdf", temaPdfFile);
      }
      if (modoCreacionTema === "texto") {
        formData.append("texto", temaTextoBruto);
      }

      const res = await (window as any).axios.post(
        "/temas/generar-resumen",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data && res.data.success) {
        setTemaForm((prev) => ({
          ...prev,
          nombre: res.data.nombre || prev.nombre,
          paginas_libro: res.data.paginas_libro || prev.paginas_libro,
          resumen: res.data.resumen || prev.resumen,
        }));
        setIaMensajeExito("¡Resumen y título generados exitosamente con IA!");
      } else {
        setIaMensajeError(
          res.data?.message || "No se pudo generar el resumen con IA.",
        );
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Error al procesar con IA. Inténtalo de nuevo.";
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

    router.post("/temas", payload, {
      forceFormData: !!temaPdfFile,
      onSuccess: () => {
        setModalNuevoTema(false);
        setProcessingTema(false);
        setTemaErrors({});
        setTemaPdfFile(null);
        setTemaTextoBruto("");
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
    const matId =
      materiaId ||
      (filtroMateria && filtroMateria !== "none"
        ? Number(filtroMateria)
        : materias[0]?.id || 0);
    const temasMat = temas.filter((t) => t.materia_id === matId);
    const maxOrden =
      temasMat.length > 0 ? Math.max(...temasMat.map((t) => t.orden)) : 0;
    setTemaForm({
      materia_id: matId,
      nombre: "",
      orden: String(maxOrden + 1),
      paginas_libro: "",
      resumen: "",
      estado: "programado",
    });
    setTemaErrors({});
    setModoCreacionTema("pdf");
    setTemaPdfFile(null);
    setTemaTextoBruto("");
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
    const activas = lecciones?.filter((l) => l.estado === "activo").length ?? 0;
    const proximas =
      lecciones?.filter((l) => {
        const d = diasRestantes(l.fecha_entrega);
        return d !== null && d >= 0 && d <= 7;
      }).length ?? 0;
    return { total, activas, proximas };
  }, [lecciones]);

  const proximasEntregas = useMemo(() => {
    return (lecciones ?? [])
      .filter(
        (l) => l.fecha_entrega && (diasRestantes(l.fecha_entrega) ?? -1) >= 0,
      )
      .sort((a, b) => (a.fecha_entrega! > b.fecha_entrega! ? 1 : -1))
      .slice(0, 4);
  }, [lecciones]);

  // Agrupar lecciones por tema
  const leccionesPorTema = useMemo(() => {
    const grupos: Record<string, Leccion[]> = {};
    lecciones.forEach((l) => {
      const key = l.tema_id ? String(l.tema_id) : "sin-tema";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(l);
    });
    return grupos;
  }, [lecciones]);

  // Temas disponibles según filtros (materia seleccionada) y rol de usuario
  const temasFiltrados = useMemo(() => {
    let lista = temas;
    if (filtroMateria && filtroMateria !== "none") {
      lista = lista.filter((t) => String(t.materia_id) === filtroMateria);
    }
    // En la vista de los estudiantes: mostrar temas que tengan al menos una tarea o un recurso de estudio
    if (!isDocente) {
      lista = lista.filter(
        (t) =>
          (leccionesPorTema[String(t.id)]?.length ?? 0) > 0 ||
          (recursos || []).some((r) => r.tema_id === t.id),
      );
    }
    return lista;
  }, [temas, filtroMateria, isDocente, leccionesPorTema, recursos]);

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [año, setAño] = useState(hoy.getFullYear());

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const diasSemana = ["D", "L", "M", "M", "J", "V", "S"];

  const getDiasMes = (m: number, a: number) => {
    const primerDia = new Date(a, m, 1).getDay();
    const diasEnMes = new Date(a, m + 1, 0).getDate();
    const dias = [];
    for (let i = 0; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);
    return dias;
  };

  const fechasEntrega = lecciones
    .filter((l) => l.fecha_entrega)
    .map((l) => l.fecha_entrega?.split("T")[0]);

  const esFechaEntrega = (dia: number) => {
    const fecha = `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return fechasEntrega.includes(fecha);
  };

  const esHoy = (dia: number) => {
    return (
      dia === hoy.getDate() &&
      mes === hoy.getMonth() &&
      año === hoy.getFullYear()
    );
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
    const fecha = `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return lecciones.filter((l) => l.fecha_entrega?.startsWith(fecha));
  };

  // Temas del select del formulario, filtrados por la materia del form
  const temasDelForm = useMemo(() => {
    if (!form.materia_id) return [];
    return temas.filter(
      (t) => String(t.materia_id) === String(form.materia_id),
    );
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
          stats={[
            { label: "Lecciones", value: lecciones?.length || 0 },
          ]}
          actions={
            isDocente ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => openModalCreateTema()}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md rounded-xl transition-all"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nuevo Tema
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setForm({
                      ...initialForm,
                      curso_id:
                        filtroCurso && filtroCurso !== "none" ? filtroCurso : "",
                      materia_id:
                        filtroMateria && filtroMateria !== "none"
                          ? filtroMateria
                          : "",
                    });
                    setModalCreate(true);
                  }}
                  className="bg-white text-slate-950 hover:bg-white/90 font-bold shadow-lg rounded-xl transition-all"
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
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 backdrop-blur-md p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-t-2xl" />
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Lecciones
                </p>
                <p className="mt-1 text-3xl font-black text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5">planificadas en el sistema</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/25 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 backdrop-blur-md p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 rounded-t-2xl" />
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-secondary/10 rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Activas
                </p>
                <p className="mt-1 text-3xl font-black text-primary">{stats.activas}</p>
                <p className="text-xs text-muted-foreground mt-0.5">en curso ahora mismo</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-md shadow-secondary/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 backdrop-blur-md p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-amber-500 to-primary transition-all duration-500 rounded-t-2xl" />
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Próximos 7 días
                </p>
                <p className="mt-1 text-3xl font-black text-amber-500">{stats.proximas}</p>
                <p className="text-xs text-muted-foreground mt-0.5">entregas por vencer</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <CalendarClock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTRADO DINÁMICA E INSTANTÁNEA (AL MOMENTO) */}
        <div className="bg-gradient-to-r from-primary/[0.04] via-card to-secondary/[0.04] border border-primary/20 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xs shrink-0">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Filtro de Contenidos del Aula</h3>
                <p className="text-xs text-muted-foreground">Al elegir curso o materia se filtra automáticamente al instante</p>
              </div>
            </div>
            {(filtroCurso || filtroMateria) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Filtro activo al momento
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Curso / Paralelo</span>
                {filtroCurso && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </Label>
              <Select value={filtroCurso || "none"} onValueChange={handleCursoChange}>
                <SelectTrigger className="bg-card border-border/80 focus:ring-primary focus:border-primary/50 text-xs h-10 rounded-xl shadow-xs">
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
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Materia Académica</span>
                {filtroMateria && <span className="h-1.5 w-1.5 rounded-full bg-secondary" />}
              </Label>
              <Select value={filtroMateria || "none"} onValueChange={handleMateriaChange}>
                <SelectTrigger className="bg-card border-border/80 focus:ring-primary focus:border-primary/50 text-xs h-10 rounded-xl shadow-xs">
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
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/reportes/pdf?curso_id=${filtroCurso}&materia_id=${filtroMateria}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3.5 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10 rounded-xl shadow-xs"
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    PDF
                  </Button>
                </a>
                <a
                  href={`/reportes/excel?curso_id=${filtroCurso}&materia_id=${filtroMateria}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3.5 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl shadow-xs"
                  >
                    <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                    Excel
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="bg-card/90 backdrop-blur-md border border-primary/20 shadow-sm rounded-3xl overflow-hidden lg:col-span-2 flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 bg-gradient-to-r from-primary/[0.04] via-transparent to-secondary/[0.04] px-6 py-4.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xs shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Listado por Temas</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {lecciones?.length ?? 0} lección{lecciones?.length !== 1 ? "es" : ""} • {temasFiltrados.length} tema{temasFiltrados.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isDocente && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-primary border-primary/30 bg-primary/5 font-semibold"
                  >
                    {temasFiltrados.length} con tareas
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleTodosTemas}
                  className="h-8 text-xs font-semibold rounded-xl border-border/80 hover:border-primary/40 text-foreground bg-card shadow-2xs"
                >
                  {todosExpandidos ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      Minimizar todos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      Desplegar todos
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3">
              {temasFiltrados.length === 0 &&
                (leccionesPorTema["sin-tema"]?.length ?? 0) === 0 && (
                  <div className="py-14 text-center rounded-2xl border border-dashed border-border/70 bg-muted/15">
                    <div className="flex flex-col items-center gap-2.5 text-muted-foreground">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {!isDocente
                          ? "No tienes tareas ni lecciones asignadas en este momento"
                          : "No hay temas registrados en esta materia"}
                      </p>
                      {!isDocente && (
                        <p className="text-xs text-muted-foreground max-w-sm">
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
                const materiaDelTema = materias.find(
                  (m) => m.id === tema.materia_id,
                );
                const color = colorForMateria(materiaDelTema?.codigo);
                const tareasPendientesTema = isDocente
                  ? []
                  : leccionesTema.filter(
                      (l) => !l.entregas || l.entregas.length === 0,
                    );
                const tienePendientesEstudiante =
                  !isDocente && tareasPendientesTema.length > 0;
                const tieneTareas = leccionesTema.length > 0;

                if (!abierto) {
                  return (
                    <div
                      key={tema.id}
                      className={`group rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                        tienePendientesEstudiante
                          ? "border-amber-500/50 bg-gradient-to-r from-amber-500/[0.06] via-card to-card ring-1 ring-amber-500/20 hover:border-amber-500"
                          : "border-border/75 bg-card/60 hover:bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-2.5 gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTema(key)}
                          className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                        >
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                              tienePendientesEstudiante
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                            }`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.dot} shadow-2xs`} />
                          <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                            {tema.orden}. {tema.nombre}
                          </span>

                          {/* BADGES NOTORIOS DE ESTADO DE TAREAS */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            {!isDocente ? (
                              tienePendientesEstudiante ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                                  <Clock className="h-2.5 w-2.5" />
                                  <span>
                                    {tareasPendientesTema.length}{" "}
                                    {tareasPendientesTema.length === 1 ? "tarea pendiente" : "tareas pendientes"}
                                  </span>
                                </span>
                              ) : tieneTareas ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>Tareas al día</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground">
                                  Sin tareas
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
                                {leccionesTema.length} {leccionesTema.length === 1 ? "tarea" : "tareas"}
                              </span>
                            )}
                            {recursosTema.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/70 text-muted-foreground hidden sm:inline-flex">
                                {recursosTema.length} {recursosTema.length === 1 ? "recurso" : "recursos"}
                              </span>
                            )}
                          </div>
                        </button>

                        {isDocente && (
                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-primary border-primary/25 hover:bg-primary/10 rounded-lg"
                              onClick={() => openCreateRecursoInTema(tema.materia_id, tema.id)}
                              title="Subir material de estudio"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Recurso
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-secondary border-secondary/25 hover:bg-secondary/10 rounded-lg"
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
                    className={`rounded-2xl border-2 p-4 sm:p-5 shadow-md transition-all duration-300 space-y-4 ${
                      tienePendientesEstudiante
                        ? "border-amber-500/50 bg-gradient-to-b from-amber-500/[0.04] via-card to-card ring-2 ring-amber-500/20"
                        : "border-primary/40 bg-gradient-to-b from-primary/[0.03] via-card to-card ring-2 ring-primary/10"
                    }`}
                  >
                    {/* HEADER DEL TEMA EXPANDIDO */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-primary/15">
                      <button
                        type="button"
                        onClick={() => toggleTema(key)}
                        className="flex items-center gap-3 text-left group min-w-0 flex-1"
                      >
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${
                            tienePendientesEstudiante
                              ? "bg-gradient-to-tr from-amber-500 to-rose-500 shadow-amber-500/30"
                              : "bg-gradient-to-tr from-primary to-secondary shadow-primary/20"
                          }`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                              Tema #{tema.orden}
                            </span>
                            {!isDocente ? (
                              tienePendientesEstudiante ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                                  <Clock className="h-2.5 w-2.5" />
                                  <span>
                                    {tareasPendientesTema.length} {tareasPendientesTema.length === 1 ? "tarea por entregar" : "tareas por entregar"}
                                  </span>
                                </span>
                              ) : tieneTareas ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>Tareas al día</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Sin tareas</span>
                              )
                            ) : (
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {leccionesTema.length} {leccionesTema.length === 1 ? "tarea" : "tareas"} • {recursosTema.length} {recursosTema.length === 1 ? "recurso" : "recursos"}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-foreground mt-0.5 group-hover:text-primary transition-colors">
                            {tema.nombre}
                          </h3>
                        </div>
                      </button>

                      {isDocente && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-xl shadow-2xs"
                            onClick={() => openCreateRecursoInTema(tema.materia_id, tema.id)}
                            title="Subir material de estudio (PDF o Enlace web)"
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Recurso
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl shadow-2xs"
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
                      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5 shadow-2xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Sinopsis del Tema
                          </span>
                          <div className="flex items-center gap-2">
                            {tema.paginas_libro && (
                              <span className="text-[11px] font-medium text-muted-foreground bg-card px-2.5 py-0.5 rounded-md border border-border/80">
                                📖 {tema.paginas_libro}
                              </span>
                            )}
                            {tema.archivo_pdf && (
                              <a
                                href={`/storage/${tema.archivo_pdf}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline bg-card px-2.5 py-0.5 rounded-md border border-primary/30"
                              >
                                <FileText className="h-3 w-3" />
                                Ver Recurso PDF
                              </a>
                            )}
                          </div>
                        </div>
                        {tema.resumen && (
                          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                            {tema.resumen}
                          </p>
                        )}
                      </div>
                    )}

                    {/* RECURSOS DE ESTUDIO */}
                    {recursosTema.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 px-0.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            📚 Recursos de Estudio ({recursosTema.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {recursosTema.map((r) => {
                            const esYoutube =
                              r.enlace_url &&
                              (r.enlace_url.includes("youtube.com") || r.enlace_url.includes("youtu.be"));
                            const href = r.tipo === "enlace" ? r.enlace_url : `/storage/${r.archivo}`;
                            return (
                              <div
                                key={r.id}
                                className="group flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-card p-2.5 hover:border-primary/40 hover:shadow-2xs transition-all"
                              >
                                <a
                                  href={href || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-primary transition-colors"
                                >
                                  <div className="shrink-0 p-2 rounded-lg bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {r.tipo === "enlace" ? (
                                      esYoutube ? (
                                        <Youtube className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <ExternalLink className="h-4 w-4 text-emerald-500" />
                                      )
                                    ) : (
                                      <FileText className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold truncate text-foreground">
                                        {r.titulo}
                                      </span>
                                    </div>
                                    {r.descripcion && (
                                      <p className="text-[11px] text-muted-foreground truncate">
                                        {r.descripcion}
                                      </p>
                                    )}
                                  </div>
                                </a>
                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={href || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-primary hover:underline px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Abrir</span>
                                  </a>
                                  {isDocente && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-rose-500 rounded-lg"
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
                      <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/20">
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
                            miEntrega?.estado_calificacion === "calificado" &&
                            miEntrega?.calificacion?.nota !== undefined;
                          const tieneRefuerzo = !!miEntrega?.refuerzo && !miEntrega.refuerzo.completado;

                          return (
                            <div
                              key={l.id}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 hover:border-primary/40 hover:shadow-sm transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {isDocente ? (
                                    <a
                                      href={`/entregas/docente?leccion_id=${l.id}`}
                                      className="text-sm font-bold text-foreground leading-tight hover:text-primary transition-colors"
                                    >
                                      {l.titulo}
                                    </a>
                                  ) : (
                                    <a
                                      href={`/lecciones/${l.hash_id || l.id}`}
                                      className="text-sm font-bold text-foreground leading-tight hover:text-primary transition-colors"
                                    >
                                      {l.titulo}
                                    </a>
                                  )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {l.fecha_entrega ? formatoFechaCorta(l.fecha_entrega) : "Sin fecha límite"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {l.curso?.gestion?.año} · P.{l.curso?.paralelo}
                                  </span>
                                  {l.docente && (
                                    <span className="flex items-center gap-1" title={nombreCompleto(l.docente.user)}>
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                                        {iniciales(l.docente.user)}
                                      </span>
                                      <span className="truncate max-w-[120px]">{nombreCompleto(l.docente.user)}</span>
                                    </span>
                                  )}
                                  {l.imagen && (
                                    <span className="flex items-center gap-1 font-semibold text-primary">
                                      <Paperclip className="h-3 w-3" />
                                      PDF adjunto
                                    </span>
                                  )}

                                  {/* Estado para Estudiantes */}
                                  {!isDocente && (
                                    <>
                                      {estaCalificado && (
                                        <Badge
                                          variant={miEntrega!.calificacion!.nota >= 70 ? "success" : "warning"}
                                          className="text-[10px] gap-1 font-bold"
                                        >
                                          <Award className="h-3 w-3" />
                                          Nota: {miEntrega!.calificacion!.nota}/100
                                        </Badge>
                                      )}
                                      {yaEntregado && !estaCalificado && (
                                        <Badge variant="info" className="text-[10px] gap-1">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Entregado
                                        </Badge>
                                      )}
                                      {!yaEntregado && (
                                        <Badge
                                          variant={restantes !== null && restantes < 0 ? "destructive" : "warning"}
                                          className="text-[10px]"
                                        >
                                          {restantes !== null && restantes < 0 ? "Sin entregar (Vencida)" : "Pendiente de entrega"}
                                        </Badge>
                                      )}
                                      {tieneRefuerzo && (
                                        <Badge variant="purple" className="text-[10px] gap-1">
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
                                        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                                          {restantes === 0 ? "Vence Hoy" : `Vence en ${restantes}d`}
                                        </Badge>
                                      )}
                                      {restantes !== null && restantes < 0 && l.estado === "activo" && (
                                        <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                                          Vencida
                                        </Badge>
                                      )}
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                          l.estado === "activo" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        <span
                                          className={`h-1.5 w-1.5 rounded-full ${l.estado === "activo" ? "bg-emerald-500" : "bg-neutral-400"}`}
                                        />
                                        {l.estado === "activo" ? "Activo" : "Inactivo"}
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
                                      className={`h-8 text-xs font-semibold rounded-xl shadow-2xs ${
                                        estaCalificado
                                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                          : yaEntregado
                                            ? "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
                                            : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
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
                                        className="h-8 text-xs gap-1.5 border-primary/25 text-primary hover:bg-primary/10 rounded-xl"
                                        title="Revisar y calificar entregas"
                                      >
                                        <FileCheck className="h-3.5 w-3.5 text-primary" />
                                        Entregas
                                      </Button>
                                    </a>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-primary/40 text-foreground hover:text-primary transition-colors"
                                      onClick={() => openEdit(l)}
                                      title="Editar lección"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-blue-500" />
                                      <span>Editar</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-rose-400 text-muted-foreground hover:text-rose-500 transition-colors"
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
                const leccionesSinTema = leccionesPorTema["sin-tema"] ?? [];
                const recursosSinTema = (recursos || []).filter((r) => !r.tema_id);
                const totalSinTema =
                  leccionesSinTema.length + recursosSinTema.length;
                if (totalSinTema === 0) return null;
                const abierto = !!temasAbiertos["sin-tema"];
                const tareasPendientesSinTema = isDocente
                  ? []
                  : leccionesSinTema.filter(
                      (l) => !l.entregas || l.entregas.length === 0,
                    );
                const tienePendientesEstudiante =
                  !isDocente && tareasPendientesSinTema.length > 0;
                const tieneTareas = leccionesSinTema.length > 0;

                if (!abierto) {
                  return (
                    <div
                      className={`group rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                        tienePendientesEstudiante
                          ? "border-amber-500/50 bg-gradient-to-r from-amber-500/[0.06] via-card to-card ring-1 ring-amber-500/20 hover:border-amber-500"
                          : "border-border/75 bg-card/60 hover:bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-2.5 gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTema("sin-tema")}
                          className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                        >
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                              tienePendientesEstudiante
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                            }`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                          <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-muted-foreground/40 shadow-2xs" />
                          <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                            Sin tema específico (General)
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            {!isDocente ? (
                              tienePendientesEstudiante ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                                  <Clock className="h-2.5 w-2.5" />
                                  <span>
                                    {tareasPendientesSinTema.length}{" "}
                                    {tareasPendientesSinTema.length === 1 ? "tarea pendiente" : "tareas pendientes"}
                                  </span>
                                </span>
                              ) : tieneTareas ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>Tareas al día</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground">
                                  Sin tareas
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
                                {leccionesSinTema.length} {leccionesSinTema.length === 1 ? "tarea" : "tareas"}
                              </span>
                            )}
                            {recursosSinTema.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/70 text-muted-foreground hidden sm:inline-flex">
                                {recursosSinTema.length} {recursosSinTema.length === 1 ? "recurso" : "recursos"}
                              </span>
                            )}
                          </div>
                        </button>
                        {isDocente && (
                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-primary border-primary/25 hover:bg-primary/10 rounded-lg"
                              onClick={() => openCreateRecursoInTema(materias[0]?.id || 0, null)}
                              title="Subir material general"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Recurso
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-secondary border-secondary/25 hover:bg-secondary/10 rounded-lg"
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
                  <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-primary/[0.03] via-card to-card p-4 sm:p-5 ring-2 ring-primary/10 shadow-md transition-all duration-300 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-primary/15">
                      <button
                        type="button"
                        onClick={() => toggleTema("sin-tema")}
                        className="flex items-center gap-3 text-left group min-w-0 flex-1"
                      >
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xs shrink-0">
                          <ChevronUp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {totalSinTema} {totalSinTema === 1 ? "elemento general" : "elementos generales"}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-foreground mt-0.5 group-hover:text-primary transition-colors">
                            Sin tema específico (General)
                          </h3>
                        </div>
                      </button>
                      {isDocente && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-xl shadow-2xs"
                            onClick={() => openCreateRecursoInTema(materias[0]?.id || 0, null)}
                            title="Subir material de estudio general"
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Recurso
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl shadow-2xs"
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
                      {leccionesPorTema["sin-tema"].map((l) => {
                        const restantes = diasRestantes(l.fecha_entrega);
                        return (
                          <div
                            key={l.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 hover:border-primary/40 hover:shadow-sm transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                {isDocente ? (
                                  <a
                                    href={`/lecciones/${l.hash_id || l.id}/entregas`}
                                    className="text-sm font-bold text-foreground leading-tight hover:text-primary transition-colors"
                                  >
                                    {l.titulo}
                                  </a>
                                ) : (
                                  <a
                                    href={`/lecciones/${l.hash_id || l.id}`}
                                    className="text-sm font-bold text-foreground leading-tight hover:text-primary transition-colors"
                                  >
                                    {l.titulo}
                                  </a>
                                )}
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {l.fecha_entrega ? formatoFechaCorta(l.fecha_entrega) : "Sin fecha"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {l.curso?.gestion?.año} · P.{l.curso?.paralelo}
                                </span>
                                {l.docente && (
                                  <span className="flex items-center gap-1" title={nombreCompleto(l.docente.user)}>
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                                      {iniciales(l.docente.user)}
                                    </span>
                                    <span className="truncate max-w-[120px]">{nombreCompleto(l.docente.user)}</span>
                                  </span>
                                )}
                                {l.imagen && (
                                  <span className="flex items-center gap-1 font-semibold text-primary">
                                    <Paperclip className="h-3 w-3" />
                                    PDF adjunto
                                  </span>
                                )}
                                {restantes !== null && restantes >= 0 && restantes <= 3 && (
                                  <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                                    {restantes === 0 ? "Hoy" : `${restantes}d`}
                                  </Badge>
                                )}
                                {restantes !== null && restantes < 0 && l.estado === "activo" && (
                                  <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                                    Vencida
                                  </Badge>
                                )}
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    l.estado === "activo" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${l.estado === "activo" ? "bg-emerald-500" : "bg-neutral-400"}`}
                                  />
                                  {l.estado === "activo" ? "Activo" : "Inactivo"}
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
                                      className="h-8 text-xs gap-1.5 border-primary/25 text-primary hover:bg-primary/10 rounded-xl"
                                      title="Ver entregas"
                                    >
                                      <Users className="h-3.5 w-3.5 text-primary" />
                                      Entregas
                                    </Button>
                                  </a>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-primary/40 text-foreground hover:text-primary transition-colors"
                                    onClick={() => openEdit(l)}
                                    title="Editar lección"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-blue-500" />
                                    <span>Editar</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-rose-400 text-muted-foreground hover:text-rose-500 transition-colors"
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
            <Card className="shadow-sm border border-primary/20 rounded-3xl bg-card/90 backdrop-blur-md overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-2xs">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground capitalize">
                        {meses[mes]} {año}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">Calendario de actividades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => cambiarMes(-1)}
                      className="rounded-lg p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => cambiarMes(1)}
                      className="rounded-lg p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-y-1.5 text-center">
                  {diasSemana.map((d, i) => (
                    <div
                      key={i}
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 py-1"
                    >
                      {d}
                    </div>
                  ))}
                  {getDiasMes(mes, año).map((dia, i) => (
                    <div
                      key={i}
                      className="group relative flex justify-center py-0.5"
                    >
                      {dia && (
                        <div
                          className={`flex h-7 w-7 flex-col items-center justify-center rounded-full text-xs transition-all
                            ${esHoy(dia) ? "bg-gradient-to-tr from-primary to-secondary font-bold text-white shadow-md shadow-primary/30 ring-2 ring-primary/20" : "text-foreground hover:bg-primary/10 hover:text-primary"}`}
                        >
                          {dia}
                          {esFechaEntrega(dia) && !esHoy(dia) && (
                            <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                      )}
                      {dia && esFechaEntrega(dia) && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden -translate-x-1/2 group-hover:block">
                          <div className="max-w-[200px] truncate rounded-xl bg-popover border border-border px-2.5 py-1 text-[11px] text-popover-foreground shadow-lg font-medium">
                            {leccionesDelDia(dia)
                              .map((l) => l.titulo)
                              .join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />{" "}
                    Entrega
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Hoy
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* PRÓXIMAS ENTREGAS */}
            <Card className="shadow-sm border border-secondary/20 rounded-3xl bg-card/90 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/70 bg-gradient-to-r from-secondary/[0.04] to-transparent px-5 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  Próximas Entregas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 p-5 pt-3">
                {proximasEntregas.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/70 rounded-xl bg-muted/20">
                    No hay entregas próximas pendientes.
                  </div>
                )}
                {proximasEntregas.map((l) => {
                  const color = colorForMateria(l.materia?.codigo);
                  const restantes = diasRestantes(l.fecha_entrega);
                  return (
                    <div
                      key={l.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/75 bg-card/60 hover:bg-card hover:border-primary/30 transition-all shadow-2xs"
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {l.titulo}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {l.materia?.codigo} · {formatoFechaCorta(l.fecha_entrega)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          restantes === 0
                            ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                            : "bg-primary/10 text-primary border border-primary/25"
                        }`}
                      >
                        {restantes === 0 ? "Hoy" : `${restantes}d`}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MODAL CREAR */}
        <Dialog open={modalCreate} onOpenChange={setModalCreate}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva lección</DialogTitle>
              <DialogDescription>
                Completa los datos para publicar una nueva lección.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Curso *</Label>
                  <Select
                    value={form.curso_id}
                    onValueChange={(v) => setForm({ ...form, curso_id: v })}
                  >
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
                  <Select
                    value={form.materia_id}
                    onValueChange={(v) =>
                      setForm({ ...form, materia_id: v, tema_id: "" })
                    }
                  >
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
                <div className="col-span-2 space-y-1">
                  <Label>Tema del temario</Label>
                  <Select
                    value={form.tema_id || "none"}
                    onValueChange={(v) =>
                      setForm({ ...form, tema_id: v === "none" ? "" : v })
                    }
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
                <div className="col-span-2 space-y-1">
                  <Label>Título *</Label>
                  <Input
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                    required
                  />
                  <InputError message={errors.titulo} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Descripción</Label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    className="w-full rounded-md border p-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha y hora de inicio (programada)</Label>
                  <Input
                    type="datetime-local"
                    value={form.fecha_programada}
                    onChange={(e) =>
                      setForm({ ...form, fecha_programada: e.target.value })
                    }
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
                          const fechaBase = form.fecha_entrega.split("T")[0];
                          setForm({
                            ...form,
                            fecha_entrega: `${fechaBase}T23:59`,
                          });
                        }}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                        title="Fijar a las 23:59 hrs de ese día"
                      >
                        Fijar 23:59
                      </button>
                    )}
                  </div>
                  <Input
                    type="datetime-local"
                    value={form.fecha_entrega}
                    onChange={(e) =>
                      setForm({ ...form, fecha_entrega: e.target.value })
                    }
                  />
                  <InputError message={errors.fecha_entrega} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="create-archivo">
                    Material / Guía de la lección (PDF opcional)
                  </Label>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalCreate(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Guardar lección
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL EDITAR */}
        <Dialog open={modalEdit} onOpenChange={setModalEdit}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar lección</DialogTitle>
              <DialogDescription>
                Actualiza los datos de "{leccionSelect?.titulo}".
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Título *</Label>
                  <Input
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Tema del temario</Label>
                  <Select
                    value={form.tema_id || "none"}
                    onValueChange={(v) =>
                      setForm({ ...form, tema_id: v === "none" ? "" : v })
                    }
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
                <div className="col-span-2 space-y-1">
                  <Label>Descripción</Label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    className="w-full rounded-md border p-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha y hora de inicio (programada)</Label>
                  <Input
                    type="datetime-local"
                    value={form.fecha_programada}
                    onChange={(e) =>
                      setForm({ ...form, fecha_programada: e.target.value })
                    }
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
                          const fechaBase = form.fecha_entrega.split("T")[0];
                          setForm({
                            ...form,
                            fecha_entrega: `${fechaBase}T23:59`,
                          });
                        }}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                        title="Fijar a las 23:59 hrs de ese día"
                      >
                        Fijar 23:59
                      </button>
                    )}
                  </div>
                  <Input
                    type="datetime-local"
                    value={form.fecha_entrega}
                    onChange={(e) =>
                      setForm({ ...form, fecha_entrega: e.target.value })
                    }
                  />
                  <InputError message={errors.fecha_entrega} />
                </div>
                <div className="space-y-1">
                  <Label>Estado</Label>
                  <Select
                    value={form.estado}
                    onValueChange={(v) => setForm({ ...form, estado: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="edit-archivo">
                    Material / Guía de la lección (PDF)
                  </Label>
                  {leccionSelect?.imagen && !eliminarArchivo && (
                    <div className="flex items-center justify-between p-2 rounded border bg-neutral-50 dark:bg-neutral-900 text-xs mb-1.5">
                      <a
                        href={`/storage/${leccionSelect.imagen}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1.5"
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
                    <div className="flex items-center justify-between p-2 rounded border border-amber-200 bg-amber-50 dark:bg-amber-950/40 text-xs mb-1.5 text-amber-800 dark:text-amber-200">
                      <span>
                        El archivo adjunto actual se eliminará al guardar.
                      </span>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalEdit(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
              <DialogDescription>
                Esta acción no se puede deshacer. ¿Eliminar "
                {leccionSelect?.titulo}"?
              </DialogDescription>
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
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Nuevo Tema para el Temario
              </DialogTitle>
              <DialogDescription>
                Estructura las lecciones agregando un tema manual o extrayendo y
                resumiendo el contenido automáticamente desde un PDF o texto con
                IA.
              </DialogDescription>
            </DialogHeader>

            {/* SELECTOR DE MODO DE INGESTA */}
            <div className="flex rounded-xl bg-muted/60 p-1 text-xs font-semibold border border-border/70">
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  modoCreacionTema === "manual"
                    ? "bg-card shadow-xs text-primary font-bold border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setModoCreacionTema("manual")}
              >
                <Pencil className="h-4 w-4" />
                Creación Manual
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  modoCreacionTema === "pdf"
                    ? "bg-card shadow-xs text-primary font-bold border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setModoCreacionTema("pdf")}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Cargar PDF (con IA)
              </button>
            </div>

            {/* SECCIÓN DE IA CUANDO SE USA PDF */}
            {modoCreacionTema === "pdf" && (
              <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/[0.04] to-secondary/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Asistente de Resumen y Estructuración IA
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-card px-2 py-0.5 rounded-md border border-border">
                    Lector de PDF inteligente
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Archivo PDF del tema o capítulo (máx. 20MB)
                  </Label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setTemaPdfFile(file);
                      setIaMensajeError(null);
                    }}
                    className="h-9 text-xs file:text-xs file:h-7 file:rounded-md file:bg-primary/10 file:text-primary file:border-0 hover:file:bg-primary/20 cursor-pointer"
                  />
                  {temaPdfFile && (
                    <p className="text-[11px] text-primary font-medium flex items-center gap-1.5 pt-1">
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
                  className="w-full h-9 text-xs font-bold gap-2 bg-gradient-to-r from-primary to-secondary text-white shadow-xs hover:opacity-90"
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
              <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{iaMensajeError}</span>
              </div>
            )}
            {iaMensajeExito && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{iaMensajeExito}</span>
              </div>
            )}

            <form onSubmit={handleSaveTema} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Materia *</Label>
                <Select
                  value={String(temaForm.materia_id || "")}
                  onValueChange={(v) => {
                    const mId = Number(v);
                    const temasMat = temas.filter((t) => t.materia_id === mId);
                    const maxOrden =
                      temasMat.length > 0
                        ? Math.max(...temasMat.map((t) => t.orden))
                        : 0;
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
                    onChange={(e) =>
                      setTemaForm({ ...temaForm, orden: e.target.value })
                    }
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
                    onChange={(e) =>
                      setTemaForm({ ...temaForm, nombre: e.target.value })
                    }
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
                  onChange={(e) =>
                    setTemaForm({ ...temaForm, paginas_libro: e.target.value })
                  }
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
                    <span className="text-[10px] text-muted-foreground">
                      {temaForm.resumen.length} caracteres
                    </span>
                  )}
                </div>
                <textarea
                  id="quick_resumen"
                  value={temaForm.resumen}
                  onChange={(e) =>
                    setTemaForm({ ...temaForm, resumen: e.target.value })
                  }
                  className="w-full rounded-md border p-2 text-xs leading-relaxed"
                  rows={4}
                  placeholder="Breve descripción pedagógica del tema..."
                />
                <InputError message={temaErrors.resumen} />
              </div>

              {temaPdfFile && (
                <div className="rounded-md border border-neutral-200 bg-neutral-50 dark:bg-neutral-800/50 p-2 text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Se guardará adjunto: <strong>{temaPdfFile.name}</strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTemaPdfFile(null)}
                    className="text-neutral-400 hover:text-red-500 text-xs ml-2"
                  >
                    Quitar
                  </button>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNuevoTema(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={processingTema || generandoResumenIA}
                >
                  {processingTema && (
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
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
                Publica material didáctico (PDF, diapositivas o enlaces de
                investigación/YouTube) que los estudiantes podrán consultar
                directamente.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveRecurso} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Materia *</Label>
                <Select
                  value={String(recursoForm.materia_id || "")}
                  onValueChange={(v) =>
                    setRecursoForm({ ...recursoForm, materia_id: Number(v) })
                  }
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
                  value={
                    recursoForm.tema_id ? String(recursoForm.tema_id) : "none"
                  }
                  onValueChange={(v) =>
                    setRecursoForm({
                      ...recursoForm,
                      tema_id: v === "none" ? null : Number(v),
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sin tema específico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Sin tema específico (General)
                    </SelectItem>
                    {temas
                      .filter(
                        (t) =>
                          !recursoForm.materia_id ||
                          t.materia_id === recursoForm.materia_id,
                      )
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
                  onChange={(e) =>
                    setRecursoForm({ ...recursoForm, titulo: e.target.value })
                  }
                  required
                  className="h-8 text-xs"
                  placeholder="Ej: Diapositivas Unidad 3 o Video de la Sinapsis"
                />
                <InputError message={recursoErrors.titulo} />
              </div>

              {/* SELECTOR TIPO DE RECURSO */}
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Recurso *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                      recursoForm.tipo === "pdf"
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-300"
                        : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                    onClick={() =>
                      setRecursoForm({ ...recursoForm, tipo: "pdf" })
                    }
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Documento / PDF
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                      recursoForm.tipo === "enlace"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                    onClick={() =>
                      setRecursoForm({ ...recursoForm, tipo: "enlace" })
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                    Enlace Web / YouTube
                  </button>
                </div>
              </div>

              {/* SI ES ARCHIVO */}
              {recursoForm.tipo !== "enlace" ? (
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
                    className="h-8 text-xs file:text-xs file:h-6"
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNuevoRecurso(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={processingRecurso}>
                  {processingRecurso && (
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
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
