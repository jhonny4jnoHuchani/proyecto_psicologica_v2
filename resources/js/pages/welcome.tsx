import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Download,
    Eye,
    ExternalLink,
    GraduationCap,
    HeartHandshake,
    Lightbulb,
    MapPin,
    Megaphone,
    MessageCircle,
    Play,
    Quote,
    Share2,
    Shield,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';

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

interface Props {
    config: ConfigData | null;
    portadas: Portada[];
    autoridades: Autoridad[];
    convocatorias: Convocatoria[];
    user: { id: number; nombre: string; apellido_paterno: string; apellido_materno: string; } | null;
}

// Helpers de colores dinámicos
const tint = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, white)`;
const shade = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, black)`;
const alpha = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, transparent)`;

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

const EXPLORA_CARDS = [
    {
        title: 'Admisión & Convocatorias',
        subtitle: 'Proceso oficial y cronograma',
        description: 'Conoce los requisitos, fechas clave y publicaciones oficiales para el curso preuniversitario de Psicología.',
        icon: GraduationCap,
        badge: 'Oficial',
        targetId: 'convocatorias',
    },
    {
        title: 'Aula Virtual & Refuerzo IA',
        subtitle: 'Tecnología pedagógica',
        description: 'Accede a tus lecciones digitales, entrega de tareas, evaluaciones y acompañamiento cognitivo personalizado.',
        icon: Sparkles,
        badge: 'Innovación',
        targetId: 'inicio',
    },
    {
        title: 'Biblioteca Especializada',
        subtitle: 'Material bibliográfico',
        description: 'Guías de estudio, textos de psicología general, neuroanatomía, epistemología y razonamiento crítico.',
        icon: BookOpen,
        badge: 'Recursos',
        targetId: 'explora',
    },
    {
        title: 'Orientación Vocacional',
        subtitle: 'Acompañamiento integral',
        description: 'Gabinete y talleres de orientación sobre las ramas clínicas, educativas, organizacionales y forenses.',
        icon: Target,
        badge: 'Vocación',
        targetId: 'sobre-nosotros',
    },
    {
        title: 'Cuerpo Docente de Excelencia',
        subtitle: 'Docentes especialistas',
        description: 'Profesionales altamente capacitados con trayectoria académica y vocación de enseñanza universitaria.',
        icon: Users,
        badge: 'Calidad',
        targetId: 'autoridades',
    },
    {
        title: 'Campus Universitario UPEA',
        subtitle: 'Infraestructura y comunidad',
        description: 'Instalaciones equipadas en Villa Esperanza, ambientes de estudio y vida universitaria comunitaria.',
        icon: MapPin,
        badge: 'El Alto',
        targetId: 'sobre-nosotros',
    },
];

export default function Welcome({ config, portadas, autoridades, convocatorias, user }: Props) {
    const primary = config?.color_primario || '#4f46e5';
    const secondary = config?.color_secundario || '#06b6d4';
    const lema = config?.lema || 'Formando Psicólogos para el Futuro';

    const [modalVideo, setModalVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTab, setActiveTab] = useState<'mision' | 'vision' | 'valores'>('mision');

    const abrirVideo = (link: string) => {
        const embedUrl = convertirLinkAEmbed(link);
        if (embedUrl) {
            setVideoUrl(embedUrl);
            setModalVideo(true);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 40 });
    }, []);

    // Slider automático de portadas
    useEffect(() => {
        if (!portadas || portadas.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % portadas.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [portadas]);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="font-body min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
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

            {/* ==================== NAVBAR ESTILO CRISTAL ==================== */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl transition-all">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
                    {/* Logo e Identidad */}
                    <Link href="/" className="flex items-center gap-3.5 group">
                        {config?.logo ? (
                            <div className="relative">
                                <div
                                    className="absolute -inset-1 rounded-full blur-md opacity-50 group-hover:opacity-90 transition-opacity"
                                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                />
                                <img
                                    src={`/storage/${config.logo}`}
                                    alt="Logo Institucional"
                                    className="relative h-11 w-11 rounded-full object-contain bg-white p-1 shadow-md"
                                />
                            </div>
                        ) : (
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg text-white font-bold text-lg"
                                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                            >
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div className="leading-tight">
                            <p className="font-title text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                                Psicología UPEA
                            </p>
                            <p className="font-mono-tag text-[11px] uppercase tracking-wider text-slate-400">
                                Preuniversitario Académico
                            </p>
                        </div>
                    </Link>

                    {/* Enlaces de Navegación (Desktop) */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
                        <button
                            type="button"
                            onClick={() => scrollTo('inicio')}
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Inicio
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('explora')}
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Explora
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('sobre-nosotros')}
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Nosotros
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('convocatorias')}
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Convocatorias
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('autoridades')}
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            Autoridades
                        </button>
                    </nav>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard">
                                <Button
                                    className="font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 rounded-xl px-5"
                                    style={{
                                        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                    }}
                                >
                                    Mi Aula Virtual <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        className="text-slate-200 hover:text-white hover:bg-white/10 rounded-xl"
                                    >
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href="/register" className="hidden sm:inline-block">
                                    <Button
                                        className="text-white font-semibold shadow-md rounded-xl px-4 transition-transform hover:scale-105 active:scale-95"
                                        style={{
                                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                        }}
                                    >
                                        Inscribirme
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ==================== HERO SECTION (Inspirado en Gas y Petroquímica) ==================== */}
            <section
                id="inicio"
                className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-24"
            >
                {/* 1. SLIDER PANORÁMICO DE PORTADAS */}
                <div className="absolute inset-0 z-0">
                    {portadas && portadas.length > 0 ? (
                        portadas.map((portada, index) => (
                            <div
                                key={portada.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                    index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                }`}
                                style={{ transition: 'opacity 1.2s ease-in-out, transform 8s ease-out' }}
                            >
                                <img
                                    src={`/storage/${portada.imagen}`}
                                    alt={portada.titulo || `Portada ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))
                    ) : (
                        <div
                            className="w-full h-full"
                            style={{
                                background: `radial-gradient(ellipse at 30% 20%, ${primary}35 0%, #060914 80%)`,
                            }}
                        />
                    )}
                </div>

                {/* 2. PELÍCULA GRADIENTE OSCURA Y AURAS DE MARCA */}
                <div
                    className="absolute inset-0 z-1 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.65) 0%, rgba(6, 9, 20, 0.88) 60%, #030712 100%)',
                    }}
                />

                {/* Auras de color dinámicas */}
                <div
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none z-1"
                    style={{ background: `${primary}35` }}
                />
                <div
                    className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[130px] pointer-events-none z-1"
                    style={{ background: `${secondary}30` }}
                />

                {/* 3. ELEMENTOS GEOMÉTRICOS FLOTANTES (PageDecorators) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-2">
                    <img
                        src="/decoradores/circulo.png"
                        alt=""
                        className="absolute top-16 left-8 w-16 sm:w-20 opacity-40 animate-[floatSlow_8s_ease-in-out_infinite]"
                    />
                    <img
                        src="/decoradores/objeto.png"
                        alt=""
                        className="absolute top-1/4 right-8 w-14 sm:w-16 opacity-35 animate-[floatSlowReverse_9s_ease-in-out_infinite]"
                    />
                    <img
                        src="/decoradores/decoradores2/objeto_puntueado.png"
                        alt=""
                        className="absolute bottom-28 left-12 w-20 sm:w-24 opacity-35 animate-[floatSlow_11s_ease-in-out_infinite]"
                    />
                    <img
                        src="/decoradores/redondo_punteuado5.png"
                        alt=""
                        className="absolute top-20 right-1/4 w-14 sm:w-16 opacity-35 animate-[floatSlow_10s_ease-in-out_infinite]"
                    />
                    <img
                        src="/decoradores/cuadrado_punteado_rojo.png"
                        alt=""
                        className="absolute bottom-24 right-16 w-14 opacity-30 animate-[floatSlowReverse_12s_ease-in-out_infinite]"
                    />
                </div>

                {/* 4. CONTENIDO PRINCIPAL HERO */}
                <div className="relative z-10 mx-auto max-w-5xl px-6 text-center flex flex-col items-center">
                    {/* Emblema / Logo Institucional Pulsante */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="relative mb-6"
                    >
                        <div
                            className="absolute -inset-3 rounded-full blur-xl opacity-75 animate-pulse"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                        />
                        <div
                            className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-white p-2.5 shadow-2xl flex items-center justify-center overflow-hidden"
                            style={{ border: `5px solid ${primary}` }}
                        >
                            {config?.logo ? (
                                <img
                                    src={`/storage/${config.logo}`}
                                    alt="Logo UPEA Psicología"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <GraduationCap className="h-16 w-16 text-indigo-600" />
                            )}
                        </div>
                    </motion.div>

                    {/* Insignia de Admisión */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <span
                            className="font-mono-tag inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-md shadow-inner text-indigo-300"
                            style={{ borderColor: `${primary}55` }}
                        >
                            <Sparkles className="h-4 w-4 text-cyan-400" /> Admisión Preuniversitaria · Carrera de Psicología
                        </span>
                    </motion.div>

                    {/* TÍTULO PRINCIPAL DE IMPACTO */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="font-title mt-6 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl uppercase"
                    >
                        CARRERA DE <span style={{ color: secondary }}>PSICOLOGÍA</span>
                        <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-normal text-slate-300 mt-2">
                            UNIVERSIDAD PÚBLICA DE EL ALTO
                        </span>
                    </motion.h1>

                    {/* LEMA INSTITUCIONAL */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-6 max-w-2xl text-base sm:text-xl font-normal leading-relaxed text-slate-200 drop-shadow-md"
                    >
                        "{lema}"
                    </motion.p>

                    {/* BOTONES DE ACCIÓN HERO */}
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
                                    className="h-13 px-8 text-base font-bold text-white shadow-2xl rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
                                        className="h-13 px-8 text-base font-bold text-white shadow-2xl rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                        style={{
                                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                                        }}
                                    >
                                        Aula Virtual / Iniciar Sesión <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => scrollTo('convocatorias')}
                                    className="h-13 px-7 text-base font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                                >
                                    <Megaphone className="h-5 w-5 text-cyan-400" />
                                    Ver Convocatorias
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* INDICADORES DEL SLIDER DE PORTADAS */}
                    {portadas && portadas.length > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-2.5">
                            {portadas.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        index === currentSlide ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-500/50' : 'w-2.5 bg-white/40 hover:bg-white/70'
                                    }`}
                                    aria-label={`Ir a portada ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* SCROLL INDICATOR ANIMADO */}
                <motion.button
                    type="button"
                    onClick={() => scrollTo('explora')}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer z-10 opacity-80 hover:opacity-100"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className="font-mono-tag text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                        Descubre más
                    </span>
                    <ChevronDown className="h-5 w-5 text-cyan-400" />
                </motion.button>
            </section>

            {/* ==================== SECCIÓN EXPLORA NUESTRA CARRERA ==================== */}
            <section
                id="explora"
                className="relative py-24 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 10% 20%, ${primary}18 0%, transparent 60%), radial-gradient(circle at 90% 80%, ${secondary}15 0%, transparent 60%)`,
                    }}
                />

                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <span
                            className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/40"
                        >
                            Plataforma & Ecosistema
                        </span>
                        <h2 className="font-title mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                            Explora la Carrera de Psicología
                        </h2>
                        <div
                            className="mx-auto mt-4 h-1 w-20 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <p className="mt-4 max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
                            Una experiencia formativa de vanguardia que combina ciencia del comportamiento, acompañamiento docente y tecnología educativa en la UPEA.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {EXPLORA_CARDS.map((card, idx) => {
                            const IconComponent = card.icon;
                            return (
                                <motion.div
                                    key={card.title}
                                    data-aos="fade-up"
                                    data-aos-delay={idx * 80}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => scrollTo(card.targetId)}
                                    className="group relative rounded-3xl p-7 bg-slate-900/60 hover:bg-slate-800/70 border border-white/10 hover:border-cyan-500/40 shadow-xl backdrop-blur-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                                >
                                    {/* Acento de brillo en hover */}
                                    <div
                                        className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"
                                        style={{ background: idx % 2 === 0 ? primary : secondary }}
                                    />

                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <div
                                                className="flex h-13 w-13 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:rotate-6"
                                                style={{
                                                    background:
                                                        idx % 2 === 0
                                                            ? `linear-gradient(135deg, ${primary}, ${secondary})`
                                                            : `linear-gradient(135deg, ${secondary}, ${primary})`,
                                                }}
                                            >
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="border-white/15 bg-white/5 text-slate-300 font-mono-tag text-[11px]"
                                            >
                                                {card.badge}
                                            </Badge>
                                        </div>

                                        <p className="font-mono-tag text-xs font-semibold uppercase tracking-wider text-cyan-400">
                                            {card.subtitle}
                                        </p>
                                        <h3 className="font-title mt-1 text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                                            {card.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-400">
                                            {card.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors">
                                        <span>Conocer más</span>
                                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ==================== SECCIÓN SOBRE NOSOTROS (Misión, Visión, Valores) ==================== */}
            <section
                id="sobre-nosotros"
                className="relative py-24 px-6 bg-slate-950 overflow-hidden"
            >
                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Columna Izquierda: Introducción y Métricas */}
                        <div className="lg:col-span-5" data-aos="fade-right">
                            <span
                                className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/40"
                            >
                                Identidad & Compromiso
                            </span>
                            <h2 className="font-title mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                Formación Científica y Sensibilidad Social
                            </h2>
                            <p className="mt-5 text-slate-300 text-base leading-relaxed">
                                La Carrera de Psicología de la Universidad Pública de El Alto prepara profesionales líderes orientados a la investigación, intervención clínica, comunitaria y educativa para responder a las necesidades de la sociedad boliviana.
                            </p>

                            {/* Tarjetas de Estadísticas / Indicadores */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="font-title text-3xl font-extrabold text-cyan-400">100%</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Docentes Especialistas</p>
                                </div>
                                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="font-title text-3xl font-extrabold text-indigo-400">+5</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Áreas de Especialidad</p>
                                </div>
                                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="font-title text-3xl font-extrabold text-teal-400">24/7</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Aula Virtual & Recursos</p>
                                </div>
                                <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="font-title text-3xl font-extrabold text-amber-400">UPEA</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Acreditación Pública</p>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Tabs interactivos Misión / Visión / Valores */}
                        <div className="lg:col-span-7" data-aos="fade-left">
                            <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl">
                                {/* Botones de Pestaña */}
                                <div className="flex flex-wrap gap-2 pb-6 border-b border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('mision')}
                                        className={`px-5 py-2.5 rounded-xl font-title font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                                            activeTab === 'mision'
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Target className="h-4 w-4" /> Nuestra Misión
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('vision')}
                                        className={`px-5 py-2.5 rounded-xl font-title font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                                            activeTab === 'vision'
                                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Eye className="h-4 w-4" /> Nuestra Visión
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('valores')}
                                        className={`px-5 py-2.5 rounded-xl font-title font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                                            activeTab === 'valores'
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Shield className="h-4 w-4" /> Valores y Ética
                                    </button>
                                </div>

                                {/* Contenido de la Pestaña */}
                                <div className="pt-6 min-h-[260px] flex flex-col justify-center">
                                    {activeTab === 'mision' && (
                                        <motion.div
                                            key="mision"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center gap-3 text-indigo-400">
                                                <Target className="h-8 w-8" />
                                                <h3 className="font-title text-2xl font-bold text-white">
                                                    Misión Institucional
                                                </h3>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
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
                                            <div className="flex items-center gap-3 text-cyan-400">
                                                <Eye className="h-8 w-8" />
                                                <h3 className="font-title text-2xl font-bold text-white">
                                                    Visión de Futuro
                                                </h3>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
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
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                        >
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                                                    <Shield className="h-4 w-4" /> Ética Profesional
                                                </h4>
                                                <p className="text-xs text-slate-300 mt-1">
                                                    Confidencialidad, respeto a la dignidad humana y responsabilidad en cada intervención.
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4" /> Rigor Científico
                                                </h4>
                                                <p className="text-xs text-slate-300 mt-1">
                                                    Método empírico, actualización académica continua y pensamiento crítico.
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <h4 className="font-bold text-indigo-300 flex items-center gap-2">
                                                    <HeartHandshake className="h-4 w-4" /> Empatía y Escucha
                                                </h4>
                                                <p className="text-xs text-slate-300 mt-1">
                                                    Comprensión activa y sensibilidad hacia las realidades del contexto comunitario.
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                                                    <Users className="h-4 w-4" /> Compromiso Social
                                                </h4>
                                                <p className="text-xs text-slate-300 mt-1">
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

            {/* ==================== SECCIÓN CONVOCATORIAS Y AVISOS ==================== */}
            <section
                id="convocatorias"
                className="relative py-24 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
            >
                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <span
                            className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/40"
                        >
                            Comunicados Oficiales
                        </span>
                        <h2 className="font-title mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                            Convocatorias de Admisión
                        </h2>
                        <div
                            className="mx-auto mt-4 h-1 w-20 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <p className="mt-4 max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
                            Infórmate sobre los periodos de inscripción, requisitos documentales y cronogramas de examen aprobados.
                        </p>
                    </div>

                    {convocatorias && convocatorias.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {convocatorias.map((c, idx) => {
                                const abierta = convocatoriaAbierta(c);
                                return (
                                    <div
                                        key={c.id}
                                        data-aos="fade-up"
                                        data-aos-delay={idx * 90}
                                        className="group rounded-3xl bg-slate-900/70 border border-white/10 hover:border-amber-500/40 shadow-xl backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-2xl hover:-translate-y-1"
                                    >
                                        {/* Imagen o afiche si existe */}
                                        {c.archivo ? (
                                            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                                                <img
                                                    src={`/storage/${c.archivo}`}
                                                    alt={c.titulo}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                            </div>
                                        ) : (
                                            <div
                                                className="h-28 w-full flex items-center justify-center"
                                                style={{
                                                    background: `linear-gradient(135deg, ${primary}40, ${secondary}40)`,
                                                }}
                                            >
                                                <Megaphone className="h-10 w-10 text-slate-300 opacity-60" />
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <Badge
                                                        className={`font-mono-tag text-xs font-semibold uppercase ${
                                                            abierta
                                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                                : 'bg-slate-700/40 text-slate-400 border border-slate-600/40'
                                                        }`}
                                                    >
                                                        {abierta ? '● Convocatoria Abierta' : 'Cerrada'}
                                                    </Badge>

                                                    {(c.fecha_inicio || c.fecha_fin) && (
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-tag">
                                                            <CalendarDays className="h-3.5 w-3.5 text-cyan-400" />
                                                            {c.fecha_fin ? formatoFecha(c.fecha_fin) : 'Vigente'}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-title text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                                                    {c.titulo}
                                                </h3>

                                                {c.descripcion && (
                                                    <p className="mt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">
                                                        {c.descripcion}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Acciones de la Convocatoria */}
                                            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                                                {c.link_video && (
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirVideo(c.link_video!)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors cursor-pointer"
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
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors ml-auto"
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
                        <div className="text-center py-12 rounded-3xl bg-white/5 border border-white/10 max-w-xl mx-auto">
                            <Megaphone className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                            <p className="text-slate-300 font-medium">No hay convocatorias publicadas en este momento.</p>
                            <p className="text-xs text-slate-500 mt-1">Vuelve pronto para consultar el nuevo cronograma.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== SECCIÓN AUTORIDADES ACADÉMICAS ==================== */}
            {autoridades && autoridades.length > 0 && (
                <section
                    id="autoridades"
                    className="relative py-24 px-6 bg-slate-950 overflow-hidden"
                >
                    <div className="mx-auto max-w-7xl relative z-10">
                        <div className="text-center mb-16" data-aos="fade-up">
                            <span
                                className="font-mono-tag inline-block rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/40"
                            >
                                Liderazgo Académico
                            </span>
                            <h2 className="font-title mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                                Autoridades de la Carrera
                            </h2>
                            <div
                                className="mx-auto mt-4 h-1 w-20 rounded-full"
                                style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                            />
                            <p className="mt-4 max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
                                Equipo directivo comprometido con la excelencia pedagógica y el progreso institucional.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {autoridades.map((autoridad, idx) => (
                                <motion.div
                                    key={autoridad.id}
                                    data-aos="fade-up"
                                    data-aos-delay={idx * 100}
                                    whileHover={{ y: -8 }}
                                    transition={{ duration: 0.3 }}
                                    className="group rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/50 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col justify-between"
                                >
                                    <div className="p-7">
                                        {/* Foto de la Autoridad con aro dinámico */}
                                        <div className="relative mx-auto mb-6 h-36 w-36 rounded-full p-1 shadow-2xl overflow-hidden">
                                            <div
                                                className="absolute inset-0 rounded-full animate-spin-slow opacity-75"
                                                style={{
                                                    background: `conic-gradient(from 0deg, ${primary}, ${secondary}, ${primary})`,
                                                }}
                                            />
                                            <div className="relative h-full w-full rounded-full overflow-hidden bg-slate-950">
                                                {autoridad.foto ? (
                                                    <img
                                                        src={`/storage/${autoridad.foto}`}
                                                        alt={autoridad.nombre}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-slate-900">
                                                        <GraduationCap className="h-14 w-14 text-indigo-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <Badge
                                                variant="outline"
                                                className="font-mono-tag text-xs font-semibold uppercase tracking-wider text-cyan-300 border-cyan-500/30 bg-cyan-950/40 mb-2"
                                            >
                                                {autoridad.cargo}
                                            </Badge>
                                            <h3 className="font-title text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                                {autoridad.nombre}
                                            </h3>

                                            {autoridad.mensaje && (
                                                <div className="mt-4 relative p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                                                    <Quote className="h-5 w-5 text-indigo-400 opacity-60 mb-1" />
                                                    <p className="text-xs text-slate-300 italic leading-relaxed">
                                                        "{autoridad.mensaje}"
                                                    </p>
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

            {/* ==================== ORGANIGRAMA INSTITUCIONAL ==================== */}
            {config?.organigrama && (
                <section className="py-20 px-6 bg-slate-950/60 border-t border-white/10">
                    <div className="mx-auto max-w-5xl text-center" data-aos="fade-up">
                        <span className="font-mono-tag text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Estructura Orgánica
                        </span>
                        <h2 className="font-title mt-2 text-3xl font-bold text-white">Organigrama de la Carrera</h2>
                        <div
                            className="mx-auto mt-3 mb-8 h-1 w-16 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                        />
                        <div className="rounded-3xl p-4 bg-slate-900/80 border border-white/15 shadow-2xl backdrop-blur-xl overflow-hidden">
                            <img
                                src={`/storage/${config.organigrama}`}
                                alt="Organigrama Institucional"
                                className="w-full rounded-2xl object-contain max-h-[600px] mx-auto"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ==================== CTA FINAL ==================== */}
            {!user && (
                <section
                    className="relative py-20 px-6 text-center overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${primary}cc, #030712 90%)`,
                    }}
                >
                    <div className="mx-auto max-w-3xl relative z-10" data-aos="zoom-in">
                        <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                            ¿Listo para iniciar tu camino en la Psicología?
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed">
                            Asegura tu participación en el curso preuniversitario, accede al material exclusivo y prepárate con los mejores docentes.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-13 px-8 text-base font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-2xl rounded-2xl transition-transform hover:scale-105 active:scale-95"
                                >
                                    Inscribirme Ahora <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="h-13 px-6 text-base font-semibold text-white hover:bg-white/15 rounded-2xl"
                                >
                                    Ya tengo una cuenta
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ==================== BOTONES SOCIALES FLOTANTES (Como en Gas y Petroquímica) ==================== */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <a
                    href="https://wa.me/59170000000?text=Hola,%20deseo%20informaci%C3%B3n%20sobre%20el%20preuniversitario%20de%20Psicolog%C3%ADa%20UPEA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
                    title="Contacto WhatsApp"
                >
                    <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                </a>
            </div>

            {/* ==================== FOOTER INSTITUCIONAL ==================== */}
            <footer className="border-t border-white/10 bg-slate-950 py-14 text-slate-400 text-sm">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                        {/* Logo y descripción */}
                        <div className="flex items-center gap-3.5">
                            {config?.logo ? (
                                <img
                                    src={`/storage/${config.logo}`}
                                    alt="Logo"
                                    className="h-12 w-12 rounded-2xl bg-white p-1 object-contain shadow-md"
                                />
                            ) : (
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold"
                                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                >
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                            )}
                            <div>
                                <p className="font-title text-base font-bold text-white">Carrera de Psicología</p>
                                <p className="text-xs text-slate-400 font-mono-tag">Universidad Pública de El Alto</p>
                            </div>
                        </div>

                        {/* Ubicación y Contacto */}
                        <div className="flex flex-col gap-2 text-xs sm:text-sm">
                            <p className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                                Av. Sucre B, Zona Villa Esperanza — El Alto, La Paz, Bolivia
                            </p>
                            <p className="text-slate-400">
                                Área de Ciencias de la Salud / Área Social · Campus Central UPEA
                            </p>
                        </div>

                        {/* Derechos reservados y enlaces */}
                        <div className="text-left md:text-right text-xs text-slate-500">
                            <p className="text-slate-400">
                                © {new Date().getFullYear()} Preuniversitario de Psicología UPEA
                            </p>
                            <p className="mt-1">Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ==================== MODAL VIDEO DE CONVOCATORIA ==================== */}
            <Dialog open={modalVideo} onOpenChange={setModalVideo}>
                <DialogContent className="sm:max-w-3xl bg-slate-950 border border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-title text-xl text-white">Video Informativo de la Convocatoria</DialogTitle>
                    </DialogHeader>
                    {videoUrl && (
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-2">
                            <iframe
                                src={videoUrl}
                                className="w-full aspect-video"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                title="Video Convocatoria"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
