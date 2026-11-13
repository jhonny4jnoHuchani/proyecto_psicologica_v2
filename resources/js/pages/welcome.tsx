import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, Link } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Download,
    ExternalLink,
    Eye,
    FileText,
    GraduationCap,
    HeartHandshake,
    Library,
    Lightbulb,
    MapPin,
    Megaphone,
    Play,
    Quote,
    Shield,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { AmbientReactiveBackground } from '@/components/ambient-reactive-background';
import { ExploraCarreraCarousel } from '@/components/explora-carrera-carousel';
import { FloatingScrollIndex } from '@/components/floating-scroll-index';
import { PortadasCinematicSlider } from '@/components/portadas-cinematic-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatoFecha } from '@/lib/formatters';

interface ConfigData {
    color_primario: string;
    color_secundario: string;
    logo: string | null;
    mision: string | null;
    vision: string | null;
    lema: string | null;
    organigrama: string | null;
}

interface Portada {
    id: number;
    titulo: string | null;
    imagen: string;
    orden: number;
}

interface Autoridad {
    id: number;
    nombre: string;
    cargo: string;
    foto: string | null;
    mensaje: string | null;
}

interface Convocatoria {
    id: number;
    titulo: string;
    descripcion: string | null;
    archivo: string | null;
    link_video: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
}

interface MateriaInfo {
    id: number;
    nombre: string;
    codigo: string;
}

interface LibroItem {
    id: number;
    nombre: string;
    autor: string | null;
    anio_lanzamiento: number | null;
    archivo: string | null;
    portada: string | null;
    materia?: MateriaInfo | null;
}

interface Props {
    config: ConfigData | null;
    portadas: Portada[];
    autoridades: Autoridad[];
    convocatorias: Convocatoria[];
    libros?: LibroItem[];
    user: { id: number; nombre: string; apellido_paterno: string; apellido_materno: string } | null;
}

const convocatoriaAbierta = (c: Convocatoria) => {
    if (!c.fecha_fin) return true;
    const fin = new Date(`${c.fecha_fin}T23:59:59`);
    return fin.getTime() >= Date.now();
};

const convertirLinkAEmbed = (link: string): string | null => {
    try {
        const url = new URL(link);
        if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
            const videoId = url.searchParams.get('v');
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.hostname.includes('youtube.com') && url.pathname.includes('/shorts/')) {
            const shortId = url.pathname.split('/shorts/')[1]?.split('/')[0];
            if (shortId) return `https://www.youtube.com/embed/${shortId}`;
        }
        if (url.hostname === 'youtu.be') {
            const videoId = url.pathname.slice(1);
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        return null;
    } catch {
        return null;
    }
};

export default function Welcome({ config, portadas, autoridades, convocatorias, libros = [], user }: Props) {
    const primary = config?.color_primario || '#4f46e5';
    const secondary = config?.color_secundario || '#06b6d4';
    const lema = config?.lema || 'Formando Psicólogos para el Futuro';

    const [modalVideo, setModalVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [modalPdf, setModalPdf] = useState(false);
    const [libroSeleccionado, setLibroSeleccionado] = useState<LibroItem | null>(null);
    const [activeTab, setActiveTab] = useState<'mision' | 'vision' | 'valores'>('mision');

    const abrirVideo = (link: string) => {
        const embedUrl = convertirLinkAEmbed(link);
        if (embedUrl) {
            setVideoUrl(embedUrl);
            setModalVideo(true);
        }
    };

    const abrirPdfLibro = (libro: LibroItem) => {
        setLibroSeleccionado(libro);
        setModalPdf(true);
    };

    useEffect(() => {
        AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 40 });
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div
            className="font-body relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100"
            style={
                {
                    '--primary': primary,
                    '--secondary': secondary,
                } as React.CSSProperties
            }
        >
            <Head title="Carrera de Psicología - Universidad Pública de El Alto">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    .font-title { font-family: 'Outfit', system-ui, -apple-system, sans-serif; }
                    .font-body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
                    .font-mono-tag { font-family: 'Space Grotesk', ui-monospace, monospace; }

                    ::selection {
                        background-color: ${primary};
                        color: #ffffff;
                    }

                    @keyframes floatSlow {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-16px) rotate(6deg); }
                    }
                    @keyframes floatSlowReverse {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(18px) rotate(-6deg); }
                    }
                    @keyframes pulseGlow {
                        0%, 100% { opacity: 0.4; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.05); }
                    }
                `}</style>
            </Head>

            {/* ========================================================================= */}
            {/* 1. ÍNDICE LATERAL FLOTANTE DOCK (OCULTO EN EL TOPE, SOLO APARECE CON SCROLL) */}
            {/* ========================================================================= */}
            <FloatingScrollIndex
                primaryColor={primary}
                secondaryColor={secondary}
                onNavigate={scrollTo}
                headerThreshold={90}
            />

            {/* ========================================================================= */}
            {/* 2. NAVBAR SUPERIOR CRISTALINO CON LOGO PROPORCIONADO                      */}
            {/* ========================================================================= */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl transition-all">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                    {/* Logo e Identidad Ceñido (Sin marco blanco desproporcionado) */}
                    <Link href="/" className="group flex items-center gap-3">
                        {config?.logo ? (
                            <div className="relative">
                                <div
                                    className="absolute -inset-1 rounded-xl opacity-40 blur-sm transition-opacity group-hover:opacity-85"
                                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                />
                                <div className="relative flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-white/20 bg-slate-900/70 p-1.5 shadow-md backdrop-blur-md transition-all group-hover:scale-105 group-hover:border-white/40">
                                    <img
                                        src={`/storage/${config.logo}`}
                                        alt="Logo Institucional"
                                        className="h-full w-full object-contain filter drop-shadow"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                            >
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div className="leading-tight">
                            <p className="font-title text-base font-bold tracking-tight text-white transition-opacity group-hover:opacity-90 sm:text-lg">
                                Psicología UPEA
                            </p>
                            <p className="font-mono-tag text-[10px] tracking-wider text-slate-400 uppercase sm:text-[11px]">
                                Preuniversitario Académico
                            </p>
                        </div>
                    </Link>

                    {/* Enlaces de Navegación Rápida (Desktop) */}
                    <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
                        <button type="button" onClick={() => scrollTo('inicio')} className="cursor-pointer transition-colors hover:text-white">
                            Inicio
                        </button>
                        <button type="button" onClick={() => scrollTo('explora')} className="cursor-pointer transition-colors hover:text-white">
                            Explora
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('sobre-nosotros')}
                            className="cursor-pointer transition-colors hover:text-white"
                        >
                            Nosotros
                        </button>
                        <button type="button" onClick={() => scrollTo('convocatorias')} className="cursor-pointer transition-colors hover:text-white">
                            Convocatorias
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('biblioteca')}
                            className="flex cursor-pointer items-center gap-1.5 font-semibold transition-colors hover:opacity-90"
                            style={{ color: secondary }}
                        >
                            <BookOpen className="h-4 w-4" />
                            Biblioteca
                        </button>
                        <button type="button" onClick={() => scrollTo('autoridades')} className="cursor-pointer transition-colors hover:text-white">
                            Autoridades
                        </button>
                    </nav>

                    {/* Botón de Autenticación (Estrictamente Iniciar Sesión o Dashboard, CERO Registros) */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard">
                                <Button
                                    className="cursor-pointer rounded-xl px-5 font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                    }}
                                >
                                    Ir al Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button
                                    className="cursor-pointer rounded-xl px-5 font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                    }}
                                >
                                    Iniciar Sesión <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* 3. HERO SECTION (PORTADA INSTITUCIONAL CINEMÁTICA Y LOGO IMPONENTE)       */}
            {/* ========================================================================= */}
            <section id="inicio" className="relative flex min-h-[92vh] items-center justify-center overflow-hidden pt-12 pb-24">
                {/* SLIDER CINEMÁTICO DINÁMICO DE PORTADAS */}
                <div className="absolute inset-0 z-0">
                    <PortadasCinematicSlider portadas={portadas} primaryColor={primary} secondaryColor={secondary} intervalMs={6500} />
                </div>

                {/* PELÍCULA GRADIENTE OSCURA PARA GARANTIZAR ALTO CONTRASTE */}
                <div
                    className="pointer-events-none absolute inset-0 z-1"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.65) 0%, rgba(6, 9, 20, 0.88) 60%, #030712 100%)',
                    }}
                />

                {/* AURAS DINÁMICAS ALIMENTADAS POR COLOR PRIMARIO Y SECUNDARIO */}
                <div
                    className="pointer-events-none absolute -top-32 -left-32 z-1 h-96 w-96 rounded-full blur-[120px]"
                    style={{ background: `${primary}35` }}
                />
                <div
                    className="pointer-events-none absolute -right-32 -bottom-32 z-1 h-96 w-96 rounded-full blur-[130px]"
                    style={{ background: `${secondary}30` }}
                />

                {/* ELEMENTOS GEOMÉTRICOS FLOTANTES DE AMBIENTACIÓN */}
                <div className="pointer-events-none absolute inset-0 z-2 overflow-hidden">
                    <img
                        src="/decoradores/circulo.png"
                        alt=""
                        className="absolute top-16 left-8 w-16 animate-[floatSlow_8s_ease-in-out_infinite] opacity-40 sm:w-20"
                    />
                    <img
                        src="/decoradores/objeto.png"
                        alt=""
                        className="absolute top-1/4 right-8 w-14 animate-[floatSlowReverse_9s_ease-in-out_infinite] opacity-35 sm:w-16"
                    />
                    <img
                        src="/decoradores/decoradores2/objeto_puntueado.png"
                        alt=""
                        className="absolute bottom-28 left-12 w-20 animate-[floatSlow_11s_ease-in-out_infinite] opacity-35 sm:w-24"
                    />
                    <img
                        src="/decoradores/redondo_punteuado5.png"
                        alt=""
                        className="absolute top-20 right-1/4 w-14 animate-[floatSlow_10s_ease-in-out_infinite] opacity-35 sm:w-16"
                    />
                    <img
                        src="/decoradores/cuadrado_punteado_rojo.png"
                        alt=""
                        className="absolute right-16 bottom-24 w-14 animate-[floatSlowReverse_12s_ease-in-out_infinite] opacity-30"
                    />
                </div>

                {/* CONTENIDO PRINCIPAL HERO */}
                <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
                    {/* EMBLEMA / ESCUDO INSTITUCIONAL GRANDE (CEÑIDO AL TAMAÑO DEL LOGO, SIN CAJA BLANCA EXCESIVA) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="group relative mb-6"
                    >
                        {/* Halo expansivo y resplandor con Colores Institucionales */}
                        <div
                            className="pointer-events-none absolute -inset-6 animate-pulse rounded-full opacity-70 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                            style={{ background: `radial-gradient(circle, ${secondary}80 0%, ${primary}70 50%, transparent 80%)` }}
                        />

                        {/* Contenedor ceñido al escudo (Squircle translúcido con drop-shadow) */}
                        <div
                            className="relative flex h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 items-center justify-center rounded-3xl bg-slate-950/45 p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl border border-white/20 transition-all duration-500 hover:scale-105"
                            style={{
                                boxShadow: `0 20px 45px -10px ${primary}60, 0 0 35px ${secondary}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
                            }}
                        >
                            {config?.logo ? (
                                <img
                                    src={`/storage/${config.logo}`}
                                    alt="Logo Carrera de Psicología UPEA"
                                    className="h-full w-full object-contain filter transition-transform duration-500 group-hover:scale-105"
                                    style={{
                                        filter: `drop-shadow(0 12px 24px ${primary}90) drop-shadow(0 0 30px ${secondary}60)`,
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <GraduationCap className="h-16 w-16 sm:h-20 sm:w-20" style={{ color: secondary }} />
                                    <span className="font-title mt-1 text-sm font-bold text-white">Psicología UPEA</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* INSIGNIA DE ADMISIÓN CON EFECTO CRISTAL Y BORDE ANIMADO */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                        <span
                            className="font-mono-tag inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg backdrop-blur-xl transition-all"
                            style={{
                                borderColor: `${secondary}70`,
                                backgroundColor: `rgba(15, 23, 42, 0.75)`,
                                boxShadow: `0 0 20px -3px ${primary}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
                            }}
                        >
                            <Sparkles className="h-4 w-4 animate-pulse" style={{ color: secondary }} />
                            <span>Admisión Preuniversitaria · Carrera de Psicología</span>
                        </span>
                    </motion.div>

                    {/* TÍTULO PRINCIPAL DE ALTO IMPACTO TIPOGRÁFICO */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="font-title mt-6 text-4xl font-extrabold tracking-tight text-white uppercase drop-shadow-2xl sm:text-6xl lg:text-7xl"
                    >
                        CARRERA DE{' '}
                        <span
                            className="relative inline-block bg-clip-text text-transparent font-black tracking-tight"
                            style={{
                                backgroundImage: `linear-gradient(135deg, ${primary}, ${secondary}, #ffffff, ${secondary})`,
                                backgroundSize: '200% auto',
                                filter: `drop-shadow(0 0 35px ${primary}90)`,
                            }}
                        >
                            PSICOLOGÍA
                        </span>
                        <span className="mt-3 block text-xl font-bold tracking-widest text-slate-200 sm:text-2xl lg:text-3xl opacity-90">
                            UNIVERSIDAD PÚBLICA DE EL ALTO
                        </span>
                    </motion.h1>

                    {/* LEMA INSTITUCIONAL */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-6 max-w-2xl text-base leading-relaxed font-medium text-slate-200 drop-shadow-md sm:text-xl italic"
                    >
                        "{lema}"
                    </motion.p>

                    {/* BOTONES DE ACCIÓN HERO (SIN ENLACES ROTOS NI REGISTROS PÚBLICOS) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-4"
                    >
                        {user ? (
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    className="h-13 cursor-pointer rounded-2xl px-8 text-base font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                    }}
                                >
                                    Ir a mi Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button
                                        size="lg"
                                        className="h-13 cursor-pointer rounded-2xl px-8 text-base font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                                        style={{
                                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                        }}
                                    >
                                        Iniciar Sesión <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => scrollTo('convocatorias')}
                                    className="flex h-13 cursor-pointer items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
                                >
                                    <Megaphone className="h-5 w-5" style={{ color: secondary }} />
                                    Ver Convocatorias
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* SCROLL INDICATOR ANIMADO */}
                <motion.button
                    type="button"
                    onClick={() => scrollTo('explora')}
                    className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 text-slate-300 opacity-80 transition-colors hover:text-white hover:opacity-100"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className="font-mono-tag text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Descubre más</span>
                    <ChevronDown className="h-5 w-5" style={{ color: secondary }} />
                </motion.button>
            </section>

            {/* ========================================================================= */}
            {/* 4. SECCIÓN EXPLORA LA CARRERA (ECOSISTEMA, CARRUSEL DE ÁREAS Y POLÍGONOS) */}
            {/* ========================================================================= */}
            <section id="explora" className="relative overflow-hidden bg-slate-950 px-6 py-24">
                {/* Capa de atmósfera reactiva: polígonos, estrellas y haces diagonales */}
                <AmbientReactiveBackground primaryColor={primary} secondaryColor={secondary} density="medium" />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="mb-16 text-center" data-aos="fade-up">
                        <span
                            className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                            style={{
                                color: secondary,
                                backgroundColor: `${secondary}18`,
                                borderColor: `${secondary}44`,
                                borderWidth: 1,
                            }}
                        >
                            Plataforma & Ecosistema
                        </span>
                        <h2 className="font-title mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Explora la Carrera de Psicología
                        </h2>
                        <div
                            className="mx-auto mt-4 h-1 w-20 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            Una experiencia formativa de vanguardia que combina ciencia del comportamiento, acompañamiento docente y tecnología
                            educativa en la UPEA.
                        </p>
                    </div>

                    {/* CARRUSEL INTERACTIVO DE LAS ÁREAS FORMATIVAS Y ACCESOS ÚTILES (SIN ENLACES VACÍOS) */}
                    <ExploraCarreraCarousel
                        primaryColor={primary}
                        secondaryColor={secondary}
                        totalConvocatorias={convocatorias.length}
                        totalLibros={libros.length}
                        totalAutoridades={autoridades.length}
                        onNavigateSeccion={scrollTo}
                    />
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 5. SECCIÓN SOBRE NOSOTROS (MISIÓN, VISIÓN, VALORES Y POLÍGONOS SUAVES)   */}
            {/* ========================================================================= */}
            <section id="sobre-nosotros" className="relative overflow-hidden bg-slate-950 px-6 py-24 border-t border-white/5">
                <AmbientReactiveBackground primaryColor={primary} secondaryColor={secondary} density="low" />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                        {/* Columna Izquierda: Introducción y Métricas */}
                        <div className="lg:col-span-5" data-aos="fade-right">
                            <span
                                className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                                style={{
                                    color: primary,
                                    backgroundColor: `${primary}18`,
                                    borderColor: `${primary}44`,
                                    borderWidth: 1,
                                }}
                            >
                                Identidad & Compromiso
                            </span>
                            <h2 className="font-title mt-3 text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl">
                                Formación Científica y Sensibilidad Social
                            </h2>
                            <p className="mt-5 text-base leading-relaxed text-slate-300">
                                La Carrera de Psicología de la Universidad Pública de El Alto prepara profesionales líderes orientados a la
                                investigación, intervención clínica, comunitaria y educativa para responder a las necesidades de la sociedad
                                boliviana.
                            </p>

                            {/* Tarjetas de Estadísticas / Indicadores con Micro-interacciones */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
                                    <p className="font-title text-3xl font-extrabold" style={{ color: secondary }}>
                                        100%
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-300">Docentes Especialistas</p>
                                </div>
                                <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
                                    <p className="font-title text-3xl font-extrabold" style={{ color: primary }}>
                                        +5
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-300">Áreas de Especialidad</p>
                                </div>
                                <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
                                    <p className="font-title text-3xl font-extrabold" style={{ color: secondary }}>
                                        24/7
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-300">Plataforma & Recursos</p>
                                </div>
                                <div className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
                                    <p className="font-title text-3xl font-extrabold" style={{ color: primary }}>
                                        UPEA
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-300">Acreditación Pública</p>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Tabs interactivos Misión / Visión / Valores */}
                        <div className="lg:col-span-7" data-aos="fade-left">
                            <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
                                {/* Botones de Pestaña */}
                                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-6">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('mision')}
                                        className={`font-title flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                                            activeTab === 'mision' ? 'text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                        style={
                                            activeTab === 'mision' ? { background: primary, boxShadow: `0 8px 20px -4px ${primary}80` } : undefined
                                        }
                                    >
                                        <Target className="h-4 w-4" /> Nuestra Misión
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('vision')}
                                        className={`font-title flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                                            activeTab === 'vision' ? 'text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                        style={
                                            activeTab === 'vision'
                                                ? { background: secondary, boxShadow: `0 8px 20px -4px ${secondary}80` }
                                                : undefined
                                        }
                                    >
                                        <Eye className="h-4 w-4" /> Nuestra Visión
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('valores')}
                                        className={`font-title flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                                            activeTab === 'valores' ? 'text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                        style={
                                            activeTab === 'valores'
                                                ? {
                                                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                                      boxShadow: `0 8px 20px -4px ${primary}80`,
                                                  }
                                                : undefined
                                        }
                                    >
                                        <Shield className="h-4 w-4" /> Valores y Ética
                                    </button>
                                </div>

                                {/* Contenido de la Pestaña */}
                                <div className="flex min-h-[260px] flex-col justify-center pt-6">
                                    {activeTab === 'mision' && (
                                        <motion.div
                                            key="mision"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center gap-3" style={{ color: primary }}>
                                                <Target className="h-8 w-8" />
                                                <h3 className="font-title text-2xl font-bold text-white">Misión Institucional</h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                                                {config?.mision ||
                                                    'Formar profesionales en psicología idóneos, éticos, críticos e investigadores, capaces de diagnosticar, prevenir e intervenir en los procesos psicológicos individuales y sociales para el bienestar de la población boliviana.'}
                                            </p>
                                        </motion.div>
                                    )}

                                    {activeTab === 'vision' && (
                                        <motion.div
                                            key="vision"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center gap-3" style={{ color: secondary }}>
                                                <Eye className="h-8 w-8" />
                                                <h3 className="font-title text-2xl font-bold text-white">Visión de Futuro</h3>
                                            </div>
                                            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                                                {config?.vision ||
                                                    'Ser una carrera universitaria líder a nivel nacional e internacional, reconocida por la excelencia académica, la investigación científica y la contribución efectiva a la salud mental y transformación social.'}
                                            </p>
                                        </motion.div>
                                    )}

                                    {activeTab === 'valores' && (
                                        <motion.div
                                            key="valores"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                        >
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <h4 className="flex items-center gap-2 font-bold" style={{ color: primary }}>
                                                    <Shield className="h-4 w-4" /> Ética Profesional
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-300">
                                                    Confidencialidad, respeto a la dignidad humana y responsabilidad en cada intervención.
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <h4 className="flex items-center gap-2 font-bold" style={{ color: secondary }}>
                                                    <Lightbulb className="h-4 w-4" /> Rigor Científico
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-300">
                                                    Método empírico, actualización académica continua y pensamiento crítico.
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <h4 className="flex items-center gap-2 font-bold" style={{ color: primary }}>
                                                    <HeartHandshake className="h-4 w-4" /> Empatía y Escucha
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-300">
                                                    Comprensión activa y sensibilidad hacia las realidades del contexto comunitario.
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <h4 className="flex items-center gap-2 font-bold" style={{ color: secondary }}>
                                                    <Users className="h-4 w-4" /> Compromiso Social
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-300">
                                                    Aporte directo al desarrollo, salud mental y calidad de vida en El Alto y Bolivia.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 6. SECCIÓN CONVOCATORIAS OFICIALES (AFICHES Y COMUNICADOS APROBADOS)     */}
            {/* ========================================================================= */}
            <section id="convocatorias" className="relative overflow-hidden bg-slate-950 px-6 py-24 border-t border-white/5">
                <AmbientReactiveBackground primaryColor={primary} secondaryColor={secondary} density="medium" />

                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="mb-16 text-center" data-aos="fade-up">
                        <span
                            className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                            style={{
                                color: secondary,
                                backgroundColor: `${secondary}18`,
                                borderColor: `${secondary}44`,
                                borderWidth: 1,
                            }}
                        >
                            Comunicados Oficiales
                        </span>
                        <h2 className="font-title mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Convocatorias de Admisión
                        </h2>
                        <div
                            className="mx-auto mt-4 h-1 w-20 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            Infórmate sobre los periodos de inscripción, requisitos documentales y cronogramas de examen aprobados.
                        </p>
                    </div>

                    {convocatorias && convocatorias.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {convocatorias.map((c, idx) => {
                                const abierta = convocatoriaAbierta(c);
                                return (
                                    <div
                                        key={c.id}
                                        data-aos="fade-up"
                                        data-aos-delay={idx * 90}
                                        className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${secondary}80`;
                                            e.currentTarget.style.boxShadow = `0 20px 40px -10px ${primary}40`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Imagen o afiche si existe */}
                                        {c.archivo ? (
                                            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                                                <img
                                                    src={`/storage/${c.archivo}`}
                                                    alt={c.titulo}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                            </div>
                                        ) : (
                                            <div
                                                className="flex h-28 w-full items-center justify-center"
                                                style={{
                                                    background: `linear-gradient(135deg, ${primary}40, ${secondary}40)`,
                                                }}
                                            >
                                                <Megaphone className="h-10 w-10 text-slate-300 opacity-60" />
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col justify-between p-6">
                                            <div>
                                                <div className="mb-3 flex items-center justify-between gap-2">
                                                    <Badge
                                                        className={`font-mono-tag text-xs font-semibold uppercase ${
                                                            abierta
                                                                ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                                                                : 'border border-slate-600/40 bg-slate-700/40 text-slate-400'
                                                        }`}
                                                    >
                                                        {abierta ? '● Convocatoria Abierta' : 'Cerrada'}
                                                    </Badge>

                                                    {(c.fecha_inicio || c.fecha_fin) && (
                                                        <span className="font-mono-tag flex items-center gap-1.5 text-xs text-slate-400">
                                                            <CalendarDays className="h-3.5 w-3.5" style={{ color: secondary }} />
                                                            {c.fecha_fin ? formatoFecha(c.fecha_fin) : 'Vigente'}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-title text-xl font-bold text-white transition-colors">{c.titulo}</h3>

                                                {c.descripcion && (
                                                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">{c.descripcion}</p>
                                                )}
                                            </div>

                                            {/* Acciones de la Convocatoria */}
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                                                {c.link_video && (
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirVideo(c.link_video!)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-600/30"
                                                    >
                                                        <Play className="h-3.5 w-3.5 fill-current" /> Ver Video
                                                    </button>
                                                )}

                                                {c.archivo && (
                                                    <a
                                                        href={`/storage/${c.archivo}`}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                                                    >
                                                        <Download className="h-3.5 w-3.5" /> Descargar
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 py-12 text-center">
                            <Megaphone className="mx-auto mb-3 h-12 w-12 text-slate-500" />
                            <p className="font-medium text-slate-300">No hay convocatorias publicadas en este momento.</p>
                            <p className="mt-1 text-xs text-slate-500">Vuelve pronto para consultar el nuevo cronograma.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 7. SECCIÓN BIBLIOTECA DIGITAL (SIN BUSCADOR, CON BIBLIOTECARIA Y PDF)     */}
            {/* ========================================================================= */}
            <section id="biblioteca" className="relative overflow-hidden bg-slate-950 px-6 py-24 border-t border-white/5">
                <AmbientReactiveBackground primaryColor={primary} secondaryColor={secondary} density="medium" />

                <div className="relative z-10 mx-auto max-w-7xl">
                    {/* ENCABEZADO DE LA SECCIÓN */}
                    <div className="mb-10 text-center" data-aos="fade-up">
                        <span
                            className="font-mono-tag inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                            style={{
                                color: secondary,
                                backgroundColor: `${secondary}18`,
                                borderColor: `${secondary}44`,
                                borderWidth: 1,
                            }}
                        >
                            <Library className="h-3.5 w-3.5" />
                            Recursos Académicos Abiertos
                        </span>
                        <h2 className="font-title mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Biblioteca Digital & Guías de Admisión
                        </h2>
                        <div
                            className="mx-auto mt-4 h-1 w-20 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            Acceso libre y público a las guías de estudio oficiales de hasta 5 páginas elaboradas por los docentes de Psicología UPEA.
                        </p>
                    </div>

                    {/* LISTADO / GRILLA DIRECTA DE DOCUMENTOS PDF (CONECTADO DIRECTAMENTE SIN ESPACIOS GIGANTES) */}
                    {libros.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {libros.map((libro, idx) => (
                                <div
                                    key={libro.id}
                                    data-aos="fade-up"
                                    data-aos-delay={(idx % 4) * 70}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = `${secondary}80`;
                                        e.currentTarget.style.boxShadow = `0 15px 35px -5px ${primary}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* CABECERA VISUAL CON ICONO Y BADGE CLARO DE PDF */}
                                    <div
                                        className="relative flex h-52 w-full items-center justify-center overflow-hidden border-b border-white/5 p-4"
                                        style={{
                                            background: `linear-gradient(135deg, #030712 0%, #0f172a 60%, ${primary}25 100%)`,
                                        }}
                                    >
                                        {/* Insignia clara de PDF en la esquina superior izquierda */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold font-mono tracking-wider bg-rose-950/80 border border-rose-500/50 text-rose-300 shadow-lg backdrop-blur-md">
                                                <FileText className="h-3 w-3 text-rose-400" />
                                                PDF
                                            </span>
                                        </div>

                                        {/* Insignia de lectura rápida de 5 páginas */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="font-mono-tag inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 shadow-md backdrop-blur-md">
                                                ≤ 5 Págs
                                            </span>
                                        </div>

                                        {libro.portada ? (
                                            <img
                                                src={`/storage/${libro.portada}`}
                                                alt={libro.nombre}
                                                className="h-full max-h-44 rounded-lg object-contain shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            /* Portada estilizada oficial con emblema institucional */
                                            <div
                                                className="relative flex h-full w-36 flex-col justify-between overflow-hidden rounded-xl p-3 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                                style={{
                                                    background: `linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))`,
                                                    border: `1px solid rgba(255, 255, 255, 0.15)`,
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                                                }}
                                            >
                                                {/* Lomo izquierdo del libro */}
                                                <div
                                                    className="absolute top-0 bottom-0 left-0 w-2.5"
                                                    style={{
                                                        background: `linear-gradient(to right, ${primary}, ${secondary})`,
                                                    }}
                                                />

                                                {/* Marca de agua Psi */}
                                                <div className="pointer-events-none absolute right-1 bottom-1 font-serif text-6xl text-slate-800 opacity-40 select-none">
                                                    Ψ
                                                </div>

                                                <div className="relative z-1 pl-2">
                                                    <span
                                                        className="font-mono-tag block text-[9px] font-bold tracking-wider uppercase"
                                                        style={{ color: secondary }}
                                                    >
                                                        {libro.materia?.codigo || 'UPEA'}
                                                    </span>
                                                    <p className="font-title mt-1 line-clamp-3 text-[11px] leading-snug font-bold text-white">
                                                        {libro.nombre}
                                                    </p>
                                                </div>

                                                <div className="relative z-1 border-t border-white/10 pt-2 pl-2">
                                                    <p className="truncate text-[9px] text-slate-400">{libro.autor || 'Psicología UPEA'}</p>
                                                    <span className="font-mono-tag mt-0.5 block text-[8px] font-semibold text-emerald-400">
                                                        Guía Oficial
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENIDO DEL LIBRO */}
                                    <div className="flex flex-1 flex-col justify-between p-5">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <span
                                                    className="font-mono-tag rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase"
                                                    style={{
                                                        color: secondary,
                                                        backgroundColor: `${secondary}18`,
                                                        borderColor: `${secondary}44`,
                                                        borderWidth: 1,
                                                    }}
                                                >
                                                    {libro.materia?.codigo || 'PSI'}
                                                </span>
                                                <span className="truncate text-xs text-slate-400">{libro.materia?.nombre}</span>
                                            </div>

                                            <h3 className="font-title line-clamp-2 text-base leading-snug font-bold text-white transition-colors">
                                                {libro.nombre}
                                            </h3>

                                            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                                                <span>{libro.autor || 'Carrera de Psicología UPEA'}</span>
                                                {libro.anio_lanzamiento && <span>· {libro.anio_lanzamiento}</span>}
                                            </p>
                                        </div>

                                        {/* ACCIONES DEL LIBRO: VISTA PREVIA Y DESCARGA DIRECTA DE PDF */}
                                        <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                                            {libro.archivo ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirPdfLibro(libro)}
                                                        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                                        }}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Visualizar PDF
                                                    </button>
                                                    <a
                                                        href={`/storage/${libro.archivo}`}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-xl bg-white/10 p-2 text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
                                                        title="Descargar archivo PDF"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </>
                                            ) : (
                                                <div className="flex w-full items-center justify-between py-1 text-xs text-slate-400 italic">
                                                    <span className="flex items-center gap-1.5 text-[11px]">
                                                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                                        Lectura en digitalización
                                                    </span>
                                                    <span className="font-mono-tag text-[10px] text-slate-500">Pronto</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 py-16 text-center">
                            <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-500" />
                            <p className="font-medium text-slate-300">Las guías de estudio están siendo preparadas.</p>
                            <p className="mt-1 text-xs text-slate-500">Próximamente se publicará el nuevo material bibliográfico.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 8. SECCIÓN AUTORIDADES DE LA CARRERA                                      */}
            {/* ========================================================================= */}
            {autoridades && autoridades.length > 0 && (
                <section id="autoridades" className="relative overflow-hidden bg-slate-950 px-6 py-24 border-t border-white/5">
                    <AmbientReactiveBackground primaryColor={primary} secondaryColor={secondary} density="low" />

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <div className="mb-16 text-center" data-aos="fade-up">
                            <span
                                className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                                style={{
                                    color: primary,
                                    backgroundColor: `${primary}18`,
                                    borderColor: `${primary}44`,
                                    borderWidth: 1,
                                }}
                            >
                                Liderazgo Académico
                            </span>
                            <h2 className="font-title mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                                Autoridades de la Carrera
                            </h2>
                            <div
                                className="mx-auto mt-4 h-1 w-20 rounded-full"
                                style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                            />
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                                Equipo directivo comprometido con la excelencia pedagógica y el progreso institucional.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {autoridades.map((autoridad, idx) => (
                                <motion.div
                                    key={autoridad.id}
                                    data-aos="fade-up"
                                    data-aos-delay={idx * 100}
                                    whileHover={{ y: -6 }}
                                    transition={{ duration: 0.3 }}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl transition-all duration-300"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = `${primary}80`;
                                        e.currentTarget.style.boxShadow = `0 15px 35px -5px ${primary}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="p-7">
                                        {/* Foto de la Autoridad con aro dinámico */}
                                        <div className="relative mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full p-1 shadow-2xl">
                                            <div
                                                className="animate-spin-slow absolute inset-0 rounded-full opacity-75"
                                                style={{
                                                    background: `conic-gradient(from 0deg, ${primary}, ${secondary}, ${primary})`,
                                                }}
                                            />
                                            <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-950">
                                                {autoridad.foto ? (
                                                    <img
                                                        src={`/storage/${autoridad.foto}`}
                                                        alt={autoridad.nombre}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-900">
                                                        <GraduationCap className="h-14 w-14" style={{ color: primary }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <Badge
                                                variant="outline"
                                                className="font-mono-tag mb-2 text-xs font-semibold tracking-wider uppercase"
                                                style={{
                                                    color: secondary,
                                                    borderColor: `${secondary}44`,
                                                    backgroundColor: `${secondary}18`,
                                                }}
                                            >
                                                {autoridad.cargo}
                                            </Badge>
                                            <h3 className="font-title text-xl font-bold text-white transition-colors">{autoridad.nombre}</h3>

                                            {autoridad.mensaje && (
                                                <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                                                    <Quote className="mb-1 h-5 w-5 opacity-60" style={{ color: primary }} />
                                                    <p className="text-xs leading-relaxed text-slate-300 italic">"{autoridad.mensaje}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 9. ORGANIGRAMA INSTITUCIONAL                                              */}
            {/* ========================================================================= */}
            {config?.organigrama && (
                <section className="border-t border-white/10 bg-slate-950/60 px-6 py-20">
                    <div className="mx-auto max-w-5xl text-center" data-aos="fade-up">
                        <span className="font-mono-tag text-xs font-semibold tracking-wider text-slate-400 uppercase">Estructura Orgánica</span>
                        <h2 className="font-title mt-2 text-3xl font-bold text-white">Organigrama de la Carrera</h2>
                        <div
                            className="mx-auto mt-3 mb-8 h-1 w-16 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <div className="overflow-hidden rounded-3xl border border-white/15 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl">
                            <img
                                src={`/storage/${config.organigrama}`}
                                alt="Organigrama Institucional"
                                className="mx-auto max-h-[600px] w-full rounded-2xl object-contain"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* 10. CTA FINAL: PORTAL ACADÉMICO / AULA VIRTUAL                            */}
            {/* ========================================================================= */}
            <section
                id="portal-acceso"
                className="relative overflow-hidden border-t border-white/10 px-6 py-20 text-center"
                style={{
                    background: `linear-gradient(135deg, ${primary}99 0%, ${secondary}25 50%, #030712 100%)`,
                }}
            >
                <AmbientReactiveBackground primaryColor={primary} secondaryColor={secondary} density="low" />

                <div className="relative z-10 mx-auto max-w-3xl" data-aos="zoom-in">
                    <span
                        className="font-mono-tag mb-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                        style={{
                            color: secondary,
                            backgroundColor: `${secondary}20`,
                            borderColor: `${secondary}40`,
                            borderWidth: 1,
                        }}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Comunidad Académica UPEA
                    </span>
                    <h2 className="font-title text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        {user ? 'Continúa en tu Portal Académico' : 'Portal Académico & Sistema Digital'}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                        {user
                            ? 'Accede a tus asignaturas, entrega tus actividades pedagógicas y realiza el seguimiento de tu avance académico.'
                            : 'Accede al sistema con tus credenciales institucionales para ingresar a clases, revisar compendios bibliográficos y evaluaciones.'}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        {user ? (
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    className="h-13 cursor-pointer rounded-2xl px-8 text-base font-bold text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                    }}
                                >
                                    Ir a mi Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button
                                        size="lg"
                                        className="h-13 cursor-pointer rounded-2xl px-8 text-base font-bold text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
                                        style={{
                                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                        }}
                                    >
                                        Iniciar Sesión en el Aula <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => scrollTo('convocatorias')}
                                    className="flex h-13 cursor-pointer items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
                                >
                                    <Megaphone className="h-5 w-5" style={{ color: secondary }} />
                                    Consultar Convocatorias
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* 11. FOOTER INSTITUCIONAL REFINADO (SIN BOTÓN VERDE FLOTANTE DE CHAT)     */}
            {/* ========================================================================= */}
            <footer className="relative border-t border-white/10 bg-slate-950/95 text-sm text-slate-400 overflow-hidden">
                {/* Línea divisoria superior con gradiente dinámico */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: `linear-gradient(90deg, ${primary}, ${secondary}, #ffffff, ${secondary}, ${primary})`,
                    }}
                />

                <div className="relative z-10 mx-auto max-w-7xl px-6 py-14">
                    <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-4">
                        {/* 1. Logo e Identidad Proporcionada */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-3.5">
                                {config?.logo ? (
                                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-white/20 bg-slate-900/80 p-2 shadow-lg backdrop-blur-md">
                                        <img
                                            src={`/storage/${config.logo}`}
                                            alt="Logo Carrera de Psicología UPEA"
                                            className="h-full w-full object-contain filter drop-shadow"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl font-bold text-white shadow-md"
                                        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                    >
                                        <GraduationCap className="h-7 w-7" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-title text-lg font-bold text-white">Carrera de Psicología</h4>
                                    <p className="font-mono text-xs text-slate-400">Universidad Pública de El Alto</p>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                                Formando profesionales en el estudio del comportamiento humano, salud mental, psicometría y
                                transformación social con rigor científico y compromiso ético.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <MapPin className="h-4 w-4 shrink-0" style={{ color: secondary }} />
                                <span>Av. Sucre B, Zona Villa Esperanza — El Alto, La Paz, Bolivia</span>
                            </div>
                        </div>

                        {/* 2. Enlaces Rápidos a Secciones Reales */}
                        <div className="space-y-3">
                            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Navegación Rápida</h5>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => scrollTo('inicio')}
                                        className="hover:text-white transition-colors cursor-pointer text-left"
                                    >
                                        Inicio / Portadas
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => scrollTo('explora')}
                                        className="hover:text-white transition-colors cursor-pointer text-left"
                                    >
                                        Explora la Carrera
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => scrollTo('sobre-nosotros')}
                                        className="hover:text-white transition-colors cursor-pointer text-left"
                                    >
                                        Misión & Visión
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => scrollTo('convocatorias')}
                                        className="hover:text-white transition-colors cursor-pointer text-left"
                                    >
                                        Convocatorias Oficiales
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => scrollTo('biblioteca')}
                                        className="hover:text-white transition-colors cursor-pointer text-left"
                                    >
                                        Biblioteca Digital
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => scrollTo('autoridades')}
                                        className="hover:text-white transition-colors cursor-pointer text-left"
                                    >
                                        Autoridades
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* 3. Acceso Institucional y Derechos */}
                        <div className="space-y-3">
                            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Acceso al Sistema</h5>
                            <p className="text-xs text-slate-400">
                                Plataforma académica oficial para estudiantes, docentes y personal administrativo.
                            </p>
                            <div>
                                {user ? (
                                    <Link href="/dashboard">
                                        <Button
                                            size="sm"
                                            className="rounded-xl px-4 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                                            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                        >
                                            Ir al Dashboard <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/login">
                                        <Button
                                            size="sm"
                                            className="rounded-xl px-4 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                                            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                        >
                                            Iniciar Sesión <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="pt-3 border-t border-white/10 text-xs text-slate-500">
                                <p>© {new Date().getFullYear()} Carrera de Psicología UPEA.</p>
                                <p className="mt-0.5">Todos los derechos reservados.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ========================================================================= */}
            {/* 12. MODAL DE VIDEO DE CONVOCATORIA                                        */}
            {/* ========================================================================= */}
            <Dialog open={modalVideo} onOpenChange={setModalVideo}>
                <DialogContent className="border border-white/20 bg-slate-950 text-white sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-title text-xl text-white">Video Informativo de la Convocatoria</DialogTitle>
                    </DialogHeader>
                    {videoUrl && (
                        <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                            <iframe
                                src={videoUrl}
                                className="aspect-video w-full"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                title="Video Convocatoria"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ========================================================================= */}
            {/* 13. MODAL DE VISTA PREVIA PDF DE LIBROS Y GUÍAS                           */}
            {/* ========================================================================= */}
            <Dialog open={modalPdf} onOpenChange={setModalPdf}>
                <DialogContent className="flex h-[88vh] flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-950 p-0 text-white shadow-2xl sm:max-w-5xl">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 bg-slate-900/90 p-4 sm:p-5">
                        <div className="flex items-center gap-3 pr-4">
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor: `${secondary}20`,
                                    borderColor: `${secondary}50`,
                                    borderWidth: 1,
                                    color: secondary,
                                }}
                            >
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="truncate text-base leading-tight font-bold text-white sm:text-lg">
                                    {libroSeleccionado?.nombre}
                                </DialogTitle>
                                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                    <span className="font-mono-tag" style={{ color: secondary }}>
                                        {libroSeleccionado?.materia?.codigo} · {libroSeleccionado?.materia?.nombre}
                                    </span>
                                    {libroSeleccionado?.autor && <span>· {libroSeleccionado.autor}</span>}
                                    <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-400">
                                        Guía de lectura oficial (≤ 5 págs)
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {libroSeleccionado?.archivo && (
                                <a
                                    href={`/storage/${libroSeleccionado.archivo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                                    title="Abrir en pestaña nueva"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pestaña nueva</span>
                                </a>
                            )}
                            {libroSeleccionado?.archivo && (
                                <a
                                    href={`/storage/${libroSeleccionado.archivo}`}
                                    download
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors hover:opacity-90"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                    }}
                                    title="Descargar PDF"
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Descargar</span>
                                </a>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="relative w-full flex-1 bg-slate-900/60">
                        {libroSeleccionado?.archivo ? (
                            <iframe
                                src={`/storage/${libroSeleccionado.archivo}#toolbar=1&navpanes=0`}
                                className="h-full w-full border-0"
                                title={libroSeleccionado.nombre}
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                <BookOpen className="mb-4 h-16 w-16 animate-bounce text-slate-600" />
                                <h4 className="text-lg font-bold text-white">Documento en proceso de digitalización</h4>
                                <p className="mt-2 max-w-md text-sm text-slate-400">
                                    El documento PDF para "{libroSeleccionado?.nombre}" está siendo cargado por el comité de admisión.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
