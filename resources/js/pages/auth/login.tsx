import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, GraduationCap, LoaderCircle, Pause, Play } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}


interface ConfigData {
    color_primario: string;
    color_secundario: string;
    logo: string | null;
    nombre_institucion?: string | null;
}

interface Portada {
    id: number;
    titulo: string | null;
    imagen: string;
    orden: number;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    config?: ConfigData | null;
    portadas?: Portada[];
}

const alpha = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, transparent)`;

export default function Login({ status, canResetPassword, config, portadas }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const primary = config?.color_primario || null;
    const secondary = config?.color_secundario || null;
    const nombreInstitucion = config?.nombre_institucion || 'Preuniversitario de Psicología';

    // ==================== CARRUSEL DE PORTADAS ====================
    const [slide, setSlide] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = derecha, -1 = izquierda
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!portadas || portadas.length < 2 || paused) return;
        const id = setInterval(() => {
            setDirection(1);
            setSlide((i) => (i + 1) % portadas.length);
        }, 5000);
        return () => clearInterval(id);
    }, [portadas, paused]);

    const nextSlide = () => {
        if (!portadas || portadas.length < 2) return;
        setDirection(1);
        setSlide((i) => (i + 1) % portadas.length);
    };

    const prevSlide = () => {
        if (!portadas || portadas.length < 2) return;
        setDirection(-1);
        setSlide((i) => (i - 1 + portadas.length) % portadas.length);
    };

    const portada = portadas && portadas.length > 0 ? portadas[slide] : null;

    // ==================== SUBMIT ====================
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };
    return (
        <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
            <Head title="Iniciar sesión" />

            {/* ==================== FONDO: CARRUSEL DE PORTADAS ==================== */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {portada ? (
                    <AnimatePresence mode="popLayout" custom={direction}>
                        <motion.img
                            key={portada.id}
                            src={`/storage/${portada.imagen}`}
                            alt=""
                            aria-hidden
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 120, scale: 1.08 }}
                            animate={{ opacity: 1, x: 0, scale: 1.05 }}
                            exit={{ opacity: 0, x: direction * -120, scale: 1.08 }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </AnimatePresence>
                ) : (
                    <div
                        className="h-full w-full"
                        style={
                            primary && secondary
                                ? { background: `radial-gradient(circle at 20% 20%, ${alpha(secondary, 25)}, transparent 55%), radial-gradient(circle at 80% 70%, ${alpha(primary, 25)}, transparent 55%)` }
                                : undefined
                        }
                    />
                )}

                {/* Scrim oscuro para que el card resalte */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

                {/* Controles del carrusel */}
                {portadas && portadas.length > 1 && (
                    <>
                        {/* Flechas */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 transition-all flex items-center justify-center text-white"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 transition-all flex items-center justify-center text-white"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Pausa / Play */}
                        <button
                            onClick={() => setPaused(!paused)}
                            className="absolute bottom-6 right-6 z-10 h-9 w-9 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 transition-all flex items-center justify-center text-white"
                        >
                            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </button>

                        {/* Indicadores */}
                        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                            {portadas.map((p, i) => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setDirection(i > slide ? 1 : -1);
                                        setSlide(i);
                                    }}
                                    className="rounded-full transition-all duration-500"
                                    style={{
                                        height: '6px',
                                        width: i === slide ? '28px' : '6px',
                                        backgroundColor: i === slide ? (primary ?? '#fff') : 'rgba(255,255,255,0.4)',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Título de la portada */}
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-center">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={portada?.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-white/90 text-sm font-medium tracking-wide"
                                >
                                    {portada?.titulo || `Portada ${slide + 1}`}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            {/* ==================== CARD DE LOGIN ==================== */}
            <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                <div className="mb-8 flex flex-col items-center text-center">
                    {config?.logo ? (
                        <img src={`/storage/${config.logo}`} alt="Logo institucional" className="mb-4 h-20 w-20 object-contain drop-shadow" />
                    ) : (
                        <div
                            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg text-white"
                            style={primary && secondary ? { background: `linear-gradient(135deg, ${primary}, ${secondary})` } : { backgroundColor: primary || '#4f46e5' }}
                        >
                            <GraduationCap className="h-10 w-10" />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                        {nombreInstitucion}
                    </p>
                </div>

                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="correo@ejemplo.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="text-sm" tabIndex={5}>
                                        ¿Olvidaste tu contraseña?
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Contraseña"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked === true)}
                            />
                            <Label htmlFor="remember" className="font-normal">Recordarme</Label>
                        </div>

                        <Button
                            type="submit"
                            className="mt-1 w-full text-white shadow-lg hover:opacity-90 transition-opacity"
                            tabIndex={4}
                            disabled={processing}
                            style={primary ? { backgroundColor: primary } : undefined}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Iniciar sesión
                        </Button>
                    </div>

                    <div className="text-muted-foreground text-center text-sm">
                        ¿No tienes una cuenta?{' '}
                        <TextLink href={route('register')} tabIndex={5} style={secondary ? { color: secondary } : undefined}>
                            Regístrate
                        </TextLink>
                    </div>
                </form>

                {status && (
                    <div className="mt-6 rounded-lg bg-green-50 dark:bg-green-950/50 px-4 py-2.5 text-center text-sm font-medium text-green-700 dark:text-green-300">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}