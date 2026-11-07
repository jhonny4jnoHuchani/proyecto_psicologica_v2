import React from "react";
import { Head } from "@inertiajs/react";
import { BookOpen, Sparkles, Wand2, TrendingUp, AlertTriangle } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { PageHeaderBanner } from "@/components/page-header-banner";
import { Card, CardContent } from "@/components/ui/card";
import { type BreadcrumbItem } from "@/types";

interface Props {
  sin_datos: boolean;
  mensaje?: string;
  estudiante_nombre?: string;
  materia_nombre?: string;
  tema_actual_nombre?: string;
  nota_actual?: number;
  tema_siguiente?: string;
  paginas_siguiente?: string;
  prediccion?: {
    prediccion_sin_leer: number;
    prediccion_con_leer: number;
    beneficio: number;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Recomendaciones de Estudio", href: "/estudiante/recomendaciones" },
];

export default function Index({
  sin_datos,
  mensaje,
  estudiante_nombre,
  materia_nombre,
  tema_actual_nombre,
  nota_actual,
  tema_siguiente,
  paginas_siguiente,
  prediccion,
}: Props) {
  if (sin_datos) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Recomendaciones de Estudio - IA" />
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          <PageHeaderBanner
            title="Recomendaciones Predictivas con IA"
            subtitle="Análisis predictivo de rendimiento y sugerencias personalizadas de preparación académica."
            icon={Wand2}
            badgeText="ASISTENTE INTELIGENTE"
          />

          <Card className="text-center py-16 px-6">
            <CardContent className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-4xl mb-4 border border-indigo-500/20">
                📚
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Aún no hay recomendaciones acumuladas
              </h2>
              <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                {mensaje || "Completa tus primeras lecciones y evaluaciones para que nuestro modelo de IA calcule tus proyecciones de estudio."}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Recomendaciones Predictivas - IA" />
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <PageHeaderBanner
          title="Recomendaciones Predictivas con IA"
          subtitle={`Plan preventivo personalizado para ${estudiante_nombre}: proyección de notas para el siguiente tema.`}
          icon={Wand2}
          badgeText="ASISTENTE INTELIGENTE"
          stats={[
            { label: "Beneficio", value: `+${prediccion?.beneficio || 0} pts` },
            { label: "Nota Actual", value: `${nota_actual || 0}/100` },
          ]}
        />

        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-primary mb-4 font-bold text-lg">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>Preparación Sugerida para el Próximo Tema</span>
          </div>

          <div className="bg-muted/40 p-5 rounded-2xl border border-border/60 space-y-2">
            <p className="text-sm text-foreground">
              En <span className="font-bold text-primary">{materia_nombre}</span>, finalizaste{" "}
              <span className="font-semibold">{tema_actual_nombre}</span> con una calificación de{" "}
              <span className={`font-bold ${nota_actual! < 75 ? "text-red-500" : "text-emerald-500"}`}>
                {nota_actual}/100
              </span>.
            </p>
            <p className="text-sm text-foreground">
              El próximo tema a avanzar es:{" "}
              <span className="font-bold text-primary">{tema_siguiente}</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/25 space-y-2">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Sin preparación previa
              </p>
              <p className="text-4xl font-extrabold text-red-500">
                ~{prediccion?.prediccion_sin_leer}/100
              </p>
              <p className="text-xs text-muted-foreground">
                Riesgo de descenso en tu rendimiento académico en esta unidad.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> Leyendo {paginas_siguiente} antes
              </p>
              <p className="text-4xl font-extrabold text-emerald-500">
                ~{prediccion?.prediccion_con_leer}/100
              </p>
              <p className="text-xs text-muted-foreground">
                ¡Aseguras la comprensión conceptual y elevas tu puntaje!
              </p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-primary/10 border border-primary/25 text-center">
            <p className="text-sm text-primary font-semibold">
              Ventaja neta estimada de lectura previa:{" "}
              <span className="font-extrabold text-base text-foreground">
                +{prediccion?.beneficio} puntos de ventaja
              </span>
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg">
            <BookOpen className="h-5 w-5" />
            <span>Lectura recomendada en el texto guía: {paginas_siguiente}</span>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
