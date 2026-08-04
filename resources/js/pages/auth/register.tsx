import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    celular: string;
    email: string;
    password: string;
    password_confirmation: string;
    genero: string;
    fecha_nacimiento: string;
    direccion: string;
    [key: string]: string; // ← Firma de índice
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm <RegisterForm> ({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        celular: '',
        email: '',
        password: '',
        password_confirmation: '',
        genero: '',
        fecha_nacimiento: '',
        direccion: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Crear una cuenta" description="Ingresa tus datos para registrarte">
            <Head title="Registro" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    
                    {/* Nombre */}
                    <div className="grid gap-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="given-name"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            disabled={processing}
                            placeholder="Juan"
                        />
                        <InputError message={errors.nombre} />
                    </div>

                    {/* Apellido Paterno */}
                    <div className="grid gap-2">
                        <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                        <Input
                            id="apellido_paterno"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="family-name"
                            value={data.apellido_paterno}
                            onChange={(e) => setData('apellido_paterno', e.target.value)}
                            disabled={processing}
                            placeholder="Pérez"
                        />
                        <InputError message={errors.apellido_paterno} />
                    </div>

                    {/* Apellido Materno */}
                    <div className="grid gap-2">
                        <Label htmlFor="apellido_materno">Apellido Materno</Label>
                        <Input
                            id="apellido_materno"
                            type="text"
                            required
                            tabIndex={3}
                            autoComplete="family-name"
                            value={data.apellido_materno}
                            onChange={(e) => setData('apellido_materno', e.target.value)}
                            disabled={processing}
                            placeholder="García"
                        />
                        <InputError message={errors.apellido_materno} />
                    </div>

                    {/* CI */}
                    <div className="grid gap-2">
                        <Label htmlFor="ci">Carnet de Identidad</Label>
                        <Input
                            id="ci"
                            type="text"
                            required
                            tabIndex={4}
                            value={data.ci}
                            onChange={(e) => setData('ci', e.target.value)}
                            disabled={processing}
                            placeholder="8377246 LP"
                        />
                        <InputError message={errors.ci} />
                    </div>

                    {/* Celular */}
                    <div className="grid gap-2">
                        <Label htmlFor="celular">Celular</Label>
                        <Input
                            id="celular"
                            type="text"
                            required
                            tabIndex={5}
                            autoComplete="tel"
                            value={data.celular}
                            onChange={(e) => setData('celular', e.target.value)}
                            disabled={processing}
                            placeholder="76543210"
                        />
                        <InputError message={errors.celular} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={6}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="correo@ejemplo.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Género */}
                    <div className="grid gap-2">
                        <Label htmlFor="genero">Género</Label>
                        <Select value={data.genero} onValueChange={(value) => setData('genero', value)} disabled={processing}>
                            <SelectTrigger id="genero" tabIndex={7}>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="M">Masculino</SelectItem>
                                <SelectItem value="F">Femenino</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.genero} />
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="grid gap-2">
                        <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                        <Input
                            id="fecha_nacimiento"
                            type="date"
                            tabIndex={8}
                            value={data.fecha_nacimiento}
                            onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.fecha_nacimiento} />
                    </div>

                    {/* Dirección */}
                    <div className="grid gap-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                            id="direccion"
                            type="text"
                            tabIndex={9}
                            autoComplete="street-address"
                            value={data.direccion}
                            onChange={(e) => setData('direccion', e.target.value)}
                            disabled={processing}
                            placeholder="Av. Sucre B, Zona Villa Esperanza"
                        />
                        <InputError message={errors.direccion} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={10}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Contraseña"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirmar Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={11}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmar contraseña"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={12} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Crear Cuenta
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    ¿Ya tienes una cuenta?{' '}
                    <TextLink href={route('login')} tabIndex={13}>
                        Iniciar Sesión
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}