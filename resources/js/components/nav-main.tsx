import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label = "Gestión Administrativa" }: { items: NavItem[], label?: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-1">
            {label && (
                <SidebarGroupLabel className="flex items-center gap-2 mb-1.5 px-2">
                    <span className="text-[10px] tracking-[0.15em] font-extrabold uppercase text-slate-800 dark:text-slate-200 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] shrink-0">
                        {label}
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = item.url === page.url || (item.url !== '/dashboard' && page.url.startsWith(item.url));
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={item.url} prefetch className="flex items-center gap-3 w-full">
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {isActive && (
                                        <span className="ml-auto flex h-2 w-2 relative shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_white]" />
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
