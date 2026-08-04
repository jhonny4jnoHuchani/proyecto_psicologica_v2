import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, GraduationCap, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Gestion { id: number; año: number; etapa: string; fecha_inicio: string; fecha_fin: string; }
interface UserData { id: number; nombre: string; apellido_paterno: string; apellido_materno: string; ci: string; email: string; }
interface DocenteData { id: number; especialidad: string | null; user: UserData; }
interface MateriaConPivot { id: number; nombre: string; codigo: string; pivot: { docente_id: number | null; }; }
interface Estudiante { id: number; user: UserData; pivot: { fecha_inscripcion: string; estado: string; }; }

interface Curso {
    id: number; paralelo: string; estado: string; cupos: number; turno: string;
    gestion: Gestion;
    materias: MateriaConPivot[];
    estudiantes: Estudiante[];
}

interface Props {
    curso: Curso;
    docentes: Record<number, DocenteData>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cursos', href: '/cursos' },
    { title: 'Detalle', href: '' },
];

const estadoBadge = (estado: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
        activo: 'default', inactivo: 'secondary', completado: 'outline'
    };
    return map[estado] || 'default';
};

export default function CursosShow({ curso, docentes }: Props) {
    const nombreCompleto = (u: UserData) => `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const getDocenteNombre = (docenteId: number | null) => {
        if (!docenteId || !docentes || !docentes[docenteId]) return 'Sin docente';
        return nombreCompleto(docentes[docenteId].user);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Curso: ${curso.gestion?.año} - Paralelo ${curso.paralelo}`} />

            <div className="p-6 space-y-6">
                <Button variant="outline" asChild>
                    <Link href="/cursos"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link>
                </Button>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {curso.gestion?.año} - {curso.gestion?.etapa} | Paralelo {curso.paralelo}
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Turno: <span className="capitalize">{curso.turno}</span> | Cupos: {curso.estudiantes?.length || 0}/{curso.cupos}
                                </p>
                            </div>
                            <Badge variant={estadoBadge(curso.estado)} className="text-lg px-4 py-2">
                                {curso.estado}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Materias y Docentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(!curso.materias || curso.materias.length === 0) && (
                                    <p className="text-muted-foreground">Sin materias asignadas</p>
                                )}
                                {curso.materias?.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <p className="font-medium">{m.codigo}</p>
                                            <p className="text-sm text-muted-foreground">{m.nombre}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground/70" />
                                            <span className="text-sm">
                                                {getDocenteNombre(m.pivot?.docente_id)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Estudiantes ({curso.estudiantes?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(!curso.estudiantes || curso.estudiantes.length === 0) && (
                                    <p className="text-muted-foreground">Sin estudiantes inscritos</p>
                                )}
                                {curso.estudiantes?.map((e) => (
                                    <div key={e.id} className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm">{nombreCompleto(e.user)}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {e.pivot?.estado || 'activo'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}