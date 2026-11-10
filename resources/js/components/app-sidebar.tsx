import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
//objeto Nav user
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavItem } from "@/types";

import { Link, usePage } from "@inertiajs/react";

import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutGrid,
  Library,
  School,
  Users,
  Palette,
  Layout,
  Sparkles,
  ShieldCheck,
  UserCog,
  BarChart3,
  ClipboardCheck,
  Wand2,
  CheckCircle2,
  Bot,
} from "lucide-react";
import AppLogo from "./app-logo";
import { BannerFondoWallpaper, BannerFondoButton } from "./banner-fondo-wallpaper";

export function AppSidebar() {
  const { auth, rol } = usePage().props as {
    auth?: {
      user?: {
        roles?: (string | { name: string })[];
      };
      roles?: string[];
    };
    rol?: string;
  };

  // Extraer roles de forma resiliente desde auth.roles, auth.user.roles o prop rol
  const roleNames: string[] = [];

  if (Array.isArray(auth?.roles)) {
    roleNames.push(...auth.roles);
  }

  if (Array.isArray(auth?.user?.roles)) {
    auth.user.roles.forEach((r) => {
      if (typeof r === "string") {
        roleNames.push(r);
      } else if (r && typeof r === "object" && "name" in r && typeof r.name === "string") {
        roleNames.push(r.name);
      }
    });
  }

  if (rol && typeof rol === "string" && !roleNames.includes(rol)) {
    roleNames.push(rol);
  }

  const isAdmin = roleNames.includes("admin");
  const isDocente = roleNames.includes("docente");
  const isEstudiante = roleNames.includes("estudiante");

  // Agrupación para ADMIN
  const adminGroups = [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
        { title: "Página Web Pública", url: "/pagina-admin", icon: Layout },
      ],
    },
    {
      label: "Gestión Académica",
      items: [
        { title: "Gestiones", url: "/gestiones", icon: Calendar },
        { title: "Cursos y Paralelos", url: "/cursos", icon: School },
        { title: "Materias", url: "/materias", icon: BookOpen },
        { title: "Biblioteca de Libros", url: "/libros", icon: Library },
        {
          title: "Lecciones Asignadas",
          url: "/lecciones",
          icon: ClipboardCheck,
        },
      ],
    },
    {
      label: "Comunidad Educativa",
      items: [
        { title: "Estudiantes", url: "/estudiantes", icon: Users },
        { title: "Docentes", url: "/docentes", icon: GraduationCap },
        {
          title: "Personal Administrativo",
          url: "/administrativos",
          icon: UserCog,
        },
      ],
    },
    {
      label: "Control y Sistema",
      items: [
        { title: "Reportes y Métricas", url: "/reportes", icon: BarChart3 },
        { title: "Roles y Permisos", url: "/roles", icon: ShieldCheck },
        { title: "Bot de Telegram", url: "/settings/telegram", icon: Bot },
      ],
    },
  ];

  // Menu para DOCENTE
  const docenteGroups = [
    {
      label: "Panel Principal",
      items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutGrid }],
    },
    {
      label: "Gestión de Aula",
      items: [
        { title: "Lecciones y Tareas", url: "/lecciones", icon: BookOpen },
        {
          title: "Revisión de Entregas",
          url: "/entregas/docente",
          icon: ClipboardCheck,
        },
        {
          title: "Refuerzos con IA",
          url: "/refuerzos/docente",
          icon: Sparkles,
        },
        {
          title: "Reportes y Calificaciones",
          url: "/reportes",
          icon: BarChart3,
        },
      ],
    },
  ];

  // Menu para ESTUDIANTE
  const estudianteGroups = [
    {
      label: "Mi Espacio",
      items: [
        { title: "Inicio / Mi Dashboard", url: "/dashboard", icon: LayoutGrid },
      ],
    },
    {
      label: "Mis Actividades",
      items: [
        { title: "Mis Clases y Lecciones", url: "/lecciones", icon: BookOpen },
        {
          title: "Mis Tareas y Entregas",
          url: "/entregas",
          icon: CheckCircle2,
        },
        {
          title: "Refuerzos Pedagógicos (IA)",
          url: "/refuerzos",
          icon: Sparkles,
        },
        {
          title: "Recomendaciones de Estudio",
          url: "/estudiante/recomendaciones",
          icon: Wand2,
        },
      ],
    },
  ];

  let activeGroups = adminGroups;
  if (isAdmin) {
    activeGroups = adminGroups;
  } else if (isDocente) {
    activeGroups = docenteGroups;
  } else if (isEstudiante) {
    activeGroups = estudianteGroups;
  } else {
    // Respaldo de seguridad para usuarios autenticados: nunca dejar el sidebar vacío
    activeGroups = estudianteGroups;
  }

  const footerNavItems: NavItem[] = isAdmin
    ? [{ title: "Apariencia", url: "/settings/apariencia", icon: Palette }]
    : [];

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* Fondo panorámico corredizo exclusivo del bloque del menú lateral */}
      <BannerFondoWallpaper />

      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-1 p-1 rounded-2xl bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-800/90 border border-white/40 dark:border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-md transition-all duration-300">
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent shadow-none border-none bg-transparent flex-1">
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
            <BannerFondoButton className="mr-1 group-data-[collapsible=icon]:hidden shrink-0" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        {activeGroups.map((group, index) => (
          <NavMain key={index} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter className="relative z-10">
        {footerNavItems.length > 0 && (
          <NavFooter items={footerNavItems} className="mt-auto" />
        )}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
