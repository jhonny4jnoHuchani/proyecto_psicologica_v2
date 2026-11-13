import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { GeometricFallingBackground } from '@/components/geometric-background';
import { SystemAlertBanner } from '@/components/system-alert-banner';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            {/* Cascada de figuras geométricas y auras de luz institucionales para el fondo del sistema */}
            <GeometricFallingBackground />
            
            {/* Menú lateral con su propio fondo panorámico corredizo integrado */}
            <AppSidebar />
            
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <SystemAlertBanner />
                <div className="relative z-10 flex-1 min-w-0 w-full">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
