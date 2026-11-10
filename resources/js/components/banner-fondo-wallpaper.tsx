import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Play, Pause } from "lucide-react";

export interface BannerFondoItem {
  id: string;
  name: string;
  url: string;
  aspect: "landscape" | "portrait";
  panType: "horizontal" | "vertical";
  width: number;
  height: number;
}

export const BANNER_FONDO_CONFIG: {
  claro: BannerFondoItem[];
  oscuro: BannerFondoItem[];
} = {
  claro: [
    {
      id: "psico_claro1",
      name: "Engranajes de la Mente",
      url: "/decoradores/banner_fondo/claro/psico_claro1.webp",
      aspect: "landscape",
      panType: "horizontal",
      width: 540,
      height: 304,
    },
    {
      id: "psico_claro2",
      name: "Árbol Otoñal de Psicología",
      url: "/decoradores/banner_fondo/claro/psico_claro2.webp",
      aspect: "landscape",
      panType: "horizontal",
      width: 728,
      height: 410,
    },
  ],
  oscuro: [
    {
      id: "psico_oscuro1",
      name: "Bosque Estrellado Nocturno",
      url: "/decoradores/banner_fondo/oscuro/psico_oscuro1.webp",
      aspect: "landscape",
      panType: "horizontal",
      width: 3873,
      height: 2582,
    },
    {
      id: "psico_oscuro2",
      name: "Espiral Mística de Humo",
      url: "/decoradores/banner_fondo/oscuro/psico_oscuro2.webp",
      aspect: "portrait",
      panType: "vertical",
      width: 4160,
      height: 6240,
    },
  ],
};

/**
 * BannerFondoWallpaper
 *
 * Fondo panorámico exclusivo para el bloque del menú lateral (Sidebar):
 * - Aplica el efecto "Ventana corrediza" (pan lento) recortado exclusivamente dentro del sidebar.
 * - Respeta los modos Claro y Oscuro con sus respectivas imágenes institucionales.
 * - Incluye una película de vidrio esmerilado (frosted glass) translúcida que garantiza
 *   la perfecta legibilidad de los textos, botones e iconos del menú.
 */
export function BannerFondoWallpaper() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [activeClaroIdx, setActiveClaroIdx] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("banner_fondo_claro_idx");
      return saved ? parseInt(saved, 10) % BANNER_FONDO_CONFIG.claro.length : 0;
    }
    return 0;
  });

  const [activeOscuroIdx, setActiveOscuroIdx] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("banner_fondo_oscuro_idx");
      return saved ? parseInt(saved, 10) % BANNER_FONDO_CONFIG.oscuro.length : 0;
    }
    return 0;
  });

  const [panEnabled, setPanEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("banner_fondo_pan_enabled") !== "false";
    }
    return true;
  });

  // Detectar cambios en modo oscuro/claro
  useEffect(() => {
    if (typeof document === "undefined") return;

    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
          checkDark();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Escuchar evento personalizado de cambio de fondo o toggle
    const handleToggle = () => {
      if (document.documentElement.classList.contains("dark")) {
        setActiveOscuroIdx((prev) => {
          const next = (prev + 1) % BANNER_FONDO_CONFIG.oscuro.length;
          localStorage.setItem("banner_fondo_oscuro_idx", String(next));
          return next;
        });
      } else {
        setActiveClaroIdx((prev) => {
          const next = (prev + 1) % BANNER_FONDO_CONFIG.claro.length;
          localStorage.setItem("banner_fondo_claro_idx", String(next));
          return next;
        });
      }
    };

    window.addEventListener("toggle-banner-fondo", handleToggle);

    return () => {
      observer.disconnect();
      window.removeEventListener("toggle-banner-fondo", handleToggle);
    };
  }, []);

  const currentList = isDark ? BANNER_FONDO_CONFIG.oscuro : BANNER_FONDO_CONFIG.claro;
  const currentIdx = isDark ? activeOscuroIdx : activeClaroIdx;
  const currentItem = currentList[currentIdx] || currentList[0];
  const isVertical = currentItem.panType === "vertical";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 rounded-2xl"
    >
      {/* 1. CONTENEDOR DE LA IMAGEN CON DESLIZAMIENTO PANORÁMICO EXCLUSIVO DEL SIDEBAR */}
      <div className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-700 ease-in-out">
        <div
          className={`absolute top-0 left-0 h-full flex items-center ${
            panEnabled
              ? isVertical
                ? "animate-pan-window-v"
                : "animate-pan-window-h"
              : "scale-105"
          }`}
          style={{
            width: isVertical ? "120%" : "180%",
            height: isVertical ? "130%" : "100%",
            transformOrigin: "center center",
          }}
        >
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={currentItem.name}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isDark
                ? "opacity-95 brightness-95 contrast-110"
                : "opacity-100 brightness-100 contrast-105"
            }`}
          />
        </div>
      </div>

      {/* 2. CAPA TRANSLÚCIDA ULTRA LIGERA: PERMITE VER LA IMAGEN NÍTIDA */}
      {isDark ? (
        <div
          className="absolute inset-0 transition-colors duration-500 pointer-events-none z-1"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10, 15, 26, 0.38) 0%, rgba(15, 23, 42, 0.22) 50%, rgba(10, 15, 26, 0.44) 100%), radial-gradient(circle at 10% 10%, var(--primary-light, rgba(79, 70, 229, 0.08)) 0%, transparent 60%)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0 transition-colors duration-500 pointer-events-none z-1"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.20) 100%), radial-gradient(circle at 10% 10%, var(--primary-light, rgba(79, 70, 229, 0.05)) 0%, transparent 60%)",
          }}
        />
      )}
    </div>
  );
}

/**
 * BannerFondoButton
 *
 * Botón compacto estilo cápsula de vidrio para alternar el fondo del sidebar
 */
export function BannerFondoButton({ className = "" }: { className?: string }) {
  const triggerToggle = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-banner-fondo"));
    }
  };

  return (
    <button
      type="button"
      onClick={triggerToggle}
      className={`inline-flex items-center justify-center p-1.5 rounded-xl bg-white/70 hover:bg-white/95 dark:bg-slate-900/70 dark:hover:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-white/60 dark:border-white/15 shadow-xs transition-all active:scale-95 cursor-pointer ${className}`}
      title="Alternar arte fotográfico del menú"
      aria-label="Alternar imagen del fondo"
    >
      <ImageIcon className="h-4 w-4 text-primary" />
    </button>
  );
}
