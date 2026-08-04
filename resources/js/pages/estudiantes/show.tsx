import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, GraduationCap, Mail, MapPin, Phone, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserData {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    genero: string | null;
    fecha_nacimiento: string | null;
    direccion: string | null;
}

interface Estudiante {
    id: number;
    user_id: number;
    colegio_procedencia: string | null;
    tipo_inscripcion: string | null;
    user: UserData;
    created_at: string;
}

interface Props {
    estudiante: Estudiante;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Detalle', href: '' },
];

export default function EstudiantesShow({ estudiante }: Props) {
    const u = estudiante.user;
    const nombreCompleto = `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    const tipoMap: Record<string, string> = { regular: 'Regular', dispensacion: 'Dispensación', cursillo: 'Cursillo' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Estudiante: ${nombreCompleto}`} />

            <div className="p-6 space-y-6">
                <Button variant="outline" asChild>
                    <Link href="/estudiantes">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Link>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Datos Personales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div><span className="font-medium">Nombre:</span> {u.nombre}</div>
                            <div><span className="font-medium">Apellido Paterno:</span> {u.apellido_paterno}</div>
                            <div><span className="font-medium">Apellido Materno:</span> {u.apellido_materno}</div>
                            <div><span className="font-medium">CI:</span> {u.ci}</div>
                            <div><span className="font-medium">Género:</span> {u.genero || '-'}</div>
                            <div><span className="font-medium">Fecha Nacimiento:</span> {u.fecha_nacimiento || '-'}</div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {u.direccion || 'Sin dirección'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Datos Académicos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {u.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {u.celular}
                            </div>
                            <hr />
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Colegio:</span> {estudiante.colegio_procedencia || 'No registrado'}
                            </div>
                            <div>
                                <span className="font-medium">Tipo Inscripción:</span>{' '}
                                <Badge variant="outline">{estudiante.tipo_inscripcion ? tipoMap[estudiante.tipo_inscripcion] : 'No definido'}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}