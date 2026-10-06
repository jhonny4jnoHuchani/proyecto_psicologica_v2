import { Head, Link, router } from '@inertiajs/react';
import { ShieldCheck, LoaderCircle, ArrowLeft } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface Permission {
    id: number;
    name: string;
}

interface Props {
    role: Role | null;
    permissions: Permission[];
    rolePermissions: string[];
}

export default function RolesForm({ role, permissions, rolePermissions }: Props) {
    const isEdit = !!role;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles y Permisos', href: '/roles' },
        { title: isEdit ? 'Editar Rol' : 'Nuevo Rol', href: '' },
    ];

    const [form, setForm] = useState<{name: string; permissions: string[]}>({
        name: role?.name || '',
        permissions: rolePermissions || []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        if (isEdit) {
            router.put(`/roles/${role.id}`, form, {
                onSuccess: () => setProcessing(false),
                onError: (err) => { setErrors(err); setProcessing(false); }
            });
        } else {
            router.post('/roles', form, {
                onSuccess: () => setProcessing(false),
                onError: (err) => { setErrors(err); setProcessing(false); }
            });
        }
    };

    const togglePermission = (permName: string, checked: boolean) => {
        setForm(prev => {
            const nextPerms = checked 
                ? [...prev.permissions, permName] 
                : prev.permissions.filter(p => p !== permName);
            return { ...prev, permissions: nextPerms };
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar Rol' : 'Nuevo Rol'} />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/roles"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6" /> {isEdit ? 'Editar Rol' : 'Nuevo Rol'}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Rol</CardTitle>
                            <CardDescription>Asigna el nombre base de este nuevo rol.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Rol *</Label>
                                <Input 
                                    id="name" 
                                    value={form.name} 
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                    required 
                                    placeholder="Ej. Auxiliar, Supervisor, etc." 
                                />
                                <InputError message={errors.name} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permisos Asignados</CardTitle>
                            <CardDescription>Selecciona los permisos explícitos que tendrán los usuarios vinculados con este rol.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {permissions.map((perm) => (
                                    <label key={perm.id} className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 dark:border-neutral-700 bg-transparent text-primary focus:ring-primary cursor-pointer"
                                            checked={form.permissions.includes(perm.name)}
                                            onChange={(e) => togglePermission(perm.name, e.target.checked)}
                                        />
                                        <span className="flex-1 cursor-pointer font-normal text-sm leading-none m-0 text-foreground">
                                            {perm.name}
                                        </span>
                                    </label>
                                ))}
                                {permissions.length === 0 && (
                                    <p className="text-sm text-neutral-500 italic col-span-full">No hay permisos registrados en el sistema para asignar.</p>
                                )}
                            </div>
                            <InputError message={errors.permissions} className="mt-4" />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} size="lg">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            {isEdit ? 'Guardar Cambios' : 'Crear Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
