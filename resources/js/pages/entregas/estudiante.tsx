import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BookOpen, ChevronRight, Clock, FileText, LoaderCircle, Paperclip, Send, Sparkles, Upload } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatoFechaHora, obtenerEstadoVencimiento } from '@/lib/formatters';
import { type BreadcrumbItem } from '@/types';

interface MateriaData { id: number; nombre: string; codigo: string; }
interface DocenteData { id: number; user: { nombre: string; apellido_paterno: string; apellido_materno: string; }; }
interface LeccionData {
    id: number; hash_id?: string; titulo: string; fecha_programada?: string | null; fecha_entrega: string | null;
    materia: MateriaData; docente: DocenteData; curso: { paralelo: string; gestion: { año: number; etapa: string } };
}
interface CalificacionData { id: number; nota: number; comentarios: string | null; }
interface RefuerzoData { id: number; hash_id?: string; completado: boolean; }

interface Entrega {
    id: number; estado_entrega: string; estado_calificacion: string;
    fecha_entrega: string | null; archivos_enviado: string[] | null; comentarios: string | null;
    leccion: LeccionData; calificacion: CalificacionData | null;
    refuerzo: RefuerzoData | null;
}

interface Props {
    entregas: Entrega[];
    leccionesPendientes: LeccionData[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mis Entregas', href: '/entregas' }];

export default function EntregasEstudiante({ entregas, leccionesPendientes }: Props) {
    const [modalSubir, setModalSubir] = useState(false);
    const [leccionSelect, setLeccionSelect] = useState<LeccionData | null>(null);
    const [archivos, setArchivos] = useState<FileList | null>(null);
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const nombreCompleto = (u: DocenteData['user']) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const openSubir = (leccion: LeccionData) => {
        setLeccionSelect(leccion);
        setArchivos(null);
        setComentarios('');
        setErrors({});
        setModalSubir(true);
    };

    const handleSubir: FormEventHandler = (e) => {
        e.preventDefault();
        if (!archivos || archivos.length === 0) {
            setErrors({ archivos: 'Selecciona al menos un archivo' });
            return;
        }
        setProcessing(true);
        const formData = new FormData();
        formData.append('leccion_id', String(leccionSelect?.id || ''));
        for (let i = 0; i < archivos.length; i++) {
            formData.append('archivos[]', archivos[i]);
        }
        formData.append('comentarios', comentarios);

        router.post('/entregas', formData, {
            onSuccess: () => {
                setModalSubir(false);
                toast.success('Entrega subida correctamente');
                setProcessing(false);
            },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    // 🎯 Agrupar entregas por materia
    const entregasPorMateria = useMemo(() => {
        const grupos: Record<string, { materia: MateriaData; entregas: Entrega[] }> = {};

        entregas.forEach((e) => {
            const key = String(e.leccion.materia.id);
            if (!grupos[key]) {
                grupos[key] = { materia: e.leccion.materia, entregas: [] };
            }
            grupos[key].entregas.push(e);
        });

        return Object.values(grupos);
    }, [entregas]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Entregas" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">Mis Entregas</h1>

                {/* Pendientes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Tareas Pendientes ({leccionesPendientes?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(!leccionesPendientes || leccionesPendientes.length === 0) && (
                            <p className="text-muted-foreground text-sm">No tienes tareas pendientes.</p>
                        )}
                        <div className="space-y-3">
                            {leccionesPendientes?.map((l) => {
                                const estadoVenc = obtenerEstadoVencimiento(l.fecha_entrega, l.fecha_programada);
                                return (
                                    <div key={l.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-sm">{l.titulo}</p>
                                                {estadoVenc && (
                                                    <Badge
                                                        className={`text-[10px] px-2 py-0 ${
                                                            estadoVenc.vencido
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                                : estadoVenc.esHoy
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                        }`}
                                                    >
                                                        <Clock className="mr-1 h-2.5 w-2.5" />
                                                        {estadoVenc.textoBadge}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {l.materia?.codigo} - {l.materia?.nombre} | Docente: {l.docente ? nombreCompleto(l.docente.user) : '-'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                {l.fecha_programada && (
                                                    <span className="text-muted-foreground">
                                                        Inicio: {formatoFechaHora(l.fecha_programada)}
                                                    </span>
                                                )}
                                                <span className="font-medium text-rose-600 dark:text-rose-400">
                                                    Límite: {formatoFechaHora(l.fecha_entrega)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            <Button size="sm" asChild variant="outline">
                                                <Link href={`/lecciones/${l.hash_id || l.id}`}>
                                                    Ver detalle
                                                </Link>
                                            </Button>
                                            <Button size="sm" onClick={() => openSubir(l)} className="bg-indigo-600 hover:bg-indigo-700">
                                                <Upload className="h-4 w-4 mr-1.5" />Subir entrega
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Entregas Realizadas - AGRUPADAS POR MATERIA */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Entregas Realizadas ({entregas?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {(!entregas || entregas.length === 0) && (
                            <p className="text-muted-foreground text-sm">No has realizado ninguna entrega.</p>
                        )}

                        {entregasPorMateria.map(({ materia, entregas: entregasMateria }) => {
                            const refuerzosPendientes = entregasMateria.filter(
                                (e) => e.refuerzo && !e.refuerzo.completado
                            ).length;

                            return (
                                <div key={materia.id} className="space-y-3">
                                    {/* Encabezado de la materia */}
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                            <span className="font-semibold text-sm">
                                                {materia.codigo} - {materia.nombre}
                                            </span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {entregasMateria.length} entrega{entregasMateria.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        {refuerzosPendientes > 0 && (
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                {refuerzosPendientes} refuerzo{refuerzosPendientes !== 1 ? 's' : ''} pendiente{refuerzosPendientes !== 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Entregas de esta materia */}
                                    <div className="space-y-3">
                                        {entregasMateria.map((e) => {
                                            const tieneRefuerzoPendiente = e.refuerzo && !e.refuerzo.completado;

                                            return (
                                                <div
                                                    key={e.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => {
                                                        const target = e.leccion?.hash_id || e.leccion?.id;
                                                        if (target) {
                                                            router.visit(`/lecciones/${target}`);
                                                        }
                                                    }}
                                                    onKeyDown={(ev) => {
                                                        if (ev.key === 'Enter' || ev.key === ' ') {
                                                            ev.preventDefault();
                                                            const target = e.leccion?.hash_id || e.leccion?.id;
                                                            if (target) {
                                                                router.visit(`/lecciones/${target}`);
                                                            }
                                                        }
                                                    }}
                                                    className="group relative border rounded-lg p-4 space-y-3 cursor-pointer transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {e.leccion?.titulo}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Docente: {e.leccion?.docente ? nombreCompleto(e.leccion.docente.user) : '-'}
                                                            </p>
                                                            {e.fecha_entrega && (
                                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                    Entregado: {formatoFechaHora(e.fecha_entrega)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs gap-1 border-neutral-300 dark:border-neutral-700 group-hover:border-indigo-400 group-hover:bg-indigo-50 group-hover:text-indigo-700 dark:group-hover:border-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-300 transition-all"
                                                                onClick={(ev) => {
                                                                    ev.stopPropagation();
                                                                    const target = e.leccion?.hash_id || e.leccion?.id;
                                                                    if (target) {
                                                                        router.visit(`/lecciones/${target}`);
                                                                    }
                                                                }}
                                                            >
                                                                Ver detalle
                                                                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                                            </Button>
                                                            <Badge variant={e.estado_entrega === 'entregado' ? 'default' : e.estado_entrega === 'atrasado' ? 'destructive' : 'secondary'}>
                                                                {e.estado_entrega}
                                                            </Badge>
                                                            <Badge variant={e.estado_calificacion === 'calificado' ? 'default' : 'outline'}>
                                                                {e.estado_calificacion === 'calificado' ? `Nota: ${e.calificacion?.nota}/100` : 'Sin calificar'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {e.calificacion?.comentarios && (
                                                        <p className="text-sm bg-muted p-2 rounded">{e.calificacion.comentarios}</p>
                                                    )}

                                                    {e.archivos_enviado && e.archivos_enviado.length > 0 && (
                                                        <div
                                                            className="flex gap-3 relative z-10"
                                                            onClick={(ev) => ev.stopPropagation()}
                                                        >
                                                            {e.archivos_enviado.map((archivo, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={`/storage/${archivo}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                                >
                                                                    <Paperclip className="h-3 w-3" />
                                                                    Archivo {i + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* 🎯 BANNER DE REFUERZO INMEDIATO (CORRECTIVO) */}
                                                    {tieneRefuerzoPendiente && (
                                                        <div
                                                            className="rounded-lg border border-sky-300 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-800 p-3.5 space-y-2 relative overflow-hidden z-10"
                                                            onClick={(ev) => ev.stopPropagation()}
                                                        >
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                                                                    <span>🔧</span>
                                                                    <span>REFUERZO INMEDIATO (Correctivo)</span>
                                                                </p>
                                                                {e.calificacion?.nota && (
                                                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                                                        Nota: {Math.round(e.calificacion.nota)}/100 ⚠️
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-neutral-700 dark:text-neutral-300">
                                                                Recomendación: Responde estas 10 preguntas de práctica para reforzar los conceptos clave de este tema.
                                                            </p>
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8 shadow-xs"
                                                            >
                                                                <Link href={`/refuerzos/${e.refuerzo?.hash_id || e.refuerzo!.id}`}>
                                                                    <span className="mr-1.5">📝</span>
                                                                    Iniciar práctica
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Indicador si ya completó */}
                                                    {e.refuerzo?.completado && (
                                                        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded p-2">
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                            Refuerzo completado
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Modal Subir */}
                <Dialog open={modalSubir} onOpenChange={setModalSubir}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Subir Entrega</DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{leccionSelect?.titulo}</p>
                                    {leccionSelect?.fecha_entrega && (
                                        <p className="text-xs text-rose-600 dark:text-rose-400">
                                            Fecha y hora límite: {formatoFechaHora(leccionSelect.fecha_entrega)}
                                        </p>
                                    )}
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubir} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Archivos *</Label>
                                <Input type="file" multiple onChange={(e) => setArchivos(e.target.files)} />
                                {errors.archivos && <p className="text-red-500 text-sm">{errors.archivos}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Comentarios</Label>
                                <textarea
                                    value={comentarios}
                                    onChange={(e) => setComentarios(e.target.value)}
                                    className="border rounded p-2 w-full text-sm bg-background"
                                    rows={3}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalSubir(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                    Subir
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}