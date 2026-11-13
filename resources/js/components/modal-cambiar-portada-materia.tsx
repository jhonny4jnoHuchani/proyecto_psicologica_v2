import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadDropzone } from "@/components/ui/file-upload-dropzone";
import { BookOpen, Image as ImageIcon, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export interface MateriaParaPortada {
  id: number;
  pivotId: number;
  nombre: string;
  codigo: string;
  imagenActual?: string | null;
}

interface ModalCambiarPortadaMateriaProps {
  isOpen: boolean;
  onClose: () => void;
  materia: MateriaParaPortada | null;
}

export function ModalCambiarPortadaMateria({
  isOpen,
  onClose,
  materia,
}: ModalCambiarPortadaMateriaProps) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
    imagen: File | null;
  }>({
    imagen: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Limpiar y resetear al abrir o cerrar modal
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      reset();
      clearErrors();
    }
  }, [isOpen]);

  const handleFileChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setData("imagen", file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materia || !data.imagen) return;

    post(`/docente/curso-materia/${materia.pivotId}/imagen`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        onClose();
      },
    });
  };

  if (!materia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Personalizar Portada de Materia
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {materia.codigo} · {materia.nombre}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. Previsualización en Vivo de la Portada */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Vista previa en vivo</span>
              {previewUrl && (
                <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Nueva imagen seleccionada
                </span>
              )}
            </span>

            <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-border/80 group bg-muted transition-all duration-300 hover:border-primary/50 shadow-inner">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : materia.imagenActual ? (
                <img
                  src={`/storage/${materia.imagenActual}`}
                  alt={materia.nombre}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary, #4f46e5), var(--secondary, #06b6d4))",
                  }}
                >
                  <BookOpen className="h-10 w-10 text-white/80 mb-1" />
                  <span className="text-xs font-semibold text-white/90">
                    Portada predeterminada de la materia
                  </span>
                </div>
              )}

              {/* Overlay decorativo con datos de la materia */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 flex items-end justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-white/20 text-white backdrop-blur-md">
                    {materia.codigo}
                  </span>
                  <p className="text-xs font-bold text-white truncate max-w-[280px] drop-shadow-sm mt-0.5">
                    {materia.nombre}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                  {previewUrl ? "Nueva" : "Actual"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Componente de Subida Drag & Drop */}
          <div className="space-y-1">
            <FileUploadDropzone
              accept="image/jpeg,image/png,image/jpg,image/webp"
              maxSizeMB={2}
              iconType="image"
              label="Arrastra y suelta aquí tu nueva portada"
              helperText="Formatos: JPG, PNG o WebP (máximo 2MB)"
              onFileChange={handleFileChange}
              error={errors.imagen}
              className="hover:border-primary focus-within:border-primary transition-colors duration-200"
            />
            {errors.imagen && (
              <p className="text-xs font-medium text-red-500 pt-1">
                {errors.imagen}
              </p>
            )}
          </div>

          {/* 3. Acciones del Modal */}
          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!data.imagen || processing}
              className="rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary, #4f46e5), var(--secondary, #06b6d4))",
              }}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

