import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Image as ImageIcon } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="bg-background/60 backdrop-blur-md border-sidebar-border/60 flex h-16 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger className="-ml-1 h-9 w-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground cursor-pointer transition-colors" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => window.dispatchEvent(new CustomEvent('toggle-banner-fondo'))}
                    className="h-9 w-9 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                    title="Alternar imagen de fondo decorativa"
                    aria-label="Alternar imagen de fondo decorativa"
                >
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="sr-only">Alternar fondo</span>
                </Button>
                <ThemeToggle />
                <NotificationBell />
            </div>
        </header>
    );
}
