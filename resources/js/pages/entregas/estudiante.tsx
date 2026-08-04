import { Head, router } from '@inertiajs/react';
import { FileText, LoaderCircle, Paperclip, Send, Upload } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
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

interface Entrega {
    id: number; estado_entrega: string; estado_calificacion: string;
    fecha_entrega: string | null; archivos_enviado: string[] | null; comentarios: string | null;
    leccion: LeccionData; calificacion: CalificacionData | null;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Entregas" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">Mis Entregas</h1>

                {/* Pendientes */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" />Tareas Pendientes ({leccionesPendientes?.length || 0})</CardTitle></CardHeader>
                    <CardContent>
                        {(!leccionesPendientes || leccionesPendientes.length === 0) && (
                            <p className="text-muted-foreground text-sm">No tienes tareas pendientes.</p>
                        )}
                        <div className="space-y-3">
                            {leccionesPendientes?.map((l) => (
                                <div key={l.id} className="flex items-center justify-between border rounded-lg p-3">
                                    <div>
                                        <p className="font-medium">{l.titulo}</p>
                                        <p className="text-xs text-muted-foreground">{l.materia?.codigo} - {l.materia?.nombre} | Docente: {l.docente ? nombreCompleto(l.docente.user) : '-'}</p>
                                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">Entrega: {l.fecha_entrega || 'Sin fecha'}</p>
                                    </div>
                                    <Button size="sm" onClick={() => openSubir(l)}>
                                        <Upload className="h-4 w-4 mr-2" />Subir
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Entregas Realizadas */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Entregas Realizadas ({entregas?.length || 0})</CardTitle></CardHeader>
                    <CardContent>
                        {(!entregas || entregas.length === 0) && (
                            <p className="text-muted-foreground text-sm">No has realizado ninguna entrega.</p>
                        )}
                        <div className="space-y-3">
                            {entregas?.map((e) => (
                                <div key={e.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{e.leccion?.titulo}</p>
                                            <p className="text-xs text-muted-foreground">{e.leccion?.materia?.codigo} | Docente: {e.leccion?.docente ? nombreCompleto(e.leccion.docente.user) : '-'}</p>
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
                                        <p className="text-sm mt-2 bg-muted p-2 rounded">{e.calificacion.comentarios}</p>
                                    )}
                                    {e.archivos_enviado && e.archivos_enviado.length > 0 && (
                                        <div className="flex gap-3 mt-2">
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
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Modal Subir */}
                <Dialog open={modalSubir} onOpenChange={setModalSubir}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Subir Entrega</DialogTitle><DialogDescription>{leccionSelect?.titulo}</DialogDescription></DialogHeader>
                        <form onSubmit={handleSubir} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Archivos *</Label>
                                <Input type="file" multiple onChange={(e) => setArchivos(e.target.files)} />
                                {errors.archivos && <p className="text-red-500 text-sm">{errors.archivos}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label>Comentarios</Label>
                                <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} className="border rounded p-2 w-full text-sm bg-background" rows={3} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalSubir(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Subir</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}