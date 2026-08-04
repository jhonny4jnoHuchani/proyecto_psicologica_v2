import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de Perfil',
        href: '/settings/profile',
    },
];

interface ProfileForm {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    genero: string;
    fecha_nacimiento: string;
    direccion: string;
    [key: string]: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        nombre: auth.user.nombre,
        apellido_paterno: auth.user.apellido_paterno,
        apellido_materno: auth.user.apellido_materno,
        ci: auth.user.ci,
        celular: auth.user.celular,
        email: auth.user.email,
        genero: auth.user.genero || '',
        fecha_nacimiento: auth.user.fecha_nacimiento || '',
        direccion: auth.user.direccion || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Información Personal" description="Actualiza tus datos personales" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Nombre */}
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                className="mt-1 block w-full"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                required
                                autoComplete="given-name"
                                placeholder="Juan"
                            />
                            <InputError className="mt-2" message={errors.nombre} />
                        </div>

                        {/* Apellido Paterno */}
                        <div className="grid gap-2">
                            <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                            <Input
                                id="apellido_paterno"
                                className="mt-1 block w-full"
                                value={data.apellido_paterno}
                                onChange={(e) => setData('apellido_paterno', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="Pérez"
                            />
                            <InputError className="mt-2" message={errors.apellido_paterno} />
                        </div>

                        {/* Apellido Materno */}
                        <div className="grid gap-2">
                            <Label htmlFor="apellido_materno">Apellido Materno</Label>
                            <Input
                                id="apellido_materno"
                                className="mt-1 block w-full"
                                value={data.apellido_materno}
                                onChange={(e) => setData('apellido_materno', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="García"
                            />
                            <InputError className="mt-2" message={errors.apellido_materno} />
                        </div>

                        {/* CI */}
                        <div className="grid gap-2">
                            <Label htmlFor="ci">Carnet de Identidad</Label>
                            <Input
                                id="ci"
                                className="mt-1 block w-full"
                                value={data.ci}
                                onChange={(e) => setData('ci', e.target.value)}
                                required
                                placeholder="8377246 LP"
                            />
                            <InputError className="mt-2" message={errors.ci} />
                        </div>

                        {/* Celular */}
                        <div className="grid gap-2">
                            <Label htmlFor="celular">Celular</Label>
                            <Input
                                id="celular"
                                className="mt-1 block w-full"
                                value={data.celular}
                                onChange={(e) => setData('celular', e.target.value)}
                                required
                                autoComplete="tel"
                                placeholder="76543210"
                            />
                            <InputError className="mt-2" message={errors.celular} />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="correo@ejemplo.com"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {/* Género */}
                        <div className="grid gap-2">
                            <Label htmlFor="genero">Género</Label>
                            <select
                                id="genero"
                                value={data.genero}
                                onChange={(e) => setData('genero', e.target.value)}
                                className="border rounded p-2 w-full"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="Otro">Otro</option>
                            </select>
                            <InputError className="mt-2" message={errors.genero} />
                        </div>

                        {/* Fecha de Nacimiento */}
                        <div className="grid gap-2">
                            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                            <Input
                                id="fecha_nacimiento"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.fecha_nacimiento}
                                onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.fecha_nacimiento} />
                        </div>

                        {/* Dirección */}
                        <div className="grid gap-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input
                                id="direccion"
                                className="mt-1 block w-full"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                autoComplete="street-address"
                                placeholder="Av. Sucre B, Zona Villa Esperanza"
                            />
                            <InputError className="mt-2" message={errors.direccion} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Tu correo no está verificado.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Haz clic aquí para reenviar el correo de verificación.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Un nuevo enlace de verificación ha sido enviado a tu correo.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Guardar</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Guardado</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}