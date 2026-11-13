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
  { id: "convocatorias", label: "Convocatorias Oficiales", shortLabel: "Convocatorias", icon: Megaphone },
  { id: "biblioteca", label: "Biblioteca Digital", shortLabel: "Biblioteca", icon: BookOpen },
  { id: "autoridades", label: "Autoridades Académicas", shortLabel: "Autoridades", icon: Users },
  { id: "portal-acceso", label: "Portal Académico", shortLabel: "Acceso", icon: Sparkles },
];

interface FloatingScrollIndexProps {
  primaryColor?: string;
  secondaryColor?: string;
  onNavigate?: (id: string) => void;
  headerThreshold?: number; // píxeles de scroll para mostrar el dock (cuando el header se pierde de vista)
}

export function FloatingScrollIndex({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  onNavigate,
  headerThreshold = 80,
}: FloatingScrollIndexProps) {
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isDockHovered, setIsDockHovered] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setScrollProgress(progress);

      // El dock se muestra ÚNICAMENTE cuando el header superior se pierde de vista
      setIsVisible(scrollY > headerThreshold);

      // Detección de la sección activa
      const sectionElements = WELCOME_SECTIONS.map((sec) => {
        const el = document.getElementById(sec.id);
        if (!el) return { id: sec.id, top: Infinity, bottom: -Infinity };
        const rect = el.getBoundingClientRect();
        return {
          id: sec.id,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

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

      if (progress > 94) {
        current = WELCOME_SECTIONS[WELCOME_SECTIONS.length - 1].id;
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headerThreshold]);

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

  const activeIndex = WELCOME_SECTIONS.findIndex((s) => s.id === activeSection);
  const currentSectionItem = WELCOME_SECTIONS[activeIndex] || WELCOME_SECTIONS[0];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DOCK VERTICAL COMPACTO Y ESTILIZADO (DESKTOP)                          */}
      {/* Oculto en el tope con opacity-0 pointer-events-none translate-x-10        */}
      {/* Aparece suavemente al hacer scroll: opacity-100 translate-x-0            */}
      {/* ========================================================================= */}
      <aside
        aria-label="Índice de Navegación Rápida"
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => {
          setIsDockHovered(false);
          setHoveredSection(null);
        }}
        className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end select-none transition-all duration-500 ease-out ${
          isVisible
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-12 pointer-events-none"
        }`}
      >
        <div
          className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.7)] transition-all duration-300"
          style={{
            boxShadow: `0 20px 40px -10px ${primaryColor}40, inset 0 1px 0 rgba(255,255,255,0.18)`,
          }}
        >
          {/* Header del dock: Porcentaje de avance circular / cápsula */}
          <div
            className="flex flex-col items-center justify-center pb-2 mb-1 border-b border-white/10 w-full"
            title={`Progreso en la página: ${Math.round(scrollProgress)}%`}
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
              <span className="text-[10px] font-mono font-bold text-white tracking-tighter">
                {Math.round(scrollProgress)}%
              </span>
            </div>
          </div>

          {/* Línea vertical de progreso sutil que acompaña las secciones */}
          <div className="relative flex flex-col items-center gap-1.5">
            {/* Riel vertical de fondo */}
            <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0.5 bg-white/10 rounded-full pointer-events-none" />

            {/* Línea vertical de progreso lleno con colores institucionales */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 rounded-full pointer-events-none transition-all duration-200"
              style={{
                height: `${Math.min(100, Math.max(0, (activeIndex / (WELCOME_SECTIONS.length - 1)) * 100))}%`,
                background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 0 8px ${secondaryColor}`,
              }}
            />

            {/* Botones de sección en el dock */}
            {WELCOME_SECTIONS.map((sec) => {
              const isActive = sec.id === activeSection;
              const isHovered = sec.id === hoveredSection;
              const IconComp = sec.icon;

              return (
                <div
                  key={sec.id}
                  className="relative flex items-center"
                  onMouseEnter={() => setHoveredSection(sec.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  {/* Tooltip / Píldora flotante hacia la izquierda */}
                  <AnimatePresence>
                    {(isHovered || (isActive && isDockHovered)) && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.92 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 6, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-full mr-3.5 pointer-events-none whitespace-nowrap z-50"
                      >
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-2xl border shadow-2xl text-left"
                          style={{
                            borderColor: isActive ? `${secondaryColor}90` : "rgba(255, 255, 255, 0.2)",
                            boxShadow: `0 10px 25px -5px ${isActive ? primaryColor : "rgba(0,0,0,0.6)"}60`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: isActive ? secondaryColor : "#ffffff",
                              boxShadow: isActive ? `0 0 8px ${secondaryColor}` : "none",
                            }}
                          />
                          <div className="flex flex-col">
                            {isActive && (
                              <span
                                className="text-[9px] font-bold uppercase tracking-wider font-mono leading-none"
                                style={{ color: secondaryColor }}
                              >
                                Te encuentras aquí
                              </span>
                            )}
                            <span className="text-xs font-bold text-white drop-shadow-sm">
                              {sec.label}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botón de Icono */}
                  <button
                    type="button"
                    onClick={() => handleItemClick(sec.id)}
                    aria-label={`Ir a ${sec.label}`}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "text-white shadow-lg scale-110"
                        : "text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105"
                    }`}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 0 16px -2px ${primaryColor}90, inset 0 1px 1px rgba(255,255,255,0.4)`,
                            border: `1px solid rgba(255, 255, 255, 0.35)`,
                          }
                        : undefined
                    }
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Botón volver arriba */}
          <button
            type="button"
            onClick={scrollToTop}
            title="Subir al inicio de la página"
            aria-label="Subir al inicio"
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/15 transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. PÍLDORA COMPACTA INFERIOR PARA MÓVILES (SOLO CUANDO HAY SCROLL)        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-40 select-none"
          >
            <div
              onClick={() => handleItemClick(activeSection)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white cursor-pointer active:scale-[0.98] transition-transform"
              style={{
                borderColor: `${secondaryColor}70`,
                boxShadow: `0 15px 35px -5px ${primaryColor}40`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full animate-ping"
                  style={{ backgroundColor: secondaryColor }}
                />
                <div className="text-left leading-tight">
                  <span
                    className="text-[9px] uppercase font-bold block font-mono tracking-wider"
                    style={{ color: secondaryColor }}
                  >
                    Te encuentras en
                  </span>
                  <span className="text-xs font-bold text-white">
                    {currentSectionItem.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                  {Math.round(scrollProgress)}%
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToTop();
                  }}
                  className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                  aria-label="Subir"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
