import { Head, router } from '@inertiajs/react';
import { Eye, LoaderCircle, Search, Star } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface MateriaData { id: number; nombre: string; codigo: string; }
interface EstudianteData { id: number; user: { nombre: string; apellido_paterno: string; apellido_materno: string; }; }
interface LeccionData { id: number; titulo: string; materia: MateriaData; }
interface CalificacionData { id: number; nota: number; comentarios: string | null; }

interface Entrega {
    id: number; estado_entrega: string; estado_calificacion: string;
    fecha_entrega: string | null; archivos_enviado: string[] | null; comentarios: string | null;
    leccion: LeccionData; estudiante: EstudianteData; calificacion: CalificacionData | null;
}

interface LeccionFiltro { id: number; titulo: string; materia: MateriaData; }

interface Props {
    entregas: Entrega[];
    lecciones: LeccionFiltro[];
    filtroLeccionId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Entregas', href: '/entregas/docente' }];

export default function EntregasDocente({ entregas, lecciones, filtroLeccionId }: Props) {
    const [leccionId, setLeccionId] = useState(filtroLeccionId ? String(filtroLeccionId) : '');

    // Modal Calificar
    const [modalCalificar, setModalCalificar] = useState(false);
    const [entregaSelect, setEntregaSelect] = useState<Entrega | null>(null);
    const [nota, setNota] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const handleCalificar: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/calificaciones', {
            entrega_id: entregaSelect?.id,
            nota,
            comentarios,
        }, {
            onSuccess: () => {
                setModalCalificar(false);
                toast.success('Calificación guardada correctamente');
                setProcessing(false);
            },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entregas de Estudiantes" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">Entregas de Estudiantes</h1>

                {/* Filtro */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-end gap-3">
                            <div className="space-y-1 flex-1">
                                <Label>Filtrar por Lección</Label>
                                <Select value={leccionId} onValueChange={setLeccionId}>
                                    <SelectTrigger><SelectValue placeholder="Todas las lecciones" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Todas</SelectItem>
                                        {lecciones.map(l => (
                                            <SelectItem key={l.id} value={String(l.id)}>{l.materia?.codigo} - {l.titulo}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={filtrar} variant="outline"><Search className="h-4 w-4 mr-2" />Filtrar</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader><CardTitle>Entregas ({entregas?.length || 0})</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b text-left">
                                    <th className="py-3 px-4">Estudiante</th>
                                    <th className="py-3 px-4">Lección</th>
                                    <th className="py-3 px-4">Materia</th>
                                    <th className="py-3 px-4">Estado</th>
                                    <th className="py-3 px-4">Calificación</th>
                                    <th className="py-3 px-4 text-right">Acciones</th>
                                </tr></thead>
                                <tbody>
                                    {(!entregas || entregas.length === 0) && (
                                        <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No hay entregas</td></tr>
                                    )}
                                    {entregas?.map((e) => (
                                        <tr key={e.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 text-xs">{nombreCompleto(e.estudiante.user)}</td>
                                            <td className="py-3 px-4 text-xs">{e.leccion?.titulo}</td>
                                            <td className="py-3 px-4 text-xs">{e.leccion?.materia?.codigo}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={e.estado_entrega === 'entregado' ? 'default' : 'destructive'}>{e.estado_entrega}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-xs">
                                                {e.calificacion ? (
                                                    <span className="font-bold text-green-600 dark:text-green-400">{e.calificacion.nota}/100</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Pendiente</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {e.archivos_enviado?.map((a, i) => (
                                                        <a key={i} href={`/storage/${a}`} target="_blank">
                                                            <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
                                                        </a>
                                                    ))}
                                                    <Button variant="outline" size="icon" onClick={() => openCalificar(e)} title="Calificar">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

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
            </div>
        </AppLayout>
    );
}