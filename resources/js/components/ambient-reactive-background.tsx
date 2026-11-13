import React, { useEffect, useRef } from "react";

interface AmbientReactiveBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  density?: "low" | "medium" | "high";
  className?: string;
}

interface StarParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  vy: number;
  color: string;
}

interface FloatingPolygon {
  x: number;
  y: number;
  size: number;
  sides: number;
  angle: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  isFilled: boolean;
}

interface LightBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  pulsePhase: number;
  color: string;
}

export function AmbientReactiveBackground({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  density = "medium",
  className = "pointer-events-none absolute inset-0 overflow-hidden select-none",
}: AmbientReactiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const countFactor = density === "low" ? 0.6 : density === "high" ? 1.4 : 1.0;
    const starCount = Math.floor(25 * countFactor);
    const polygonCount = Math.floor(14 * countFactor);
    const beamCount = 4;

    // Colores dinámicos
    const prim = primaryColor.startsWith("var") ? "#4f46e5" : primaryColor;
    const sec = secondaryColor.startsWith("var") ? "#06b6d4" : secondaryColor;

    // 1. Estrellitas / Destellos cayendo suavemente
    const stars: StarParticle[] = [];
    for (let i = 0; i < starCount; i++) {
      const isSec = Math.random() > 0.45;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.2,
        alpha: 0.1 + Math.random() * 0.4,
        baseAlpha: 0.15 + Math.random() * 0.45,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        vy: 0.15 + Math.random() * 0.4,
        color: isSec ? sec : prim,
      });
    }

    // 2. Polígonos flotando y rotando
    const polygons: FloatingPolygon[] = [];
    const availableSides = [3, 4, 6, 8];
    for (let i = 0; i < polygonCount; i++) {
      const isSec = i % 2 === 0;
      polygons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 14 + Math.random() * 32,
        sides: availableSides[Math.floor(Math.random() * availableSides.length)],
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        vx: (Math.random() - 0.5) * 0.25,
        vy: 0.2 + Math.random() * 0.35, // Caída lenta suave
        alpha: 0.08 + Math.random() * 0.18,
        color: isSec ? sec : prim,
        isFilled: Math.random() > 0.6,
      });
    }

    // 3. Líneas geométricas / haces diagonales con baja opacidad
    const beams: LightBeam[] = [];
    for (let i = 0; i < beamCount; i++) {
      const isSec = i % 2 === 0;
      beams.push({
        x1: (i / beamCount) * width,
        y1: 0,
        x2: ((i + 1) / beamCount) * width + 200,
        y2: height,
        alpha: 0.04 + Math.random() * 0.06,
        pulsePhase: Math.random() * Math.PI * 2,
        color: isSec ? sec : prim,
      });
    }

    const drawPolygon = (
      x: number,
      y: number,
      radius: number,
      sides: number,
      angle: number,
      color: string,
      alpha: number,
      filled: boolean
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();

      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides;
        const px = radius * Math.cos(a);
        const py = radius * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.globalAlpha = alpha;
      if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // A) Dibujar Haces y Líneas geométricas diagonales
      for (const b of beams) {
        b.pulsePhase += 0.015;
        const dynAlpha = b.alpha * (0.8 + 0.35 * Math.sin(b.pulsePhase));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = dynAlpha;
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.restore();
      }

      // B) Dibujar y animar Polígonos flotantes
      for (const p of polygons) {
        p.angle += p.rotSpeed;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y - p.size > height) {
          p.y = -p.size;
          p.x = Math.random() * width;
        }
        if (p.x < -p.size) p.x = width + p.size;
        if (p.x > width + p.size) p.x = -p.size;

        drawPolygon(p.x, p.y, p.size, p.sides, p.angle, p.color, p.alpha, p.isFilled);
      }

      // C) Dibujar y animar Estrellas / Destellos
      for (const s of stars) {
        s.y += s.vy;
        s.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.y * s.twinkleSpeed));

        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.05, Math.min(0.8, s.alpha));
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Destello en cruz para las estrellas más grandes
        if (s.size > 2.0) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(s.x - s.size * 2, s.y);
          ctx.lineTo(s.x + s.size * 2, s.y);
          ctx.moveTo(s.x, s.y - s.size * 2);
          ctx.lineTo(s.x, s.y + s.size * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [primaryColor, secondaryColor, density]);

  return (
    <div className={className} aria-hidden="true">
      {/* 1. Canvas Dinámico de Polígonos, Estrellas y Líneas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* 2. Auras difusas y resplandor ambiental institucional */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-[130px] opacity-25"
        style={{ background: primaryColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-[140px] opacity-20"
        style={{ background: secondaryColor }}
      />
    </div>
  );
}

