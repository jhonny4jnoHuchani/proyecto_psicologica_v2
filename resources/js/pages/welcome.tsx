import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, GraduationCap, Megaphone, Quote, Target, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

interface ConfigData {
    color_primario: string;
    color_secundario: string;
    logo: string | null;
    mision: string | null;
    vision: string | null;
    lema: string | null;
    organigrama: string | null;
}

interface Portada { id: number; titulo: string | null; imagen: string; orden: number; }
interface Autoridad { id: number; nombre: string; cargo: string; foto: string | null; mensaje: string | null; }
interface Convocatoria { id: number; titulo: string; descripcion: string | null; fecha_inicio: string | null; fecha_fin: string | null; }

interface Props {
    config: ConfigData | null;
    portadas: Portada[];
    autoridades: Autoridad[];
    convocatorias: Convocatoria[];
    user: { id: number; nombre: string; apellido_paterno: string; apellido_materno: string; } | null;
}

export default function Welcome({ config, portadas, autoridades, convocatorias, user }: Props) {
    const primary = config?.color_primario || '#4f46e5';
    const secondary = config?.color_secundario || '#06b6d4';








    return (

        <div className="min-h-screen bg-white">
            <Head title="Preuniversitario de Psicología" />

            {/*====================================================================================================================================================================*/}

            {/* NAVBAR */}
            <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        {config?.logo ? (
                            <img src={`/storage/${config.logo}`} alt="Logo" className="h-10 w-10 object-contain" />
                        ) : (
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Preuniversitario de Psicología</h1>
                            <p className="text-xs text-neutral-500">UPEA - Carrera de Psicología</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard">
                                <Button style={{ backgroundColor: primary }}>Ir al Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="outline">Iniciar Sesión</Button>
                                </Link>
                                <Link href="/register">
                                    <Button style={{ backgroundColor: primary }}>Registrarse</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>


            {/*====================================================================================================================================================================*/}









            {/*====================================================================================================================================================================*/}


            {/* HERO */}
            <div className="relative">
                {portadas && portadas.length > 0 ? (
                    <img
                        src={`/storage/${portadas[0].imagen}`}
                        alt={portadas[0].titulo || 'Portada'}
                        className="w-full h-[500px] object-cover"
                    />
                ) : (

                    <div className="w-full h-[500px] flex items-center justify-center" style={{ backgroundColor: primary }}>
                        <BookOpen className="h-24 w-24 text-white/50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white px-6">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            {'Formando Psicólogos para el Futuro'}
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                            Prepárate para tu examen de admisión con recursos digitales, clases virtuales y seguimiento personalizado.
                        </p>

                    </div>
                </div>
            </div>



            {/*====================================================================================================================================================================*/}








            {/* MISIÓN Y VISIÓN */}
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" style={{ color: primary }} />
                            Misión
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-neutral-600">{config?.mision || 'Formar profesionales en psicología con sólidas competencias académicas, científicas y tecnológicas.'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" style={{ color: secondary }} />
                            Visión
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-neutral-600">{config?.vision || 'Ser una institución líder en la formación de psicólogos altamente capacitados.'}</p>
                    </CardContent>
                </Card>
            </div>











            {/*====================================================================================================================================================================*/}





















            {/* AUTORIDADES */}
            {autoridades && autoridades.length > 0 && (
                <div className="bg-neutral-50 py-16">

                    <div className="max-w-7xl mx-auto px-6">

                        <h2 className="text-2xl font-bold text-center mb-8">Autoridades</h2>
                        <div className="flex flex-wrap justify-center gap-6">


                            {/*aqui empieza a armar las tarjetas de las autoridades */}
                            {autoridades.map((a) => (

                                <div key={a.id} className="bg-white rounded-lg shadow p-6 w-64 text-center">
                                    {a.foto ? (
                                        <img src={`/storage/${a.foto}`} alt={a.nombre} className="h-24 w-24 rounded-full object-cover mx-auto mb-3" />
                                    ) : (
                                        <div className="h-24 w-24 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${primary}20` }}>
                                            <GraduationCap className="h-10 w-10" style={{ color: primary }} />
                                        </div>
                                    )}
                                    {/*  nombre completo */}
                                    <p className="font-bold">{a.nombre}</p>
                                    {/*  cargo */}
                                    <p className="text-sm text-neutral-500">{a.cargo}</p>

                                </div>
                            ))}




                        </div>
                    </div>
                </div>
            )}


            {/*====================================================================================================================================================================*/}
























            {/* CONVOCATORIAS */}
            {convocatorias && convocatorias.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-2xl font-bold text-center mb-8">Convocatorias</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">




                        {/*aqui empieza a armar las tarjetas de las convocatorias */}
                        {convocatorias.map((c) => (
                            <div key={c.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-2">
                                    <Megaphone className="h-5 w-5 shrink-0" style={{ color: secondary }} />

                                    {/*titulo*/}
                                    <div>
                                        <p className="font-bold">{c.titulo}</p>
                                        {/*descripcion*/}
                                        {c.descripcion && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{c.descripcion}</p>}
                                    </div>
                                </div>

                                {/*fecha de inicio y fin*/}
                                <div className="flex gap-2 mt-3">
                                    {c.fecha_inicio && <Badge variant="outline">{c.fecha_inicio}</Badge>}
                                    {c.fecha_fin && <Badge variant="outline">hasta {c.fecha_fin}</Badge>}
                                </div>
                            </div>
                        ))}






                    </div>
                </div>
            )}



            {/*====================================================================================================================================================================*/}
            {/*====================================================================================================================================================================*/}



            {/* FOOTER */}
            <footer className="text-white py-8" style={{ backgroundColor: primary }}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="font-bold">Preuniversitario de Psicología</p>
                    <p className="text-sm opacity-80 mt-1">Universidad Pública del Alto - UPEA - 2026</p>
                </div>
            </footer>

            {/*====================================================================================================================================================================*/}
            {/*====================================================================================================================================================================*/}

            {/*© Universidad Pública de El Alto 2026 | UTIC - Web Developer CristhianVM | Support by JhonnyAH - Todos los Derechos Reservados */}
        </div>
    );
}