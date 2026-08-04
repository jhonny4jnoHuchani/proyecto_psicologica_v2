import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Clock, GraduationCap, LoaderCircle, Upload } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserData { nombre: string; apellido_paterno: string; apellido_materno: string; }
interface MateriaData { id: number; nombre: string; codigo: string; }
interface DocenteData { id: number; user: UserData; }
interface CursoData { id: number; paralelo: string; gestion: { año: number; etapa: string }; }

interface LeccionData {
    id: number; titulo: string; descripcion: string | null;
    fecha_programada: string | null; fecha_entrega: string | null;
    estado: string; materia: MateriaData; docente: DocenteData; curso: CursoData;
}

interface CalificacionData { id: number; nota: number; comentarios: string | null; }

interface EntregaData {
    id: number; estado_entrega: string; estado_calificacion: string;
    fecha_entrega: string | null; archivos_enviado: string[] | null;
    comentarios: string | null; calificacion: CalificacionData | null;
}

interface Props {
    leccion: LeccionData;
    entrega: EntregaData | null;
    rol: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lecciones', href: '/lecciones' },
    { title: 'Detalle', href: '' },
];

function diasRestantes(fecha?: string | null) {
    if (!fecha) return null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const obj = new Date(`${fecha.split('T')[0]}T00:00:00`);
    return Math.round((obj.getTime() - hoy.getTime()) / 86400000);
}

function formatoFechaLarga(fecha?: string | null) {
    if (!fecha) return 'Sin fecha';
    return new Date(`${fecha.split('T')[0]}T00:00:00`).toLocaleDateString('es-BO', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

export default function LeccionesShow({ leccion, entrega: entregaInicial, rol }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    
    const [entrega] = useState<EntregaData | null>(entregaInicial);
    const [archivos, setArchivos] = useState<FileList | null>(null);
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Mostrar mensaje flash si existe
    useEffect(() => {
        if (flash?.success) setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    }, [flash]);

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;
    const restantes = diasRestantes(leccion.fecha_entrega);
    const esEstudiante = rol === 'estudiante';
    const puedeEntregar = esEstudiante && (!entrega || (entrega.estado_calificacion !== 'calificado' && restantes !== null && restantes >= 0));

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!archivos || archivos.length === 0) {
            setErrors({ archivos: 'Selecciona al menos un archivo' });
            return;
        }
        setProcessing(true);
        setErrors({});
        
        const formData = new FormData();
        formData.append('leccion_id', String(leccion.id));
        for (let i = 0; i < archivos.length; i++) formData.append('archivos[]', archivos[i]);
        formData.append('comentarios', comentarios);

        router.post('/entregas', formData, {
            onSuccess: () => {
                setProcessing(false);
                setArchivos(null);
                setComentarios('');
                setShowSuccess(true);
                // Actualizar entrega localmente con los datos de la respuesta
                // Recargar la página para ver los cambios
                router.reload();
            },
            onError: (err) => { 
                setErrors(err); 
                setProcessing(false); 
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={leccion.titulo} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Button variant="outline" asChild>
                    <Link href="/lecciones"><ArrowLeft className="mr-2 h-4 w-4" />Volver a lecciones</Link>
                </Button>

                {/* Mensaje de éxito */}
                {showSuccess && (
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4 animate-in fade-in">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        <div>
                            <p className="font-medium text-emerald-800">¡Entrega realizada!</p>
                            <p className="text-sm text-emerald-600">Tu archivo ha sido subido exitosamente.</p>
                        </div>
                    </div>
                )}

                {/* Detalle de la lección */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-indigo-600">
                            <BookOpen className="h-4 w-4" />
                            {leccion.materia?.codigo} - {leccion.materia?.nombre}
                        </div>
                        <CardTitle className="text-xl">{leccion.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leccion.descripcion && (
                            <div>
                                <Label className="text-xs text-neutral-500">Descripción</Label>
                                <p className="mt-1 text-sm">{leccion.descripcion}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-neutral-600">
                                <GraduationCap className="h-4 w-4" />
                                {leccion.docente ? nombreCompleto(leccion.docente.user) : 'Sin docente'}
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-600">
                                <CalendarDays className="h-4 w-4" />
                                {formatoFechaLarga(leccion.fecha_entrega)}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {restantes !== null && restantes > 0 && (
                                    <Badge className="bg-amber-100 text-amber-700">{restantes} días restantes</Badge>
                                )}
                                {restantes === 0 && (
                                    <Badge className="bg-red-100 text-red-700">¡Entrega hoy!</Badge>
                                )}
                                {restantes !== null && restantes < 0 && (
                                    <Badge className="bg-red-100 text-red-700">Vencida</Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección de Entrega (solo estudiante) */}
                {esEstudiante && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Upload className="h-5 w-5" />
                                {entrega ? 'Mi Entrega' : 'Subir Entrega'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {entrega ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant={entrega.estado_entrega === 'entregado' ? 'default' : 'destructive'}>
                                            {entrega.estado_entrega === 'entregado' ? '✅ Entregado' : '⚠️ Atrasado'}
                                        </Badge>
                                        <Badge variant={entrega.estado_calificacion === 'calificado' ? 'default' : 'outline'}>
                                            {entrega.estado_calificacion === 'calificado' 
                                                ? `⭐ ${entrega.calificacion?.nota}/100` 
                                                : '⏳ Sin calificar'}
                                        </Badge>
                                        {entrega.fecha_entrega && (
                                            <span className="text-xs text-neutral-500">
                                                Entregado: {formatoFechaLarga(entrega.fecha_entrega)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {entrega.calificacion?.comentarios && (
                                        <div className="rounded bg-neutral-50 border p-3 text-sm">
                                            <strong>📝 Retroalimentación:</strong>
                                            <p className="mt-1">{entrega.calificacion.comentarios}</p>
                                        </div>
                                    )}
                                    
                                    {entrega.archivos_enviado && entrega.archivos_enviado.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-neutral-500 mb-1">Archivos enviados:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {entrega.archivos_enviado.map((a, i) => (
                                                    <a key={i} href={`/storage/${a}`} target="_blank" 
                                                        className="inline-flex items-center gap-1 rounded bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
                                                        📎 Archivo {i + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {puedeEntregar && (
                                        <div className="rounded bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                                            Puedes volver a subir archivos para reemplazar tu entrega actual.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                                    ⚠️ Aún no has realizado tu entrega. 
                                    {restantes !== null && restantes > 0 && ` Tienes ${restantes} días para entregar.`}
                                    {restantes === 0 && ' ¡La entrega es hoy!'}
                                </div>
                            )}

                            {puedeEntregar && (
                                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                                    <div className="space-y-1">
                                        <Label>Archivos * (puedes seleccionar varios)</Label>
                                        <Input 
                                            type="file" 
                                            multiple 
                                            onChange={(e) => {
                                                setArchivos(e.target.files);
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setErrors({});
                                                }
                                            }} 
                                        />
                                        {archivos && archivos.length > 0 && (
                                            <p className="text-xs text-emerald-600 mt-1">
                                                {archivos.length} archivo(s) seleccionado(s)
                                            </p>
                                        )}
                                        {errors.archivos && <p className="text-sm text-red-500">{errors.archivos}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Comentarios (opcional)</Label>
                                        <textarea
                                            value={comentarios}
                                            onChange={(e) => setComentarios(e.target.value)}
                                            className="w-full rounded-md border p-2 text-sm"
                                            rows={3}
                                            placeholder="Comentarios para el docente..."
                                        />
                                    </div>
                                    <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        {entrega ? '🔄 Actualizar entrega' : '📤 Subir entrega'}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}