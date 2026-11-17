import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LibroItem {
  id: number;
  hash_id?: string;
  nombre: string;
  autor?: string | null;
  anio_lanzamiento?: number | null;
  archivo?: string | null;
  archivo_url?: string | null;
  portada?: string | null;
  portada_url?: string | null;
  materia?: {
    id: number;
    nombre: string;
    codigo: string;
  } | null;
}

interface LibrosCarruselProps {
  libros: LibroItem[];
  primaryColor?: string;
  secondaryColor?: string;
  onAbrirPdf: (libro: LibroItem) => void;
  intervalMs?: number; // 2000 a 4000ms según lo solicitado
}

const DEFAULT_COVER = "/decoradores/LOGO/LOGO_PDF_MUESTRA.webp";

export function LibrosCarrusel({
  libros,
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  onAbrirPdf,
  intervalMs = 3500,
}: LibrosCarruselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(3);
  const touchStartX = useRef<number | null>(null);

  const total = libros.length;

  // Ajustar cantidad de tarjetas visibles según el ancho de pantalla (3 en Desktop, 2 en Tablet, 1 en Móvil)
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Máximo índice de desplazamiento
  const maxIndex = Math.max(0, total - visibleCount);

  // Autoplay continuo en bucle infinito cada 3.5s (2 a 4 segundos)
  useEffect(() => {
    if (total <= visibleCount || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // Regresa al inicio para bucle interminable
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [total, visibleCount, isPaused, maxIndex, intervalMs]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  // Helper para resolver la carátula o fallback a LOGO_PDF_MUESTRA.webp
  const obtenerCaratulaLibro = (libro: LibroItem): string => {
    if (imgErrors[libro.id]) return DEFAULT_COVER;
    if (libro.portada_url) return libro.portada_url;
    if (libro.portada) {
      const clean = libro.portada.replace(/^\/?storage\//, "").replace(/^\//, "");
      return `/storage/${clean}`;
    }
    return DEFAULT_COVER;
  };

  if (!libros || libros.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 py-16 text-center">
        <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-500" />
        <p className="font-medium text-slate-300">Las guías de estudio están siendo preparadas.</p>
        <p className="mt-1 text-xs text-slate-500">Próximamente se publicará el nuevo material bibliográfico.</p>
      </div>
    );
  }

  // Porcentaje de ancho por tarjeta según visibleCount
  const itemWidthPercent = 100 / visibleCount;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. CONTENEDOR PRINCIPAL CON MÁSCARA OVERFLOW */}
      <div
        className="overflow-hidden py-4 px-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-600 ease-out"
          style={{
            transform: `translateX(-${currentIndex * itemWidthPercent}%)`,
          }}
        >
          {libros.map((libro, idx) => {
            const coverSrc = obtenerCaratulaLibro(libro);

            return (
              <div
                key={`${libro.id}-${idx}`}
                className="shrink-0 px-3"
                style={{ width: `${itemWidthPercent}%` }}
              >
                <div
                  onClick={() => onAbrirPdf(libro)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onAbrirPdf(libro);
                    }
                  }}
                  className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-slate-900/85 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/10 cursor-pointer select-none"
                  style={{
                    boxShadow: `0 18px 45px -12px ${idx % 2 === 0 ? primaryColor : secondaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${secondaryColor}80`;
                    e.currentTarget.style.boxShadow = `0 22px 50px -10px ${primaryColor}45, inset 0 1px 0 rgba(255,255,255,0.2)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.boxShadow = `0 18px 45px -12px ${idx % 2 === 0 ? primaryColor : secondaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`;
                  }}
                >
                  {/* CABECERA VISUAL: PORTADA OFICIAL O MUESTRA CON MARGEN NÍTIDO */}
                  <div
                    className="relative flex h-60 sm:h-64 w-full items-center justify-center overflow-hidden border-b border-white/10 p-3 sm:p-4 bg-gradient-to-b from-slate-950/90 to-slate-900/90"
                  >
                    {/* Insignia clara de PDF */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold font-mono tracking-wider bg-rose-950/85 border border-rose-500/50 text-rose-300 shadow-lg backdrop-blur-md">
                        <FileText className="h-3 w-3 text-rose-400" />
                        PDF
                      </span>
                    </div>

                    {/* Insignia de lectura rápida */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="font-mono-tag inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/85 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 shadow-md backdrop-blur-md">
                        ≤ 5 Págs
                      </span>
                    </div>

                    {/* Overlay al hacer hover: Clic para leer PDF */}
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-2xl transition-transform duration-300 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        <BookOpen className="h-4 w-4" />
                        Leer PDF Completo
                      </span>
                    </div>

                    {/* IMAGEN DE PORTADA (REAL O LOGO_PDF_MUESTRA.webp) */}
                    <div className="relative h-full w-full flex items-center justify-center">
                      <img
                        src={coverSrc}
                        alt={libro.nombre}
                        onError={() => setImgErrors((prev) => ({ ...prev, [libro.id]: true }))}
                        className="h-full w-auto max-w-full max-h-56 object-contain rounded-xl shadow-xl transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* CUERPO INFORMATIVO Y ACCIONES */}
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <div className="mb-2.5 flex items-center gap-2">
                        <span
                          className="font-mono-tag rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase"
                          style={{
                            color: secondaryColor,
                            backgroundColor: `${secondaryColor}18`,
                            borderColor: `${secondaryColor}44`,
                            borderWidth: 1,
                          }}
                        >
                          {libro.materia?.codigo || "PSI"}
                        </span>
                        <span className="truncate text-xs text-slate-400 font-medium">
                          {libro.materia?.nombre || "Psicología General"}
                        </span>
                      </div>

                      <h3 className="font-title line-clamp-2 text-base font-extrabold text-white leading-snug group-hover:text-cyan-200 transition-colors">
                        {libro.nombre}
                      </h3>

                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <span>{libro.autor || "Carrera de Psicología UPEA"}</span>
                        {libro.anio_lanzamiento && <span>· {libro.anio_lanzamiento}</span>}
                      </p>
                    </div>

                    {/* BOTONES DE ACCIÓN: LEER PDF Y DESCARGAR */}
                    <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4">
                      {libro.archivo ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAbrirPdf(libro);
                            }}
                            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Leer Documento
                          </button>
                          <a
                            href={`/storage/${libro.archivo}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-xl bg-white/10 p-2.5 text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
                            title="Descargar archivo PDF"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </>
                      ) : (
                        <div className="flex w-full items-center justify-between py-1 text-xs text-slate-400 italic">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                            Lectura en digitalización
                          </span>
                          <span className="font-mono-tag text-[10px] text-slate-500">Pronto</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CONTROLES DE NAVEGACIÓN ANTERIOR / SIGUIENTE (FLECHAS FLOTANTES) */}
      {total > visibleCount && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-slate-950/85 text-white shadow-2xl backdrop-blur-xl transition-all hover:scale-110 hover:border-white/40 active:scale-95 cursor-pointer"
            style={{
              boxShadow: `0 10px 25px -5px ${primaryColor}50`,
            }}
            title="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-slate-950/85 text-white shadow-2xl backdrop-blur-xl transition-all hover:scale-110 hover:border-white/40 active:scale-95 cursor-pointer"
            style={{
              boxShadow: `0 10px 25px -5px ${secondaryColor}50`,
            }}
            title="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* 3. BOTONES INDICADORES INTERACTIVOS (PUNTOS / SLIDES) */}
      {total > visibleCount && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => {
            const isActive = i === currentIndex;

            return (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: isActive ? "32px" : "10px",
                  background: isActive
                    ? `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                    : "rgba(255, 255, 255, 0.2)",
                  boxShadow: isActive ? `0 0 12px ${secondaryColor}80` : "none",
                }}
                title={`Ir al grupo ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

