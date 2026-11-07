import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Sparkles, Play, Pause } from "lucide-react";

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
 * Fondo panorámico con efecto "Ventana corrediza" (Ken Burns / Pan lento):
 * - Adapta automáticamente las imágenes según el modo Claro y Oscuro.
 * - Desliza suavemente la imagen hacia la izquierda/abajo para recorrer toda su longitud.
 * - Aplica una película translúcida institucional con los colores primario y secundario
 *   para garantizar perfecta legibilidad y contraste.
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

    // Escuchar evento personalizado de cambio de fondo
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

  const toggleImage = () => {
    if (isDark) {
      const next = (activeOscuroIdx + 1) % BANNER_FONDO_CONFIG.oscuro.length;
      setActiveOscuroIdx(next);
      localStorage.setItem("banner_fondo_oscuro_idx", String(next));
    } else {
      const next = (activeClaroIdx + 1) % BANNER_FONDO_CONFIG.claro.length;
      setActiveClaroIdx(next);
      localStorage.setItem("banner_fondo_claro_idx", String(next));
    }
  };

  const togglePan = () => {
    const next = !panEnabled;
    setPanEnabled(next);
    localStorage.setItem("banner_fondo_pan_enabled", String(next));
  };

  const isVertical = currentItem.panType === "vertical";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. CONTENEDOR DE LA IMAGEN CON DESLIZAMIENTO PANORÁMICO TIPO VENTANA */}
      <div
        className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ease-in-out`}
      >
        <div
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${
            panEnabled
              ? isVertical
                ? "animate-pan-window-v"
                : "animate-pan-window-h"
              : "scale-105"
          }`}
          style={{
            width: isVertical ? "105vw" : "135vw",
            height: isVertical ? "135vh" : "105vh",
            minWidth: isVertical ? "100%" : "135%",
            minHeight: isVertical ? "135%" : "100%",
            transformOrigin: "center center",
          }}
        >
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={currentItem.name}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isDark ? "opacity-85 brightness-90 contrast-110" : "opacity-85 brightness-100 contrast-105"
            }`}
            style={{
              filter: isDark
                ? "saturate(1.25) brightness(0.85)"
                : "saturate(1.15) brightness(1.0)",
            }}
          />
        </div>
      </div>

      {/* 2. ELEMENTOS GEOMÉTRICOS FLOTANTES / CAYENDO EN SEGUNDO PLANO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
        {/* Decorador 1: Arriba Izquierda */}
        <img
          src="/decoradores/circulo.png"
          alt=""
          className="absolute top-12 left-6 w-16 h-16 opacity-35 dark:opacity-25 animate-[floatGentle_10s_ease-in-out_infinite]"
        />
        {/* Decorador 2: Centro Derecha */}
        <img
          src="/decoradores/objeto.png"
          alt=""
          className="absolute top-1/3 right-10 w-14 h-14 opacity-30 dark:opacity-20 animate-[floatReverse_12s_ease-in-out_infinite]"
        />
        {/* Decorador 3: Abajo Izquierda */}
        <img
          src="/decoradores/decoradores2/objeto_puntueado.png"
          alt=""
          className="absolute bottom-24 left-16 w-20 h-20 opacity-35 dark:opacity-25 animate-[floatGentle_14s_ease-in-out_infinite]"
        />
        {/* Decorador 4: Centro Izquierda */}
        <img
          src="/decoradores/decoradores3/circulo_linea.png"
          alt=""
          className="absolute top-2/3 left-1/4 w-12 h-12 opacity-30 dark:opacity-20 animate-[floatReverse_9s_ease-in-out_infinite]"
        />
        {/* Decorador 5: Arriba Derecha */}
        <img
          src="/decoradores/redondo_punteuado5.png"
          alt=""
          className="absolute top-16 right-1/4 w-16 h-16 opacity-35 dark:opacity-25 animate-[floatGentle_11s_ease-in-out_infinite]"
        />
        {/* Decorador 6: Abajo Derecha */}
        <img
          src="/decoradores/cuadrado_punteado_rojo.png"
          alt=""
          className="absolute bottom-16 right-12 w-14 h-14 opacity-30 dark:opacity-20 animate-[floatReverse_13s_ease-in-out_infinite]"
        />
      </div>

      {/* 3. PELÍCULA DE MATIZ Y GRADIENTE INSTITUCIONAL (Sutil para no tapar el fondo) */}
      {isDark ? (
        <div
          className="absolute inset-0 transition-colors duration-700 pointer-events-none z-2"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(var(--primary-rgb, 79, 70, 229), 0.18) 0%, transparent 60%), linear-gradient(to bottom, rgba(5, 7, 14, 0.35) 0%, rgba(10, 15, 26, 0.50) 100%)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0 transition-colors duration-700 pointer-events-none z-2"
          style={{
            background:
              "radial-gradient(ellipse at 80% 10%, rgba(var(--secondary-rgb, 6, 182, 212), 0.14) 0%, transparent 60%), linear-gradient(to bottom, rgba(255, 255, 255, 0.20) 0%, rgba(248, 250, 252, 0.32) 100%)",
          }}
        />
      )}

      {/* 3. BOTÓN FLOTANTE DISCRETO PARA CONTROLAR / CAMBIAR FONDO */}
      <div className="pointer-events-auto fixed bottom-3 right-3 z-50 flex items-center gap-1.5 p-1 rounded-full bg-card/80 backdrop-blur-md border border-border/70 shadow-lg text-xs opacity-40 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={toggleImage}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-muted text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
          title={`Fondo actual: ${currentItem.name}. Haz clic para alternar imagen.`}
        >
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          <span>{currentItem.name.split(" ")[0]} ({currentIdx + 1}/{currentList.length})</span>
        </button>

        <button
          type="button"
          onClick={togglePan}
          className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={panEnabled ? "Pausar movimiento de ventana" : "Activar movimiento de ventana"}
        >
          {panEnabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

