import { Head, router } from '@inertiajs/react';
import { Image, LoaderCircle, Megaphone, Pencil, Plus, Trash2, Users } from 'lucide-react';
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

// ======================== TIPOS ========================
interface Portada {
    id: number;
    titulo: string | null;
    imagen: string;
    orden: number;
    activo: boolean;
}

interface Autoridad {
    id: number;
    nombre: string;
    cargo: string;
    foto: string | null;
    mensaje: string | null;
    orden: number;
}

interface Convocatoria {
    id: number;
    titulo: string;
    descripcion: string | null;
    archivo: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    activo: boolean;
    deleted_at: string | null;
}

interface Props {
    portadas: Portada[];
    autoridades: Autoridad[];
    convocatorias: Convocatoria[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Página Admin', href: '/pagina-admin' },
];

export default function PaginaAdminIndex({ portadas, autoridades, convocatorias }: Props) {
    const [activeTab, setActiveTab] = useState<'portadas' | 'autoridades' | 'convocatorias'>('portadas');

    // ======================== PORTADAS ========================
    const [modalPortada, setModalPortada] = useState(false);
    const [portadaSelect, setPortadaSelect] = useState<Portada | null>(null);
    const [portadaTitulo, setPortadaTitulo] = useState('');
    const [portadaImagen, setPortadaImagen] = useState<File | null>(null);
    const [portadaOrden, setPortadaOrden] = useState('0');

    // ======================== AUTORIDADES ========================
    const [modalAutoridad, setModalAutoridad] = useState(false);
    const [autoridadSelect, setAutoridadSelect] = useState<Autoridad | null>(null);
    const [autoridadNombre, setAutoridadNombre] = useState('');
    const [autoridadCargo, setAutoridadCargo] = useState('');
    const [autoridadFoto, setAutoridadFoto] = useState<File | null>(null);
    const [autoridadMensaje, setAutoridadMensaje] = useState('');
    const [autoridadOrden, setAutoridadOrden] = useState('0');

    // ======================== CONVOCATORIAS ========================
    const [modalConvocatoria, setModalConvocatoria] = useState(false);
    const [convocatoriaSelect, setConvocatoriaSelect] = useState<Convocatoria | null>(null);
    const [convocatoriaTitulo, setConvocatoriaTitulo] = useState('');
    const [convocatoriaDescripcion, setConvocatoriaDescripcion] = useState('');
    const [convocatoriaArchivo, setConvocatoriaArchivo] = useState<File | null>(null);
    const [convocatoriaInicio, setConvocatoriaInicio] = useState('');
    const [convocatoriaFin, setConvocatoriaFin] = useState('');
    const [convocatoriaActivo, setConvocatoriaActivo] = useState(true);

    const [processing, setProcessing] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [deleteType, setDeleteType] = useState<'portada' | 'autoridad' | 'convocatoria'>('portada');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // ======================== HANDLERS PORTADAS ========================
    const openCreatePortada = () => {
        setPortadaSelect(null);
        setPortadaTitulo('');
        setPortadaImagen(null);
        setPortadaOrden('0');
        setModalPortada(true);
    };

    const openEditPortada = (p: Portada) => {
        setPortadaSelect(p);
        setPortadaTitulo(p.titulo || '');
        setPortadaImagen(null);
        setPortadaOrden(String(p.orden));
        setModalPortada(true);
    };

    const handlePortada: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        formData.append('titulo', portadaTitulo);
        formData.append('orden', portadaOrden);
        if (portadaImagen) formData.append('imagen', portadaImagen);

        if (portadaSelect) {
            router.put(`/pagina-admin/portadas/${portadaSelect.id}`, formData, {
                onSuccess: () => { setModalPortada(false); setProcessing(false); toast.success('Portada actualizada'); },
                onError: () => setProcessing(false),
            });
        } else {
            router.post('/pagina-admin/portadas', formData, {
                onSuccess: () => { setModalPortada(false); setProcessing(false); toast.success('Portada agregada'); },
                onError: () => setProcessing(false),
            });
        }
    };

    // ======================== HANDLERS AUTORIDADES ========================
    const openCreateAutoridad = () => {
        setAutoridadSelect(null);
        setAutoridadNombre('');
        setAutoridadCargo('');
        setAutoridadFoto(null);
        setAutoridadMensaje('');
        setAutoridadOrden('0');
        setModalAutoridad(true);
    };

    const openEditAutoridad = (a: Autoridad) => {
        setAutoridadSelect(a);
        setAutoridadNombre(a.nombre);
        setAutoridadCargo(a.cargo);
        setAutoridadFoto(null);
        setAutoridadMensaje(a.mensaje || '');
        setAutoridadOrden(String(a.orden));
        setModalAutoridad(true);
    };

    const handleAutoridad: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        formData.append('nombre', autoridadNombre);
        formData.append('cargo', autoridadCargo);
        formData.append('mensaje', autoridadMensaje);
        formData.append('orden', autoridadOrden);
        if (autoridadFoto) formData.append('foto', autoridadFoto);

        if (autoridadSelect) {
            router.put(`/pagina-admin/autoridades/${autoridadSelect.id}`, formData, {
                onSuccess: () => { setModalAutoridad(false); setProcessing(false); toast.success('Autoridad actualizada'); },
                onError: () => setProcessing(false),
            });
        } else {
            router.post('/pagina-admin/autoridades', formData, {
                onSuccess: () => { setModalAutoridad(false); setProcessing(false); toast.success('Autoridad agregada'); },
                onError: () => setProcessing(false),
            });
        }
    };

    // ======================== HANDLERS CONVOCATORIAS ========================
    const openCreateConvocatoria = () => {
        setConvocatoriaSelect(null);
        setConvocatoriaTitulo('');
        setConvocatoriaDescripcion('');
        setConvocatoriaArchivo(null);
        setConvocatoriaInicio('');
        setConvocatoriaFin('');
        setConvocatoriaActivo(true);
        setModalConvocatoria(true);
    };

    const openEditConvocatoria = (c: Convocatoria) => {
        setConvocatoriaSelect(c);
        setConvocatoriaTitulo(c.titulo);
        setConvocatoriaDescripcion(c.descripcion || '');
        setConvocatoriaArchivo(null);
        setConvocatoriaInicio(c.fecha_inicio || '');
        setConvocatoriaFin(c.fecha_fin || '');
        setConvocatoriaActivo(c.activo);
        setModalConvocatoria(true);
    };

    const handleConvocatoria: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        formData.append('titulo', convocatoriaTitulo);
        formData.append('descripcion', convocatoriaDescripcion);
        formData.append('fecha_inicio', convocatoriaInicio);
        formData.append('fecha_fin', convocatoriaFin);
        formData.append('activo', convocatoriaActivo ? '1' : '0');
        if (convocatoriaArchivo) formData.append('archivo', convocatoriaArchivo);

        if (convocatoriaSelect) {
            router.put(`/pagina-admin/convocatorias/${convocatoriaSelect.id}`, formData, {
                onSuccess: () => { setModalConvocatoria(false); setProcessing(false); toast.success('Convocatoria actualizada'); },
                onError: () => setProcessing(false),
            });
        } else {
            router.post('/pagina-admin/convocatorias', formData, {
                onSuccess: () => { setModalConvocatoria(false); setProcessing(false); toast.success('Convocatoria publicada'); },
                onError: () => setProcessing(false),
            });
        }
    };

    // ======================== DELETE ========================
    const openDelete = (type: 'portada' | 'autoridad' | 'convocatoria', id: number) => {
        setDeleteType(type);
        setDeleteId(id);
        setModalDelete(true);
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/pagina-admin/${deleteType}s/${deleteId}`, {
            onSuccess: () => { setModalDelete(false); toast.success('Eliminado correctamente'); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Página Admin" />
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Administrar Página Welcome</h1>
                    <p className="text-sm text-neutral-500 mt-1">Configura el contenido que se muestra en la página principal.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <Button variant={activeTab === 'portadas' ? 'default' : 'outline'} onClick={() => setActiveTab('portadas')}>
                        <Image className="h-4 w-4 mr-2" />Portadas
                    </Button>
                    <Button variant={activeTab === 'autoridades' ? 'default' : 'outline'} onClick={() => setActiveTab('autoridades')}>
                        <Users className="h-4 w-4 mr-2" />Autoridades
                    </Button>
                    <Button variant={activeTab === 'convocatorias' ? 'default' : 'outline'} onClick={() => setActiveTab('convocatorias')}>
                        <Megaphone className="h-4 w-4 mr-2" />Convocatorias
                    </Button>
                </div>

                {/* ==================== PORTADAS ==================== */}
                {activeTab === 'portadas' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Fotos de Portada</CardTitle>
                            <Button onClick={openCreatePortada}><Plus className="h-4 w-4 mr-2" />Agregar Portada</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {(!portadas || portadas.length === 0) && (
                                    <p className="text-neutral-500 col-span-full text-center py-12">No hay portadas registradas</p>
                                )}
                                {portadas?.map((p) => (
                                    <div key={p.id} className="border rounded-lg overflow-hidden group">
                                        <img src={`/storage/${p.imagen}`} alt={p.titulo || ''} className="w-full h-40 object-cover" />
                                        <div className="p-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{p.titulo || 'Sin título'}</p>
                                                <p className="text-xs text-neutral-500">Orden: {p.orden}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="outline" size="icon" onClick={() => openEditPortada(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button variant="outline" size="icon" onClick={() => openDelete('portada', p.id)}><Trash2 className="h-3.5 w-3.5 text-rose-500" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ==================== AUTORIDADES ==================== */}
                {activeTab === 'autoridades' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Autoridades</CardTitle>
                            <Button onClick={openCreateAutoridad}><Plus className="h-4 w-4 mr-2" />Agregar Autoridad</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(!autoridades || autoridades.length === 0) && (
                                    <p className="text-neutral-500 text-center py-12">No hay autoridades registradas</p>
                                )}
                                {autoridades?.map((a) => (
                                    <div key={a.id} className="flex items-center gap-4 border rounded-lg p-4 group">
                                        {a.foto ? (
                                            <img src={`/storage/${a.foto}`} alt={a.nombre} className="h-14 w-14 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-neutral-200 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-neutral-500" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{a.nombre}</p>
                                            <p className="text-sm text-neutral-500">{a.cargo}</p>
                                            {a.mensaje && <p className="text-xs text-neutral-400 mt-1 truncate">{a.mensaje}</p>}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                            <Button variant="outline" size="icon" onClick={() => openEditAutoridad(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                                            <Button variant="outline" size="icon" onClick={() => openDelete('autoridad', a.id)}><Trash2 className="h-3.5 w-3.5 text-rose-500" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ==================== CONVOCATORIAS ==================== */}
                {activeTab === 'convocatorias' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Convocatorias</CardTitle>
                            <Button onClick={openCreateConvocatoria}><Plus className="h-4 w-4 mr-2" />Nueva Convocatoria</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(!convocatorias || convocatorias.length === 0) && (
                                    <p className="text-neutral-500 text-center py-12">No hay convocatorias</p>
                                )}
                                {convocatorias?.map((c) => (
                                    <div key={c.id} className="flex items-center gap-4 border rounded-lg p-4 group">
                                        <div className="flex-1">
                                            <p className="font-medium">{c.titulo}</p>
                                            {c.descripcion && <p className="text-sm text-neutral-500 truncate">{c.descripcion}</p>}
                                            <div className="flex gap-2 mt-1">
                                                {c.fecha_inicio && <Badge variant="outline">{c.fecha_inicio}</Badge>}
                                                {c.fecha_fin && <Badge variant="outline">hasta {c.fecha_fin}</Badge>}
                                                <Badge variant={c.activo ? 'default' : 'secondary'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                                                {c.deleted_at && <Badge variant="destructive">Eliminada</Badge>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                            <Button variant="outline" size="icon" onClick={() => openEditConvocatoria(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                                            <Button variant="outline" size="icon" onClick={() => openDelete('convocatoria', c.id)}><Trash2 className="h-3.5 w-3.5 text-rose-500" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* MODAL PORTADA */}
                <Dialog open={modalPortada} onOpenChange={setModalPortada}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{portadaSelect ? 'Editar Portada' : 'Agregar Portada'}</DialogTitle></DialogHeader>
                        <form onSubmit={handlePortada} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Título</Label>
                                <Input value={portadaTitulo} onChange={(e) => setPortadaTitulo(e.target.value)} placeholder="Ej: Campus Universitario" />
                            </div>
                            <div className="space-y-1">
                                <Label>Imagen *</Label>
                                <Input type="file" accept="image/*" onChange={(e) => setPortadaImagen(e.target.files?.[0] || null)} required={!portadaSelect} />
                                {portadaSelect?.imagen && !portadaImagen && <img src={`/storage/${portadaSelect.imagen}`} className="h-20 rounded mt-1" />}
                            </div>
                            <div className="space-y-1">
                                <Label>Orden</Label>
                                <Input type="number" value={portadaOrden} onChange={(e) => setPortadaOrden(e.target.value)} min="0" />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalPortada(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL AUTORIDAD */}
                <Dialog open={modalAutoridad} onOpenChange={setModalAutoridad}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{autoridadSelect ? 'Editar Autoridad' : 'Agregar Autoridad'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleAutoridad} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Nombre *</Label>
                                <Input value={autoridadNombre} onChange={(e) => setAutoridadNombre(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Cargo *</Label>
                                <Input value={autoridadCargo} onChange={(e) => setAutoridadCargo(e.target.value)} placeholder="Ej: Directora de Carrera" required />
                            </div>
                            <div className="space-y-1">
                                <Label>Foto</Label>
                                <Input type="file" accept="image/*" onChange={(e) => setAutoridadFoto(e.target.files?.[0] || null)} />
                                {autoridadSelect?.foto && !autoridadFoto && <img src={`/storage/${autoridadSelect.foto}`} className="h-16 w-16 rounded-full mt-1 object-cover" />}
                            </div>
                            <div className="space-y-1">
                                <Label>Mensaje</Label>
                                <textarea value={autoridadMensaje} onChange={(e) => setAutoridadMensaje(e.target.value)} className="w-full rounded-md border p-2 text-sm" rows={3} />
                            </div>
                            <div className="space-y-1">
                                <Label>Orden</Label>
                                <Input type="number" value={autoridadOrden} onChange={(e) => setAutoridadOrden(e.target.value)} min="0" />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalAutoridad(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL CONVOCATORIA */}
                <Dialog open={modalConvocatoria} onOpenChange={setModalConvocatoria}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{convocatoriaSelect ? 'Editar Convocatoria' : 'Nueva Convocatoria'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleConvocatoria} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Título *</Label>
                                <Input value={convocatoriaTitulo} onChange={(e) => setConvocatoriaTitulo(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Descripción</Label>
                                <textarea value={convocatoriaDescripcion} onChange={(e) => setConvocatoriaDescripcion(e.target.value)} className="w-full rounded-md border p-2 text-sm" rows={3} />
                            </div>
                            <div className="space-y-1">
                                <Label>Archivo PDF (opcional)</Label>
                                <Input type="file" accept="application/pdf" onChange={(e) => setConvocatoriaArchivo(e.target.files?.[0] || null)} />
                                {convocatoriaSelect?.archivo && !convocatoriaArchivo && <p className="text-xs text-neutral-500 mt-1">PDF actual: {convocatoriaSelect.archivo}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Fecha Inicio</Label>
                                    <Input type="date" value={convocatoriaInicio} onChange={(e) => setConvocatoriaInicio(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Fecha Fin</Label>
                                    <Input type="date" value={convocatoriaFin} onChange={(e) => setConvocatoriaFin(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={convocatoriaActivo} onChange={(e) => setConvocatoriaActivo(e.target.checked)} className="h-4 w-4" />
                                <Label>Activo</Label>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalConvocatoria(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL DELETE */}
                <Dialog open={modalDelete} onOpenChange={setModalDelete}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalDelete(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}