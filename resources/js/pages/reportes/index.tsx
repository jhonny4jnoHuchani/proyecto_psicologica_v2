import { Head } from "@inertiajs/react";
import { FileSpreadsheet, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface Props {
  cursos: {
    id: number;
    gestion: { año: number; etapa: string };
    paralelo: string;
  }[];
  materias: { id: number; nombre: string; codigo: string }[];
  filtros?: { curso_id?: string; materia_id?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Reportes", href: "/reportes" },
];

export default function ReportesIndex({ cursos, materias, filtros }: Props) {
  const [cursoId, setCursoId] = useState(filtros?.curso_id || "");
  const [materiaId, setMateriaId] = useState(filtros?.materia_id || "");

  const descargar = (tipo: "pdf" | "excel" | "refuerzos-pdf") => {
    if (!cursoId) {
      toast.error(
        "Por favor, selecciona un curso antes de generar el reporte.",
      );
      return;
    }

    const params = new URLSearchParams({ curso_id: cursoId });
    if (materiaId && materiaId !== "none") {
      params.append("materia_id", materiaId);
    }

    window.open(`/reportes/${tipo}?${params.toString()}`, "_blank");
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reportes" />
      <div className="mx-auto max-w-xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Generar Reportes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Exporta las calificaciones y actividades de refuerzo con IA en
            formato PDF o Excel.
          </p>
        </div>

        <Card className="shadow-xs border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Seleccionar Datos
            </CardTitle>
            <CardDescription className="text-xs">
              Elige el curso y materia para emitir el reporte correspondiente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Curso *</Label>
              <Select value={cursoId} onValueChange={setCursoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.gestion?.año} - {c.gestion?.etapa} | Paralelo{" "}
                      {c.paralelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Materia (opcional)</Label>
              <Select value={materiaId} onValueChange={setMateriaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las materias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todas las materias</SelectItem>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.codigo} - {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">
                Reportes de Calificaciones
              </Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => descargar("pdf")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" /> Calificaciones (PDF)
                </Button>
                <Button
                  type="button"
                  onClick={() => descargar("excel")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Calificaciones
                  (Excel)
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <Label className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Reporte Psicopedagógico con IA
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => descargar("refuerzos-pdf")}
                className="w-full border-primary-border text-primary hover:bg-primary-light cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Descargar Reporte de Refuerzos IA (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
