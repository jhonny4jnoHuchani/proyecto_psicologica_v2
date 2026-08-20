import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Calendar, FileText, GraduationCap, LayoutGrid, Library, School, Users, Palette,Layout } from 'lucide-react';

import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    { title: 'Gestiones', url: '/gestiones', icon: Calendar },
    { title: 'Materias', url: '/materias', icon: BookOpen },
    { title: 'Docentes', url: '/docentes', icon: GraduationCap },
    { title: 'Estudiantes', url: '/estudiantes', icon: Users },
    { title: 'Cursos', url: '/cursos', icon: School },
    { title: 'Libros', url: '/libros', icon: Library },
    { title: 'Mis Entregas', url: '/entregas', icon: FileText },
    { title: 'Reportes', url: '/reportes', icon: FileText },
    { title: 'Página Admin', url: '/pagina-admin', icon: Layout }  // ← NUEVO
];
const footerNavItems: NavItem[] = [
    {
        title: 'Apariencia',
        url: '/settings/apariencia',
        icon: Palette,
    },
];

export function AppSidebar() {
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}