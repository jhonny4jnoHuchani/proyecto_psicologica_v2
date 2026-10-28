import { Head, Link, router } from "@inertiajs/react";
import {
  Archive,
  BookOpen,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { FormEventHandler, useState } from "react";

import InputError from "@/components/input-error";
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
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface Tema {
  id: number;
  materia_id: number;
  nombre: string;
  orden: number;
  resumen: string | null;
  paginas_libro: string | null;
  estado: "programado" | "visto" | "omitido" | "pospuesto";
}

interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  created_at: string;
  deleted_at: string | null;
  temas?: Tema[];
}

interface Props {
  materias: Materia[];
}

type MateriaForm = {
  nombre: string;
  codigo: string;
  [key: string]: string;
};

type TemaForm = {
  materia_id: number;
  nombre: string;
  orden: string;
  paginas_libro: string;
  resumen: string;
  estado: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Materias", href: "/materias" },
];

const initialForm: MateriaForm = { nombre: "", codigo: "" };

const initialTemaForm: TemaForm = {
  materia_id: 0,
  nombre: "",
  orden: "",
  paginas_libro: "",
  resumen: "",
  estado: "programado",
};

export default function MateriasIndex({ materias }: Props) {
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [materiaSelect, setMateriaSelect] = useState<Materia | null>(null);

  // Modal Temario
  const [modalTemas, setModalTemas] = useState(false);
  const [temaForm, setTemaForm] = useState<TemaForm>(initialTemaForm);
  const [editingTemaId, setEditingTemaId] = useState<number | null>(null);
  const [temaErrors, setTemaErrors] = useState<Record<string, string>>({});
  const [processingTema, setProcessingTema] = useState(false);

  const [form, setForm] = useState<MateriaForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setModalCreate(true);
  };

  const openEdit = (materia: Materia) => {
    setMateriaSelect(materia);
    setForm({ nombre: materia.nombre, codigo: materia.codigo });
    setErrors({});
    setModalEdit(true);
  };

  const openDelete = (materia: Materia) => {
    setMateriaSelect(materia);
    setModalDelete(true);
  };

  // Abrir modal de Temario para una materia
  const openTemasModal = (materia: Materia) => {
    setMateriaSelect(materia);
    const temasActuales = materia.temas || [];
    const maxOrden =
      temasActuales.length > 0
        ? Math.max(...temasActuales.map((t) => t.orden))
        : 0;
    setTemaForm({
      ...initialTemaForm,
      materia_id: materia.id,
      orden: String(maxOrden + 1),
    });
    setEditingTemaId(null);
    setTemaErrors({});
    setModalTemas(true);
  };

  const startEditTema = (tema: Tema) => {
    setEditingTemaId(tema.id);
    setTemaForm({
      materia_id: tema.materia_id,
      nombre: tema.nombre,
      orden: String(tema.orden),
      paginas_libro: tema.paginas_libro || "",
      resumen: tema.resumen || "",
      estado: tema.estado || "programado",
    });
    setTemaErrors({});
  };

  const cancelEditTema = () => {
    setEditingTemaId(null);
    if (materiaSelect) {
      const temasActuales = materiaSelect.temas || [];
      const maxOrden =
        temasActuales.length > 0
          ? Math.max(...temasActuales.map((t) => t.orden))
          : 0;
      setTemaForm({
        ...initialTemaForm,
        materia_id: materiaSelect.id,
        orden: String(maxOrden + 1),
      });
    }
    setTemaErrors({});
  };

  const handleCreate: FormEventHandler = (e) => {
    e.preventDefault();
    setProcessing(true);
    router.post("/materias", form, {
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
    if (!materiaSelect) return;
    setProcessing(true);
    router.put(`/materias/${materiaSelect.id}`, form, {
      onSuccess: () => {
        setModalEdit(false);
        setMateriaSelect(null);
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
    if (!materiaSelect) return;
    router.delete(`/materias/${materiaSelect.id}`, {
      onSuccess: () => {
        setModalDelete(false);
        setMateriaSelect(null);
      },
    });
  };

  // Guardar o Actualizar Tema
  const handleSaveTema: FormEventHandler = (e) => {
    e.preventDefault();
    if (!materiaSelect) return;

    setProcessingTema(true);
    if (editingTemaId) {
      router.put(`/temas/${editingTemaId}`, temaForm, {
        onSuccess: () => {
          cancelEditTema();
          setProcessingTema(false);
        },
        onError: (err) => {
          setTemaErrors(err);
          setProcessingTema(false);
        },
      });
    } else {
      router.post("/temas", temaForm, {
        onSuccess: () => {
          cancelEditTema();
          setProcessingTema(false);
        },
        onError: (err) => {
          setTemaErrors(err);
          setProcessingTema(false);
        },
      });
    }
  };

  const handleDeleteTema = (temaId: number) => {
    if (confirm("¿Estás seguro de eliminar este tema del temario?")) {
      router.delete(`/temas/${temaId}`);
    }
  };

  // Materia seleccionada con sus temas en tiempo real
  const currentMateria =
    materias.find((m) => m.id === materiaSelect?.id) || materiaSelect;
  const temasDeMateria = currentMateria?.temas || [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Materias" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Materias y Temarios</h1>
            <p className="text-sm text-neutral-500">
              Administra las materias y los temas oficiales asignados a cada
              una.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/materias/eliminados">
                <Archive className="h-4 w-4 mr-2" />
                Ver Eliminadas
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Materias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-medium">Código</th>
                    <th className="py-3 px-4 font-medium">
                      Nombre de la Materia
                    </th>
                    <th className="py-3 px-4 font-medium">Temario Oficial</th>
                    <th className="py-3 px-4 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(!materias || materias.length === 0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-neutral-500"
                      >
                        No hay materias registradas
                      </td>
                    </tr>
                  )}
                  {materias?.map((materia) => {
                    const cantTemas = materia.temas?.length || 0;
                    return (
                      <tr
                        key={materia.id}
                        className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">
                          <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs">
                            {materia.codigo}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                          {materia.nombre}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTemasModal(materia)}
                            className="h-8 gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Temario</span>
                            <Badge
                              variant="secondary"
                              className="ml-1 text-[10px] px-1.5 py-0 font-semibold"
                            >
                              {cantTemas}
                            </Badge>
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEdit(materia)}
                              title="Editar materia"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDelete(materia)}
                              title="Eliminar materia"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* MODAL GESTIÓN DE TEMARIO */}
        <Dialog open={modalTemas} onOpenChange={setModalTemas}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Temario de {currentMateria?.codigo} - {currentMateria?.nombre}
              </DialogTitle>
              <DialogDescription>
                Administra los temas asignados a esta materia. Servirán para
                agrupar las lecciones y guiar el avance pedagógico.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-2">
              {/* Formulario para agregar / editar tema */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    {editingTemaId
                      ? "✏️ Modificar Tema"
                      : "➕ Nuevo Tema para la Materia"}
                  </h4>
                  {editingTemaId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditTema}
                      className="h-7 text-xs"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Cancelar edición
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSaveTema} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1 space-y-1">
                      <Label htmlFor="tema_orden" className="text-xs">
                        N° Orden *
                      </Label>
                      <Input
                        id="tema_orden"
                        type="number"
                        min="1"
                        value={temaForm.orden}
                        onChange={(e) =>
                          setTemaForm({ ...temaForm, orden: e.target.value })
                        }
                        required
                        className="h-8 text-xs"
                        placeholder="1, 2, 3..."
                      />
                      <InputError message={temaErrors.orden} />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <Label htmlFor="tema_nombre" className="text-xs">
                        Nombre del Tema *
                      </Label>
                      <Input
                        id="tema_nombre"
                        value={temaForm.nombre}
                        onChange={(e) =>
                          setTemaForm({ ...temaForm, nombre: e.target.value })
                        }
                        required
                        className="h-8 text-xs"
                        placeholder="Ej: Tema 1: Qué es la Psicología"
                      />
                      <InputError message={temaErrors.nombre} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="tema_paginas" className="text-xs">
                        Páginas de Referencia (Libro)
                      </Label>
                      <Input
                        id="tema_paginas"
                        value={temaForm.paginas_libro}
                        onChange={(e) =>
                          setTemaForm({
                            ...temaForm,
                            paginas_libro: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                        placeholder="Ej: pág. 5-18"
                      />
                      <InputError message={temaErrors.paginas_libro} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="tema_estado" className="text-xs">
                        Estado inicial
                      </Label>
                      <select
                        id="tema_estado"
                        value={temaForm.estado}
                        onChange={(e) =>
                          setTemaForm({ ...temaForm, estado: e.target.value })
                        }
                        className="w-full h-8 rounded-md border text-xs px-2 bg-background"
                      >
                        <option value="programado">Programado</option>
                        <option value="visto">Visto</option>
                        <option value="pospuesto">Pospuesto</option>
                        <option value="omitido">Omitido</option>
                      </select>
                      <InputError message={temaErrors.estado} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="tema_resumen" className="text-xs">
                      Resumen o sinopsis del tema
                    </Label>
                    <textarea
                      id="tema_resumen"
                      value={temaForm.resumen}
                      onChange={(e) =>
                        setTemaForm({ ...temaForm, resumen: e.target.value })
                      }
                      className="w-full rounded-md border p-2 text-xs bg-background"
                      rows={2}
                      placeholder="Breve descripción de los conceptos clave abordados en este tema..."
                    />
                    <InputError message={temaErrors.resumen} />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={processingTema}
                      className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
                    >
                      {processingTema && (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      )}
                      {editingTemaId ? "Actualizar Tema" : "Añadir al Temario"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Lista de temas actuales */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Temas registrados ({temasDeMateria.length})
                </h4>

                {temasDeMateria.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg text-xs text-neutral-400">
                    Esta materia aún no tiene temas asignados. Agrega el primero
                    usando el formulario de arriba.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {temasDeMateria.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between border rounded-lg p-3 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono shrink-0"
                            >
                              #{t.orden}
                            </Badge>
                            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                              {t.nombre}
                            </span>
                            {t.paginas_libro && (
                              <span className="text-[11px] text-neutral-500 shrink-0">
                                📖 {t.paginas_libro}
                              </span>
                            )}
                          </div>
                          {t.resumen && (
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                              {t.resumen}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEditTema(t)}
                            title="Editar tema"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteTema(t.id)}
                            title="Eliminar tema"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalTemas(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Crear Materia */}
        <Dialog open={modalCreate} onOpenChange={setModalCreate}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Materia</DialogTitle>
              <DialogDescription>
                Completa los datos de la materia.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  required
                  placeholder="PSI-101"
                />
                <InputError message={errors.codigo} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  placeholder="Psicología Cognitiva"
                />
                <InputError message={errors.nombre} />
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
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Materia */}
        <Dialog open={modalEdit} onOpenChange={setModalEdit}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Materia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="edit-codigo">Código *</Label>
                <Input
                  id="edit-codigo"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  required
                />
                <InputError message={errors.codigo} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-nombre">Nombre *</Label>
                <Input
                  id="edit-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
                <InputError message={errors.nombre} />
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
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Actualizar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Eliminar Materia */}
        <Dialog open={modalDelete} onOpenChange={setModalDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Desactivación</DialogTitle>
              <DialogDescription>
                ¿Desactivar la materia "{materiaSelect?.nombre}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalDelete(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Desactivar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
