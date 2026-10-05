import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BookOpen, FileText, LoaderCircle, Paperclip, Send, Sparkles, Upload } from 'lucide-react';
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
import { type BreadcrumbItem } from '@/types';

interface MateriaData { id: number; nombre: string; codigo: string; }
interface DocenteData { id: number; user: { nombre: string; apellido_paterno: string; apellido_materno: string; }; }
interface LeccionData {
    id: number; titulo: string; fecha_entrega: string | null;
    materia: MateriaData; docente: DocenteData; curso: { paralelo: string; gestion: { año: number; etapa: string } };
}
interface CalificacionData { id: number; nota: number; comentarios: string | null; }
interface RefuerzoData { id: number; completado: boolean; }

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
                            {leccionesPendientes?.map((l) => (
                                <div key={l.id} className="flex items-center justify-between border rounded-lg p-3">
                                    <div>
                                        <p className="font-medium">{l.titulo}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {l.materia?.codigo} - {l.materia?.nombre} | Docente: {l.docente ? nombreCompleto(l.docente.user) : '-'}
                                        </p>
                                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                            Entrega: {l.fecha_entrega || 'Sin fecha'}
                                        </p>
                                    </div>
                                    <Button size="sm" onClick={() => openSubir(l)}>
                                        <Upload className="h-4 w-4 mr-2" />Subir
                                    </Button>
                                </div>
                            ))}
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
                                                <div key={e.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{e.leccion?.titulo}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Docente: {e.leccion?.docente ? nombreCompleto(e.leccion.docente.user) : '-'}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
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
                                                        <div className="flex gap-3">
                                                            {e.archivos_enviado.map((archivo, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={`/storage/${archivo}`}
                                                                    target="_blank"
                                                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                                >
                                                                    <Paperclip className="h-3 w-3" />
                                                                    Archivo {i + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* 🎯 BANNER DE REFUERZO PENDIENTE */}
                                                    {tieneRefuerzoPendiente && (
                                                        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
                                                            <div className="flex items-start gap-3">
                                                                <div className="rounded-full bg-amber-200 p-1.5 shrink-0">
                                                                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-amber-800">
                                                                        ¡Tienes un refuerzo pendiente!
                                                                    </p>
                                                                    <p className="text-xs text-amber-700 mt-0.5">
                                                                        La IA generó 10 preguntas para ayudarte a mejorar en este tema.
                                                                    </p>
                                                                    <Button
                                                                        asChild
                                                                        size="sm"
                                                                        className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
                                                                    >
                                                                        <Link href={`/refuerzos/${e.refuerzo!.id}`}>
                                                                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                                                            Responder ahora
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </div>
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
                            <DialogDescription>{leccionSelect?.titulo}</DialogDescription>
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