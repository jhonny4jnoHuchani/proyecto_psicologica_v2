import React, { useEffect, useState } from "react";
import {
  Compass,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Shield,
  Megaphone,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SectionIndexItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const WELCOME_SECTIONS: SectionIndexItem[] = [
  { id: "inicio", label: "Inicio / Portadas", shortLabel: "Inicio", icon: GraduationCap },
  { id: "explora", label: "Explora la Carrera", shortLabel: "Explora", icon: Compass },
  { id: "sobre-nosotros", label: "Misión & Visión", shortLabel: "Nosotros", icon: Shield },
  { id: "convocatorias", label: "Convocatorias", shortLabel: "Convocatorias", icon: Megaphone },
  { id: "biblioteca", label: "Biblioteca Digital", shortLabel: "Biblioteca", icon: BookOpen },
  { id: "autoridades", label: "Autoridades", shortLabel: "Autoridades", icon: Users },
  { id: "portal-acceso", label: "Portal Académico", shortLabel: "Acceso", icon: Sparkles },
];

interface FloatingScrollIndexProps {
  primaryColor?: string;
  secondaryColor?: string;
  onNavigate?: (id: string) => void;
}

export function FloatingScrollIndex({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  onNavigate,
}: FloatingScrollIndexProps) {
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setScrollProgress(progress);
      setIsScrolledPastHero(scrollY > 250);

      // Detección precisa de la sección actual ("Te encuentras aquí")
      const sectionElements = WELCOME_SECTIONS.map((sec) => {
        const el = document.getElementById(sec.id);
        if (!el) return { id: sec.id, top: Infinity, bottom: -Infinity };
        const rect = el.getBoundingClientRect();
        return {
          id: sec.id,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
        };
      });

      // El punto de vista se evalúa al 35% de la altura de la ventana
      const viewportTrigger = window.innerHeight * 0.35;
      let current = WELCOME_SECTIONS[0].id;

      for (const sec of sectionElements) {
        if (sec.top <= viewportTrigger && sec.bottom >= viewportTrigger) {
          current = sec.id;
          break;
        } else if (sec.top < viewportTrigger) {
          current = sec.id;
        }
      }

      // Si llegó casi al final, marcar la última sección
      if (progress > 93) {
        current = WELCOME_SECTIONS[WELCOME_SECTIONS.length - 1].id;
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleItemClick = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentSectionItem =
    WELCOME_SECTIONS.find((s) => s.id === activeSection) || WELCOME_SECTIONS[0];

  return (
    <>
      {/* 1. ÍNDICE LATERAL FLOTANTE FIJO AL COSTADO DERECHO */}
      <nav
        aria-label="Índice de Navegación de la Página"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2.5 select-none"
      >
        {/* Cápsula flotante contenedora del índice */}
        <div
          className="flex flex-col gap-2 p-2.5 rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
          style={{
            boxShadow: `0 20px 40px -15px ${primaryColor}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          {/* Cabecera del índice con mini barra de progreso circular */}
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-white/10">
            <span className="text-[10px] font-mono-tag font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full animate-ping"
                style={{ backgroundColor: secondaryColor }}
              />
              ÍNDICE
            </span>
            <span className="text-[10px] font-mono-tag font-bold text-slate-300">
              {Math.round(scrollProgress)}%
            </span>
          </div>

          {/* Listado de secciones con indicador de ubicación actual */}
          <div className="flex flex-col gap-1.5">
            {WELCOME_SECTIONS.map((sec, idx) => {
              const isActive = sec.id === activeSection;
              const IconComp = sec.icon;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleItemClick(sec.id)}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl transition-all duration-300 text-left cursor-pointer ${
                    isActive
                      ? "bg-white/15 text-white shadow-lg border border-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          borderColor: `${secondaryColor}80`,
                          boxShadow: `0 4px 15px -3px ${primaryColor}50`,
                        }
                      : undefined
                  }
                >
                  {/* Icono de la sección */}
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? "text-white shadow-md"
                        : "text-slate-400 group-hover:text-white group-hover:scale-110"
                    }`}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                          }
                        : undefined
                    }
                  >
                    <IconComp className="h-3.5 w-3.5" />
                  </div>

                  {/* Nombre de la sección (visible si está activa o en hover del índice) */}
                  <AnimatePresence>
                    {(isActive || isExpanded) && (
                      <motion.div
                        initial={{ opacity: 0, width: 0, x: 10 }}
                        animate={{ opacity: 1, width: "auto", x: 0 }}
                        exit={{ opacity: 0, width: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap pr-2"
                      >
                        <div className="flex flex-col">
                          {isActive && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider font-mono-tag leading-none mb-0.5"
                              style={{ color: secondaryColor }}
                            >
                              ● Te encuentras aquí
                            </span>
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              isActive ? "text-white font-bold" : "text-slate-300"
                            }`}
                          >
                            {sec.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Punto indicador minimalista para cuando está contraído */}
                  {!isActive && !isExpanded && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white/25 group-hover:bg-white transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Botón flotante para regresar arriba */}
          {isScrolledPastHero && (
            <button
              type="button"
              onClick={scrollToTop}
              title="Volver al inicio"
              className="mt-1 flex items-center justify-center py-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[11px] font-medium gap-1"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              {isExpanded && <span>Subir</span>}
            </button>
          )}
        </div>
      </nav>

      {/* 2. BARRA DE UBICACIÓN MÓVIL (COMPACTA INFERIOR) */}
      <AnimatePresence>
        {isScrolledPastHero && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="md:hidden fixed bottom-5 left-4 right-18 z-40 select-none"
          >
            <div
              onClick={() => handleItemClick(activeSection)}
              className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/20 shadow-2xl text-white cursor-pointer"
              style={{
                borderColor: `${secondaryColor}60`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full animate-ping"
                  style={{ backgroundColor: secondaryColor }}
                />
                <div className="text-left leading-tight">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono-tag">
                    Sección Actual
                  </span>
                  <span className="text-xs font-bold text-white">
                    {currentSectionItem.label}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono-tag font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                {Math.round(scrollProgress)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

