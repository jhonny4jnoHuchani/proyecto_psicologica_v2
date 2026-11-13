import React from "react";
import { BookOpen, FileText, Sparkles, CheckCircle2, ShieldCheck, Download } from "lucide-react";

interface BibliotecariaGuideCardProps {
  primaryColor?: string;
  secondaryColor?: string;
  totalLibros?: number;
}

export function BibliotecariaGuideCard({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  totalLibros = 0,
}: BibliotecariaGuideCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 mb-10"
      style={{
        boxShadow: `0 20px 45px -15px ${primaryColor}30, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      {/* Resplandor decorativo de fondo */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-25"
        style={{ background: secondaryColor }}
      />
      <div
        className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-3xl opacity-20"
        style={{ background: primaryColor }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* ILUSTRACIÓN / AVATAR DE LA BIBLIOTECARIA ACADÉMICA */}
        <div className="relative shrink-0">
          {/* Halo luminoso giratorio sutil */}
          <div
            className="absolute -inset-2 rounded-full opacity-60 blur-md animate-pulse"
            style={{
              background: `radial-gradient(circle, ${secondaryColor} 0%, ${primaryColor} 60%, transparent 80%)`,
            }}
          />

          <div
            className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-slate-950 p-2 shadow-2xl border-2"
            style={{
              borderColor: `${secondaryColor}80`,
            }}
          >
            {/* Arte vectorial exclusivo de la Bibliotecaria Académica */}
            <div className="relative flex flex-col items-center justify-center h-full w-full rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
              <span className="font-serif text-2xl text-slate-300 font-bold opacity-30 select-none absolute top-1">
                Ψ
              </span>
              <BookOpen className="h-9 w-9 sm:h-11 sm:w-11 drop-shadow-md" style={{ color: secondaryColor }} />
              <div
                className="absolute bottom-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-white shadow-xs"
                style={{ background: primaryColor }}
              >
                Guías PDF
              </div>
            </div>

            {/* Píldora de estado activo */}
            <span className="absolute bottom-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950" />
            </span>
          </div>
        </div>

        {/* MENSAJE DIRECTO Y ORIENTACIÓN PEDAGÓGICA */}
        <div className="flex-1 text-center lg:text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
            <Sparkles className="h-3.5 w-3.5" style={{ color: secondaryColor }} />
            <span>Orientación Bibliográfica Oficial · Psicología UPEA</span>
          </div>

          <h3 className="font-title text-xl sm:text-2xl font-extrabold text-white">
            Compendios Digitales y Guías de Lectura Abiertas
          </h3>

          <p className="text-sm leading-relaxed text-slate-300 max-w-3xl">
            Cada guía cuenta con un límite pedagógico de hasta <strong>5 páginas</strong> para una preparación ágil y
            estructurada. Selecciona cualquier documento para <strong>visualizarlo directamente en tu navegador</strong> o
            descárgalo gratis en formato <strong>PDF oficial</strong> para tus repasos.
          </p>

          {/* BADGES DE GARANTÍA ACADÉMICA */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sin límite de lecturas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
              <FileText className="h-3.5 w-3.5 text-rose-400" />
              <span>Formato PDF Oficial</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: secondaryColor }} />
              <span>{totalLibros} Guías Disponibles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

