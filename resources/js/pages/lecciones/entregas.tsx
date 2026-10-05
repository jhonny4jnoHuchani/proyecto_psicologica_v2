import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CalendarDays, Clock, Eye, GraduationCap, LoaderCircle, RefreshCw, Sparkles, Star, UserX, Users, Wand2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserData { nombre: string; apellido_paterno: string; apellido_materno: string; }
interface MateriaData { id: number; nombre: string; codigo: string; }
interface DocenteData { id: number; user: UserData; }
interface CursoData { id: number; paralelo: string; gestion: { año: number; etapa: string }; }

interface LeccionData {
    id: number; titulo: string; tema: string | null; descripcion: string | null;
    fecha_programada: string | null; fecha_entrega: string | null;
    estado: string; materia: MateriaData; docente: DocenteData; curso: CursoData;
}

interface CalificacionData { id: number; nota: number; comentarios: string | null; }

interface EntregaData {
    id: number; estado_entrega: string; estado_calificacion: string;
    fecha_entrega: string | null; archivos_enviado: string[] | null;
    comentarios: string | null; calificacion: CalificacionData | null;
    estudiante: { id: number; user: UserData };
}

interface EstudianteSinEntregar {
    id: number; user: UserData;
}

interface Props {
    leccion: LeccionData;
    entregas: EntregaData[];
    estudiantesSinEntregar: EstudianteSinEntregar[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lecciones', href: '/lecciones' },
    { title: 'Entregas', href: '' },
];

function formatoFechaLarga(fecha?: string | null) {
    if (!fecha) return 'Sin fecha';
    return new Date(`${fecha.split('T')[0]}T00:00:00`).toLocaleDateString('es-BO', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

export default function LeccionesEntregas({ leccion, entregas, estudiantesSinEntregar }: Props) {
    // ==================== MODAL CALIFICAR ====================
    const [modalCalificar, setModalCalificar] = useState(false);
    const [entregaSelect, setEntregaSelect] = useState<EntregaData | null>(null);
    const [nota, setNota] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);

    // ==================== MODAL REFUERZO IA ====================
    const [modalRefuerzo, setModalRefuerzo] = useState(false);
    const [entregaRefuerzoId, setEntregaRefuerzoId] = useState<number | null>(null);
    const [estudianteRefuerzo, setEstudianteRefuerzo] = useState<string>('');
    const [preguntasRefuerzo, setPreguntasRefuerzo] = useState<string[]>([]);
    const [recomendacion, setRecomendacion] = useState('');
    const [cargandoRefuerzo, setCargandoRefuerzo] = useState(false);
    const [regenerando, setRegenerando] = useState<number | null>(null);
    const [guardandoRefuerzo, setGuardandoRefuerzo] = useState(false);
    const [modalConfirmarRefrescar, setModalConfirmarRefrescar] = useState(false);

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    // ============================================================
    // HANDLERS - MODAL CALIFICAR
    // ============================================================

    const openCalificar = (entrega: EntregaData) => {
        setEntregaSelect(entrega);
        setNota(entrega.calificacion?.nota ? String(entrega.calificacion.nota) : '');
        setComentarios(entrega.calificacion?.comentarios || '');
        setModalCalificar(true);
    };


    const handleCalificar: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const res = await window.axios.post('/calificaciones', {
                entrega_id: entregaSelect?.id,
                nota,
                comentarios,
            });

            setModalCalificar(false);
            setProcessing(false);

            toast.success('Calificación guardada');

            // Detectar si se sugiere refuerzo
            const flash = res.data?.flash;
            if (flash?.sugerir_refuerzo && flash?.entrega_refuerzo_id) {
                setEntregaRefuerzoId(flash.entrega_refuerzo_id);
                setEstudianteRefuerzo(
                    entregaSelect ? nombreCompleto(entregaSelect.estudiante.user) : ''
                );
                setModalRefuerzo(true);
                generarPreguntas(flash.entrega_refuerzo_id);
            } else {
                // Recargar la página para actualizar la tabla
                router.reload({ only: ['entregas'] });
            }
        } catch (err) {
            console.error(err);
            setProcessing(false);
            const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string> }>;
            toast.error(axiosErr.response?.data?.message || 'Error al guardar la calificación');
        }
    };


    // ============================================================
    // HANDLERS - MODAL REFUERZO IA
    // ============================================================

    const generarPreguntas = async (entregaId: number, limpiar: boolean = true) => {
        setCargandoRefuerzo(true);

        if (limpiar) {
            setPreguntasRefuerzo([]);
            setRecomendacion('');
        }

        try {
            const res = await window.axios.post('/refuerzos/generar', {
                entrega_id: entregaId,
            });

            if (res.data.success) {
                setPreguntasRefuerzo(res.data.preguntas);
                setRecomendacion(res.data.recomendacion || '');
            } else {
                toast.error(res.data.error || 'Error al generar las preguntas');
                if (limpiar) setModalRefuerzo(false);
            }
        } catch (err) {
            console.error(err);
            const axiosErr = err as AxiosError<{ error?: string }>;
            toast.error(axiosErr.response?.data?.error || 'Error al generar las preguntas');
            if (limpiar) setModalRefuerzo(false);
        } finally {
            setCargandoRefuerzo(false);
        }
    };

    const actualizarTodas = () => {
        if (!entregaRefuerzoId) return;

        const hayContenido = preguntasRefuerzo.length > 0;
        if (hayContenido) {
            setModalConfirmarRefrescar(true);
            return;
        }

        // Si no hay preguntas, regenerar directo
        ejecutarRefrescar();
    };

    const ejecutarRefrescar = async () => {
        if (!entregaRefuerzoId) return;

        setModalConfirmarRefrescar(false);
        await generarPreguntas(entregaRefuerzoId, false);
    };

    const regenerarPregunta = async (index: number) => {
        if (!entregaRefuerzoId) return;

        setRegenerando(index);

        try {
            const otrasPreguntas = preguntasRefuerzo.filter((_, i) => i !== index);

            const res = await window.axios.post('/refuerzos/regenerar-pregunta', {
                entrega_id: entregaRefuerzoId,
                pregunta_actual: preguntasRefuerzo[index],
                otras_preguntas: otrasPreguntas,
            });

            if (res.data.success) {
                const nuevas = [...preguntasRefuerzo];
                nuevas[index] = res.data.pregunta;
                setPreguntasRefuerzo(nuevas);
                toast.success('Pregunta regenerada');
            } else {
                toast.error(res.data.error || 'Error al regenerar');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al regenerar la pregunta');
        } finally {
            setRegenerando(null);
        }
    };

    const actualizarPregunta = (index: number, valor: string) => {
        const nuevas = [...preguntasRefuerzo];
        nuevas[index] = valor;
        setPreguntasRefuerzo(nuevas);
    };

    const guardarRefuerzo = async () => {
        if (!entregaRefuerzoId) return;

        setGuardandoRefuerzo(true);

        try {
            await window.axios.post('/refuerzos/guardar', {
                entrega_id: entregaRefuerzoId,
                preguntas: preguntasRefuerzo,
                recomendacion,
            });

            toast.success('Refuerzo guardado y enviado al estudiante');
            setModalRefuerzo(false);
            setPreguntasRefuerzo([]);
            setRecomendacion('');
            setEntregaRefuerzoId(null);
        } catch (err) {
            console.error(err);
            const axiosErr = err as AxiosError<{ error?: string }>;
            toast.error(axiosErr.response?.data?.error || 'Error al guardar el refuerzo');
        } finally {
            setGuardandoRefuerzo(false);
        }
    };

    const cancelarRefuerzo = () => {
        if (!confirm('¿Cancelar la generación de preguntas? Se perderán las preguntas no guardadas.')) {
            return;
        }
        setModalRefuerzo(false);
        setPreguntasRefuerzo([]);
        setRecomendacion('');
        setEntregaRefuerzoId(null);
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Entregas: ${leccion.titulo}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Button variant="outline" asChild>
                    <Link href="/lecciones"><ArrowLeft className="mr-2 h-4 w-4" />Volver a lecciones</Link>
                </Button>

                {/* Datos de la lección */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-indigo-600">
                            <BookOpen className="h-4 w-4" />
                            {leccion.materia?.codigo} - {leccion.materia?.nombre}
                        </div>
                        <CardTitle className="text-xl">{leccion.titulo}</CardTitle>
                        {leccion.tema && (
                            <p className="text-sm text-neutral-500 mt-1">{leccion.tema}</p>
                        )}
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-neutral-600">
                            <GraduationCap className="h-4 w-4" />
                            {leccion.docente ? nombreCompleto(leccion.docente.user) : 'Sin docente'}
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-600">
                            <CalendarDays className="h-4 w-4" />
                            {formatoFechaLarga(leccion.fecha_entrega)}
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-600">
                            <Users className="h-4 w-4" />
                            {entregas.length} entregas recibidas
                        </div>
                    </CardContent>
                </Card>

                {/* Entregas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            📋 Entregas Recibidas ({entregas.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {entregas.length === 0 && (
                            <p className="text-sm text-neutral-500">Ningún estudiante ha entregado aún.</p>
                        )}
                        {entregas.map((e) => (
                            <div key={e.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1 space-y-1">
                                    <p className="font-medium">{nombreCompleto(e.estudiante.user)}</p>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <Badge variant={e.estado_entrega === 'entregado' ? 'default' : 'destructive'}>
                                            {e.estado_entrega === 'entregado' ? '✅ Entregado' : '⚠️ Atrasado'}
                                        </Badge>
                                        <Badge variant={e.estado_calificacion === 'calificado' ? 'default' : 'outline'}>
                                            {e.estado_calificacion === 'calificado' ? `⭐ ${e.calificacion?.nota}/100` : '⏳ Sin calificar'}
                                        </Badge>
                                        {e.fecha_entrega && (
                                            <span className="text-neutral-500">
                                                {formatoFechaLarga(e.fecha_entrega)}
                                            </span>
                                        )}
                                    </div>
                                    {e.calificacion?.comentarios && (
                                        <p className="text-xs text-neutral-600 mt-1">📝 {e.calificacion.comentarios}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {e.archivos_enviado?.map((a, i) => (
                                        <a key={i} href={`/storage/${a}`} target="_blank">
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-1 h-3.5 w-3.5" />Archivo {i + 1}
                                            </Button>
                                        </a>
                                    ))}
                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => openCalificar(e)}>
                                        <Star className="mr-1 h-3.5 w-3.5" />
                                        {e.calificacion ? 'Editar nota' : 'Calificar'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* No entregaron */}
                {estudiantesSinEntregar.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-neutral-500">
                                <UserX className="h-5 w-5" />
                                No han entregado ({estudiantesSinEntregar.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {estudiantesSinEntregar.map((e) => (
                                    <div key={e.id} className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                        {nombreCompleto(e.user)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* MODAL CALIFICAR */}
                <Dialog open={modalCalificar} onOpenChange={setModalCalificar}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Calificar Entrega</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-neutral-500">
                            <p><strong>Estudiante:</strong> {entregaSelect ? nombreCompleto(entregaSelect.estudiante.user) : ''}</p>
                        </div>
                        <form onSubmit={handleCalificar} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Nota (0-100) *</Label>
                                <Input type="number" min="0" max="100" step="0.01" value={nota} onChange={(e) => setNota(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Comentarios</Label>
                                <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} className="w-full rounded-md border p-2 text-sm" rows={3} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCalificar(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {entregaSelect?.calificacion ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL REFUERZO IA */}
                <Dialog open={modalRefuerzo} onOpenChange={cancelarRefuerzo}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">


                        <DialogHeader>
                            <div className="flex items-center justify-between gap-3">
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    Preguntas de refuerzo con IA
                                </DialogTitle>

                                {/* Botón "Otra tanda" */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={actualizarTodas}
                                    disabled={cargandoRefuerzo || guardandoRefuerzo}
                                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                                    title="Generar 10 preguntas nuevas"
                                >
                                    <Wand2 className={`mr-1.5 h-3.5 w-3.5 ${cargandoRefuerzo ? 'animate-pulse' : ''}`} />
                                    {cargandoRefuerzo ? 'Generando...' : 'Otra tanda'}
                                </Button>
                            </div>
                            <DialogDescription>
                                Estudiante: <strong>{estudianteRefuerzo}</strong> · Revisa y edita las preguntas antes de enviarlas.
                            </DialogDescription>
                        </DialogHeader>

                        {preguntasRefuerzo.length === 0 && cargandoRefuerzo ? (
                            // Primera carga: no hay preguntas → mostrar spinner grande
                            <div className="py-12 text-center">
                                <LoaderCircle className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                                <p className="mt-3 text-sm text-neutral-500">
                                    Generando preguntas con IA...
                                </p>
                            </div>
                        ) : (
                            // Ya hay preguntas (o se está regenerando): mostrar atenuadas
                            <div className={`space-y-4 transition-opacity duration-300 ${cargandoRefuerzo ? 'opacity-40 pointer-events-none' : ''}`}>
                                {preguntasRefuerzo.map((p, i) => (


                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-neutral-500">
                                                Pregunta {i + 1}
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => regenerarPregunta(i)}
                                                disabled={regenerando !== null}
                                                title="Regenerar esta pregunta"
                                            >
                                                <RefreshCw className={`h-3.5 w-3.5 ${regenerando === i ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>
                                        <textarea
                                            value={p}
                                            onChange={(e) => actualizarPregunta(i, e.target.value)}
                                            className="w-full rounded-md border p-2 text-sm"
                                            rows={2}
                                        />
                                    </div>
                                ))}

                                <div className="space-y-1 pt-4 border-t">
                                    <Label className="text-xs text-neutral-500">
                                        📝 Recomendación de estudio
                                    </Label>
                                    <textarea
                                        value={recomendacion}
                                        onChange={(e) => setRecomendacion(e.target.value)}
                                        className="w-full rounded-md border p-2 text-sm"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelarRefuerzo}
                                disabled={guardandoRefuerzo}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={guardarRefuerzo}
                                disabled={guardandoRefuerzo || cargandoRefuerzo || preguntasRefuerzo.length === 0}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {guardandoRefuerzo && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar y enviar al estudiante
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MODAL CONFIRMAR REFRESCAR */}
                <Dialog open={modalConfirmarRefrescar} onOpenChange={setModalConfirmarRefrescar}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-950/50">
                                    <Wand2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <DialogTitle>¿Generar una nueva tanda?</DialogTitle>
                                    <DialogDescription>
                                        Se generarán 10 preguntas nuevas con IA.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                    ⚠️ Se perderán las 10 preguntas actuales, incluidas las que hayas editado.
                                </p>
                                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalConfirmarRefrescar(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={ejecutarRefrescar}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Wand2 className="mr-2 h-4 w-4" />
                                Sí, generar nuevas
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}