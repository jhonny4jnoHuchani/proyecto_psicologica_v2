import React from "react";
import {
  BookOpen,
  Calendar,
  Users2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExploraCarreraCarouselProps {
  primaryColor?: string;
  secondaryColor?: string;
  totalConvocatorias?: number;
  totalLibros?: number;
  totalAutoridades?: number;
  onNavigateSeccion?: (seccionId: string) => void;
}

export function ExploraCarreraCarousel({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  totalConvocatorias = 0,
  totalLibros = 0,
  totalAutoridades = 0,
  onNavigateSeccion,
}: ExploraCarreraCarouselProps) {
  const handleNav = (targetId: string) => {
    if (onNavigateSeccion) {
      onNavigateSeccion(targetId);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      {/* 3 ACCESOS DIRECTOS A RECURSOS EN VIVO (CONECTADOS Y SIN BOTONES VACÍOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Acceso a Convocatorias Oficiales */}
        <div
          onClick={() => handleNav("convocatorias")}
          className="group p-6 rounded-3xl bg-slate-900/75 hover:bg-slate-900/90 border border-white/10 hover:border-white/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer flex flex-col justify-between"
          style={{
            boxShadow: `0 15px 35px -10px ${primaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${secondaryColor}80`;
            e.currentTarget.style.boxShadow = `0 20px 40px -10px ${primaryColor}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = `0 15px 35px -10px ${primaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`;
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Calendar className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-xs font-mono-tag border-white/20 text-slate-300 px-2.5 py-1">
                {totalConvocatorias > 0 ? `${totalConvocatorias} Activas` : "Publicaciones"}
              </Badge>
            </div>
            <h4 className="text-lg font-title font-bold text-white group-hover:text-cyan-300 transition-colors">
              Convocatorias de Admisión
            </h4>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Cronogramas oficiales, requisitos de postulación, fechas de examen y publicaciones de la carrera.
            </p>
          </div>
          <div
            className="mt-6 flex items-center gap-2 text-xs font-bold transition-transform group-hover:translate-x-1"
            style={{ color: secondaryColor }}
          >
            <span>Ir a Convocatorias</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Acceso a Biblioteca de Compendios */}
        <div
          onClick={() => handleNav("biblioteca")}
          className="group p-6 rounded-3xl bg-slate-900/75 hover:bg-slate-900/90 border border-white/10 hover:border-white/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer flex flex-col justify-between"
          style={{
            boxShadow: `0 15px 35px -10px ${secondaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${secondaryColor}80`;
            e.currentTarget.style.boxShadow = `0 20px 40px -10px ${secondaryColor}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = `0 15px 35px -10px ${secondaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`;
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}
              >
                <BookOpen className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-xs font-mono-tag border-white/20 text-slate-300 px-2.5 py-1">
                {totalLibros > 0 ? `${totalLibros} Guías Libres` : "Acceso Abierto"}
              </Badge>
            </div>
            <h4 className="text-lg font-title font-bold text-white group-hover:text-cyan-300 transition-colors">
              Biblioteca Digital de Estudio
            </h4>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Compendios bibliográficos y guías oficiales de 5 páginas preparadas por los docentes para postulantes.
            </p>
          </div>
          <div
            className="mt-6 flex items-center gap-2 text-xs font-bold transition-transform group-hover:translate-x-1"
            style={{ color: secondaryColor }}
          >
            <span>Explorar Libros y Guías PDF</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Acceso a Autoridades y Contacto */}
        <div
          onClick={() => handleNav("autoridades")}
          className="group p-6 rounded-3xl bg-slate-900/75 hover:bg-slate-900/90 border border-white/10 hover:border-white/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer flex flex-col justify-between"
          style={{
            boxShadow: `0 15px 35px -10px ${primaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${primaryColor}80`;
            e.currentTarget.style.boxShadow = `0 20px 40px -10px ${primaryColor}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = `0 15px 35px -10px ${primaryColor}25, inset 0 1px 0 rgba(255,255,255,0.12)`;
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Users2 className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-xs font-mono-tag border-white/20 text-slate-300 px-2.5 py-1">
                {totalAutoridades > 0 ? `${totalAutoridades} Directivos` : "Dirección"}
              </Badge>
            </div>
            <h4 className="text-lg font-title font-bold text-white group-hover:text-cyan-300 transition-colors">
              Cuerpo de Autoridades
            </h4>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Equipo directivo, comisiones pedagógicas y representantes institucionales de la Carrera en la UPEA.
            </p>
          </div>
          <div
            className="mt-6 flex items-center gap-2 text-xs font-bold transition-transform group-hover:translate-x-1"
            style={{ color: secondaryColor }}
          >
            <span>Ver Autoridades</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
