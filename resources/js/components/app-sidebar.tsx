import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
//objeto Nav user
import { NavUser } from '@/components/nav-user';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';

import { Link, usePage } from '@inertiajs/react';

import { BookOpen, Calendar, FileText, GraduationCap, LayoutGrid, Library, School, Users, Palette, Layout, Sparkles, ShieldCheck, UserCog } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as { auth?: { user?: { roles?: { name: string }[] } } };
    const roles = auth?.user?.roles?.map(r => r.name) || [];
    const isAdmin = roles.includes('admin');
    const isDocente = roles.includes('docente');
    const isEstudiante = roles.includes('estudiante');

    // Agrupación para ADMIN
    const adminGroups = [
        {
            label: "Principal",
            items: [
                { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
                { title: 'Página Principal', url: '/pagina-admin', icon: Layout },
            ]
        },
        {
            label: "Gestión Académica",
            items: [
                { title: 'Gestiones', url: '/gestiones', icon: Calendar },
                { title: 'Cursos', url: '/cursos', icon: School },
                { title: 'Materias', url: '/materias', icon: BookOpen },
                { title: 'Libros', url: '/libros', icon: Library },
                { title: 'Lecciones', url: '/lecciones', icon: FileText },
            ]
        },
        {
            label: "Registros (Usuarios)",
            items: [
                { title: 'Estudiantes', url: '/estudiantes', icon: Users },
                { title: 'Docentes', url: '/docentes', icon: GraduationCap },
                { title: 'Personal Admin', url: '/administrativos', icon: UserCog },
            ]
        },
        {
            label: "Administración del Sistema",
            items: [
                { title: 'Reportes', url: '/reportes', icon: FileText },
                { title: 'Roles y Permisos', url: '/roles', icon: ShieldCheck },
            ]
        }
    ];

    // Menu para DOCENTE
    const docenteGroups = [
        {
            label: "Principal",
            items: [
                { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
            ]
        },
        {
            label: "Académico",
            items: [
                { title: 'Lecciones', url: '/lecciones', icon: FileText },
                { title: 'Entregas', url: '/entregas/docente', icon: FileText },
                { title: 'Refuerzos', url: '/refuerzos/docente', icon: Sparkles },
                { title: 'Reportes', url: '/reportes', icon: FileText },
            ]
        }
    ];

    // Menu para ESTUDIANTE
    const estudianteGroups = [
        {
            label: "Principal",
            items: [
                { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
            ]
        },
        {
            label: "Mis Actividades",
            items: [
                { title: 'Lecciones', url: '/lecciones', icon: FileText },
                { title: 'Mis Entregas', url: '/entregas', icon: FileText },
                { title: 'Mis Refuerzos', url: '/refuerzos', icon: Sparkles },
            ]
        }
    ];

    let activeGroups = [];
    if (isAdmin) activeGroups = adminGroups;
    else if (isDocente) activeGroups = docenteGroups;
    else if (isEstudiante) activeGroups = estudianteGroups;

    const footerNavItems: NavItem[] = isAdmin
        ? [{ title: 'Apariencia', url: '/settings/apariencia', icon: Palette }]
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
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}