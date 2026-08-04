import { Head, router } from '@inertiajs/react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Props {
    cursos: { id: number; gestion: { año: number; etapa: string }; paralelo: string }[];
    materias: { id: number; nombre: string; codigo: string }[];
    filtros?: { curso_id?: string; materia_id?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reportes', href: '/reportes' }];

export default function ReportesIndex({ cursos, materias, filtros }: Props) {
    const [cursoId, setCursoId] = useState(filtros?.curso_id || '');
    const [materiaId, setMateriaId] = useState(filtros?.materia_id || '');


    const descargar = (tipo: 'pdf' | 'excel') => {
        if (!cursoId) return;
        router.post(`/reportes/${tipo}`, 
            { curso_id: cursoId, materia_id: materiaId || null },
            { preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />
            <div className="mx-auto max-w-xl space-y-6 p-6">
                <h1 className="text-2xl font-bold">Generar Reportes</h1>

                <Card>
                    <CardHeader><CardTitle>Seleccionar Datos</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Curso *</Label>
                            <Select value={cursoId} onValueChange={setCursoId}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar curso" /></SelectTrigger>
                                <SelectContent>
                                    {cursos.map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.gestion?.año} - {c.gestion?.etapa} | P.{c.paralelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Materia (opcional)</Label>
                            <Select value={materiaId} onValueChange={setMateriaId}>
                                <SelectTrigger><SelectValue placeholder="Todas las materias" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Todas</SelectItem>
                                    {materias.map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.codigo} - {m.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button onClick={() => descargar('pdf')} className="flex-1 bg-red-600 hover:bg-red-700">
                                <FileText className="mr-2 h-4 w-4" /> Descargar PDF
                            </Button>
                            <Button onClick={() => descargar('excel')} className="flex-1 bg-green-600 hover:bg-green-700">
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Descargar Excel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}