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

export function AppSidebar() {
  const { auth } = usePage().props as {
    auth?: { user?: { roles?: { name: string }[] } };
  };
  const roles = auth?.user?.roles?.map((r) => r.name) || [];
  const isAdmin = roles.includes("admin");
  const isDocente = roles.includes("docente");
  const isEstudiante = roles.includes("estudiante");

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

  let activeGroups: typeof adminGroups = [];
  if (isAdmin) activeGroups = adminGroups;
  else if (isDocente) activeGroups = docenteGroups;
  else if (isEstudiante) activeGroups = estudianteGroups;

  const footerNavItems: NavItem[] = isAdmin
    ? [{ title: "Apariencia", url: "/settings/apariencia", icon: Palette }]
    : [];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {activeGroups.map((group, index) => (
          <NavMain key={index} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {footerNavItems.length > 0 && (
          <NavFooter items={footerNavItems} className="mt-auto" />
        )}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
