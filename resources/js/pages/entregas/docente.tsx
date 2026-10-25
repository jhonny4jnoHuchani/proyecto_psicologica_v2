import { Head, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, Eye, Filter, LoaderCircle, RefreshCw, Search, Sparkles, Star, UserX, Wand2 } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatoFechaHora } from '@/lib/formatters';
import { type BreadcrumbItem } from '@/types';

interface MateriaData { id: number; nombre: string; codigo: string; }
interface EstudianteData { id: number; user: { nombre: string; apellido_paterno: string; apellido_materno: string; }; }
interface LeccionData { id: number; titulo: string; materia: MateriaData; }
interface CalificacionData { id: number; nota: number; comentarios: string | null; }
interface RefuerzoData { id: number; completado: boolean; }

interface Entrega {
    id: number; estado_entrega: string; estado_calificacion: string;
    fecha_entrega: string | null; archivos_enviado: string[] | null; comentarios: string | null;
    leccion: LeccionData; estudiante: EstudianteData; calificacion: CalificacionData | null;
    refuerzo?: RefuerzoData | null;
}

interface LeccionFiltro { id: number; titulo: string; materia: MateriaData; }

interface EstudianteSinEntregar {
    id: number;
    user: {
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
    };
}

interface Props {
    entregas: Entrega[];
    lecciones: LeccionFiltro[];
    filtroLeccionId: number | null;
    estudiantesSinEntregar?: EstudianteSinEntregar[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Entregas', href: '/entregas/docente' }];

export default function EntregasDocente({ entregas, lecciones, filtroLeccionId, estudiantesSinEntregar }: Props) {
    const [leccionId, setLeccionId] = useState(filtroLeccionId ? String(filtroLeccionId) : '');
    const [tabEstado, setTabEstado] = useState<'todos' | 'pendientes' | 'calificados' | 'sin_entregar'>('todos');

    // Modal Calificar
    const [modalCalificar, setModalCalificar] = useState(false);
    const [entregaSelect, setEntregaSelect] = useState<Entrega | null>(null);
    const [nota, setNota] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Modal Refuerzo IA
    const [modalRefuerzo, setModalRefuerzo] = useState(false);
    const [entregaRefuerzoId, setEntregaRefuerzoId] = useState<number | null>(null);
    const [estudianteRefuerzo, setEstudianteRefuerzo] = useState<string>('');
    const [preguntasRefuerzo, setPreguntasRefuerzo] = useState<string[]>([]);
    const [recomendacion, setRecomendacion] = useState('');
    const [cargandoRefuerzo, setCargandoRefuerzo] = useState(false);
    const [errorGeneracion, setErrorGeneracion] = useState<string | null>(null);
    const [regenerando, setRegenerando] = useState<number | null>(null);
    const [guardandoRefuerzo, setGuardandoRefuerzo] = useState(false);
    const [modalConfirmarRefrescar, setModalConfirmarRefrescar] = useState(false);

    const nombreCompleto = (u: EstudianteData['user']) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const filtrar = () => {
        if (leccionId) {
            router.get(`/entregas/docente?leccion_id=${leccionId}`);
        } else {
            router.get('/entregas/docente');
        }
    };

    const openCalificar = (entrega: Entrega) => {
        setEntregaSelect(entrega);
        setNota(entrega.calificacion?.nota ? String(entrega.calificacion.nota) : '');
        setComentarios(entrega.calificacion?.comentarios || '');
        setErrors({});
        setModalCalificar(true);
    };

    const handleCalificar: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const res = await window.axios.post('/calificaciones', {
                entrega_id: entregaSelect?.id,
                nota,
                comentarios,
            });

            setModalCalificar(false);
            setProcessing(false);

            toast.success('Calificación guardada correctamente');

            const flash = res.data?.flash;
            if (flash?.sugerir_refuerzo && flash?.entrega_refuerzo_id) {
                setEntregaRefuerzoId(flash.entrega_refuerzo_id);
                setEstudianteRefuerzo(
                    entregaSelect ? nombreCompleto(entregaSelect.estudiante.user) : ''
                );
                setErrorGeneracion(null);
                setModalRefuerzo(true);
                generarPreguntas(flash.entrega_refuerzo_id);
            } else if (flash?.motivo_no_refuerzo) {
                toast.warning(`Atención: ${flash.motivo_no_refuerzo}`, { duration: 7000 });
                router.reload({ only: ['entregas'] });
            } else {
                router.reload({ only: ['entregas'] });
            }
        } catch (err) {
            console.error(err);
            setProcessing(false);
            const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string> }>;
            if (axiosErr.response?.data?.errors) {
                setErrors(axiosErr.response.data.errors);
            }
            toast.error(axiosErr.response?.data?.message || 'Error al guardar la calificación');
        }
    };

    const abrirRefuerzoManual = (entrega: Entrega) => {
        setEntregaRefuerzoId(entrega.id);
        setEstudianteRefuerzo(nombreCompleto(entrega.estudiante.user));
        setErrorGeneracion(null);
        setModalRefuerzo(true);
        generarPreguntas(entrega.id);
    };

    const generarPreguntas = async (entregaId: number, limpiar: boolean = true) => {
        setCargandoRefuerzo(true);
        setErrorGeneracion(null);

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
                toast.success('Preguntas de refuerzo generadas con éxito');
            } else {
                const errorMsg = res.data.error || 'Error al generar las preguntas';
                setErrorGeneracion(errorMsg);
                toast.error(errorMsg, { duration: 7000 });
            }
        } catch (err) {
            console.error(err);
            const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
            const errorMsg = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Error inesperado al generar las preguntas con IA.';
            setErrorGeneracion(errorMsg);
            toast.error(errorMsg, { duration: 7000 });
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
                toast.error(res.data.error || 'Error al regenerar la pregunta');
            }
        } catch (err) {
            console.error(err);
            const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
            toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Error al regenerar la pregunta');
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
            router.reload({ only: ['entregas'] });
        } catch (err) {
            console.error(err);
            const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
            toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Error al guardar el refuerzo');
        } finally {
            setGuardandoRefuerzo(false);
        }
    };

    const cancelarRefuerzo = () => {
        if (preguntasRefuerzo.length > 0 && !confirm('¿Cancelar la generación de preguntas? Se perderán las preguntas no guardadas.')) {
            return;
        }
        setModalRefuerzo(false);
        setPreguntasRefuerzo([]);
        setErrorGeneracion(null);
        setRecomendacion('');
        setEntregaRefuerzoId(null);
    };

    const pendientesCount = useMemo(() => (entregas || []).filter(e => !e.calificacion).length, [entregas]);
    const calificadasCount = useMemo(() => (entregas || []).filter(e => !!e.calificacion).length, [entregas]);
    const sinEntregarCount = estudiantesSinEntregar?.length || 0;

    const entregasFiltradas = useMemo(() => {
        if (!entregas) return [];
        if (tabEstado === 'pendientes') {
            return entregas.filter(e => !e.calificacion);
        }
        if (tabEstado === 'calificados') {
            return entregas.filter(e => !!e.calificacion);
        }
        return entregas;
    }, [entregas, tabEstado]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entregas de Estudiantes" />
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Revisión y Calificación de Entregas</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Evalúa tareas, asigna retroalimentación y genera refuerzos pedagógicos asistidos por IA.
                        </p>
                    </div>
                </div>

                {/* Filtro por lección */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div className="space-y-1 flex-1">
                                <Label>Filtrar por Lección o Tarea</Label>
                                <Select value={leccionId} onValueChange={setLeccionId}>
                                    <SelectTrigger><SelectValue placeholder="Todas las lecciones" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Todas las lecciones</SelectItem>
                                        {lecciones.map(l => (
                                             <SelectItem key={l.id} value={String(l.id)}>
                                                {l.materia?.codigo} - {l.titulo}
                                             </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={filtrar} variant="outline"><Search className="h-4 w-4 mr-2" />Filtrar</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Selector de Pestañas / Estados */}
                <div className="flex flex-wrap items-center gap-2 border-b pb-2">
                    <Button
                        type="button"
                        variant={tabEstado === 'todos' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTabEstado('todos')}
                        className="rounded-full"
                    >
                        Todas las Entregas ({entregas?.length || 0})
                    </Button>
                    <Button
                        type="button"
                        variant={tabEstado === 'pendientes' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTabEstado('pendientes')}
                        className={`rounded-full ${pendientesCount > 0 && tabEstado !== 'pendientes' ? 'text-amber-600 font-semibold' : ''}`}
                    >
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Por Calificar ({pendientesCount})
                    </Button>
                    <Button
                        type="button"
                        variant={tabEstado === 'calificados' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTabEstado('calificados')}
                        className="rounded-full"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Calificadas ({calificadasCount})
                    </Button>
                    {filtroLeccionId && (
                        <Button
                            type="button"
                            variant={tabEstado === 'sin_entregar' ? 'destructive' : 'ghost'}
                            size="sm"
                            onClick={() => setTabEstado('sin_entregar')}
                            className={`rounded-full ${sinEntregarCount > 0 && tabEstado !== 'sin_entregar' ? 'text-rose-600 font-semibold' : ''}`}
                        >
                            <UserX className="h-3.5 w-3.5 mr-1.5" />
                            Sin Entregar ({sinEntregarCount})
                        </Button>
                    )}
                </div>

                {/* Vista Sin Entregar */}
                {tabEstado === 'sin_entregar' && filtroLeccionId ? (
                    <Card>
                        <CardHeader className="border-b bg-rose-50/40 dark:bg-rose-950/20">
                            <CardTitle className="text-base font-semibold flex items-center text-rose-700 dark:text-rose-400">
                                <UserX className="h-4 w-4 mr-2" />
                                Estudiantes que aún no han entregado ({sinEntregarCount})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {sinEntregarCount === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                                    <p className="font-medium text-emerald-700 dark:text-emerald-400">¡Excelente!</p>
                                    <p className="text-sm">Todos los estudiantes inscritos han presentado su entrega para esta lección.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="py-3 px-4 font-medium">Estudiante</th>
                                                <th className="py-3 px-4 font-medium">Estado</th>
                                                <th className="py-3 px-4 font-medium">Observación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudiantesSinEntregar?.map(est => (
                                                <tr key={est.id} className="border-b hover:bg-muted/40 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-foreground">
                                                        {nombreCompleto(est.user)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="destructive" className="font-normal text-xs">
                                                            Sin entrega
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-muted-foreground">
                                                        Pendiente de envío por el estudiante
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    /* Tabla de entregas enviadas */
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                {tabEstado === 'pendientes' && `Entregas pendientes de calificar (${entregasFiltradas.length})`}
                                {tabEstado === 'calificados' && `Entregas ya calificadas (${entregasFiltradas.length})`}
                                {tabEstado === 'todos' && `Listado de entregas (${entregasFiltradas.length})`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b text-left text-muted-foreground">
                                        <th className="py-3 px-4 font-medium">Estudiante</th>
                                        <th className="py-3 px-4 font-medium">Lección</th>
                                        <th className="py-3 px-4 font-medium">Materia</th>
                                        <th className="py-3 px-4 font-medium">Estado Entrega</th>
                                        <th className="py-3 px-4 font-medium">Calificación</th>
                                        <th className="py-3 px-4 text-right font-medium">Acciones</th>
                                    </tr></thead>
                                    <tbody>
                                        {entregasFiltradas.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                                    No se encontraron entregas en esta sección.
                                                </td>
                                            </tr>
                                        ) : (
                                            entregasFiltradas.map((e) => (
                                                <tr key={e.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="py-3 px-4 text-xs font-medium">{nombreCompleto(e.estudiante.user)}</td>
                                                    <td className="py-3 px-4 text-xs">{e.leccion?.titulo}</td>
                                            <td className="py-3 px-4 text-xs">{e.leccion?.materia?.codigo}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={e.estado_entrega === 'entregado' ? 'default' : 'destructive'}>{e.estado_entrega}</Badge>
                                                {e.fecha_entrega && (
                                                    <p className="text-[11px] text-muted-foreground mt-1">
                                                        {formatoFechaHora(e.fecha_entrega)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs">
                                                {e.calificacion ? (
                                                    <div>
                                                        <span className={`font-bold ${e.calificacion.nota >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {e.calificacion.nota}/100
                                                        </span>
                                                        {e.refuerzo && (
                                                            <div className="mt-1">
                                                                <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300">
                                                                    {e.refuerzo.completado ? 'Refuerzo completado' : 'Refuerzo activo'}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Pendiente</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {e.archivos_enviado?.map((a, i) => (
                                                        <a key={i} href={`/storage/${a}`} target="_blank" rel="noreferrer">
                                                            <Button variant="outline" size="icon" title="Ver archivo"><Eye className="h-4 w-4" /></Button>
                                                        </a>
                                                    ))}
                                                    {e.calificacion && e.calificacion.nota < 75 && !e.refuerzo && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => abrirRefuerzoManual(e)}
                                                            title="Generar preguntas de refuerzo IA"
                                                            className="text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 dark:hover:text-purple-200"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="icon" onClick={() => openCalificar(e)} title="Calificar">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                )}

                {/* Modal Calificar */}
                <Dialog open={modalCalificar} onOpenChange={setModalCalificar}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Calificar Entrega</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground mb-2">
                            <p><strong>Estudiante:</strong> {entregaSelect ? nombreCompleto(entregaSelect.estudiante.user) : ''}</p>
                            <p><strong>Lección:</strong> {entregaSelect?.leccion?.titulo}</p>
                        </div>
                        <form onSubmit={handleCalificar} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Nota (0-100) *</Label>
                                <Input type="number" min="0" max="100" step="0.01" value={nota} onChange={(e) => setNota(e.target.value)} required placeholder="85.5" />
                                {errors.nota && <p className="text-red-500 text-sm">{errors.nota}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Comentarios</Label>
                                <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} className="border rounded p-2 w-full text-sm bg-background" rows={3} placeholder="Retroalimentación..." />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalCalificar(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                    {entregaSelect?.calificacion ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Refuerzo IA */}
                <Dialog open={modalRefuerzo} onOpenChange={setModalRefuerzo}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between gap-3">
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    Preguntas de refuerzo con IA
                                </DialogTitle>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={actualizarTodas}
                                    disabled={cargandoRefuerzo || guardandoRefuerzo}
                                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/60 dark:hover:text-purple-200 dark:hover:border-purple-700"
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

                        {/* Error al generar preguntas */}
                        {errorGeneracion && preguntasRefuerzo.length === 0 && !cargandoRefuerzo && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                                            No se pudieron generar las preguntas con IA
                                        </h4>
                                        <p className="text-xs text-red-700 dark:text-red-400 whitespace-pre-line">
                                            {errorGeneracion}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => entregaRefuerzoId && generarPreguntas(entregaRefuerzoId, true)}
                                        className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
                                    >
                                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                        Reintentar generación
                                    </Button>
                                </div>
                            </div>
                        )}

                        {preguntasRefuerzo.length === 0 && cargandoRefuerzo ? (
                            <div className="py-12 text-center">
                                <LoaderCircle className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                                <p className="mt-3 text-sm text-neutral-500">
                                    Generando preguntas con IA...
                                </p>
                            </div>
                        ) : (
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
                                            className="w-full rounded-md border p-2 text-sm bg-background"
                                            rows={2}
                                        />
                                    </div>
                                ))}

                                {preguntasRefuerzo.length > 0 && (
                                    <div className="space-y-1 pt-4 border-t">
                                        <Label className="text-xs text-neutral-500">
                                            📝 Recomendación de estudio
                                        </Label>
                                        <textarea
                                            value={recomendacion}
                                            onChange={(e) => setRecomendacion(e.target.value)}
                                            className="w-full rounded-md border p-2 text-sm bg-background"
                                            rows={3}
                                        />
                                    </div>
                                )}
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

                {/* Modal Confirmar Refrescar */}
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