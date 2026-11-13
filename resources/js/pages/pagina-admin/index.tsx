import { Head, router } from '@inertiajs/react';
import { ExternalLink, Globe, Image, Layout, LoaderCircle, Megaphone, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUploadDropzone } from '@/components/ui/file-upload-dropzone';
import AppLayout from '@/layouts/app-layout';
import { formatoFechaHora } from '@/lib/formatters';
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
    link_video: string | null;
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

// Muestra el primer mensaje de error de validación que devuelva Laravel,
// para dejar de fallar en silencio cuando algo no se guarda.
const showValidationErrors = (errors: Record<string, string>) => {
    const first = Object.values(errors)[0];
    toast.error(first || 'No se pudo guardar. Revisa los datos e intenta de nuevo.');
};

export default function PaginaAdminIndex({ portadas, autoridades, convocatorias }: Props) {
    const [activeTab, setActiveTab] = useState<'portadas' | 'autoridades' | 'convocatorias'>('portadas');

    const [modalPortada, setModalPortada] = useState(false);
    const [portadaSelect, setPortadaSelect] = useState<Portada | null>(null);
    const [portadaTitulo, setPortadaTitulo] = useState('');
    const [portadaImagen, setPortadaImagen] = useState<File | null>(null);
    const [portadaOrden, setPortadaOrden] = useState('0');

    const [modalAutoridad, setModalAutoridad] = useState(false);
    const [autoridadSelect, setAutoridadSelect] = useState<Autoridad | null>(null);
    const [autoridadNombre, setAutoridadNombre] = useState('');
    const [autoridadCargo, setAutoridadCargo] = useState('');
    const [autoridadFoto, setAutoridadFoto] = useState<File | null>(null);
    const [autoridadMensaje, setAutoridadMensaje] = useState('');
    const [autoridadOrden, setAutoridadOrden] = useState('0');

    const [modalConvocatoria, setModalConvocatoria] = useState(false);
    const [convocatoriaSelect, setConvocatoriaSelect] = useState<Convocatoria | null>(null);
    const [convocatoriaTitulo, setConvocatoriaTitulo] = useState('');
    const [convocatoriaDescripcion, setConvocatoriaDescripcion] = useState('');
    const [convocatoriaArchivo, setConvocatoriaArchivo] = useState<File | null>(null);
    const [convocatoriaInicio, setConvocatoriaInicio] = useState('');
    const [convocatoriaFin, setConvocatoriaFin] = useState('');
    const [convocatoriaActivo, setConvocatoriaActivo] = useState(true);
    const [convocatoriaLink, setConvocatoriaLink] = useState('');

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
            // Los navegadores/PHP no procesan bien multipart/form-data en peticiones PUT nativas
            // (los archivos llegan vacíos). Por eso se envía como POST con _method spoofing.
            formData.append('_method', 'PUT');
            router.post(`/pagina-admin/portadas/${portadaSelect.id}`, formData, {
                onSuccess: () => { setModalPortada(false); setProcessing(false); toast.success('Portada actualizada'); },
                onError: (errors) => { setProcessing(false); showValidationErrors(errors); },
            });
        } else {
            router.post('/pagina-admin/portadas', formData, {
                onSuccess: () => { setModalPortada(false); setProcessing(false); toast.success('Portada agregada'); },
                onError: (errors) => { setProcessing(false); showValidationErrors(errors); },
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
            formData.append('_method', 'PUT');
            router.post(`/pagina-admin/autoridades/${autoridadSelect.id}`, formData, {
                onSuccess: () => { setModalAutoridad(false); setProcessing(false); toast.success('Autoridad actualizada'); },
                onError: (errors) => { setProcessing(false); showValidationErrors(errors); },
            });
        } else {
            router.post('/pagina-admin/autoridades', formData, {
                onSuccess: () => { setModalAutoridad(false); setProcessing(false); toast.success('Autoridad agregada'); },
                onError: (errors) => { setProcessing(false); showValidationErrors(errors); },
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
        setConvocatoriaLink('');
        setModalConvocatoria(true);
    };

    const openEditConvocatoria = (c: Convocatoria) => {
        setConvocatoriaSelect(c);
        setConvocatoriaTitulo(c.titulo);
        setConvocatoriaDescripcion(c.descripcion || '');
        setConvocatoriaArchivo(null);
        setConvocatoriaInicio(c.fecha_inicio ? c.fecha_inicio.split('T')[0] : '');
        setConvocatoriaFin(c.fecha_fin ? c.fecha_fin.split('T')[0] : '');
        setConvocatoriaActivo(c.activo);
        setConvocatoriaLink(c.link_video || '');
        setModalConvocatoria(true);
    };

    const handleConvocatoria: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        formData.append('titulo', convocatoriaTitulo);
        formData.append('descripcion', convocatoriaDescripcion);
        // Enviar fechas vacías como string '' puede chocar con reglas "nullable|date" en Laravel.
        // Se omiten del payload cuando están vacías para que el backend las reciba como ausentes.
        if (convocatoriaInicio) formData.append('fecha_inicio', convocatoriaInicio);
        if (convocatoriaFin) formData.append('fecha_fin', convocatoriaFin);
        formData.append('activo', convocatoriaActivo ? '1' : '0');
        formData.append('link_video', convocatoriaLink);
        if (convocatoriaArchivo) formData.append('archivo', convocatoriaArchivo);

        if (convocatoriaSelect) {
            formData.append('_method', 'PUT');
            router.post(`/pagina-admin/convocatorias/${convocatoriaSelect.id}`, formData, {
                onSuccess: () => { setModalConvocatoria(false); setProcessing(false); toast.success('Convocatoria actualizada'); },
                onError: (errors) => { setProcessing(false); showValidationErrors(errors); },
            });
        } else {
            router.post('/pagina-admin/convocatorias', formData, {
                onSuccess: () => { setModalConvocatoria(false); setProcessing(false); toast.success('Convocatoria publicada'); },
                onError: (errors) => { setProcessing(false); showValidationErrors(errors); },
            });
        }
    };

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
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* CABECERA PRINCIPAL MODERNA Y LIMPIA */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25 shrink-0">
                            <Layout className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-foreground">
                                    Portal Web Público
                                </h1>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary/30 text-primary">
                                    Página de Bienvenida
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Administra el contenido visible para los visitantes: portadas rotativas, directorio de autoridades y convocatorias.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-card/90 hover:bg-muted text-foreground border border-border shadow-xs hover:border-primary/40 transition-all cursor-pointer"
                        >
                            <Globe className="h-4 w-4 text-primary" />
                            <span>Ver Portal Público</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                    </div>
                </div>

                {/* 3 SELECTORES DE SECCIÓN / MÉTRICAS INTERACTIVAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tarjeta 1: Portadas */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('portadas')}
                        className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer group overflow-hidden ${
                            activeTab === 'portadas'
                                ? 'bg-card border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10 -translate-y-0.5'
                                : 'bg-card/70 hover:bg-card border-border/80 hover:border-primary/40 hover:-translate-y-0.5'
                        }`}
                    >
                        {activeTab === 'portadas' && (
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-secondary" />
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                                activeTab === 'portadas'
                                    ? 'bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/25'
                                    : 'bg-primary/10 text-primary'
                            }`}>
                                <Image className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Portadas del Slider</h3>
                                <p className="text-xs text-muted-foreground">Carrusel de cabecera</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-black ${activeTab === 'portadas' ? 'text-primary' : 'text-foreground'}`}>
                                {portadas?.length || 0}
                            </span>
                            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Registradas</span>
                        </div>
                    </button>

                    {/* Tarjeta 2: Autoridades */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('autoridades')}
                        className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer group overflow-hidden ${
                            activeTab === 'autoridades'
                                ? 'bg-card border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10 -translate-y-0.5'
                                : 'bg-card/70 hover:bg-card border-border/80 hover:border-primary/40 hover:-translate-y-0.5'
                        }`}
                    >
                        {activeTab === 'autoridades' && (
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-secondary" />
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                                activeTab === 'autoridades'
                                    ? 'bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/25'
                                    : 'bg-primary/10 text-primary'
                            }`}>
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Autoridades</h3>
                                <p className="text-xs text-muted-foreground">Directorio y mensajes</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-black ${activeTab === 'autoridades' ? 'text-primary' : 'text-foreground'}`}>
                                {autoridades?.length || 0}
                            </span>
                            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Cargos</span>
                        </div>
                    </button>

                    {/* Tarjeta 3: Convocatorias */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('convocatorias')}
                        className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer group overflow-hidden ${
                            activeTab === 'convocatorias'
                                ? 'bg-card border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10 -translate-y-0.5'
                                : 'bg-card/70 hover:bg-card border-border/80 hover:border-primary/40 hover:-translate-y-0.5'
                        }`}
                    >
                        {activeTab === 'convocatorias' && (
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-secondary" />
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                                activeTab === 'convocatorias'
                                    ? 'bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/25'
                                    : 'bg-primary/10 text-primary'
                            }`}>
                                <Megaphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Convocatorias</h3>
                                <p className="text-xs text-muted-foreground">Avisos y comunicados</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-black ${activeTab === 'convocatorias' ? 'text-primary' : 'text-foreground'}`}>
                                {convocatorias?.length || 0}
                            </span>
                            <span className="block text-[10px] uppercase font-bold text-muted-foreground">Avisos</span>
                        </div>
                    </button>
                </div>

                {/* ==================== PORTADAS ==================== */}
                {activeTab === 'portadas' && (
                    <Card className="rounded-3xl border border-border/80 shadow-md">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Image className="h-5 w-5 text-primary" />
                                    <span>Fotos de Portada del Carrusel</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Imágenes que rotan automáticamente en la cabecera principal del portal de bienvenida
                                </CardDescription>
                            </div>
                            <Button type="button" variant="gradient" onClick={openCreatePortada} className="text-xs gap-1.5 shrink-0">
                                <Plus className="h-4 w-4" />
                                <span>Agregar Portada</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {(!portadas || portadas.length === 0) ? (
                                <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl bg-muted/20">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Image className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">No hay fotos de portada registradas</p>
                                        <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                                            Sube imágenes fotográficas horizontales para crear un carrusel dinámico en la página de inicio.
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={openCreatePortada} className="text-xs mt-1">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Subir primera foto
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {portadas.map((p) => (
                                        <div key={p.id} className="border border-border/80 hover:border-primary/50 rounded-2xl overflow-hidden group bg-card transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
                                            <div className="relative h-44 w-full overflow-hidden bg-muted">
                                                <img src={`/storage/${p.imagen}`} alt={p.titulo || 'Portada'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <Badge variant="outline" className="absolute top-2.5 left-2.5 bg-black/60 text-white border-white/20 backdrop-blur-md text-[10px]">
                                                    Orden: #{p.orden}
                                                </Badge>
                                            </div>
                                            <div className="p-3.5 flex items-center justify-between gap-2 border-t border-border/60">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-xs text-foreground truncate">{p.titulo || 'Sin título'}</p>
                                                    <p className="text-[11px] text-muted-foreground">Posición #{p.orden}</p>
                                                </div>
                                                <div className="flex gap-1.5 shrink-0">
                                                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs hover:border-primary/40 hover:text-primary gap-1" onClick={() => openEditPortada(p)}>
                                                        <Pencil className="h-3 w-3" />
                                                        <span>Editar</span>
                                                    </Button>
                                                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs hover:border-rose-500/40 hover:text-rose-500 gap-1" onClick={() => openDelete('portada', p.id)}>
                                                        <Trash2 className="h-3 w-3 text-rose-500" />
                                                        <span>Eliminar</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ==================== AUTORIDADES ==================== */}
                {activeTab === 'autoridades' && (
                    <Card className="rounded-3xl border border-border/80 shadow-md">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span>Directorio de Autoridades</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Cargos jerárquicos y docentes directivos visibles en la sección institucional del portal
                                </CardDescription>
                            </div>
                            <Button type="button" variant="gradient" onClick={openCreateAutoridad} className="text-xs gap-1.5 shrink-0">
                                <Plus className="h-4 w-4" />
                                <span>Agregar Autoridad</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {(!autoridades || autoridades.length === 0) ? (
                                <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl bg-muted/20">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">No hay autoridades registradas</p>
                                        <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                                            Agrega las autoridades de la carrera para que los visitantes conozcan al equipo de dirección y coordinación.
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={openCreateAutoridad} className="text-xs mt-1">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Registrar autoridad
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {autoridades.map((a) => (
                                        <div key={a.id} className="flex items-center gap-4 border border-border/80 hover:border-primary/50 rounded-2xl p-4 bg-card transition-all duration-300 hover:shadow-md group">
                                            {a.foto ? (
                                                <img src={`/storage/${a.foto}`} alt={a.nombre} className="h-16 w-16 rounded-2xl object-cover shadow-sm shrink-0 border border-border" />
                                            ) : (
                                                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                                    <Users className="h-7 w-7" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-foreground truncate">{a.nombre}</p>
                                                <p className="text-xs font-semibold text-primary truncate mt-0.5">{a.cargo}</p>
                                                {a.mensaje && (
                                                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 italic">
                                                        &ldquo;{a.mensaje}&rdquo;
                                                    </p>
                                                )}
                                                <span className="text-[10px] text-muted-foreground mt-1 block">Prioridad #{a.orden}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                                                <Button type="button" variant="outline" size="sm" className="h-8 px-2.5 text-xs hover:border-primary/40 hover:text-primary gap-1" onClick={() => openEditAutoridad(a)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span>Editar</span>
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" className="h-8 px-2.5 text-xs hover:border-rose-500/40 hover:text-rose-500 gap-1" onClick={() => openDelete('autoridad', a.id)}>
                                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                    <span>Eliminar</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ==================== CONVOCATORIAS ==================== */}
                {activeTab === 'convocatorias' && (
                    <Card className="rounded-3xl border border-border/80 shadow-md">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Megaphone className="h-5 w-5 text-primary" />
                                    <span>Convocatorias y Avisos Públicos</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Comunicados oficiales, fechas límite, documentos y videos abiertos a la comunidad
                                </CardDescription>
                            </div>
                            <Button type="button" variant="gradient" onClick={openCreateConvocatoria} className="text-xs gap-1.5 shrink-0">
                                <Plus className="h-4 w-4" />
                                <span>Nueva Convocatoria</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {(!convocatorias || convocatorias.length === 0) ? (
                                <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl bg-muted/20">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Megaphone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">No hay convocatorias publicadas</p>
                                        <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                                            Publica convocatorias de auxiliaturas, becas, concursos o comunicados académicos.
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={openCreateConvocatoria} className="text-xs mt-1">
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Crear primera convocatoria
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {convocatorias.map((c) => (
                                        <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/80 hover:border-primary/50 rounded-2xl p-4 bg-card transition-all duration-300 hover:shadow-md group">
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-sm text-foreground">{c.titulo}</p>
                                                    <Badge variant={c.activo ? 'success' : 'secondary'} className="text-[10px]">
                                                        {c.activo ? 'Publicada' : 'Borrador'}
                                                    </Badge>
                                                    {c.deleted_at && <Badge variant="destructive" className="text-[10px]">Archivada</Badge>}
                                                </div>
                                                {c.descripcion && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {c.descripcion}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 flex-wrap pt-1">
                                                    {c.fecha_inicio && (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            Desde: {formatoFechaHora(c.fecha_inicio)}
                                                        </Badge>
                                                    )}
                                                    {c.fecha_fin && (
                                                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400">
                                                            Límite: {formatoFechaHora(c.fecha_fin)}
                                                        </Badge>
                                                    )}
                                                    {c.link_video && (
                                                        <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-600 dark:text-rose-400">
                                                            🎥 Video adjunto
                                                        </Badge>
                                                    )}
                                                    {c.archivo && (
                                                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                                            📄 Archivo oficial
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 sm:self-center shrink-0">
                                                <Button type="button" variant="outline" size="sm" className="h-8 text-xs hover:border-primary/40 hover:text-primary gap-1" onClick={() => openEditConvocatoria(c)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span>Editar</span>
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" className="h-8 text-xs hover:border-rose-500/40 hover:text-rose-500 gap-1" onClick={() => openDelete('convocatoria', c.id)}>
                                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                                    <span>Eliminar</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* MODAL PORTADA */}
                <Dialog open={modalPortada} onOpenChange={setModalPortada}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{portadaSelect ? 'Editar Portada' : 'Agregar Portada'}</DialogTitle></DialogHeader>
                        <form onSubmit={handlePortada} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Título</Label>
                                <Input value={portadaTitulo} onChange={(e) => setPortadaTitulo(e.target.value)} placeholder="Ej: Campus Universitario" />
                            </div>
                            <div className="space-y-1">
                                <Label>Imagen del Banner / Portada *</Label>
                                <FileUploadDropzone
                                    accept="image/*"
                                    maxSizeMB={15}
                                    helperText="Sube una fotografía horizontal de alta resolución (JPG, PNG, WEBP hasta 15MB)"
                                    onFileSelect={(file) => setPortadaImagen(file)}
                                />
                                {portadaSelect?.imagen && !portadaImagen && (
                                    <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-muted/40 border border-border/60">
                                        <img src={`/storage/${portadaSelect.imagen}`} className="h-14 w-24 object-cover rounded-lg shadow-xs" alt="Portada actual" />
                                        <span className="text-xs text-muted-foreground font-medium">Portada actual en el sistema</span>
                                    </div>
                                )}
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
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                <Label>Fotografía de la Autoridad</Label>
                                <FileUploadDropzone
                                    accept="image/*"
                                    maxSizeMB={10}
                                    helperText="Fotografía formal para el portal de autoridades (JPG, PNG, WEBP)"
                                    onFileSelect={(file) => setAutoridadFoto(file)}
                                />
                                {autoridadSelect?.foto && !autoridadFoto && (
                                    <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-muted/40 border border-border/60">
                                        <img src={`/storage/${autoridadSelect.foto}`} className="h-12 w-12 rounded-full object-cover shadow-xs" alt="Foto actual" />
                                        <span className="text-xs text-muted-foreground font-medium">Fotografía registrada actualmente</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Mensaje</Label>
                                <textarea value={autoridadMensaje} onChange={(e) => setAutoridadMensaje(e.target.value)} className="w-full rounded-md border p-2 text-sm bg-background" rows={3} />
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
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{convocatoriaSelect ? 'Editar Convocatoria' : 'Nueva Convocatoria'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleConvocatoria} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Título *</Label>
                                <Input value={convocatoriaTitulo} onChange={(e) => setConvocatoriaTitulo(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Descripción</Label>
                                <textarea value={convocatoriaDescripcion} onChange={(e) => setConvocatoriaDescripcion(e.target.value)} className="w-full rounded-md border p-2 text-sm bg-background" rows={3} />
                            </div>
                            <div className="space-y-1">
                                <Label>Link de Video (YouTube)</Label>
                                <Input value={convocatoriaLink} onChange={(e) => setConvocatoriaLink(e.target.value)} placeholder="https://youtu.be/..." />
                                <p className="text-xs text-neutral-500">Pega el link normal de compartir</p>
                            </div>
                            <div className="space-y-1">
                                <Label>Afiche o Imagen de la Convocatoria (opcional)</Label>
                                <FileUploadDropzone
                                    accept="image/*,.pdf"
                                    maxSizeMB={20}
                                    helperText="Sube la imagen de la convocatoria o el documento oficial"
                                    onFileSelect={(file) => setConvocatoriaArchivo(file)}
                                />
                                {convocatoriaSelect?.archivo && !convocatoriaArchivo && (
                                    <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-muted/40 border border-border/60">
                                        <img src={`/storage/${convocatoriaSelect.archivo}`} className="h-14 w-20 rounded-lg object-cover shadow-xs" alt="Afiche actual" />
                                        <span className="text-xs text-muted-foreground font-medium">Afiche registrado actualmente</span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <Button type="button" variant="outline" onClick={() => setModalDelete(false)}>Cancelar</Button>
                            <Button type="button" variant="destructive" onClick={handleDelete}>Eliminar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}