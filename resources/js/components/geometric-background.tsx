import React from "react";

/**
 * GeometricFallingBackground
 *
 * Fondo dinámico institucional con:
 * 1. Auras radiales de luz con degradado suave derivado de los colores institucionales (primario y secundario).
 * 2. Cascada de figuras geométricas (rombos, anillos, cruces, polígonos) que caen suavemente de arriba a abajo.
 * 3. Figuras flotantes estacionales con rotación y pulso sutil para otorgar profundidad y vida visual.
 * 4. Adaptabilidad total a modo claro (matiz suave no blanco plano) y modo oscuro (matiz profundo no azul plano).
 */
export function GeometricFallingBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {/* ========================================================================= */}
      {/* 0. PATRÓN DE PUNTOS SUTIL CON DESVANECIMIENTO EN LOS BORDES (MASK-IMAGE) */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(var(--primary) 1.25px, transparent 1.25px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 45%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 45%, transparent 85%)",
        }}
      />

      {/* ========================================================================= */}
      {/* 1. AURAS AMBIENTALES DE LUZ (Derivadas de color primario y secundario)   */}
      {/* ========================================================================= */}
      <div
        className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full blur-3xl opacity-35 dark:opacity-20 transition-all duration-700"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/4 -right-32 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30 dark:opacity-20 transition-all duration-700"
        style={{
          background:
            "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-10 left-1/4 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-25 dark:opacity-15 transition-all duration-700"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 75%)",
        }}
      />

      {/* ========================================================================= */}
      {/* 2. CASCADA DE FIGURAS GEOMÉTRICAS CAYENDO CONTINUAMENTE DE ARRIBA A ABAJO */}
      {/* ========================================================================= */}

      {/* Carril 1 (~4% izq): Rombo primario cayendo */}
      <div
        className="absolute -top-16 left-[4%] w-10 h-10 rounded-xl rotate-45 border-2 animate-fall-continuous"
        style={{
          borderColor: "var(--primary-border)",
          background: "linear-gradient(135deg, var(--primary-light), transparent)",
          animationDuration: "19s",
          animationDelay: "0s",
          ["--shape-op" as any]: "0.45",
        }}
      />

      {/* Carril 2 (~12% izq): Anillo punteado secundario cayendo */}
      <div
        className="absolute -top-20 left-[12%] w-14 h-14 rounded-full border-2 border-dashed animate-fall-continuous"
        style={{
          borderColor: "var(--secondary-border)",
          animationDuration: "24s",
          animationDelay: "4s",
          ["--shape-op" as any]: "0.38",
        }}
      />

      {/* Carril 3 (~22% izq): Cruz geométrica (+) cayendo */}
      <div
        className="absolute -top-12 left-[22%] w-7 h-7 animate-fall-continuous"
        style={{
          animationDuration: "17s",
          animationDelay: "8s",
          ["--shape-op" as any]: "0.4",
        }}
      >
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
        />
      </div>

      {/* Carril 4 (~34% centro-izq): Triángulo/Polígono estilizado */}
      <div
        className="absolute -top-16 left-[34%] w-12 h-12 rounded-2xl rotate-12 border animate-fall-continuous"
        style={{
          borderColor: "var(--secondary-border)",
          background: "linear-gradient(to bottom right, var(--secondary-light), transparent)",
          animationDuration: "22s",
          animationDelay: "2s",
          ["--shape-op" as any]: "0.42",
        }}
      />

      {/* Carril 5 (~48% centro): Rombo pequeño con relleno translúcido */}
      <div
        className="absolute -top-14 left-[48%] w-8 h-8 rounded-lg rotate-45 border animate-fall-continuous"
        style={{
          borderColor: "var(--primary-border)",
          background: "var(--primary-light)",
          animationDuration: "16s",
          animationDelay: "11s",
          ["--shape-op" as any]: "0.45",
        }}
      />

      {/* Carril 6 (~62% centro-der): Anillo doble primario */}
      <div
        className="absolute -top-20 left-[62%] w-16 h-16 rounded-full border-2 animate-fall-continuous"
        style={{
          borderColor: "var(--primary-border)",
          animationDuration: "26s",
          animationDelay: "6s",
          ["--shape-op" as any]: "0.35",
        }}
      />

      {/* Carril 7 (~74% der): Cruz (+) secundaria */}
      <div
        className="absolute -top-12 left-[74%] w-8 h-8 animate-fall-continuous"
        style={{
          animationDuration: "20s",
          animationDelay: "1s",
          ["--shape-op" as any]: "0.4",
        }}
      >
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full"
          style={{ backgroundColor: "var(--secondary)" }}
        />
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 rounded-full"
          style={{ backgroundColor: "var(--secondary)" }}
        />
      </div>

      {/* Carril 8 (~86% der): Rombo biselado secundario */}
      <div
        className="absolute -top-18 left-[86%] w-12 h-12 rounded-2xl rotate-45 border-2 animate-fall-continuous"
        style={{
          borderColor: "var(--secondary-border)",
          background: "linear-gradient(to top right, var(--secondary-light), transparent)",
          animationDuration: "21s",
          animationDelay: "9s",
          ["--shape-op" as any]: "0.42",
        }}
      />

      {/* Carril 9 (~94% der): Círculo suave con borde punteado */}
      <div
        className="absolute -top-16 left-[94%] w-11 h-11 rounded-full border border-dashed animate-fall-continuous"
        style={{
          borderColor: "var(--primary-border)",
          animationDuration: "25s",
          animationDelay: "13s",
          ["--shape-op" as any]: "0.38",
        }}
      />

      {/* ========================================================================= */}
      {/* 3. FIGURAS FLOTANTES DECORATIVAS ESTACIONARIAS (PROFUNDIDAD SUTIL)       */}
      {/* ========================================================================= */}

      {/* Rombo grande superior izquierdo */}
      <div
        className="absolute top-24 left-[7%] w-16 h-16 rounded-3xl rotate-45 border-2 animate-float-gentle opacity-40 shadow-xs"
        style={{
          borderColor: "var(--primary-border)",
          background: "linear-gradient(135deg, var(--primary-light), transparent)",
        }}
      />

      {/* Anillo superior derecho */}
      <div
        className="absolute top-28 right-[10%] w-20 h-20 rounded-full border-2 border-dashed animate-float-reverse opacity-35"
        style={{ borderColor: "var(--secondary-border)" }}
      />

      {/* Círculo pulsante medio */}
      <div
        className="absolute top-[48%] right-[5%] w-24 h-24 rounded-full border border-primary/20 animate-pulse-scale"
        style={{
          background: "radial-gradient(circle, var(--primary-light) 0%, transparent 70%)",
        }}
      />

      {/* Caja isométrica media izquierda */}
      <div
        className="absolute top-[55%] left-[3%] w-14 h-14 rounded-2xl rotate-12 border animate-float-gentle opacity-35"
        style={{
          borderColor: "var(--secondary-border)",
          background: "linear-gradient(to bottom right, var(--secondary-light), transparent)",
        }}
      />
    </div>
  );
}
