import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';

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

interface Docente {
    id: number;
    user_id: number;
    especialidad: string | null;
    titulo_profesional: string | null;
    user: UserData;
    created_at: string;
}

interface Props {
    docente: Docente;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Docentes', href: '/docentes' },
    { title: 'Detalle', href: '' },
];

export default function DocentesShow({ docente }: Props) {
    const u = docente.user;
    const nombreCompleto = `${u.apellido_paterno} ${u.apellido_materno}, ${u.nombre}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Docente: ${nombreCompleto}`} />

            <div className="p-6 space-y-6">
                <Button variant="outline" asChild>
                    <Link href="/docentes">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Link>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Datos Personales */}
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
                            <div><span className="font-medium">Dirección:</span> {u.direccion || '-'}</div>
                        </CardContent>
                    </Card>

                    {/* Contacto y Datos Profesionales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contacto y Datos Profesionales
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
                            <div>
                                <span className="font-medium">Especialidad:</span>{' '}
                                <Badge variant="outline">{docente.especialidad || 'No asignada'}</Badge>
                            </div>
                            <div>
                                <span className="font-medium">Título Profesional:</span>{' '}
                                {docente.titulo_profesional || 'No registrado'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}