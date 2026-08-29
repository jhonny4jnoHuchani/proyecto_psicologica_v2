import { useEffect, useState } from 'react';
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
    ChevronRight,
    GraduationCap,
    Megaphone,
    Quote,
    Sparkles,
    Target,
    Eye,
    MapPin,
    Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ConfigData {
    color_primario: string;
    color_secundario: string;
    logo: string | null;
    mision: string | null;
    vision: string | null;
    lema: string | null;
    organigrama: string | null;
}

interface Portada { id: number; titulo: string | null; imagen: string; orden: number; }
interface Autoridad { id: number; nombre: string; cargo: string; foto: string | null; mensaje: string | null; }
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

// --- Color helpers: derive tints, shades and translucent variants from the
// institution's own primary/secondary colors instead of hardcoding a palette.
const tint = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, white)`;
const shade = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, black)`;
const alpha = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, transparent)`;

const RUTA_INGRESO = [
    { titulo: 'Inscripción', detalle: 'Crea tu cuenta en la plataforma y elige tu horario de preparación.' },
    { titulo: 'Preparación', detalle: 'Avanza por módulos de razonamiento, biología y ciencias sociales con docentes especialistas.' },
    { titulo: 'Simulacros', detalle: 'Rinde exámenes cronometrados con el mismo formato y nivel de exigencia del examen real.' },
    { titulo: 'Examen de admisión', detalle: 'Preséntate el día del examen con la práctica y confianza que construiste en el camino.' },
];

const formatFecha = (fecha: string | null) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
};

const convocatoriaAbierta = (c: Convocatoria) => {
    if (!c.fecha_fin) return true;
    const fin = new Date(`${c.fecha_fin}T23:59:59`);
    return fin.getTime() >= Date.now();
};


const convertirLinkAEmbed = (link: string): string | null => {
    try {
        const url = new URL(link);

        // YouTube watch
        if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
            const videoId = url.searchParams.get('v');
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        // YouTube Shorts
        if (url.hostname.includes('youtube.com') && url.pathname.includes('/shorts/')) {
            const shortId = url.pathname.split('/shorts/')[1]?.split('/')[0];
            if (shortId) return `https://www.youtube.com/embed/${shortId}`;
        }

        // youtu.be
        if (url.hostname === 'youtu.be') {
            const videoId = url.pathname.slice(1);
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        return null;
    } catch {
        return null;
    }
};

const getYoutubeThumbnail = (link: string): string | null => {
    try {
        const url = new URL(link);
        let videoId: string | null = null;

        if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
            videoId = url.searchParams.get('v');
        }
        if (url.hostname.includes('youtube.com') && url.pathname.includes('/shorts/')) {
            videoId = url.pathname.split('/shorts/')[1]?.split('/')[0] || null;
        }
        if (url.hostname === 'youtu.be') {
            videoId = url.pathname.slice(1);
        }

        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return null;
    } catch {
        return null;
    }
};

export default function Welcome({ config, portadas, autoridades, convocatorias, user }: Props) {
    const primary = config?.color_primario || '#4f46e5';
    const secondary = config?.color_secundario || '#06b6d4';
    const lema = config?.lema || 'Formando Psicólogos para el Futuro';
    const portada = portadas && portadas.length > 0 ? portadas[0] : null;

    const [modalVideo, setModalVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const abrirVideo = (link: string) => {
        const embedUrl = convertirLinkAEmbed(link);
        if (embedUrl) {
            setVideoUrl(embedUrl);
            setModalVideo(true);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 40 });
    }, []);

    return (
        <div className="font-body min-h-screen bg-white text-neutral-900">
            <Head title="Preuniversitario de Psicología - UPEA">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    .font-display { font-family: 'Newsreader', ui-serif, Georgia, serif; font-optical-sizing: auto; }
                    .font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
                    .font-mono-ui { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
                `}</style>
            </Head>






            {/* ==================== NAVBAR ==================== */}
            <nav className="sticky top-0 z-50 border-b border-neutral-100 bg-white/85 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        {/*aqui se muestra el logo del sibe bar*/}
                        {config?.logo ? (
                            <img src={`/storage/${config.logo}`} alt="Logo institucional" className="h-11 w-11 object-contain" />
                        ) : (
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
                                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                            >
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div className="leading-tight">
                            <p className="font-display text-[17px] font-medium">Preuniversitario de Psicología</p>
                            <p className="font-mono-ui text-[11px] uppercase tracking-wide text-neutral-400">UPEA · Carrera de Psicología</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard">
                                <Button className="text-white shadow-sm hover:opacity-90" style={{ backgroundColor: primary }}>
                                    Ir al Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Iniciar sesión</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>





















            {/* ==================== HERO ==================== */}
            <section
                className="relative overflow-hidden"
                style={{ background: `linear-gradient(165deg, ${tint(primary, 92)} 0%, ${tint(secondary, 94)} 55%, #ffffff 100%)` }}
            >
                <div
                    className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full blur-3xl"
                    style={{ background: alpha(secondary, 30) }}
                />
                <div
                    className="pointer-events-none absolute top-40 -left-24 h-72 w-72 rounded-full blur-3xl"
                    style={{ background: alpha(primary, 20) }}
                />

                <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pt-14 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-28">
                    <div data-aos="fade-up">
                        <span
                            className="font-mono-ui inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] tracking-wide uppercase"
                            style={{ borderColor: alpha(primary, 35), color: shade(primary, 10) }}
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Admisión UPEA · Carrera de Psicología
                        </span>

                        <h1 className="font-display mt-6 text-5xl leading-[1.08] font-medium tracking-tight text-neutral-900 md:text-6xl">
                            {lema}
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
                            Prepárate para tu examen de admisión con clases virtuales en vivo, material de estudio por áreas y el
                            acompañamiento de un equipo docente especializado.
                        </p>

                        {!user && (
                            <div className="mt-9 flex flex-wrap items-center gap-5">
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="h-12 px-7 text-base text-white shadow-lg transition-transform hover:scale-[1.02] hover:opacity-95"
                                        style={{ backgroundColor: primary, boxShadow: `0 12px 24px -8px ${alpha(primary, 45)}` }}
                                    >
                                        Inscríbete ahora <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium underline decoration-2 underline-offset-4"
                                    style={{ color: shade(secondary, 15), textDecorationColor: alpha(secondary, 45) }}
                                >
                                    Ya tengo una cuenta
                                </Link>
                            </div>
                        )}

                        <div className="mt-12 flex flex-wrap gap-3">
                            {['Clases en vivo', 'Simulacros cronometrados', 'Tutoría personalizada'].map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm ring-1"
                                    style={{ boxShadow: `0 1px 2px ${alpha(primary, 10)}`, outline: 'none' }}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: secondary }} />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Signature element: hero image styled like a student credential card */}
                    <div className="relative" data-aos="fade-left" data-aos-delay="100">
                        <div
                            className="absolute -inset-8 -z-10 rounded-[2.5rem]"
                            style={{ background: `radial-gradient(circle at 30% 25%, ${alpha(secondary, 25)}, transparent 65%)` }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 24, rotate: -6 }}
                            animate={{ opacity: 1, y: 0, rotate: -3 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="relative mx-auto max-w-sm rounded-3xl bg-white p-3"
                            style={{ boxShadow: `0 0 0 1px ${alpha(primary, 12)}, 0 30px 60px -20px ${alpha(primary, 45)}` }}
                        >
                            {portada ? (
                                <img
                                    src={`/storage/${portada.imagen}`}
                                    alt={portada.titulo || 'Portada institucional'}
                                    className="aspect-[4/5] w-full rounded-2xl object-cover"
                                />
                            ) : (
                                <div
                                    className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl"
                                    style={{ background: `linear-gradient(160deg, ${primary}, ${secondary})` }}
                                >
                                    <BookOpen className="h-20 w-20 text-white/40" />
                                </div>
                            )}
                            <div
                                className="mt-3 flex items-center justify-between rounded-xl px-4 py-3"
                                style={{ background: tint(primary, 92) }}
                            >
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" style={{ color: primary }} />
                                    <span className="font-mono-ui text-[11px] tracking-wide text-neutral-600 uppercase">Promoción 2026</span>
                                </div>
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: secondary }} />
                            </div>
                        </motion.div>

                        <div
                            className="absolute -right-4 -bottom-6 flex h-20 w-20 items-center justify-center rounded-full text-center shadow-lg"
                            style={{ background: `conic-gradient(from 180deg, ${primary}, ${secondary}, ${primary})` }}
                        >
                            <span className="font-mono-ui text-[10px] leading-tight font-medium text-white">
                                UPEA
                                <br />
                                PSICOLOGÍA
                            </span>
                        </div>
                    </div>
                </div>
            </section>


















            {/* ==================== LEMA RIBBON ==================== */}
            {config?.lema && (
                <div className="relative py-8 text-center" style={{ background: `linear-gradient(100deg, ${primary}, ${shade(secondary, 5)})` }}>
                    <Quote className="mx-auto mb-2 h-6 w-6 text-white/40" />
                    <p className="font-display mx-auto max-w-3xl px-6 text-xl text-white md:text-2xl">{config.lema}</p>
                </div>
            )}















            {/* ==================== MISIÓN Y VISIÓN ==================== */}
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid grid-cols-1 divide-y divide-neutral-100 overflow-hidden rounded-3xl border border-neutral-100 shadow-sm md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="p-10 md:p-12" data-aos="fade-up">
                        <div
                            className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2"
                            style={{ borderColor: alpha(primary, 40) }}
                        >
                            <Target className="h-5 w-5" style={{ color: primary }} />
                        </div>
                        <h3 className="font-display text-2xl">Misión</h3>
                        <p className="mt-4 leading-relaxed text-neutral-600">
                            {config?.mision ||
                                'Formar profesionales en psicología con sólidas competencias académicas, científicas y tecnológicas.'}
                        </p>
                    </div>
                    <div className="p-10 md:p-12" data-aos="fade-up" data-aos-delay="100">
                        <div
                            className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2"
                            style={{ borderColor: alpha(secondary, 40) }}
                        >
                            <Eye className="h-5 w-5" style={{ color: secondary }} />
                        </div>
                        <h3 className="font-display text-2xl">Visión</h3>
                        <p className="mt-4 leading-relaxed text-neutral-600">
                            {config?.vision ||
                                'Ser una institución líder en la formación de psicólogos altamente capacitados.'}
                        </p>
                    </div>
                </div>
            </div>

















            {/* ==================== RUTA DE INGRESO ==================== */}
            <div className="mx-auto max-w-7xl px-6 pb-20">
                <div className="mb-12 text-center" data-aos="fade-up">
                    <h2 className="font-display text-3xl md:text-4xl">Tu ruta hacia la carrera</h2>
                    <p className="mt-3 text-neutral-500">Cuatro etapas para llegar preparado al día del examen.</p>
                </div>
                <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div
                        className="absolute top-6 right-0 left-0 hidden h-px md:block"
                        style={{ background: `linear-gradient(90deg, ${alpha(primary, 5)}, ${alpha(primary, 35)}, ${alpha(secondary, 35)}, ${alpha(secondary, 5)})` }}
                    />
                    {RUTA_INGRESO.map((paso, i) => (
                        <div key={paso.titulo} className="relative" data-aos="fade-up" data-aos-delay={i * 100}>
                            <div
                                className="font-mono-ui relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium text-white shadow-md"
                                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                            >
                                0{i + 1}
                            </div>
                            <h4 className="mt-5 text-base font-semibold text-neutral-900">{paso.titulo}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{paso.detalle}</p>
                        </div>
                    ))}
                </div>
            </div>














            {/* ==================== AUTORIDADES ==================== */}
            {autoridades && autoridades.length > 0 && (
                <div className="bg-neutral-50/70 py-20">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 flex items-center justify-center gap-2 text-center" data-aos="fade-up">
                            <Users className="h-5 w-5" style={{ color: primary }} />
                            <h2 className="font-display text-3xl md:text-4xl">Autoridades</h2>
                        </div>
                        <div className="flex flex-wrap justify-center gap-7">
                            {autoridades.map((a, i) => (
                                <div
                                    key={a.id}
                                    className="group w-72 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-xl"
                                    data-aos="fade-up"
                                    data-aos-delay={i * 80}
                                >
                                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                                    <div className="p-6 text-center">
                                        {a.foto ? (
                                            <img
                                                src={`/storage/${a.foto}`}
                                                alt={a.nombre}
                                                className="mx-auto mb-4 h-28 w-28 rounded-full border-4 object-cover"
                                                style={{ borderColor: tint(primary, 88) }}
                                            />
                                        ) : (
                                            <div
                                                className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full"
                                                style={{ background: tint(primary, 90) }}
                                            >
                                                <GraduationCap className="h-11 w-11" style={{ color: primary }} />
                                            </div>
                                        )}
                                        <p className="text-lg font-semibold">{a.nombre}</p>
                                        <span
                                            className="mt-1.5 inline-block rounded-full px-3 py-0.5 text-xs font-medium"
                                            style={{ background: tint(secondary, 88), color: shade(secondary, 20) }}
                                        >
                                            {a.cargo}
                                        </span>
                                        {a.mensaje && (
                                            <div className="mt-5 border-t border-neutral-100 pt-4">
                                                <Quote className="mx-auto mb-2 h-4 w-4 text-neutral-300" />
                                                <p className="line-clamp-3 text-sm italic text-neutral-500">{a.mensaje}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}














            {/* ==================== CONVOCATORIAS ==================== */}
            {convocatorias && convocatorias.length > 0 && (
                <div className="mx-auto max-w-5xl px-6 py-20">
                    <div className="mb-12 flex items-center justify-center gap-2 text-center" data-aos="fade-up">
                        <Megaphone className="h-5 w-5" style={{ color: secondary }} />
                        <h2 className="font-display text-3xl md:text-4xl">Convocatorias</h2>
                    </div>
                    <div className="space-y-4">
                        {convocatorias.map((c, i) => {
                            const abierta = convocatoriaAbierta(c);
                            const inicio = formatFecha(c.fecha_inicio);
                            const fin = formatFecha(c.fecha_fin);
                            return (
                                <div
                                    key={c.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-neutral-100 p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                    data-aos="fade-up"
                                    data-aos-delay={i * 60}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                            style={{ background: tint(secondary, 88) }}
                                        >
                                            <Megaphone className="h-5 w-5" style={{ color: secondary }} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">{c.titulo}</p>
                                            {c.descripcion && (
                                                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{c.descripcion}</p>
                                            )}



                                            <div className="mt-3 flex flex-col sm:flex-row gap-3">
                                                {/* Video */}
                                                {c.link_video && (() => {
                                                    const thumbnail = getYoutubeThumbnail(c.link_video);
                                                    if (!thumbnail) return null;
                                                    return (
                                                        <button
                                                            onClick={() => abrirVideo(c.link_video!)}
                                                            className="relative block w-full max-w-[200px] overflow-hidden rounded-xl group"
                                                        >
                                                            <img src={thumbnail} alt="Vista previa del video" className="w-full h-28 object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/55 transition-colors">
                                                                <span className="text-white text-3xl drop-shadow-lg">▶</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })()}

                                                {/* Imagen */}
                                                {c.archivo && (
                                                    <img
                                                        src={`/storage/${c.archivo}`}
                                                        alt={c.titulo}
                                                        className="w-full max-w-[200px] h-28 object-cover rounded-xl border border-neutral-200"
                                                    />
                                                )}
                                            </div>


                                            {(inicio || fin) && (
                                                <p className="font-mono-ui mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {inicio}
                                                    {inicio && fin ? ' — ' : ''}
                                                    {fin}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        className="w-fit shrink-0 border-none"
                                        style={{
                                            background: abierta ? tint(secondary, 85) : '#f1f5f9',
                                            color: abierta ? shade(secondary, 25) : '#64748b',
                                        }}
                                    >
                                        {abierta ? 'Convocatoria abierta' : 'Cerrada'}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}














            {/* ==================== ORGANIGRAMA ==================== */}
            {config?.organigrama && (
                <div className="bg-neutral-50/70 py-20">
                    <div className="mx-auto max-w-5xl px-6" data-aos="fade-up">
                        <h2 className="font-display mb-4 text-center text-3xl md:text-4xl">Organigrama</h2>
                        <div className="mx-auto mb-10 h-1 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-neutral-100">
                            <img src={`/storage/${config.organigrama}`} alt="Organigrama institucional" className="w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            )}






















            {/* ==================== CTA FINAL ==================== */}
            {!user && (
                <div className="relative overflow-hidden py-16 text-center" style={{ background: `linear-gradient(120deg, ${primary}, ${shade(secondary, 5)})` }}>
                    <div data-aos="zoom-in">
                        <h2 className="font-display px-6 text-3xl text-white md:text-4xl">
                            ¿Listo para asegurar tu cupo?
                        </h2>
                        <p className="mx-auto mt-3 max-w-md px-6 text-white/80">
                            Regístrate hoy y empieza tu preparación para el examen de admisión.
                        </p>
                        <Link href="/register">
                            <Button size="lg" className="mt-8 h-12 bg-white px-8 text-base text-neutral-900 shadow-lg hover:bg-white/90">
                                Crear mi cuenta <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}





















            {/* ==================== FOOTER ==================== */}
            <footer className="bg-neutral-950 py-14 text-neutral-300">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                        <div className="flex items-center gap-3 md:items-start">
                            {config?.logo ? (
                                <img src={`/storage/${config.logo}`} alt="Logo" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
                            ) : (
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                                >
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                            )}
                            <div>
                                <p className="font-display text-lg text-white">Preuniversitario de Psicología</p>
                                <p className="text-sm text-neutral-400">UPEA · Carrera de Psicología</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-sm text-neutral-400">
                            <p className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" style={{ color: secondary }} />
                                Av. Sucre B, Zona Villa Esperanza — El Alto, Bolivia
                            </p>
                        </div>
                        <div className="text-center text-sm text-neutral-500 md:text-right">
                            <p>© {new Date().getFullYear()} Universidad Pública del Alto</p>
                            <p className="mt-1 text-xs text-neutral-600">Todos los derechos reservados</p>
                        </div>
                    </div>
                </div>

            </footer>












            {/* ==================== MODAL VIDEO ==================== */}
            <Dialog open={modalVideo} onOpenChange={setModalVideo}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Video de la convocatoria</DialogTitle>
                    </DialogHeader>
                    {videoUrl && (
                        <div className="rounded-xl overflow-hidden">
                            <iframe
                                src={videoUrl}
                                className="w-full aspect-video"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}