import { Head } from '@inertiajs/react';
import { BookOpen, GraduationCap, LayoutGrid, School, Users } from 'lucide-react';

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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {curso.materias?.map((m) => (
                                                <a
                                                    key={m.id}
                                                    href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                                                    className="flex items-center gap-3 border rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                                                >
                                                    <div className="bg-blue-100 p-2 rounded-lg">
                                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-sm">{m.codigo}</span>
                                                        <span className="text-xs text-neutral-500 block">{m.nombre}</span>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {curso.materias?.map((m) => (
                                                <a
                                                    key={m.id}
                                                    href={`/lecciones?curso_id=${curso.id}&materia_id=${m.id}`}
                                                    className="flex items-center gap-3 border rounded-lg p-3 hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer"
                                                >
                                                    <div className="bg-green-100 p-2 rounded-lg">
                                                        <BookOpen className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-sm">{m.codigo}</span>
                                                        <span className="text-xs text-neutral-500 block">{m.nombre}</span>
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