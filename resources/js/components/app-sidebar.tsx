import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, FileText, GraduationCap, LayoutGrid, Library, School, Users, Palette, Layout } from 'lucide-react';

import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as { auth?: { user?: { roles?: { name: string }[] } } };
    const roles = auth?.user?.roles?.map(r => r.name) || [];
    const isAdmin = roles.includes('admin');
    const isDocente = roles.includes('docente');
    const isEstudiante = roles.includes('estudiante');

    // Menu para ADMIN
    const adminNavItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Gestiones', url: '/gestiones', icon: Calendar },
        { title: 'Materias', url: '/materias', icon: BookOpen },
        { title: 'Docentes', url: '/docentes', icon: GraduationCap },
        { title: 'Estudiantes', url: '/estudiantes', icon: Users },
        { title: 'Cursos', url: '/cursos', icon: School },
        { title: 'Libros', url: '/libros', icon: Library },
        { title: 'Lecciones', url: '/lecciones', icon: FileText },
        { title: 'Reportes', url: '/reportes', icon: FileText },
        { title: 'Página Admin', url: '/pagina-admin', icon: Layout },
    ];

    // Menu para DOCENTE
    const docenteNavItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Lecciones', url: '/lecciones', icon: FileText },
        { title: 'Entregas', url: '/entregas/docente', icon: FileText },
        { title: 'Reportes', url: '/reportes', icon: FileText },
    ];

    // Menu para ESTUDIANTE
    const estudianteNavItems: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Lecciones', url: '/lecciones', icon: FileText },
        { title: 'Mis Entregas', url: '/entregas', icon: FileText },
    ];

    let mainNavItems: NavItem[] = [];
    if (isAdmin) mainNavItems = adminNavItems;
    else if (isDocente) mainNavItems = docenteNavItems;
    else if (isEstudiante) mainNavItems = estudianteNavItems;

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}