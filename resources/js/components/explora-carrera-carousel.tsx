import React, { useState } from "react";
import {
  Brain,
  HeartPulse,
  Users2,
  GraduationCap,
  Briefcase,
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  FileText,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface AreaAcademica {
  id: string;
  nombre: string;
  categoria: string;
  badge: string;
  icono: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  resumen: string;
  duracion: string;
  tituloOtorgado: string;
  materiasClave: string[];
  campoLaboral: string[];
  competencias: string[];
  targetSeccion?: string;
  botonAccionLabel: string;
}

export const AREAS_ACADEMICAS: AreaAcademica[] = [
  {
    id: "clinica",
    nombre: "Psicología Clínica y de la Salud",
    categoria: "Salud Mental & Diagnóstico",
    badge: "Especialidad Troncal",
    icono: HeartPulse,
    resumen:
      "Formación especializada en evaluación, diagnóstico, intervención psicoterapéutica y prevención de trastornos emocionales y del comportamiento.",
    duracion: "5 Años (10 Semestres)",
    tituloOtorgado: "Licenciado(a) en Psicología",
    materiasClave: [
      "Psicopatología General e Infanto-Juvenil",
      "Técnicas de Evaluación y Psicométrica",
      "Modelos Psicoterapéuticos y Clínica",
      "Neuropsicología Aplicada",
      "Ética y Deontología Profesional",
    ],
    campoLaboral: [
      "Hospitales públicos y centros de salud de 1er, 2do y 3er nivel",
      "Clínicas y gabinetes de atención privada",
      "Centros de rehabilitación y salud mental comunitaria",
      "Unidades de peritaje psicológico forense",
    ],
    competencias: [
      "Aplicación de baterías psicodiagnósticas estandarizadas",
      "Diseño y ejecución de planes de intervención terapéutica",
      "Manejo de crisis y contención emocional",
    ],
    botonAccionLabel: "Ver Ficha Académica del Área",
  },
  {
    id: "social",
    nombre: "Psicología Social y Comunitaria",
    categoria: "Compromiso Social UPEA",
    badge: "Enfoque Social",
    icono: Users2,
    resumen:
      "Abordaje de dinámicas grupales, problemas psicosociales, derechos humanos, prevención de violencia e intervención comunitaria en la ciudad de El Alto.",
    duracion: "5 Años (10 Semestres)",
    tituloOtorgado: "Licenciado(a) en Psicología",
    materiasClave: [
      "Psicología Social y de las Masas",
      "Antropología y Realidad Nacional",
      "Elaboración de Proyectos Comunitarios",
      "Psicología Política y Derechos Humanos",
      "Investigación Acción Participativa",
    ],
    campoLaboral: [
      "Organizaciones No Gubernamentales (ONGs) nacionales e internacionales",
      "Ministerios y programas de desarrollo social del Estado",
      "Defensorías de la Niñez y Servicios Legales Integrales (SLIM)",
      "Liderazgo en proyectos de desarrollo barrial y comunitario",
    ],
    competencias: [
      "Diagnóstico psicosocial en comunidades vulnerables",
      "Facilitación de procesos participativos y resolución de conflictos",
      "Formulación y evaluación de políticas públicas con impacto social",
    ],
    botonAccionLabel: "Ver Ficha Académica del Área",
  },
  {
    id: "educativa",
    nombre: "Psicología Educativa y del Desarrollo",
    categoria: "Formación & Psicopedagogía",
    badge: "Área Educativa",
    icono: GraduationCap,
    resumen:
      "Acompañamiento a procesos de enseñanza-aprendizaje, detección de dificultades cognitivas, estimulación temprana y orientación vocacional.",
    duracion: "5 Años (10 Semestres)",
    tituloOtorgado: "Licenciado(a) en Psicología",
    materiasClave: [
      "Psicología del Desarrollo (Infancia y Adolescencia)",
      "Dificultades del Aprendizaje y Neurodesarrollo",
      "Orientación Vocacional y Profesional",
      "Diseño Curricular y Psicopedagogía",
      "Educación Inclusiva y Necesidades Especiales",
    ],
    campoLaboral: [
      "Unidades educativas fiscales, de convenio y privadas",
      "Universidades e institutos de educación superior",
      "Centros de estimulación infantil y psicopedagógicos",
      "Gabinetes de orientación vocacional escolar",
    ],
    competencias: [
      "Evaluación y diagnóstico psicopedagógico integral",
      "Asesoramiento a docentes y familias en convivencia escolar",
      "Diseño de estrategias de inclusión y adaptaciones curriculares",
    ],
    botonAccionLabel: "Ver Ficha Académica del Área",
  },
  {
    id: "organizacional",
    nombre: "Psicología Organizacional y del Trabajo",
    categoria: "Gestión de Talento & Empresas",
    badge: "Sector Corporativo",
    icono: Briefcase,
    resumen:
      "Gestión estratégica de recursos humanos, selección por competencias, clima laboral, ergonomía y salud ocupacional en instituciones y empresas.",
    duracion: "5 Años (10 Semestres)",
    tituloOtorgado: "Licenciado(a) en Psicología",
    materiasClave: [
      "Comportamiento Organizacional",
      "Reclutamiento y Selección por Competencias",
      "Evaluación del Desempeño y Clima Laboral",
      "Salud y Bienestar Ocupacional",
      "Liderazgo, Coaching y Negociación",
    ],
    campoLaboral: [
      "Departamentos de Talento Humano y Recursos Humanos",
      "Consultoras de selección y capacitación de personal",
      "Empresas públicas, bancarias e industrias privadas",
      "Organismos de seguridad laboral y salud ocupacional",
    ],
    competencias: [
      "Diseño de perfiles de puesto y evaluación por competencias",
      "Diagnóstico e intervención en clima y cultura laboral",
      "Programas de prevención de estrés laboral y burnout",
    ],
    botonAccionLabel: "Ver Ficha Académica del Área",
  },
  {
    id: "neurociencias",
    nombre: "Neuropsicología y Psicometría Científica",
    categoria: "Investigación & Neurociencia",
    badge: "Científico - Experimental",
    icono: Brain,
    resumen:
      "Estudio de las bases biológicas y cerebrales de la conducta, rehabilitación cognitiva, evaluación estandarizada y metodología científica.",
    duracion: "5 Años (10 Semestres)",
    tituloOtorgado: "Licenciado(a) en Psicología",
    materiasClave: [
      "Bases Biológicas de la Conducta y Neuroanatomía",
      "Psicometría y Construcción de Pruebas",
      "Neuropsicología Clínica",
      "Estadística Aplicada a las Ciencias Sociales",
      "Laboratorio Experimental de Procesos Cognitivos",
    ],
    campoLaboral: [
      "Centros de rehabilitación neurocognitiva y geriátrica",
      "Institutos de investigación neurocientífica y del comportamiento",
      "Laboratorios psicométricos de estandarización de pruebas",
      "Asesoría técnica en proyectos de investigación académica",
    ],
    competencias: [
      "Aplicación de pruebas neuropsicológicas computarizadas",
      "Elaboración de perfiles cognitivos y planes de rehabilitación",
      "Publicación científica y análisis estadístico riguroso",
    ],
    botonAccionLabel: "Ver Ficha Académica del Área",
  },
];

interface ExploraCarreraCarouselProps {
  primaryColor?: string;
  secondaryColor?: string;
  totalConvocatorias?: number;
  totalLibros?: number;
  totalAutoridades?: number;
  onNavigateSeccion?: (id: string) => void;
}

export function ExploraCarreraCarousel({
  primaryColor = "#4f46e5",
  secondaryColor = "#06b6d4",
  totalConvocatorias = 0,
  totalLibros = 0,
  totalAutoridades = 0,
  onNavigateSeccion,
}: ExploraCarreraCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalArea, setModalArea] = useState<AreaAcademica | null>(null);

  const total = AREAS_ACADEMICAS.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  };

  const handleNav = (targetId: string) => {
    if (onNavigateSeccion) {
      onNavigateSeccion(targetId);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. CARRUSEL INTERACTIVO DE LAS 5 ÁREAS DE FORMACIÓN */}
      <div className="relative">
        {/* Controles de navegación de carrusel */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono-tag font-bold uppercase tracking-wider text-white"
              style={{
                backgroundColor: `${primaryColor}25`,
                borderColor: `${primaryColor}55`,
                borderWidth: 1,
              }}
            >
              Área {currentSlide + 1} de {total}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Desliza para explorar las ramas profesionales
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Área anterior"
              className="h-10 w-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Siguiente área"
              className="h-10 w-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tarjeta Hero del Área Seleccionada */}
        <AnimatePresence mode="wait">
          {(() => {
            const area = AREAS_ACADEMICAS[currentSlide];
            const Icon = area.icono;

            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-slate-900/75 backdrop-blur-2xl border border-white/15 shadow-2xl"
                style={{
                  boxShadow: `0 25px 50px -12px ${primaryColor}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
              >
                {/* Auras de resplandor institucional en esquinas */}
                <div
                  className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
                  }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Columna Izquierda: Información de la Especialidad */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center text-white shadow-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      <div>
                        <span
                          className="text-xs font-mono-tag font-bold uppercase tracking-wider block"
                          style={{ color: secondaryColor }}
                        >
                          {area.categoria}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-title font-extrabold text-white tracking-tight">
                          {area.nombre}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                      {area.resumen}
                    </p>

                    {/* Fichas rápidas de especificación */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono-tag">
                          Duración del Plan
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {area.duracion}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono-tag">
                          Título Académico
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          Licenciatura UPEA
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono-tag">
                          Modalidad
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          Semestral Presencial
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción útiles con sentido */}
                    <div className="pt-3 flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => setModalArea(area)}
                        className="font-bold text-white rounded-xl px-5 py-2.5 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        Ver Plan de Estudios & Campo Laboral
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleNav("convocatorias")}
                        className="font-semibold text-slate-200 bg-white/5 hover:bg-white/15 border-white/20 rounded-xl px-4 py-2.5 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="h-4 w-4" style={{ color: secondaryColor }} />
                        Revisar Admisión
                      </Button>
                    </div>
                  </div>

                  {/* Columna Derecha: Vista previa de Competencias Clave */}
                  <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3.5">
                    <span className="text-[11px] font-mono-tag font-bold uppercase tracking-wider text-slate-400 block border-b border-white/10 pb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" style={{ color: secondaryColor }} />
                      Competencias Formativas
                    </span>
                    <ul className="space-y-2.5">
                      {area.competencias.map((comp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 mt-0.5"
                            style={{ color: secondaryColor }}
                          />
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Indicadores de diapositivas en miniatura */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {AREAS_ACADEMICAS.map((area, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white font-bold border border-white/25 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={
                  isActive
                    ? {
                        borderColor: `${secondaryColor}80`,
                        boxShadow: `0 0 12px ${secondaryColor}40`,
                      }
                    : undefined
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isActive ? secondaryColor : "rgba(255,255,255,0.3)",
                  }}
                />
                <span className="hidden sm:inline">{area.nombre.split(" ")[1] || area.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACCESOS DIRECTOS A RECURSOS EN VIVO (SIN BOTONES VACÍOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Acceso a Convocatorias Oficiales */}
        <div
          onClick={() => handleNav("convocatorias")}
          className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-mono-tag border-white/20 text-slate-300">
                {totalConvocatorias > 0 ? `${totalConvocatorias} Activas` : "Publicaciones Oficiales"}
              </Badge>
            </div>
            <h4 className="text-base font-title font-bold text-white group-hover:text-cyan-300 transition-colors">
              Convocatorias de Admisión
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Cronogramas oficiales, requisitos de postulación, costos y fechas de inicio de clases.
            </p>
          </div>
          <div
            className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-transform group-hover:translate-x-1"
            style={{ color: secondaryColor }}
          >
            <span>Ir a Convocatorias</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Acceso a Biblioteca de Compendios */}
        <div
          onClick={() => handleNav("biblioteca")}
          className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-mono-tag border-white/20 text-slate-300">
                {totalLibros > 0 ? `${totalLibros} Guías Libres` : "Acceso Abierto"}
              </Badge>
            </div>
            <h4 className="text-base font-title font-bold text-white group-hover:text-cyan-300 transition-colors">
              Biblioteca Digital de Estudio
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Compendios bibliográficos y guías de 5 páginas preparadas por los docentes para postulantes.
            </p>
          </div>
          <div
            className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-transform group-hover:translate-x-1"
            style={{ color: secondaryColor }}
          >
            <span>Explorar Libros y Guías</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Acceso a Autoridades y Contacto */}
        <div
          onClick={() => handleNav("autoridades")}
          className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Users2 className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-mono-tag border-white/20 text-slate-300">
                {totalAutoridades > 0 ? `${totalAutoridades} Directivos` : "Dirección de Carrera"}
              </Badge>
            </div>
            <h4 className="text-base font-title font-bold text-white group-hover:text-cyan-300 transition-colors">
              Cuerpo de Autoridades
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Conoce a los directores, comisiones pedagógicas y representantes institucionales de la UPEA.
            </p>
          </div>
          <div
            className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-transform group-hover:translate-x-1"
            style={{ color: secondaryColor }}
          >
            <span>Ver Autoridades</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* 3. MODAL DETALLADO DE FICHA ACADÉMICA DEL ÁREA */}
      <Dialog open={!!modalArea} onOpenChange={(open) => !open && setModalArea(null)}>
        <DialogContent className="sm:max-w-3xl bg-slate-950 border border-white/20 text-white max-h-[88vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          {modalArea && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-mono-tag font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: `${primaryColor}40`, borderColor: `${primaryColor}80`, borderWidth: 1 }}
                  >
                    {modalArea.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-tag">{modalArea.categoria}</span>
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-title font-black text-white">
                  {modalArea.nombre}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-300 leading-relaxed pt-1">
                  {modalArea.resumen}
                </DialogDescription>
              </DialogHeader>

              {/* Parámetros Generales */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase font-mono-tag text-[10px]">
                    Grado Académico
                  </span>
                  <span className="font-bold text-white">{modalArea.tituloOtorgado}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase font-mono-tag text-[10px]">
                    Duración
                  </span>
                  <span className="font-bold text-white">{modalArea.duracion}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase font-mono-tag text-[10px]">
                    Sede
                  </span>
                  <span className="font-bold text-white">Campus Villa Esperanza, El Alto</span>
                </div>
              </div>

              {/* Materias Troncales */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono-tag font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" style={{ color: secondaryColor }} />
                  Asignaturas Troncales Representativas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modalArea.materiasClave.map((mat, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                      <span>{mat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campo Laboral */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono-tag font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Building className="h-4 w-4" style={{ color: primaryColor }} />
                  Campo de Desempeño Profesional
                </h4>
                <ul className="space-y-2">
                  {modalArea.campoLaboral.map((campo, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{campo}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acciones dentro del modal */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setModalArea(null)}
                  className="bg-transparent hover:bg-white/10 text-slate-300 border-white/20 rounded-xl"
                >
                  Cerrar Ficha
                </Button>

                <Button
                  onClick={() => {
                    setModalArea(null);
                    handleNav("convocatorias");
                  }}
                  className="font-bold text-white rounded-xl px-5 shadow-lg cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  Consultar Convocatorias de Admisión <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

