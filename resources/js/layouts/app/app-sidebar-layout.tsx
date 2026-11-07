import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { BannerFondoWallpaper } from '@/components/banner-fondo-wallpaper';
import { GeometricFallingBackground } from '@/components/geometric-background';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            <BannerFondoWallpaper />
            <GeometricFallingBackground />
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="relative z-10 flex-1">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
