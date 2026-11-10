import { Head, router } from "@inertiajs/react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  UserX,
  Wand2,
} from "lucide-react";
import { FormEventHandler, useMemo, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeaderBanner } from "@/components/page-header-banner";
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
import { formatoFechaHora } from "@/lib/formatters";
import { type BreadcrumbItem } from "@/types";

interface MateriaData {
  id: number;
  nombre: string;
  codigo: string;
}
interface EstudianteData {
  id: number;
  user: { nombre: string; apellido_paterno: string; apellido_materno: string };
}
interface LeccionData {
  id: number;
  titulo: string;
  materia: MateriaData;
}
interface CalificacionData {
  id: number;
  nota: number;
  comentarios: string | null;
}
interface RefuerzoData {
  id: number;
  completado: boolean;
}

interface Entrega {
  id: number;
  estado_entrega: string;
  estado_calificacion: string;
  fecha_entrega: string | null;
  archivos_enviado: string[] | null;
  comentarios: string | null;
  leccion: LeccionData;
  estudiante: EstudianteData;
  calificacion: CalificacionData | null;
  refuerzo?: RefuerzoData | null;
}

interface LeccionFiltro {
  id: number;
  titulo: string;
  materia: MateriaData;
}

interface EstudianteSinEntregar {
  id: number;
  user: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
}

interface Props {
  entregas: Entrega[];
  lecciones: LeccionFiltro[];
  filtroLeccionId: number | null;
  estudiantesSinEntregar?: EstudianteSinEntregar[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Entregas", href: "/entregas/docente" },
];

export default function EntregasDocente({
  entregas,
  lecciones,
  filtroLeccionId,
  estudiantesSinEntregar,
}: Props) {
  const [leccionId, setLeccionId] = useState(
    filtroLeccionId ? String(filtroLeccionId) : "",
  );
  const [tabEstado, setTabEstado] = useState<
    "todos" | "pendientes" | "calificados" | "sin_entregar"
  >("todos");

  // Modal Calificar
  const [modalCalificar, setModalCalificar] = useState(false);
  const [entregaSelect, setEntregaSelect] = useState<Entrega | null>(null);
  const [nota, setNota] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal Refuerzo IA
  const [modalRefuerzo, setModalRefuerzo] = useState(false);
  const [entregaRefuerzoId, setEntregaRefuerzoId] = useState<number | null>(
    null,
  );
  const [estudianteRefuerzo, setEstudianteRefuerzo] = useState<string>("");
  const [preguntasRefuerzo, setPreguntasRefuerzo] = useState<string[]>([]);
  const [recomendacion, setRecomendacion] = useState("");
  const [cargandoRefuerzo, setCargandoRefuerzo] = useState(false);
  const [errorGeneracion, setErrorGeneracion] = useState<string | null>(null);
  const [regenerando, setRegenerando] = useState<number | null>(null);
  const [guardandoRefuerzo, setGuardandoRefuerzo] = useState(false);
  const [modalConfirmarRefrescar, setModalConfirmarRefrescar] = useState(false);

  const nombreCompleto = (u: EstudianteData["user"]) =>
    `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

  const handleLeccionChange = (nuevaLeccionId: string) => {
    setLeccionId(nuevaLeccionId === "none" ? "" : nuevaLeccionId);
    if (nuevaLeccionId && nuevaLeccionId !== "none") {
      router.get(
        `/entregas/docente?leccion_id=${nuevaLeccionId}`,
        {},
        { preserveState: true, preserveScroll: true },
      );
    } else {
      router.get(
        "/entregas/docente",
        {},
        { preserveState: true, preserveScroll: true },
      );
    }
  };

  const openCalificar = (entrega: Entrega) => {
    setEntregaSelect(entrega);
    setNota(
      entrega.calificacion?.nota ? String(entrega.calificacion.nota) : "",
    );
    setComentarios(entrega.calificacion?.comentarios || "");
    setErrors({});
    setModalCalificar(true);
  };

  //aqui manda lo que es la calificacion (formulario para mandar al controaldor)
  // calficacion y retroalimentacion se mandan al controlador
  const handleCalificar: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const res = await window.axios.post("/calificaciones", {
        entrega_id: entregaSelect?.id,
        nota,
        comentarios,
      });

      setModalCalificar(false);
      setProcessing(false);

      toast.success("Calificación guardada correctamente");

      const flash = res.data?.flash;
      if (flash?.sugerir_refuerzo && flash?.entrega_refuerzo_id) {
        setEntregaRefuerzoId(flash.entrega_refuerzo_id);
        setEstudianteRefuerzo(
          entregaSelect ? nombreCompleto(entregaSelect.estudiante.user) : "",
        );
        setErrorGeneracion(null);
        setModalRefuerzo(true);
        generarPreguntas(flash.entrega_refuerzo_id);
      } else if (flash?.motivo_no_refuerzo) {
        toast.warning(`Atención: ${flash.motivo_no_refuerzo}`, {
          duration: 7000,
        });
        router.reload({ only: ["entregas"] });
      } else {
        router.reload({ only: ["entregas"] });
      }
    } catch (err) {
      console.error(err);
      setProcessing(false);
      const axiosErr = err as AxiosError<{
        message?: string;
        errors?: Record<string, string>;
      }>;
      if (axiosErr.response?.data?.errors) {
        setErrors(axiosErr.response.data.errors);
      }
      toast.error(
        axiosErr.response?.data?.message || "Error al guardar la calificación",
      );
    }
  };

  const abrirRefuerzoManual = (entrega: Entrega) => {
    setEntregaRefuerzoId(entrega.id);
    setEstudianteRefuerzo(nombreCompleto(entrega.estudiante.user));
    setErrorGeneracion(null);
    setModalRefuerzo(true);
    generarPreguntas(entrega.id);
  };

  const generarPreguntas = async (
    entregaId: number,
    limpiar: boolean = true,
  ) => {
    setCargandoRefuerzo(true);
    setErrorGeneracion(null);

    if (limpiar) {
      setPreguntasRefuerzo([]);
      setRecomendacion("");
    }

    try {
      const res = await window.axios.post("/refuerzos/generar", {
        entrega_id: entregaId,
      });

      if (res.data.success) {
        setPreguntasRefuerzo(res.data.preguntas);
        setRecomendacion(res.data.recomendacion || "");
        toast.success("Preguntas de refuerzo generadas con éxito");
      } else {
        const errorMsg = res.data.error || "Error al generar las preguntas";
        setErrorGeneracion(errorMsg);
        toast.error(errorMsg, { duration: 7000 });
      }
    } catch (err) {
      console.error(err);
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const errorMsg =
        axiosErr.response?.data?.error ||
        axiosErr.response?.data?.message ||
        "Error inesperado al generar las preguntas con IA.";
      setErrorGeneracion(errorMsg);
      toast.error(errorMsg, { duration: 7000 });
    } finally {
      setCargandoRefuerzo(false);
    }
  };

  const actualizarTodas = () => {
    if (!entregaRefuerzoId) return;

    const hayContenido = preguntasRefuerzo.length > 0;
    if (hayContenido) {
      setModalConfirmarRefrescar(true);
      return;
    }

    ejecutarRefrescar();
  };

  const ejecutarRefrescar = async () => {
    if (!entregaRefuerzoId) return;

    setModalConfirmarRefrescar(false);
    await generarPreguntas(entregaRefuerzoId, false);
  };

  const regenerarPregunta = async (index: number) => {
    if (!entregaRefuerzoId) return;

    setRegenerando(index);

    try {
      const otrasPreguntas = preguntasRefuerzo.filter((_, i) => i !== index);

      const res = await window.axios.post("/refuerzos/regenerar-pregunta", {
        entrega_id: entregaRefuerzoId,
        pregunta_actual: preguntasRefuerzo[index],
        otras_preguntas: otrasPreguntas,
      });

      if (res.data.success) {
        const nuevas = [...preguntasRefuerzo];
        nuevas[index] = res.data.pregunta;
        setPreguntasRefuerzo(nuevas);
        toast.success("Pregunta regenerada");
      } else {
        toast.error(res.data.error || "Error al regenerar la pregunta");
      }
    } catch (err) {
      console.error(err);
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      toast.error(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          "Error al regenerar la pregunta",
      );
    } finally {
      setRegenerando(null);
    }
  };

  const actualizarPregunta = (index: number, valor: string) => {
    const nuevas = [...preguntasRefuerzo];
    nuevas[index] = valor;
    setPreguntasRefuerzo(nuevas);
  };

  const guardarRefuerzo = async () => {
    if (!entregaRefuerzoId) return;

    setGuardandoRefuerzo(true);

    try {
      await window.axios.post("/refuerzos/guardar", {
        entrega_id: entregaRefuerzoId,
        preguntas: preguntasRefuerzo,
        recomendacion,
      });

      toast.success("Refuerzo guardado y enviado al estudiante");
      setModalRefuerzo(false);
      setPreguntasRefuerzo([]);
      setRecomendacion("");
      setEntregaRefuerzoId(null);
      router.reload({ only: ["entregas"] });
    } catch (err) {
      console.error(err);
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      toast.error(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          "Error al guardar el refuerzo",
      );
    } finally {
      setGuardandoRefuerzo(false);
    }
  };

  const cancelarRefuerzo = () => {
    if (
      preguntasRefuerzo.length > 0 &&
      !confirm(
        "¿Cancelar la generación de preguntas? Se perderán las preguntas no guardadas.",
      )
    ) {
      return;
    }
    setModalRefuerzo(false);
    setPreguntasRefuerzo([]);
    setErrorGeneracion(null);
    setRecomendacion("");
    setEntregaRefuerzoId(null);
  };

  const pendientesCount = useMemo(
    () => (entregas || []).filter((e) => !e.calificacion).length,
    [entregas],
  );
  const calificadasCount = useMemo(
    () => (entregas || []).filter((e) => !!e.calificacion).length,
    [entregas],
  );
  const sinEntregarCount = estudiantesSinEntregar?.length || 0;

  const entregasFiltradas = useMemo(() => {
    if (!entregas) return [];
    if (tabEstado === "pendientes") {
      return entregas.filter((e) => !e.calificacion);
    }
    if (tabEstado === "calificados") {
      return entregas.filter((e) => !!e.calificacion);
    }
    return entregas;
  }, [entregas, tabEstado]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Entregas de Estudiantes" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <PageHeaderBanner
          title="Revisión y Calificación de Entregas"
          subtitle="Evaluación pedagógica de tareas, retroalimentación cuantitativa/cualitativa y generación de refuerzo con IA."
          icon={Sparkles}
          badgeText="PANEL DEL DOCENTE"
          stats={[
            { label: "Total Entregas", value: entregas?.length || 0 },
            { label: "Lecciones", value: lecciones?.length || 0 },
          ]}
        />

        {/* BARRA DE FILTRADO DINÁMICA (EN TIEMPO REAL) */}
        <div className="bg-card/90 backdrop-blur-md border border-primary/20 rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <Label className="text-xs font-bold text-foreground">Filtrar por Lección o Tarea</Label>
                {leccionId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    Filtrado instantáneo
                  </span>
                )}
              </div>
              <Select value={leccionId || "none"} onValueChange={handleLeccionChange}>
                <SelectTrigger className="h-10 text-xs rounded-xl bg-background border-border/80 focus:ring-primary shadow-2xs">
                  <SelectValue placeholder="Todas las lecciones y tareas" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">Todas las lecciones y tareas</SelectItem>
                  {lecciones.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.materia?.codigo} - {l.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* VISTA EN 2 CARDS LADO A LADO: COMPLETADO Y PENDIENTE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* CARD 1: ESTUDIANTES CON ENTREGA (COMPLETADOS) */}
          <Card className="rounded-3xl border border-emerald-500/25 bg-card/90 backdrop-blur-md shadow-sm overflow-hidden flex flex-col justify-between">
            <CardHeader className="border-b border-border/80 bg-gradient-to-r from-emerald-500/[0.06] to-transparent px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Entregas Recibidas (Completado)
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {entregas?.length || 0} estudiante(s) han enviado su tarea
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                  {entregas?.length || 0} entregados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 flex-1 space-y-3">
              {(!entregas || entregas.length === 0) ? (
                <div className="py-14 text-center text-muted-foreground">
                  <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Aún no hay entregas registradas</p>
                  <p className="text-xs text-muted-foreground">Los envíos de los estudiantes aparecerán aquí.</p>
                </div>
              ) : (
                entregas.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl border border-border/80 bg-background/50 hover:bg-background hover:border-emerald-500/40 hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {nombreCompleto(e.estudiante.user)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.leccion?.materia?.codigo} · {e.leccion?.titulo}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {e.calificacion ? (
                          <Badge
                            variant={e.calificacion.nota >= 70 ? "success" : "warning"}
                            className="text-xs font-black px-2.5 py-0.5"
                          >
                            Nota: {e.calificacion.nota}/100
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/10 font-bold">
                            Pendiente de calificar
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {e.fecha_entrega ? formatoFechaHora(e.fecha_entrega) : "Entregado"}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {e.archivos_enviado?.map((a, i) => (
                          <a key={i} href={`/storage/${a}`} target="_blank" rel="noreferrer">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 rounded-lg border-border hover:border-primary/40 text-foreground"
                              title="Ver archivo adjunto de la entrega"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              <span>Ver Entrega</span>
                            </Button>
                          </a>
                        ))}

                        {e.calificacion && e.calificacion.nota < 75 && !e.refuerzo && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirRefuerzoManual(e)}
                            className="h-7 text-xs gap-1.5 rounded-lg text-primary border-primary/30 hover:bg-primary/10"
                            title="Generar preguntas de refuerzo IA"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Refuerzo IA</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 font-bold"
                          onClick={() => openCalificar(e)}
                          title="Calificar y evaluar entrega"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{e.calificacion ? "Editar Nota" : "Calificar"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* CARD 2: ESTUDIANTES PENDIENTES (SIN ENTREGAR) */}
          <Card className="rounded-3xl border border-rose-500/25 bg-card/90 backdrop-blur-md shadow-sm overflow-hidden flex flex-col justify-between">
            <CardHeader className="border-b border-border/80 bg-gradient-to-r from-rose-500/[0.06] to-transparent px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                    <UserX className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Estudiantes Pendientes (Sin Entregar)
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {filtroLeccionId ? `${sinEntregarCount} estudiante(s) faltan por enviar` : "Selecciona una lección para ver la lista exacta"}
                    </p>
                  </div>
                </div>
                {filtroLeccionId && (
                  <Badge variant="outline" className="text-xs font-bold text-rose-600 border-rose-500/30 bg-rose-500/10">
                    {sinEntregarCount} pendientes
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 flex-1 space-y-3">
              {!filtroLeccionId ? (
                <div className="py-14 text-center text-muted-foreground space-y-2">
                  <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-foreground">Elige una lección específica en el filtro superior</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Al seleccionar una tarea específica, el sistema cruzará la lista completa de inscritos y te mostrará exactamente quiénes no han enviado su trabajo.
                  </p>
                </div>
              ) : sinEntregarCount === 0 ? (
                <div className="py-14 text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2 opacity-90" />
                  <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">¡100% de Cumplimiento!</p>
                  <p className="text-xs text-muted-foreground">Todos los estudiantes inscritos han presentado su entrega para esta lección.</p>
                </div>
              ) : (
                estudiantesSinEntregar?.map((est) => (
                  <div
                    key={est.id}
                    className="p-3.5 rounded-2xl border border-border/80 bg-background/50 hover:bg-background hover:border-rose-500/30 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {nombreCompleto(est.user)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código: {est.codigo_estudiante || "Inscrito"}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5">
                      Sin entrega
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal Calificar */}
        <Dialog open={modalCalificar} onOpenChange={setModalCalificar}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Calificar Entrega</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground mb-2">
              <p>
                <strong>Estudiante:</strong>{" "}
                {entregaSelect
                  ? nombreCompleto(entregaSelect.estudiante.user)
                  : ""}
              </p>
              <p>
                <strong>Lección:</strong> {entregaSelect?.leccion?.titulo}
              </p>
            </div>
            <form onSubmit={handleCalificar} className="space-y-4">
              <div className="space-y-1">
                <Label>Nota (0-100) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  required
                  placeholder="85.5"
                />
                {errors.nota && (
                  <p className="text-red-500 text-sm">{errors.nota}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Comentarios</Label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  className="border rounded p-2 w-full text-sm bg-background"
                  rows={3}
                  placeholder="Retroalimentación..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalCalificar(false)}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={processing}>
                  {processing && (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {entregaSelect?.calificacion ? "Actualizar" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Refuerzo IA */}
        <Dialog open={modalRefuerzo} onOpenChange={setModalRefuerzo}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Preguntas de refuerzo con IA
                </DialogTitle>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={actualizarTodas}
                  disabled={cargandoRefuerzo || guardandoRefuerzo}
                  className="border-primary-border text-primary hover:bg-primary-light"
                  title="Generar 10 preguntas nuevas"
                >
                  <Wand2
                    className={`mr-1.5 h-3.5 w-3.5 ${cargandoRefuerzo ? "animate-pulse" : ""}`}
                  />
                  {cargandoRefuerzo ? "Generando..." : "Otra tanda"}
                </Button>
              </div>
              <DialogDescription>
                Estudiante: <strong>{estudianteRefuerzo}</strong> · Revisa y
                edita las preguntas antes de enviarlas.
              </DialogDescription>
            </DialogHeader>

            {/* Error al generar preguntas */}
            {errorGeneracion &&
              preguntasRefuerzo.length === 0 &&
              !cargandoRefuerzo && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                        No se pudieron generar las preguntas con IA
                      </h4>
                      <p className="text-xs text-red-700 dark:text-red-400 whitespace-pre-line">
                        {errorGeneracion}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        entregaRefuerzoId &&
                        generarPreguntas(entregaRefuerzoId, true)
                      }
                      className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Reintentar generación
                    </Button>
                  </div>
                </div>
              )}

            {preguntasRefuerzo.length === 0 && cargandoRefuerzo ? (
              <div className="py-12 text-center">
                <LoaderCircle className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                <p className="mt-3 text-sm text-neutral-500">
                  Generando preguntas con IA...
                </p>
              </div>
            ) : (
              <div
                className={`space-y-4 transition-opacity duration-300 ${cargandoRefuerzo ? "opacity-40 pointer-events-none" : ""}`}
              >
                {preguntasRefuerzo.map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-500">
                        Pregunta {i + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => regenerarPregunta(i)}
                        disabled={regenerando !== null}
                        title="Regenerar esta pregunta"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${regenerando === i ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                    <textarea
                      value={p}
                      onChange={(e) => actualizarPregunta(i, e.target.value)}
                      className="w-full rounded-md border p-2 text-sm bg-background"
                      rows={2}
                    />
                  </div>
                ))}

                {preguntasRefuerzo.length > 0 && (
                  <div className="space-y-1 pt-4 border-t">
                    <Label className="text-xs text-neutral-500">
                      📝 Recomendación de estudio
                    </Label>
                    <textarea
                      value={recomendacion}
                      onChange={(e) => setRecomendacion(e.target.value)}
                      className="w-full rounded-md border p-2 text-sm bg-background"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={cancelarRefuerzo}
                disabled={guardandoRefuerzo}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={guardarRefuerzo}
                disabled={
                  guardandoRefuerzo ||
                  cargandoRefuerzo ||
                  preguntasRefuerzo.length === 0
                }
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-xs"
              >
                {guardandoRefuerzo && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar y enviar al estudiante
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Confirmar Refrescar */}
        <Dialog
          open={modalConfirmarRefrescar}
          onOpenChange={setModalConfirmarRefrescar}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary-light p-2">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle>¿Generar una nueva tanda?</DialogTitle>
                  <DialogDescription>
                    Se generarán 10 preguntas nuevas con IA.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  ⚠️ Se perderán las 10 preguntas actuales, incluidas las que
                  hayas editado.
                </p>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalConfirmarRefrescar(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={ejecutarRefrescar}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-xs"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Sí, generar nuevas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
