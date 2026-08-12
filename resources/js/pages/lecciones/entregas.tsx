import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CalendarDays, Clock, Eye, GraduationCap, LoaderCircle, Star, UserX, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    const [modalCalificar, setModalCalificar] = useState(false);
    const [entregaSelect, setEntregaSelect] = useState<EntregaData | null>(null);
    const [nota, setNota] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);

    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const openCalificar = (entrega: EntregaData) => {
        setEntregaSelect(entrega);
        setNota(entrega.calificacion?.nota ? String(entrega.calificacion.nota) : '');
        setComentarios(entrega.calificacion?.comentarios || '');
        setModalCalificar(true);
    };

    const handleCalificar: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/calificaciones', {
            entrega_id: entregaSelect?.id,
            nota,
            comentarios,
        }, {
            onSuccess: () => { setModalCalificar(false); setProcessing(false); },
            onError: () => setProcessing(false),
        });
    };

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

                {/* Modal Calificar */}
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
            </div>
        </AppLayout>
    );
}