import { Head, router } from '@inertiajs/react';
import { BookOpen, GraduationCap, ImagePlus, LayoutGrid, School, Sparkles, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface Stats {
    gestiones_activas: number;
    cursos_activos: number;
    total_docentes: number;
    total_estudiantes: number;
}

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    pivot: {
        id: number;
        docente_id: number;
        ayuda_ia_activa: boolean;
        imagen: string | null;
    };
}

interface Curso {
    id: number;
    paralelo: string;
    estado: string;
    turno: string;
    gestion: { año: number; etapa: string };
    materias: Materia[];
}

interface Props {
    rol?: string;
    stats?: Stats;
    cursos?: Curso[];
}

export default function Dashboard({ rol, stats, cursos }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">
                    {rol === 'admin' && 'Panel de Administración'}
                    {rol === 'docente' && 'Mis Cursos'}
                    {rol === 'estudiante' && 'Mi Curso'}
                </h1>

                {/* ======================== ADMIN ======================== */}
                {rol === 'admin' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Gestiones Activas</CardTitle>
                                <LayoutGrid className="h-4 w-4 text-neutral-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.gestiones_activas}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                                <School className="h-4 w-4 text-neutral-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.cursos_activos}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Docentes</CardTitle>
                                <GraduationCap className="h-4 w-4 text-neutral-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.total_docentes}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
                                <Users className="h-4 w-4 text-neutral-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.total_estudiantes}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ======================== DOCENTE ======================== */}
                {rol === 'docente' && (
                    <div className="space-y-4">
                        {(!cursos || cursos.length === 0) && (
                            <Card>
                                <CardContent className="py-8 text-center text-neutral-500">
                                    No tienes cursos asignados.
                                </CardContent>
                            </Card>
                        )}
                        {cursos?.map((curso) => (
                            <Card key={curso.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <School className="h-5 w-5 text-blue-500" />
                                                <h2 className="text-lg font-bold">
                                                    {curso.gestion?.año} - {curso.gestion?.etapa}
                                                </h2>
                                                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                                                    Paralelo {curso.paralelo}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-500 mt-1 capitalize">
                                                Turno: {curso.turno}
                                            </p>
                                        </div>
                                        <a
                                            href={`/cursos/${curso.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Ver Curso →
                                        </a>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                                            <BookOpen className="h-4 w-4" />
                                            Mis Materias ({curso.materias?.length || 0})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {curso.materias?.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="relative border rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group"
                                                >
                                                    {/* LINK A LA CARD (con imagen o degradado) */}
                                                    <a
                                                        href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                                                        className="block"
                                                    >
                                                        {m.pivot?.imagen ? (
                                                            <div className="h-28 w-full overflow-hidden bg-neutral-100">
                                                                <img
                                                                    src={`/storage/${m.pivot.imagen}`}
                                                                    alt={m.nombre}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="h-28 w-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                                <BookOpen className="h-10 w-10 text-blue-400" />
                                                            </div>
                                                        )}

                                                        <div className="p-3">
                                                            <span className="font-medium text-sm">{m.codigo}</span>
                                                            <span className="text-xs text-neutral-500 block truncate">{m.nombre}</span>
                                                        </div>
                                                    </a>

                                                    {/* TOGGLE IA */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            router.post(
                                                                `/docente/curso-materia/${m.pivot?.id}/toggle-ia`,
                                                                {},
                                                                { preserveScroll: true }
                                                            );
                                                        }}
                                                        className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur transition-colors ${
                                                            m.pivot?.ayuda_ia_activa
                                                                ? 'bg-purple-600/90 text-white hover:bg-purple-700/90'
                                                                : 'bg-white/80 text-neutral-500 hover:bg-white'
                                                        }`}
                                                        title={m.pivot?.ayuda_ia_activa ? 'IA activada' : 'IA desactivada'}
                                                    >
                                                        <Sparkles className="h-3 w-3" />
                                                        IA
                                                    </button>

                                                    {/* BOTÓN SUBIR IMAGEN */}
                                                    <label
                                                        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur bg-white/80 text-neutral-600 cursor-pointer hover:bg-white transition-colors"
                                                        title="Cambiar imagen"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ImagePlus className="h-3 w-3" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append('imagen', file);
                                                                router.post(
                                                                    `/docente/curso-materia/${m.pivot?.id}/imagen`,
                                                                    formData,
                                                                    {
                                                                        forceFormData: true,
                                                                        preserveScroll: true,
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ======================== ESTUDIANTE ======================== */}
                {rol === 'estudiante' && (
                    <div className="space-y-4">
                        {(!cursos || cursos.length === 0) && (
                            <Card>
                                <CardContent className="py-8 text-center text-neutral-500">
                                    No estás inscrito en ningún curso.
                                </CardContent>
                            </Card>
                        )}
                        {cursos?.map((curso) => (
                            <Card key={curso.id}>
                                <CardContent className="pt-6">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <School className="h-5 w-5 text-green-500" />
                                            <h2 className="text-lg font-bold">
                                                {curso.gestion?.año} - {curso.gestion?.etapa}
                                            </h2>
                                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                                                Paralelo {curso.paralelo}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-1 capitalize">
                                            Turno: {curso.turno}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                                            <BookOpen className="h-4 w-4" />
                                            Mis Materias ({curso.materias?.length || 0})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {curso.materias?.map((m) => (
                                                <a
                                                    key={m.id}
                                                    href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                                                    className="border rounded-lg overflow-hidden hover:border-green-300 hover:shadow-md transition-all group"
                                                >
                                                    {m.pivot?.imagen ? (
                                                        <div className="h-28 w-full overflow-hidden bg-neutral-100">
                                                            <img
                                                                src={`/storage/${m.pivot.imagen}`}
                                                                alt={m.nombre}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-28 w-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                                            <BookOpen className="h-10 w-10 text-green-400" />
                                                        </div>
                                                    )}

                                                    <div className="p-3">
                                                        <span className="font-medium text-sm">{m.codigo}</span>
                                                        <span className="text-xs text-neutral-500 block truncate">{m.nombre}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}