import { Head, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { LoaderCircle, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

interface Props {
    config: {
        id: number;
        color_primario: string;
        color_secundario: string;
        logo: string | null;
    } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/settings/apariencia' },
    { title: 'Apariencia', href: '' },
];

function colorContraste(hex: string): string {
    if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) return '#ffffff';
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const brillo = (r * 299 + g * 587 + b * 114) / 1000;
    return brillo >= 128 ? '#000000' : '#ffffff';
}

export default function Apariencia({ config }: Props) {
    const [colorPrimario, setColorPrimario] = useState(config?.color_primario || '#4f46e5');
    const [colorSecundario, setColorSecundario] = useState(config?.color_secundario || '#06b6d4');
    const [logo, setLogo] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        const formData = new FormData();
        formData.append('color_primario', colorPrimario);
        formData.append('color_secundario', colorSecundario);
        if (logo) formData.append('logo', logo);

        router.post('/settings/apariencia', formData, {
            onSuccess: () => setProcessing(false),
            onError: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Apariencia" />
            <SettingsLayout>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Personalizar Apariencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Previsualización */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border p-4 space-y-3 bg-white">
                                        <p className="text-xs font-medium text-neutral-500">Modo Claro</p>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded" style={{ backgroundColor: colorPrimario }} />
                                            <div className="h-8 w-8 rounded" style={{ backgroundColor: colorSecundario }} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-3/4 rounded" style={{ backgroundColor: colorPrimario }} />
                                            <div className="h-3 w-1/2 rounded opacity-50" style={{ backgroundColor: colorSecundario }} />
                                        </div>
                                            <button
                                                className="text-xs px-3 py-1 rounded"
                                                style={{ backgroundColor: colorPrimario, color: colorContraste(colorPrimario) }}
                                            >
                                                Botón Primario
                                            </button>
                                    </div>
                                    <div className="rounded-lg border p-4 space-y-3 bg-neutral-900">
                                        <p className="text-xs font-medium text-neutral-400">Modo Oscuro</p>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded opacity-80" style={{ backgroundColor: colorPrimario }} />
                                            <div className="h-8 w-8 rounded opacity-80" style={{ backgroundColor: colorSecundario }} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-3/4 rounded opacity-80" style={{ backgroundColor: colorPrimario }} />
                                            <div className="h-3 w-1/2 rounded opacity-50" style={{ backgroundColor: colorSecundario }} />
                                        </div>
                                        <button
                                            className="text-xs px-3 py-1 rounded opacity-90"
                                            style={{ backgroundColor: colorPrimario, color: colorContraste(colorPrimario) }}
                                        >
                                            Botón Primario
                                        </button>
                                    </div>
                                </div>

                                {/* Color Primario */}
                                <div className="space-y-2">
                                    <Label>Color Primario</Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="color"
                                            value={colorPrimario}
                                            onChange={(e) => setColorPrimario(e.target.value)}
                                            className="w-16 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={colorPrimario}
                                            onChange={(e) => setColorPrimario(e.target.value)}
                                            className="w-32"
                                            placeholder="#4f46e5"
                                        />
                                    </div>
                                </div>

                                {/* Color Secundario */}
                                <div className="space-y-2">
                                    <Label>Color Secundario</Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="color"
                                            value={colorSecundario}
                                            onChange={(e) => setColorSecundario(e.target.value)}
                                            className="w-16 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={colorSecundario}
                                            onChange={(e) => setColorSecundario(e.target.value)}
                                            className="w-32"
                                            placeholder="#06b6d4"
                                        />
                                    </div>
                                </div>

                                {/* Logo */}
                                <div className="space-y-2">
                                    <Label>Logo (opcional)</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                    />
                                    {config?.logo && (
                                        <img src={`/storage/${config.logo}`} alt="Logo actual" className="h-12 mt-2 rounded" />
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    style={{ backgroundColor: colorPrimario, color: colorContraste(colorPrimario) }}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}