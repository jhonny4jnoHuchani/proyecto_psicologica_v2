import React, { useEffect, useRef } from "react";

interface PolygonCollisionsRainProps {
  className?: string;
  count?: number;
  interactive?: boolean;
}

interface Polygon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  sides: number;
  angle: number;
  rotSpeed: number;
  colorType: "primary" | "secondary" | "accent";
  opacity: number;
  isWireframeOnly: boolean;
  isConcentric: boolean;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

export function PolygonCollisionsRain({
  className = "absolute inset-0 pointer-events-none overflow-hidden",
  count = 28,
  interactive = true,
}: PolygonCollisionsRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 220);

    // Resolución de colores de la institución
    const resolveColors = () => {
      const computed = getComputedStyle(canvas);
      const prim = computed.getPropertyValue("--primary").trim() || "#6366f1";
      const sec = computed.getPropertyValue("--secondary").trim() || "#06b6d4";
      return {
        primary: prim.startsWith("var") ? "#6366f1" : prim,
        secondary: sec.startsWith("var") ? "#06b6d4" : sec,
        accent: "#ffffff",
      };
    };

    let colors = resolveColors();

    // Mouse tracking interactivo sobre el banner
    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    if (interactive && canvas.parentElement) {
      canvas.parentElement.addEventListener("mousemove", handleMouseMove);
      canvas.parentElement.addEventListener("mouseleave", handleMouseLeave);
    }

    // Inicializar Polígonos
    const sideOptions = [3, 4, 5, 6, 8]; // Triángulos, rombos, pentágonos, hexágonos, octágonos
    const polygons: Polygon[] = [];

    const effectiveCount = Math.min(
      Math.max(16, Math.floor((width * height) / 12000)),
      count,
    );

    for (let i = 0; i < effectiveCount; i++) {
      const sides = sideOptions[Math.floor(Math.random() * sideOptions.length)];
      const radius = 10 + Math.random() * 22; // Radio entre 10px y 32px
      const colorType: "primary" | "secondary" | "accent" =
        Math.random() < 0.55
          ? "primary"
          : Math.random() < 0.88
            ? "secondary"
            : "accent";

      polygons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.45) * 0.8, // Deriva lateral suave
        vy: 0.5 + Math.random() * 1.5, // Caída tipo lluvia constante
        radius,
        mass: radius * radius,
        sides,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        colorType,
        opacity: 0.15 + Math.random() * 0.35,
        isWireframeOnly: Math.random() > 0.4,
        isConcentric: Math.random() > 0.6,
      });
    }

    // Lista de ondas de choque generadas por colisiones ("choque de polígonos")
    const shockwaves: Shockwave[] = [];

    // Ajuste responsive automático con ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            width = canvas.width = w;
            height = canvas.height = h;
            colors = resolveColors();
          }
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Dibujar un polígono regular N-lados con opcional centro concéntrico
    const drawPolygon = (p: Polygon, color: string) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // Trazo exterior
      ctx.beginPath();
      for (let i = 0; i < p.sides; i++) {
        const a = (i * 2 * Math.PI) / p.sides;
        const px = Math.cos(a) * p.radius;
        const py = Math.sin(a) * p.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Relleno suave translúcido si no es exclusivamente wireframe
      if (!p.isWireframeOnly) {
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity * 0.18;
        ctx.fill();
      }

      // Borde brillante nítido
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.stroke();

      // Efecto concéntrico / núcleo geométrico si aplica
      if (p.isConcentric) {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        const innerRadius = p.radius * 0.48;
        for (let i = 0; i < p.sides; i++) {
          const a = (i * 2 * Math.PI) / p.sides;
          const px = Math.cos(a) * innerRadius;
          const py = Math.sin(a) * innerRadius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = colors.accent;
        ctx.globalAlpha = p.opacity * 0.4;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Radios conectores del núcleo al vértice
        ctx.beginPath();
        for (let i = 0; i < p.sides; i++) {
          const a = (i * 2 * Math.PI) / p.sides;
          ctx.moveTo(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius);
          ctx.lineTo(Math.cos(a) * p.radius, Math.sin(a) * p.radius);
        }
        ctx.globalAlpha = p.opacity * 0.25;
        ctx.stroke();
      }

      ctx.restore();
    };

    // Bucle Principal de Física y Renderizado
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Detección de Colisiones entre Polígonos ("Choque de Polígonos")
      for (let i = 0; i < polygons.length; i++) {
        const p1 = polygons[i];

        for (let j = i + 1; j < polygons.length; j++) {
          const p2 = polygons[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = p1.radius + p2.radius;

          // Si colisionan físicamente
          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Velocidad relativa
            const kx = p1.vx - p2.vx;
            const ky = p1.vy - p2.vy;
            const impulse =
              (2 * (nx * kx + ny * ky)) / (p1.mass + p2.mass + 0.001);

            p1.vx -= impulse * p2.mass * nx * 0.85;
            p1.vy -= impulse * p2.mass * ny * 0.85;
            p2.vx += impulse * p1.mass * nx * 0.85;
            p2.vy += impulse * p1.mass * ny * 0.85;

            // Separación para evitar atascos
            const overlap = 0.5 * (minDist - dist);
            p1.x -= overlap * nx;
            p1.y -= overlap * ny;
            p2.x += overlap * nx;
            p2.y += overlap * ny;

            // Micro impulso rotacional en el impacto
            p1.rotSpeed = (Math.random() - 0.5) * 0.05;
            p2.rotSpeed = (Math.random() - 0.5) * 0.05;

            // Disparar destello / anillo expansivo de choque ("onda de impacto")
            if (shockwaves.length < 15) {
              const impactColor =
                p1.colorType === "primary" ? colors.primary : colors.secondary;
              shockwaves.push({
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2,
                radius: 3,
                maxRadius: 18 + Math.random() * 12,
                opacity: 0.85,
                color: impactColor,
              });
            }
          } else if (dist < 85) {
            // Filamento / Enlace sutil de proximidad entre polígonos cercanos
            const linkAlpha = (1 - dist / 85) * 0.18;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle =
              p1.colorType === "primary" ? colors.primary : colors.secondary;
            ctx.globalAlpha = linkAlpha;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 2. Interacción con el cursor (Repulsión táctil)
      if (mouse.active) {
        for (const p of polygons) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 100 && mdist > 0.001) {
            const force = (1 - mdist / 100) * 1.8;
            p.vx += (mdx / mdist) * force;
            p.vy += (mdy / mdist) * force;
            p.rotSpeed += (Math.random() - 0.5) * 0.04;
          }
        }
      }

      // 3. Actualizar y Renderizar Ondas de Choque
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = sw.opacity;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        sw.radius += 1.2;
        sw.opacity -= 0.045;
        if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      // 4. Actualizar posiciones, rotaciones y lluvia ("Lluvia de Polígonos")
      for (const p of polygons) {
        // Amortiguación gradual en velocidades horizontales
        p.vx *= 0.985;

        // Limitar caída y reponer velocidad constante hacia abajo (lluvia)
        if (p.vy < 0.6) p.vy += 0.04;
        if (p.vy > 3.0) p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.rotSpeed;

        // Rebote en paredes laterales izquierda / derecha
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = Math.abs(p.vx) * 0.8;
        } else if (p.x + p.radius > width) {
          p.x = width - p.radius;
          p.vx = -Math.abs(p.vx) * 0.8;
        }

        // Lluvia continua: si pasa el fondo inferior, reaparece suavemente por la parte superior
        if (p.y - p.radius > height) {
          p.y = -p.radius - 5;
          p.x = Math.random() * width;
          p.vy = 0.5 + Math.random() * 1.5;
          p.vx = (Math.random() - 0.45) * 0.8;
        }

        // Determinar color
        const color =
          p.colorType === "primary"
            ? colors.primary
            : p.colorType === "secondary"
              ? colors.secondary
              : colors.accent;

        drawPolygon(p, color);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentElement) {
        resizeObserver.disconnect();
        if (interactive) {
          canvas.parentElement.removeEventListener(
            "mousemove",
            handleMouseMove,
          );
          canvas.parentElement.removeEventListener(
            "mouseleave",
            handleMouseLeave,
          );
        }
      }
    };
  }, [count, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        willChange: "transform",
      }}
    />
  );
}

