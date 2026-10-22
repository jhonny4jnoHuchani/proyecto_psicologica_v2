import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatoFechaHora } from '@/lib/formatters';
import { type NotificacionItem, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    CheckCheck,
    FileCheck,
    KeyRound,
    Sparkles,
} from 'lucide-react';

function getNotificationIcon(tipo: string) {
    switch (tipo) {
        case 'tarea_calificada':
            return <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />;
        case 'refuerzo_generado':
            return <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />;
        case 'credenciales_enviadas':
            return <KeyRound className="h-4 w-4 text-blue-500 shrink-0" />;
        case 'tarea_nueva':
            return <BookOpen className="h-4 w-4 text-amber-500 shrink-0" />;
        default:
            return <Bell className="h-4 w-4 text-neutral-500 shrink-0" />;
    }
}

function formatearFechaRelativa(fechaStr: string) {
    try {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        const diffSegundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

        if (diffSegundos < 60) return 'Hace un momento';
        if (diffSegundos < 3600) return `Hace ${Math.floor(diffSegundos / 60)} min`;
        if (diffSegundos < 86400) return `Hace ${Math.floor(diffSegundos / 3600)} h`;
        return formatoFechaHora(fechaStr);
    } catch {
        return '';
    }
}

export function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    const notificaciones: NotificacionItem[] = auth?.notificaciones || [];
    const cantidadNoLeidas = notificaciones.length;

    const handleItemClick = (n: NotificacionItem) => {
        router.post(
            route('notificaciones.marcar-leida', n.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (n.url) {
                        router.visit(n.url);
                    }
                },
            }
        );
    };

    const handleMarcarTodas = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(
            route('notificaciones.marcar-todas-leidas'),
            {},
            { preserveScroll: true }
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                    title="Notificaciones"
                    aria-label="Ver notificaciones"
                >
                    <Bell className="h-4 w-4" />
                    {cantidadNoLeidas > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                            {cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 rounded-xl shadow-lg border">
                <DropdownMenuLabel className="flex items-center justify-between p-3.5 border-b bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Notificaciones</span>
                        {cantidadNoLeidas > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                {cantidadNoLeidas} nuevas
                            </span>
                        )}
                    </div>
                    {cantidadNoLeidas > 0 && (
                        <button
                            type="button"
                            onClick={handleMarcarTodas}
                            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary transition-colors cursor-pointer"
                            title="Marcar todas como leídas"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            <span>Marcar todas</span>
                        </button>
                    )}
                </DropdownMenuLabel>

                <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                    {notificaciones.length === 0 ? (
                        <div className="py-8 text-center text-neutral-400 dark:text-neutral-500 space-y-2">
                            <Bell className="h-8 w-8 mx-auto stroke-1 opacity-60" />
                            <p className="text-sm">No tienes notificaciones pendientes</p>
                        </div>
                    ) : (
                        notificaciones.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                onClick={() => handleItemClick(n)}
                                className="flex items-start gap-3 p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer focus:bg-neutral-50 dark:focus:bg-neutral-800/60"
                            >
                                <div className="mt-0.5 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                    {getNotificationIcon(n.tipo)}
                                </div>
                                <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                            {n.titulo}
                                        </p>
                                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                                            {formatearFechaRelativa(n.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                                        {n.mensaje}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
