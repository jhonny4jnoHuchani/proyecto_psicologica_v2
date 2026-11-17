import { motion, type Variants } from "framer-motion";
import React, { useEffect, useState } from "react";

interface PageDecoratorsProps {
  primaryColor?: string;
  secondaryColor?: string;
  showSparkles?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

export function PageDecorators({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  showSparkles = true,
}: PageDecoratorsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!showSparkles) return;
    const colors = [
      primaryColor,
      secondaryColor,
      "#f59e0b", // Ámbar cálido para romper la monotonía azul
      "#38bdf8", // Cian cielo
      "#ffffff", // Destello blanco
    ];
    const initialParticles: Particle[] = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: Math.random() * 96 + 2,
      y: Math.random() * 95 + 2,
      size: Math.random() * 8 + 3,
      delay: Math.random() * 5,
      duration: Math.random() * 7 + 6,
      color: colors[i % colors.length],
    }));
    setParticles(initialParticles);
  }, [showSparkles, primaryColor, secondaryColor]);

  // Efecto de chispas interactivas al hacer clic (SparkCursor como en gasypetroquimica)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignorar clics dentro de inputs o modales si están enfocados
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      const sparkCount = 8;
      const palette = [primaryColor, secondaryColor, "#f59e0b", "#38bdf8", "#ffffff"];

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("div");
        spark.className = "welcome-click-spark";
        spark.style.left = `${e.clientX}px`;
        spark.style.top = `${e.clientY}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 50 + 18;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        spark.style.setProperty("--tx", `${tx}px`);
        spark.style.setProperty("--ty", `${ty}px`);
        spark.style.backgroundColor = palette[Math.floor(Math.random() * palette.length)];

        document.body.appendChild(spark);

        setTimeout(() => {
          spark.remove();
        }, 550);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [primaryColor, secondaryColor]);

  const cornerVariants: Variants = {
    animate: {
      scale: [1, 1.04, 1],
      opacity: [0.14, 0.28, 0.14],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <>
      <style>{`
        .welcome-decorator-canvas {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 2;
          overflow: hidden;
        }
        .welcome-click-spark {
          position: fixed;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: welcomeSparkAnim 0.55s ease-out forwards;
          box-shadow: 0 0 8px currentColor;
        }
        @keyframes welcomeSparkAnim {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0.2);
          }
        }
      `}</style>

      <div className="welcome-decorator-canvas">
        {/* 1. Esquinas arquitectónicas ornamentales fijas con pulsación suave */}
        <motion.img
          src="/decoradores/esquina-izquierda.png"
          alt=""
          variants={cornerVariants}
          animate="animate"
          className="absolute top-0 left-0 w-[clamp(220px,28vw,460px)] opacity-20 pointer-events-none select-none"
        />
        <motion.img
          src="/decoradores/esquina-derecha.png"
          alt=""
          variants={cornerVariants}
          animate="animate"
          className="absolute bottom-0 right-0 w-[clamp(220px,28vw,460px)] opacity-20 pointer-events-none select-none"
        />

        {/* 2. Partículas flotantes de luz cálida / institucional que eliminan el vacío muerto */}
        {showSparkles && particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0, scale: 0 }}
                animate={{
                  y: [`${p.y}vh`, `${Math.max(0, p.y - 28)}vh`],
                  x: [`${p.x}vw`, `${p.x + (p.id % 2 === 0 ? 6 : -6)}vw`],
                  opacity: [0, 0.75, 0],
                  scale: [0, 1.25, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2.5}px ${p.color}, 0 0 ${p.size}px #ffffff`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
