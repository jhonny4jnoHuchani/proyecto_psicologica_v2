import { Head, router } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { LoaderCircle, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { type BreadcrumbItem } from "@/types";

interface Props {
  config: {
    id: number;
    color_primario: string;
    color_secundario: string;
    logo: string | null;
  } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Configuración", href: "/settings/apariencia" },
  { title: "Apariencia", href: "" },
];

function colorContraste(hex: string): string {
  if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) return "#ffffff";
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const brillo = (r * 299 + g * 587 + b * 114) / 1000;
  return brillo >= 128 ? "#000000" : "#ffffff";
}

function colorAjustar(hex: string, porcentaje: number): string {
  if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  const h = hex.replace("#", "");
  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);

  if (porcentaje > 0) {
    const factor = porcentaje / 100;
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
  } else {
    const factor = 1 + porcentaje / 100;
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
  }

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function colorLightRgba(hex: string, alpha = 0.12): string {
  if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) return `rgba(79, 70, 229, ${alpha})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Apariencia({ config }: Props) {
  const [colorPrimario, setColorPrimario] = useState(
    config?.color_primario || "#4f46e5",
  );
  const [colorSecundario, setColorSecundario] = useState(
    config?.color_secundario || "#06b6d4",
  );
  const [logo, setLogo] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  // Derivaciones en tiempo real
  const primarioHover = colorAjustar(colorPrimario, -14);
  const primarioLight = colorLightRgba(colorPrimario, 0.12);
  const primarioBorder = colorLightRgba(colorPrimario, 0.3);
  const secundarioHover = colorAjustar(colorSecundario, -14);
  const secundarioLight = colorLightRgba(colorSecundario, 0.12);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setProcessing(true);
    const formData = new FormData();
    formData.append("color_primario", colorPrimario);
    formData.append("color_secundario", colorSecundario);
    if (logo) formData.append("logo", logo);

    router.post("/settings/apariencia", formData, {
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
                Personalizar Apariencia e Identidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Previsualización de paleta y derivaciones */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Previsualización de la paleta armónica en vivo
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Modo Claro */}
                    <div className="rounded-xl border border-neutral-200 p-4 space-y-4 bg-white shadow-xs">
                      <div className="flex items-center justify-between border-b pb-2">
                        <p className="text-xs font-semibold text-neutral-600">
                          Modo Claro
                        </p>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Fondo Blanco
                        </span>
                      </div>

                      {/* Muestrarios de color */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div>
                          <div
                            className="h-9 rounded-lg shadow-inner"
                            style={{ backgroundColor: colorPrimario }}
                          />
                          <span className="text-neutral-500 mt-1 block">
                            Primario
                          </span>
                        </div>
                        <div>
                          <div
                            className="h-9 rounded-lg shadow-inner"
                            style={{ backgroundColor: primarioHover }}
                          />
                          <span className="text-neutral-500 mt-1 block">
                            Hover (-14%)
                          </span>
                        </div>
                        <div>
                          <div
                            className="h-9 rounded-lg border shadow-inner"
                            style={{
                              backgroundColor: primarioLight,
                              borderColor: primarioBorder,
                            }}
                          />
                          <span className="text-neutral-500 mt-1 block">
                            Suave (Fondo)
                          </span>
                        </div>
                        <div>
                          <div
                            className="h-9 rounded-lg shadow-inner"
                            style={{ backgroundColor: colorSecundario }}
                          />
                          <span className="text-neutral-500 mt-1 block">
                            Secundario
                          </span>
                        </div>
                      </div>

                      {/* Elementos interactivos simulados */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
                            style={{
                              backgroundColor: colorPrimario,
                              color: colorContraste(colorPrimario),
                            }}
                          >
                            Botón Primario
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
                            style={{
                              backgroundColor: primarioHover,
                              color: colorContraste(primarioHover),
                            }}
                          >
                            Estado Hover
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
                            style={{
                              backgroundColor: colorSecundario,
                              color: colorContraste(colorSecundario),
                            }}
                          >
                            Secundario
                          </button>
                        </div>

                        <div
                          className="rounded-lg p-2.5 text-xs flex items-center justify-between border"
                          style={{
                            backgroundColor: primarioLight,
                            borderColor: primarioBorder,
                            color: colorPrimario,
                          }}
                        >
                          <span className="font-semibold">
                            Alerta / Badge derivado suave
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/70">
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Modo Oscuro */}
                    <div className="rounded-xl border border-neutral-800 p-4 space-y-4 bg-neutral-900 text-neutral-100 shadow-xs">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <p className="text-xs font-semibold text-neutral-300">
                          Modo Oscuro
                        </p>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Fondo Oscuro
                        </span>
                      </div>

                      {/* Muestrarios de color */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div>
                          <div
                            className="h-9 rounded-lg opacity-90 shadow-inner"
                            style={{ backgroundColor: colorPrimario }}
                          />
                          <span className="text-neutral-400 mt-1 block">
                            Primario
                          </span>
                        </div>
                        <div>
                          <div
                            className="h-9 rounded-lg opacity-95 shadow-inner"
                            style={{
                              backgroundColor: colorAjustar(colorPrimario, 15),
                            }}
                          />
                          <span className="text-neutral-400 mt-1 block">
                            Hover (+15%)
                          </span>
                        </div>
                        <div>
                          <div
                            className="h-9 rounded-lg border border-neutral-700 shadow-inner"
                            style={{
                              backgroundColor: colorLightRgba(
                                colorPrimario,
                                0.2,
                              ),
                            }}
                          />
                          <span className="text-neutral-400 mt-1 block">
                            Suave (Dark)
                          </span>
                        </div>
                        <div>
                          <div
                            className="h-9 rounded-lg opacity-90 shadow-inner"
                            style={{ backgroundColor: colorSecundario }}
                          />
                          <span className="text-neutral-400 mt-1 block">
                            Secundario
                          </span>
                        </div>
                      </div>

                      {/* Elementos interactivos simulados */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs opacity-95"
                            style={{
                              backgroundColor: colorPrimario,
                              color: colorContraste(colorPrimario),
                            }}
                          >
                            Botón Primario
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs"
                            style={{
                              backgroundColor: colorAjustar(colorPrimario, 15),
                              color: colorContraste(
                                colorAjustar(colorPrimario, 15),
                              ),
                            }}
                          >
                            Estado Hover
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs opacity-95"
                            style={{
                              backgroundColor: colorSecundario,
                              color: colorContraste(colorSecundario),
                            }}
                          >
                            Secundario
                          </button>
                        </div>

                        <div
                          className="rounded-lg p-2.5 text-xs flex items-center justify-between border"
                          style={{
                            backgroundColor: colorLightRgba(
                              colorPrimario,
                              0.22,
                            ),
                            borderColor: colorLightRgba(colorPrimario, 0.4),
                            color: colorAjustar(colorPrimario, 25),
                          }}
                        >
                          <span className="font-semibold">
                            Alerta / Badge derivado suave
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
                            Activo
                          </span>
                        </div>
                      </div>
                    </div>
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
                    <img
                      src={`/storage/${config.logo}`}
                      alt="Logo actual"
                      className="h-12 mt-2 rounded"
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={processing}
                  style={{
                    backgroundColor: colorPrimario,
                    color: colorContraste(colorPrimario),
                  }}
                >
                  {processing && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
