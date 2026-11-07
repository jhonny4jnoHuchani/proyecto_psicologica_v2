import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  X,
  CheckCircle2,
  Sparkles,
  ArrowUpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadDropzoneProps {
  id?: string;
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  value?: File | File[] | FileList | null;
  onChange?: (files: FileList | null) => void;
  onFileChange?: (file: File | null) => void;
  onFilesChange?: (files: File[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  iconType?: "upload" | "excel" | "pdf" | "image";
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FileUploadDropzone({
  id,
  name,
  accept,
  multiple = false,
  maxSizeMB = 25,
  onChange,
  onFileChange,
  onFilesChange,
  label = "Arrastra y suelta aquí tu archivo",
  helperText,
  error,
  disabled = false,
  className,
  iconType = "upload",
}: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      setSelectedFiles([]);
      onChange?.(null);
      onFileChange?.(null);
      onFilesChange?.([]);
      return;
    }

    const filesArray = Array.from(fileList);
    setSelectedFiles(filesArray);
    onChange?.(fileList);
    onFileChange?.(filesArray[0] || null);
    onFilesChange?.(filesArray);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onFileChange?.(updated[0] || null);
    onFilesChange?.(updated);
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return <FileText className="h-5 w-5 text-rose-500 shrink-0" />;
    }
    if (["xlsx", "xls", "csv"].includes(ext || "")) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />;
    }
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
      return <ImageIcon className="h-5 w-5 text-cyan-500 shrink-0" />;
    }
    return <File className="h-5 w-5 text-primary shrink-0" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all duration-300 text-center cursor-pointer select-none",
          "bg-card/70 backdrop-blur-md hover:bg-card/90",
          isDragging
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.01]"
            : "border-border/80 hover:border-primary/60 hover:shadow-md",
          error && "border-rose-500/80 bg-rose-500/5",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        {/* Luces y auras decorativas detrás del icono */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />

        {/* CONTENIDO PRINCIPAL: ICONO CON MOVIMIENTO Y TEXTOS */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          {/* ICONO CON MOVIMIENTO FLOTANTE Y ANILLO PULSANTE */}
          <div className="relative flex items-center justify-center">
            {/* Anillo de pulso animado */}
            <div className="absolute w-16 h-16 rounded-full bg-primary/20 animate-upload-ring" />

            {/* Icono animado con flotación suave */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary/35 group-hover:shadow-primary/50 group-hover:scale-110 transition-all duration-300 animate-upload-float">
              {iconType === "excel" ? (
                <FileSpreadsheet className="h-7 w-7 text-white" />
              ) : iconType === "pdf" ? (
                <FileText className="h-7 w-7 text-white" />
              ) : iconType === "image" ? (
                <ImageIcon className="h-7 w-7 text-white" />
              ) : (
                <UploadCloud className="h-7 w-7 text-white" />
              )}
            </div>

            {/* Pequeño destello brillante flotante */}
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-300 animate-pulse pointer-events-none" />
          </div>

          {/* TEXTO Y LLAMADO A LA ACCIÓN */}
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {isDragging ? (
                <span className="text-primary font-bold">¡Suelta tu archivo aquí!</span>
              ) : (
                <>
                  <span>{label} o </span>
                  <span className="text-primary underline underline-offset-4 font-bold">
                    explora en tu equipo
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {helperText ||
                (accept
                  ? `Formatos aceptados: ${accept} (Máx. ${maxSizeMB}MB)`
                  : `Archivos permitidos hasta ${maxSizeMB}MB`)}
            </p>
          </div>
        </div>

        {/* LISTADO DE ARCHIVOS SELECCIONADOS */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/80 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {selectedFiles.length} archivo(s) listo(s)
              </span>
              <span className="text-[11px]">Haz clic para cambiar</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 border border-border shadow-xs text-xs group/item hover:border-primary/50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getFileIcon(file)}
                  <div className="min-w-0 max-w-[14rem]">
                    <p className="truncate font-medium text-foreground">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => removeFile(idx, e)}
                    className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                    title="Quitar archivo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-rose-500 pl-1">{error}</p>}
    </div>
  );
}

