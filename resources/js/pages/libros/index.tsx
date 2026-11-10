import { Head, router } from "@inertiajs/react";
import {
  Archive,
  BookOpen,
  Calendar,
  Eye,
  FileText,
  Filter,
  LayoutGrid,
  Library,
  List,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { FormEventHandler, useMemo, useState } from "react";

import InputError from "@/components/input-error";
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
import { FileUploadDropzone } from "@/components/ui/file-upload-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

// ======================== TIPOS ========================
interface MateriaOption {
  id: number;
  nombre: string;
  codigo: string;
}

interface Libro {
  id: number;
  nombre: string;
  autor: string | null;
  anio_lanzamiento: number | null;
  archivo: string | null;
  portada: string | null;
  materia: MateriaOption;
}

interface Filtros {
  materia_id: number | null;
}

interface Props {
  libros: Libro[];
  materias: MateriaOption[];
  filtros: Filtros;
}

//formularios(son los qie se van a mandar al controlador para llenar datos en la base datos)
type LibroForm = {
  materia_id: string;
  nombre: string;
  autor: string;
  anio_lanzamiento: string;
  [key: string]: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: "Libros", href: "/libros" }];

// como va iniciar???
const initialForm: LibroForm = {
  materia_id: "",
  nombre: "",
  autor: "",
  anio_lanzamiento: "",
};

const MATERIA_COLORS = [
  {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-200",
    dot: "bg-teal-500",
  },
  {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
  },
];

function colorForMateria(codigo?: string) {
  if (!codigo) return MATERIA_COLORS[0];
  let hash = 0;
  for (let i = 0; i < codigo.length; i++)
    hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
  return MATERIA_COLORS[Math.abs(hash) % MATERIA_COLORS.length];
}

export default function LibrosIndex({ libros, materias, filtros }: Props) {
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [libroSelect, setLibroSelect] = useState<Libro | null>(null);

  const [form, setForm] = useState<LibroForm>(initialForm);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [portada, setPortada] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const [vistaModo, setVistaModo] = useState<"grid" | "table">("grid");
  const [busqueda, setBusqueda] = useState("");

  const resetForm = () => {
    setForm(initialForm);
    setArchivo(null);
    setPortada(null);
    setErrors({});
  };

  const librosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return libros || [];
    const q = busqueda.toLowerCase();
    return (libros || []).filter(
      (l) =>
        l.nombre.toLowerCase().includes(q) ||
        (l.autor && l.autor.toLowerCase().includes(q)) ||
        (l.materia?.nombre && l.materia.nombre.toLowerCase().includes(q)) ||
        (l.materia?.codigo && l.materia.codigo.toLowerCase().includes(q)),
    );
  }, [libros, busqueda]);

  const openCreate = () => {
    resetForm();
    setForm({ ...initialForm, materia_id: "" });
    setModalCreate(true);
  };

  const openEdit = (libro: Libro) => {
    setLibroSelect(libro);
    setForm({
      materia_id: String(libro.materia?.id || ""),
      nombre: libro.nombre,
      autor: libro.autor || "",
      anio_lanzamiento: libro.anio_lanzamiento
        ? String(libro.anio_lanzamiento)
        : "",
    });
    setArchivo(null);
    setPortada(null);
    setErrors({});
    setModalEdit(true);
  };

  const openDelete = (libro: Libro) => {
    setLibroSelect(libro);
    setModalDelete(true);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("materia_id", form.materia_id);
    formData.append("nombre", form.nombre);
    formData.append("autor", form.autor || "");
    formData.append("anio_lanzamiento", form.anio_lanzamiento || "");
    if (archivo) formData.append("archivo", archivo);
    if (portada) formData.append("portada", portada);
    return formData;
  };

  const handleCreate: FormEventHandler = (e) => {
    e.preventDefault();
    setProcessing(true);
    router.post("/libros", buildFormData(), {
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
    if (!libroSelect) return;
    setProcessing(true);
    router.put(`/libros/${libroSelect.id}`, buildFormData(), {
      onSuccess: () => {
        setModalEdit(false);
        setLibroSelect(null);
        resetForm();
        setProcessing(false);
      },
      onError: (err) => {
        setErrors(err);
        setProcessing(false);
      },
    });
  };

  const handleDelete = () => {
    if (!libroSelect) return;
    router.delete(`/libros/${libroSelect.id}`, {
      onSuccess: () => {
        setModalDelete(false);
        setLibroSelect(null);
      },
    });
  };

  const stats = useMemo(() => {
    const total = libros?.length ?? 0;
    const materiasUnicas = new Set(libros?.map((l) => l.materia?.id)).size;
    return { total, materias: materiasUnicas };
  }, [libros]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Libros" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <PageHeaderBanner
          title="Biblioteca y Recursos Bibliográficos"
          subtitle="Catálogo digital de libros, guías de estudio, textos oficiales y material de apoyo por materia."
          icon={Library}
          badgeText="BIBLIOTECA VIRTUAL"
          stats={[
            { label: "Libros", value: stats.total },
            { label: "Materias", value: stats.materias },
          ]}
          actions={
            <>
              <a href="/libros/eliminados">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md rounded-xl transition-all"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Papelera
                </Button>
              </a>
              <Button
                onClick={openCreate}
                className="bg-white text-slate-950 hover:bg-white/90 font-bold shadow-lg rounded-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Libro
              </Button>
            </>
          }
        />

        {/* BARRA DE BÚSQUEDA Y CONTROL DE VISTA */}
        <div className="bg-card/80 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por título, autor o materia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs focus:ring-primary"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {librosFiltrados.length} {librosFiltrados.length === 1 ? "libro disponible" : "libros disponibles"}
            </span>

            <div className="flex rounded-xl bg-muted/60 p-1 border border-border/70">
              <button
                type="button"
                onClick={() => setVistaModo("grid")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  vistaModo === "grid"
                    ? "bg-card shadow-xs text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Galería</span>
              </button>
              <button
                type="button"
                onClick={() => setVistaModo("table")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  vistaModo === "table"
                    ? "bg-card shadow-xs text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: GALERÍA DE PORTADAS O TABLA */}
        {librosFiltrados.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-md rounded-3xl p-12 text-center border border-dashed border-border flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-7 w-7" />
            </div>
            <h4 className="font-bold text-base text-foreground">No se encontraron libros</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {busqueda
                ? "No hay resultados para tu búsqueda. Intenta con otro término."
                : 'Todavía no hay libros registrados. Agrega el primero con el botón "Nuevo Libro".'}
            </p>
          </div>
        ) : vistaModo === "grid" ? (
          /* MODO GALERÍA / BOOKSHELF MODERNO */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {librosFiltrados.map((l) => {
              const color = colorForMateria(l.materia?.codigo);
              return (
                <div
                  key={l.id}
                  className="group bg-card/90 backdrop-blur-md rounded-3xl border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* PORTADA DEL LIBRO */}
                    <div className="relative h-60 w-full bg-gradient-to-br from-primary/10 via-muted to-secondary/10 flex items-center justify-center overflow-hidden border-b border-border/70">
                      {l.portada ? (
                        <img
                          src={`/storage/${l.portada}`}
                          alt={l.nombre}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/60 p-4 text-center">
                          <BookOpen className="h-16 w-16 opacity-50" />
                          <span className="text-[11px] font-medium uppercase tracking-wider">Sin portada</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${color.bg} ${color.text} border border-border/50 backdrop-blur-md`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                          {l.materia?.codigo}
                        </span>
                      </div>
                      {l.anio_lanzamiento && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                          {l.anio_lanzamiento}
                        </div>
                      )}
                    </div>

                    {/* METADATOS DEL LIBRO */}
                    <div className="p-5 space-y-2.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                        {l.materia?.nombre}
                      </p>
                      <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {l.nombre}
                      </h4>
                      {l.autor && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span className="truncate">{l.autor}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACCIONES DEL LIBRO (CON DESCRIPCIÓN VISIBLE) */}
                  <div className="p-4 pt-0 border-t border-border/70 mt-3 pt-3 flex items-center gap-1.5">
                    <a href={`/libros/${l.id}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs gap-1.5 rounded-xl border-border/80 hover:border-primary/40 text-foreground hover:text-primary"
                        title="Ver detalle del libro"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Ver</span>
                      </Button>
                    </a>
                    {l.archivo && (
                      <a
                        href={`/storage/${l.archivo}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver o descargar PDF"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1.5 rounded-xl border-border/80 hover:border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5 rounded-xl border-border/80 hover:border-primary/40 text-foreground hover:text-primary"
                      onClick={() => openEdit(l)}
                      title="Editar libro"
                    >
                      <Pencil className="h-3.5 w-3.5 text-amber-500" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5 rounded-xl border-border/80 hover:border-rose-400 text-muted-foreground hover:text-rose-500"
                      onClick={() => openDelete(l)}
                      title="Eliminar libro"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MODO TABLA DETALLADA */
          <Card className="shadow-sm border border-border/80 rounded-3xl overflow-hidden bg-card/90 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/80 bg-gradient-to-r from-primary/[0.04] to-transparent px-6 py-4">
              <CardTitle className="text-base font-bold text-foreground">Catálogo de Libros</CardTitle>
              <span className="text-xs text-muted-foreground">
                {librosFiltrados.length} resultado(s)
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-3.5 font-bold">Libro</th>
                      <th className="px-6 py-3.5 font-bold">Materia</th>
                      <th className="px-6 py-3.5 font-bold">Autor</th>
                      <th className="px-6 py-3.5 font-bold">Año</th>
                      <th className="px-6 py-3.5 text-right font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {librosFiltrados.map((l) => {
                      const color = colorForMateria(l.materia?.codigo);
                      return (
                        <tr
                          key={l.id}
                          className="group border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {l.portada ? (
                                <img
                                  src={`/storage/${l.portada}`}
                                  alt={l.nombre}
                                  className="h-14 w-11 object-cover rounded-lg shadow-xs"
                                />
                              ) : (
                                <div className="h-14 w-11 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                  <BookOpen className="h-5 w-5 opacity-60" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-sm text-foreground leading-tight">
                                  {l.nombre}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${color.bg} ${color.text} border border-border/50`}
                            >
                              {l.materia?.codigo}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {l.materia?.nombre}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground font-medium">
                            {l.autor || <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground font-medium">
                            {l.anio_lanzamiento || <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              <a href={`/libros/${l.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-primary/40 text-foreground hover:text-primary"
                                  title="Ver detalle del libro"
                                >
                                  <Eye className="h-3.5 w-3.5 text-primary" />
                                  <span>Ver</span>
                                </Button>
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-primary/40 text-foreground hover:text-primary"
                                onClick={() => openEdit(l)}
                                title="Editar libro"
                              >
                                <Pencil className="h-3.5 w-3.5 text-amber-500" />
                                <span>Editar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-border/80 hover:border-rose-400 text-muted-foreground hover:text-rose-500"
                                onClick={() => openDelete(l)}
                                title="Eliminar libro"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                <span>Eliminar</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Crear */}
        <Dialog open={modalCreate} onOpenChange={setModalCreate}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo libro</DialogTitle>
              <DialogDescription>
                Completa los datos para agregar un nuevo libro al sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Materia *</Label>
                  <Select
                    value={form.materia_id}
                    onValueChange={(v) => setForm({ ...form, materia_id: v })}
                  >
                    <SelectTrigger>
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
                  <InputError message={errors.materia_id} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nombre del libro *</Label>
                    <Input
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      placeholder="Ej: Introducción a la Psicología"
                      required
                    />
                    <InputError message={errors.nombre} />
                  </div>
                  <div className="space-y-1">
                    <Label>Autor</Label>
                    <Input
                      value={form.autor}
                      onChange={(e) =>
                        setForm({ ...form, autor: e.target.value })
                      }
                      placeholder="Ej: Sigmund Freud"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Año de lanzamiento</Label>
                  <Input
                    type="number"
                    value={form.anio_lanzamiento}
                    onChange={(e) =>
                      setForm({ ...form, anio_lanzamiento: e.target.value })
                    }
                    placeholder="Ej: 2020"
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label>Archivo Digital (PDF)</Label>
                    <FileUploadDropzone
                      iconType="pdf"
                      accept="application/pdf"
                      onFileChange={(f) => setArchivo(f)}
                      label="Arrastra el documento PDF"
                      helperText="Libro completo en formato PDF"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Portada del Libro (Imagen)</Label>
                    <FileUploadDropzone
                      iconType="image"
                      accept="image/*"
                      onFileChange={(f) => setPortada(f)}
                      label="Arrastra la portada"
                      helperText="JPG, PNG o WebP de la cubierta"
                    />
                  </div>
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
                  Guardar libro
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Editar */}
        <Dialog open={modalEdit} onOpenChange={setModalEdit}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar libro</DialogTitle>
              <DialogDescription>
                Actualiza los datos de "{libroSelect?.nombre}".
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Materia *</Label>
                  <Select
                    value={form.materia_id}
                    onValueChange={(v) => setForm({ ...form, materia_id: v })}
                  >
                    <SelectTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nombre del libro *</Label>
                    <Input
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      placeholder="Ej: Introducción a la Psicología"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Autor</Label>
                    <Input
                      value={form.autor}
                      onChange={(e) =>
                        setForm({ ...form, autor: e.target.value })
                      }
                      placeholder="Ej: Sigmund Freud"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Año de lanzamiento</Label>
                  <Input
                    type="number"
                    value={form.anio_lanzamiento}
                    onChange={(e) =>
                      setForm({ ...form, anio_lanzamiento: e.target.value })
                    }
                    placeholder="Ej: 2020"
                    min="1900"
                    max="2100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label>Reemplazar Archivo PDF (opcional)</Label>
                    <FileUploadDropzone
                      iconType="pdf"
                      accept="application/pdf"
                      onFileChange={(f) => setArchivo(f)}
                      label="Subir nuevo documento PDF"
                      helperText="Opcional: Sube un nuevo archivo para sustituir el actual"
                    />
                    {libroSelect?.archivo && (
                      <p className="text-xs text-neutral-500">
                        PDF actual: {libroSelect.archivo}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reemplazar Portada (opcional)</Label>
                    <FileUploadDropzone
                      iconType="image"
                      accept="image/*"
                      onFileChange={(f) => setPortada(f)}
                      label="Subir nueva portada"
                      helperText="Opcional: Sube una nueva imagen para la cubierta"
                    />
                    {libroSelect?.portada && (
                      <img
                        src={`/storage/${libroSelect.portada}`}
                        alt="Portada actual"
                        className="h-12 rounded mt-1"
                      />
                    )}
                  </div>
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

        {/* Modal Eliminar */}
        <Dialog open={modalDelete} onOpenChange={setModalDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar libro</DialogTitle>
              <DialogDescription>
                Esta acción marcará el libro como eliminado. ¿Eliminar "
                {libroSelect?.nombre}"?
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
      </div>
    </AppLayout>
  );
}
