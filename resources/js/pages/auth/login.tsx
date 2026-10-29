import { Head, useForm } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, LoaderCircle, Sparkles } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
  [key: string]: string | boolean;
}

interface ConfigData {
  color_primario?: string | null;
  color_secundario?: string | null;
  logo?: string | null;
  nombre_institucion?: string | null;
  lema?: string | null;
}

interface Portada {
  id: number;
  titulo: string | null;
  imagen: string;
  orden: number;
}

interface LoginProps {
  status?: string;
  canResetPassword?: boolean;
  config?: ConfigData | null;
  portadas?: Portada[];
}

export default function Login({ status, config, portadas = [] }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<LoginForm>(
    {
      email: "",
      password: "",
      remember: true,
    },
  );

  const primaryColor = config?.color_primario || "var(--primary, #0b57d0)";
  const secondaryColor =
    config?.color_secundario || "var(--secondary, #00d2ff)";
  const institucion = config?.nombre_institucion || "CARRERA DE PSICOLOGÍA";
  const lema = config?.lema || "VOCACIÓN, CIENCIA Y COMPROMISO";

  // Rotación suave de portadas si hay más de 2
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(portadas.length > 1 ? 1 : 0);

  useEffect(() => {
    if (!portadas || portadas.length <= 2) return;
    const timer = setInterval(() => {
      setLeftIndex((prev) => (prev + 2) % portadas.length);
      setRightIndex((prev) => (prev + 2) % portadas.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [portadas]);

  const leftPortada =
    portadas.length > 0 ? portadas[leftIndex % portadas.length] : null;
  const rightPortada =
    portadas.length > 0 ? portadas[rightIndex % portadas.length] : null;

  const logoUrl = config?.logo
    ? `/storage/${config.logo}`
    : "/storage/logos/N4rqQeXKbHHvV8ATwpvZhB4JYDqiagXwa4EyNHU5.png";

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#051329] text-white flex items-center justify-center font-sans select-none">
      <Head title="Iniciar sesión - Aula Virtual" />

      {/* ==================== FONDO TECNOLÓGICO Y CONSTELACIÓN ==================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Degradado de fondo profundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061633] via-[#040e22] to-[#020712]" />

        {/* Resplandores radiales */}
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[140px] opacity-25"
          style={{ background: secondaryColor }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[650px] w-[650px] rounded-full blur-[160px] opacity-20"
          style={{ background: primaryColor }}
        />

        {/* SVG de Red de Nodos / Constelación (Estilo Moodle Sistemas UPEA) */}
        <svg
          className="absolute inset-0 h-full w-full opacity-35"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Líneas de red lado izquierdo */}
          <g stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3">
            <line x1="5%" y1="15%" x2="22%" y2="28%" />
            <line x1="22%" y1="28%" x2="12%" y2="52%" />
            <line x1="12%" y1="52%" x2="28%" y2="65%" />
            <line x1="28%" y1="65%" x2="8%" y2="82%" />
            <line x1="5%" y1="15%" x2="12%" y2="52%" />
            <line x1="22%" y1="28%" x2="35%" y2="40%" />
            <line x1="28%" y1="65%" x2="38%" y2="85%" />
          </g>

          {/* Líneas de red lado derecho */}
          <g stroke="#00f2fe" strokeWidth="1" strokeOpacity="0.3">
            <line x1="72%" y1="18%" x2="88%" y2="12%" />
            <line x1="88%" y1="12%" x2="95%" y2="38%" />
            <line x1="88%" y1="12%" x2="80%" y2="45%" />
            <line x1="80%" y1="45%" x2="92%" y2="68%" />
            <line x1="92%" y1="68%" x2="75%" y2="82%" />
            <line x1="75%" y1="82%" x2="68%" y2="92%" />
            <line x1="92%" y1="68%" x2="98%" y2="88%" />
          </g>

          {/* Circuitos decorativos detrás de los hexágonos */}
          <path
            d="M 680,240 L 720,240 L 750,270 L 830,270"
            fill="none"
            stroke="#00d2ff"
            strokeWidth="2"
            strokeOpacity="0.4"
          />
          <circle cx="830" cy="270" r="4" fill="#00d2ff" />

          <path
            d="M 280,320 L 240,320 L 210,350 L 140,350"
            fill="none"
            stroke="#00d2ff"
            strokeWidth="2"
            strokeOpacity="0.4"
          />
          <circle cx="140" cy="350" r="4" fill="#00d2ff" />

          {/* Nodos brillantes (Dots) */}
          {[
            { cx: "5%", cy: "15%", r: 3 },
            { cx: "22%", cy: "28%", r: 4 },
            { cx: "12%", cy: "52%", r: 5 },
            { cx: "28%", cy: "65%", r: 4 },
            { cx: "8%", cy: "82%", r: 3.5 },
            { cx: "35%", cy: "40%", r: 4.5 },
            { cx: "72%", cy: "18%", r: 4 },
            { cx: "88%", cy: "12%", r: 3.5 },
            { cx: "95%", cy: "38%", r: 5 },
            { cx: "80%", cy: "45%", r: 4 },
            { cx: "92%", cy: "68%", r: 4.5 },
            { cx: "75%", cy: "82%", r: 4 },
            { cx: "68%", cy: "92%", r: 3 },
          ].map((node, i) => (
            <circle key={i} cx={node.cx} cy={node.cy} r={node.r} fill="#38bdf8">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur={`${2.5 + (i % 3)}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>

      {/* ==================== CONTENEDOR PRINCIPAL: 3 COLUMNAS ==================== */}
      <div className="relative z-10 w-full max-w-[1440px] min-h-screen px-4 sm:px-8 py-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
        {/* ==================== COLUMNA IZQUIERDA: PORTADA 1 + LEMA + ESCUDO ==================== */}
        <div className="hidden lg:flex flex-col justify-between items-start w-[300px] xl:w-[360px] h-[640px] shrink-0">
          {/* Hexágono Izquierdo con Portada */}
          <div className="relative w-64 xl:w-72 h-64 xl:h-72 mx-auto filter drop-shadow-[0_0_20px_rgba(56,189,248,0.35)]">
            {/* Marco Hexagonal con degradado cian */}
            <div
              className="w-full h-full p-[3px] bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 transition-all duration-700"
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <div
                className="w-full h-full bg-[#081830] overflow-hidden"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              >
                {leftPortada ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={leftPortada.id}
                      src={`/storage/${leftPortada.imagen}`}
                      alt={leftPortada.titulo || "Portada"}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-cyan-200">
                    <GraduationCap className="w-16 h-16 mb-2 opacity-80" />
                    <span className="text-xs uppercase font-semibold tracking-wider">
                      UPEA Psicología
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slogan institucional */}
          <div className="my-auto pl-2">
            <p className="text-xl xl:text-2xl font-black uppercase tracking-wider text-white leading-tight">
              CALIDAD, CIENCIA <br /> Y COMPROMISO
            </p>
            <p className="mt-1 text-sm font-bold tracking-widest uppercase text-cyan-400">
              {lema}
            </p>
          </div>

          {/* Escudo UPEA + Texto Inferior Izquierdo */}
          <div className="flex items-center gap-3.5 pt-4">
            <div className="w-14 h-14 rounded-full bg-white/10 p-1 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <img
                src={logoUrl}
                alt="UPEA"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback si no carga
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black tracking-wider uppercase text-white">
                UNIVERSIDAD PÚBLICA
              </p>
              <p className="text-sm font-black tracking-wider uppercase text-white">
                DE EL ALTO
              </p>
              <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-widest mt-0.5">
                CARRERA DE PSICOLOGÍA
              </p>
            </div>
          </div>
        </div>

        {/* ==================== COLUMNA CENTRAL: TARJETA BLANCA DE LOGIN ==================== */}
        <div className="relative w-full max-w-[430px] z-20">
          <div className="relative rounded-[28px] bg-white text-neutral-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] px-7 py-9 sm:px-9 sm:py-10 border border-white/90">
            {/* Sello Circular Superior (Estilo Exacto Moodle UPEA - Grande y Legible) */}
            <div className="relative mx-auto mb-6 flex flex-col items-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* SVG con texto perimetral circular estático y concéntrico */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 260 260"
                >
                  <defs>
                    {/* Arco Superior (recorre la parte superior de izquierda a derecha) */}
                    <path
                      id="topSealPath"
                      d="M 22, 130 A 108,108 0 0,1 238, 130"
                      fill="none"
                    />
                    {/* Arco Inferior (recorre la parte inferior de izquierda a derecha en sentido de lectura) */}
                    <path
                      id="bottomSealPath"
                      d="M 22, 130 A 108,108 0 0,0 238, 130"
                      fill="none"
                    />
                  </defs>

                  {/* Círculo perimetral exterior */}
                  <circle
                    cx="130"
                    cy="130"
                    r="126"
                    fill="none"
                    stroke="#0d3b66"
                    strokeWidth="3"
                    strokeOpacity="0.8"
                  />

                  {/* Círculo intermedio */}
                  <circle
                    cx="130"
                    cy="130"
                    r="121"
                    fill="none"
                    stroke="#0d3b66"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />

                  {/* Texto superior: CARRERA DE PSICOLOGÍA */}
                  <text className="text-[12.5px] font-black uppercase tracking-[0.24em] fill-[#0d3b66]">
                    <textPath
                      href="#topSealPath"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      CARRERA DE PSICOLOGÍA
                    </textPath>
                  </text>

                  {/* Puntos separadores laterales */}
                  <circle cx="22" cy="130" r="3.5" fill="#0d3b66" />
                  <circle cx="238" cy="130" r="3.5" fill="#0d3b66" />

                  {/* Texto inferior: UNIVERSIDAD PÚBLICA DE EL ALTO */}
                  <text className="text-[11.5px] font-black uppercase tracking-[0.20em] fill-[#0d3b66]">
                    <textPath
                      href="#bottomSealPath"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      UNIVERSIDAD PÚBLICA DE EL ALTO
                    </textPath>
                  </text>

                  {/* Círculo interior punteado */}
                  <circle
                    cx="130"
                    cy="130"
                    r="92"
                    fill="none"
                    stroke="#0d3b66"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    strokeOpacity="0.5"
                  />
                </svg>

                {/* Logo institucional central agrandado */}
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full p-2 bg-white flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logo Carrera de Psicología"
                    className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Formulario de Inicio de Sesión */}
            <form onSubmit={submit} className="flex flex-col gap-4">
              {/* Input: Nombre de usuario */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="email"
                    type="text"
                    name="email"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="username"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="Nombre de usuario"
                    className="h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-[#0d47a1] focus:ring-1 focus:ring-[#0d47a1] transition-all shadow-none"
                  />
                </div>
                <InputError message={errors.email} />
              </div>

              {/* Input: Contraseña */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    tabIndex={2}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="Contraseña"
                    className="h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-[#0d47a1] focus:ring-1 focus:ring-[#0d47a1] transition-all shadow-none"
                  />
                </div>
                <InputError message={errors.password} />
              </div>

              {/* Botón Principal: Acceder */}
              <Button
                type="submit"
                tabIndex={3}
                disabled={processing}
                className="mt-2 h-12 w-full rounded-md text-[16px] font-bold text-white shadow-md transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                {processing ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  "Acceder"
                )}
              </Button>

              {/* Recordarme (Discreto) */}
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={data.remember}
                  onCheckedChange={(checked) =>
                    setData("remember", checked === true)
                  }
                  className="border-neutral-400 data-[state=checked]:bg-[#0d47a1]"
                />
                <Label
                  htmlFor="remember"
                  className="text-xs text-neutral-500 font-normal cursor-pointer select-none"
                >
                  Recordar sesión
                </Label>
              </div>
            </form>

            {/* Estado / Mensaje de feedback de sesión */}
            {status && (
              <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
                {status}
              </div>
            )}
          </div>
        </div>

        {/* ==================== COLUMNA DERECHA: TÍTULO + PORTADA 2 + AÑO 2026 ==================== */}
        <div className="hidden lg:flex flex-col justify-between items-end w-[300px] xl:w-[360px] h-[640px] shrink-0 text-right">
          {/* Gran Título: CARRERA DE PSICOLOGÍA */}
          <div className="text-right pr-2">
            <h2 className="text-2xl xl:text-3xl font-black uppercase tracking-wider text-cyan-400 font-mono drop-shadow">
              CARRERA DE
            </h2>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              PSICOLOGÍA
            </h1>
            <div className="mt-2 h-1 w-28 ml-auto rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          </div>

          {/* Hexágono Derecho con Portada */}
          <div className="relative w-64 xl:w-72 h-64 xl:h-72 mx-auto filter drop-shadow-[0_0_20px_rgba(56,189,248,0.35)]">
            <div
              className="w-full h-full p-[3px] bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 transition-all duration-700"
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <div
                className="w-full h-full bg-[#081830] overflow-hidden"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              >
                {rightPortada ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={rightPortada.id}
                      src={`/storage/${rightPortada.imagen}`}
                      alt={rightPortada.titulo || "Portada"}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-cyan-200">
                    <Sparkles className="w-16 h-16 mb-2 opacity-80" />
                    <span className="text-xs uppercase font-semibold tracking-wider">
                      AULA VIRTUAL
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badge 2026 e Insignia TIC / Carrera (Estilo Moodle UPEA) */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <span className="text-2xl font-black tracking-widest text-white drop-shadow">
              2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
