import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface PortadaItem {
    id: number;
    titulo: string | null;
    imagen: string;
    orden?: number;
}

interface PortadasCinematicSliderProps {
    portadas: PortadaItem[];
    primaryColor?: string;
    secondaryColor?: string;
    intervalMs?: number;
    className?: string;
}

type TransitionMode = 'rompecabezas' | 'mosaico-3d' | 'persianas-verticales' | 'vortice-espiral' | 'cubo-profundidad' | 'corte-horizontal';

const TRANSITION_MODES: { id: TransitionMode; name: string; tag: string }[] = [
    { id: 'rompecabezas', name: 'Rompecabezas Fragmentado', tag: '🧩 Piezas 3D' },
    { id: 'mosaico-3d', name: 'Mosaico en Cascada', tag: '✨ Mosaico 3D' },
    { id: 'persianas-verticales', name: 'Persianas Cinemáticas', tag: '⚡ Persianas' },
    { id: 'vortice-espiral', name: 'Vórtice Espiral', tag: '🌀 Vórtice' },
    { id: 'cubo-profundidad', name: 'Hiperespacio 3D', tag: '🌌 Profundidad' },
    { id: 'corte-horizontal', name: 'Cintas Láser', tag: '💫 Cintas Láser' },
];

const COLS = 6;
const ROWS = 4;
const TOTAL_TILES = COLS * ROWS;

export function PortadasCinematicSlider({
    portadas = [],
    primaryColor = '#4f46e5',
    secondaryColor = '#06b6d4',
    intervalMs = 6500,
    className = 'absolute inset-0 overflow-hidden',
}: PortadasCinematicSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0);
    const [modeIndex, setModeIndex] = useState(0);
    const [transitionKey, setTransitionKey] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const total = portadas.length;

    const currentPortada = portadas[currentIndex];
    const previousPortada = portadas[previousIndex];
    const currentMode = TRANSITION_MODES[modeIndex % TRANSITION_MODES.length];

    // Cambiar a la siguiente portada ciclando modos dinámicamente ("N entradas")
    const goToNext = () => {
        if (total <= 1) return;
        setPreviousIndex(currentIndex);
        setCurrentIndex((prev) => (prev + 1) % total);
        setModeIndex((prev) => (prev + 1) % TRANSITION_MODES.length);
        setTransitionKey((prev) => prev + 1);
    };

    const goToPrev = () => {
        if (total <= 1) return;
        setPreviousIndex(currentIndex);
        setCurrentIndex((prev) => (prev - 1 + total) % total);
        setModeIndex((prev) => (prev - 1 + TRANSITION_MODES.length) % TRANSITION_MODES.length);
        setTransitionKey((prev) => prev + 1);
    };

    const goToSlide = (idx: number) => {
        if (idx === currentIndex || total <= 1) return;
        setPreviousIndex(currentIndex);
        setCurrentIndex(idx);
        setModeIndex((prev) => (prev + 1) % TRANSITION_MODES.length);
        setTransitionKey((prev) => prev + 1);
    };

    // Autoplay con pausa en hover o manual
    useEffect(() => {
        if (total <= 1 || isPaused || isHovered) return;
        const timer = setInterval(goToNext, intervalMs);
        return () => clearInterval(timer);
    }, [total, isPaused, isHovered, intervalMs, currentIndex]);

    // Generador de parámetros de animación por celda según el modo
    const getTileAnimation = (col: number, row: number, mode: TransitionMode) => {
        const tileX = col;
        const tileY = row;

        switch (mode) {
            case 'rompecabezas': {
                // Efecto de piezas de rompecabezas/vidrio roto dispersas en 3D
                const pseudoRand = ((col * 7 + row * 13) % 19) / 19;
                const angle = pseudoRand * Math.PI * 2;
                const scatterDist = 300 + ((col + row) % 4) * 120;
                const startX = Math.cos(angle) * scatterDist + (col - 2.5) * 80;
                const startY = Math.sin(angle) * scatterDist + (row - 1.5) * 80;
                const startZ = -200 - pseudoRand * 300;
                const rotX = (pseudoRand - 0.5) * 120;
                const rotY = ((col % 3) - 1) * 90;
                const rotZ = (pseudoRand - 0.5) * 140;
                const delay = ((col + row * 1.2) / (COLS + ROWS)) * 0.45;

                return {
                    initial: {
                        x: startX,
                        y: startY,
                        z: startZ,
                        rotateX: rotX,
                        rotateY: rotY,
                        rotateZ: rotZ,
                        scale: 0.25 + pseudoRand * 0.3,
                        opacity: 0,
                    },
                    animate: {
                        x: 0,
                        y: 0,
                        z: 0,
                        rotateX: 0,
                        rotateY: 0,
                        rotateZ: 0,
                        scale: 1,
                        opacity: 1,
                        transition: {
                            duration: 1.05,
                            delay,
                            ease: [0.16, 1, 0.3, 1], // Deceleración magnética tipo snap
                        },
                    },
                };
            }

            case 'mosaico-3d': {
                // Giro tridimensional en cascada diagonal
                const distFromCorner = col + row;
                const delay = distFromCorner * 0.045;
                return {
                    initial: {
                        scale: 0.1,
                        rotateY: 180,
                        rotateX: -45,
                        opacity: 0,
                    },
                    animate: {
                        scale: 1,
                        rotateY: 0,
                        rotateX: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.85,
                            delay,
                            ease: [0.22, 1, 0.36, 1],
                        },
                    },
                };
            }

            case 'persianas-verticales': {
                // Columnas alternadas bajando y subiendo a alta velocidad
                const isEven = col % 2 === 0;
                const delay = col * 0.06;
                return {
                    initial: {
                        y: isEven ? '-120%' : '120%',
                        scaleY: 1.3,
                        opacity: 0,
                    },
                    animate: {
                        y: '0%',
                        scaleY: 1,
                        opacity: 1,
                        transition: {
                            duration: 0.9,
                            delay,
                            ease: [0.25, 1, 0.5, 1],
                        },
                    },
                };
            }

            case 'vortice-espiral': {
                // Vórtice concéntrico rotando hacia el centro
                const centerX = (COLS - 1) / 2;
                const centerY = (ROWS - 1) / 2;
                const dx = col - centerX;
                const dy = row - centerY;
                const radius = Math.hypot(dx, dy);
                const baseAngle = Math.atan2(dy, dx);
                const spiralDist = 350 + radius * 60;
                const delay = (radius / (COLS / 2 + ROWS / 2)) * 0.35;

                return {
                    initial: {
                        x: Math.cos(baseAngle + 1.8) * spiralDist,
                        y: Math.sin(baseAngle + 1.8) * spiralDist,
                        rotateZ: 180,
                        scale: 0.2,
                        opacity: 0,
                    },
                    animate: {
                        x: 0,
                        y: 0,
                        rotateZ: 0,
                        scale: 1,
                        opacity: 1,
                        transition: {
                            duration: 1.0,
                            delay,
                            ease: [0.16, 1, 0.3, 1],
                        },
                    },
                };
            }

            case 'cubo-profundidad': {
                // Salida desde el fondo Z en hiperespacio 3D
                const distFromCenter = Math.hypot(col - 2.5, row - 1.5);
                const delay = (distFromCenter / 4) * 0.3;
                return {
                    initial: {
                        z: -850,
                        scale: 2.2,
                        opacity: 0,
                    },
                    animate: {
                        z: 0,
                        scale: 1,
                        opacity: 1,
                        transition: {
                            duration: 0.95,
                            delay,
                            ease: [0.16, 1, 0.3, 1],
                        },
                    },
                };
            }

            case 'corte-horizontal':
            default: {
                // Cintas horizontales alternadas desde izquierda y derecha
                const isEvenRow = row % 2 === 0;
                const delay = row * 0.09 + col * 0.02;
                return {
                    initial: {
                        x: isEvenRow ? '-110%' : '110%',
                        skewX: isEvenRow ? 15 : -15,
                        opacity: 0,
                    },
                    animate: {
                        x: '0%',
                        skewX: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.85,
                            delay,
                            ease: [0.22, 1, 0.36, 1],
                        },
                    },
                };
            }
        }
    };

    // Si no hay portadas disponibles, render de fondo elegante institucional
    if (!portadas || portadas.length === 0) {
        return (
            <div
                className={className}
                style={{
                    background: `radial-gradient(ellipse at 30% 20%, ${primaryColor}40 0%, #060914 80%)`,
                }}
            />
        );
    }

    // Si solo hay una portada, render simple con sutil efecto Ken Burns sin división en tiles
    if (total === 1) {
        return (
            <div className={className}>
                <img
                    src={`/storage/${currentPortada.imagen}`}
                    alt={currentPortada.titulo || 'Portada Institucional'}
                    className="h-full w-full animate-[kenburns_20s_ease-out_infinite_alternate] object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`${className} select-none`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                perspective: '1400px',
            }}
        >
            {/* 1. Capa Fondo: Portada Anterior (evita parpadeos o huecos negros durante la transición) */}
            {previousPortada && (
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    <img src={`/storage/${previousPortada.imagen}`} alt="" className="h-full w-full object-cover brightness-[0.75]" />
                </div>
            )}

            {/* 2. Capa Dinámica: Mosaico de Fragmentos / Rompecabezas en 3D */}
            <div
                key={transitionKey}
                className="pointer-events-none absolute inset-0 z-1"
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                {Array.from({ length: ROWS }).map((_, r) =>
                    Array.from({ length: COLS }).map((_, c) => {
                        const tileConfig = getTileAnimation(c, r, currentMode.id);
                        const tileWidth = 100 / COLS;
                        const tileHeight = 100 / ROWS;

                        return (
                            <motion.div
                                key={`${transitionKey}-${c}-${r}`}
                                initial={tileConfig.initial}
                                animate={tileConfig.animate}
                                style={{
                                    position: 'absolute',
                                    left: `${c * tileWidth}%`,
                                    top: `${r * tileHeight}%`,
                                    width: `${tileWidth + 0.05}%`, // 0.05% de solape para eliminar costuras de píxeles
                                    height: `${tileHeight + 0.05}%`,
                                    overflow: 'hidden',
                                    transformStyle: 'preserve-3d',
                                    backfaceVisibility: 'hidden',
                                }}
                            >
                                {/* Imagen segmentada proyectada exactamente en su coordenada */}
                                <img
                                    src={`/storage/${currentPortada.imagen}`}
                                    alt=""
                                    className="pointer-events-none absolute max-w-none select-none"
                                    style={{
                                        width: `${COLS * 100}%`,
                                        height: `${ROWS * 100}%`,
                                        left: `${-c * 100}%`,
                                        top: `${-r * 100}%`,
                                        objectFit: 'cover',
                                    }}
                                />

                                {/* Micro resplandor en los bordes del fragmento durante el ensamblado */}
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-1000"
                                    style={{
                                        boxShadow: 'inset 0 0 1px rgba(255,255,255,0.4)',
                                    }}
                                />
                            </motion.div>
                        );
                    }),
                )}
            </div>

            {/* 3. Indicador de Efecto de Transición Activo (Píldora flotante elegante) */}
            <div className="pointer-events-none absolute top-6 right-6 z-20 hidden items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 text-xs text-white/90 shadow-xl backdrop-blur-md transition-all duration-300 sm:flex">
                <Sparkles className="h-3.5 w-3.5" style={{ color: secondaryColor }} />
                <span className="font-mono text-[11px] font-semibold tracking-wider">{currentMode.tag}</span>
            </div>

            {/* 4. Título de la portada activa (si tiene) */}
            {currentPortada.titulo && (
                <div className="pointer-events-none absolute bottom-16 left-6 z-20 max-w-md sm:left-12">
                    <motion.div
                        key={`title-${currentIndex}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="rounded-2xl border border-white/20 bg-slate-950/75 p-3.5 text-white shadow-2xl backdrop-blur-md sm:p-4"
                    >
                        <span className="mb-1 block text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                            Portada Institucional {currentIndex + 1} de {total}
                        </span>
                        <p className="text-sm font-bold text-white drop-shadow sm:text-base">{currentPortada.titulo}</p>
                    </motion.div>
                </div>
            )}

            {/* 5. Controles de Navegación Flechas (Anterior / Siguiente) */}
            <div className="absolute inset-y-0 left-3 z-20 flex items-center sm:left-6">
                <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Portada anterior"
                    className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-white/50 hover:bg-slate-900/90 active:scale-95 sm:h-12 sm:w-12"
                >
                    <ChevronLeft className="h-6 w-6 text-white transition-transform group-hover:-translate-x-0.5" />
                </button>
            </div>

            <div className="absolute inset-y-0 right-3 z-20 flex items-center sm:right-6">
                <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Siguiente portada"
                    className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-white/50 hover:bg-slate-900/90 active:scale-95 sm:h-12 sm:w-12"
                >
                    <ChevronRight className="h-6 w-6 text-white transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>

            {/* 6. Barra inferior con Indicadores y Pausa/Play */}
            <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 p-1.5 px-3 shadow-xl backdrop-blur-md">
                    {portadas.map((_, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => goToSlide(index)}
                                aria-label={`Ir a portada ${index + 1}`}
                                className={`cursor-pointer rounded-full transition-all duration-300 ${
                                    isActive ? 'h-2.5 w-8' : 'h-2.5 w-2.5 hover:scale-125'
                                }`}
                                style={{
                                    background: isActive ? secondaryColor : 'rgba(255, 255, 255, 0.35)',
                                    boxShadow: isActive ? `0 0 10px ${secondaryColor}` : 'none',
                                }}
                            />
                        );
                    })}

                    <div className="mx-1 h-3 w-px bg-white/20" />

                    {/* Botón Pausa / Reproducir */}
                    <button
                        type="button"
                        onClick={() => setIsPaused(!isPaused)}
                        aria-label={isPaused ? 'Reanudar transiciones' : 'Pausar transiciones'}
                        className="cursor-pointer rounded-full p-1 text-white/70 transition-colors hover:text-white"
                    >
                        {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
