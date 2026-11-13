import { usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FlashProps {
    error?: string | null;
    warning?: string | null;
    success?: string | null;
    [key: string]: any;
}

export function SystemAlertBanner() {
    const { flash } = usePage<{ flash?: FlashProps }>().props;
    const [dismissed, setDismissed] = useState<{ [key: string]: boolean }>({});

    // Resetear dismiss cuando cambia el contenido del flash
    useEffect(() => {
        setDismissed({});
    }, [flash?.error, flash?.warning, flash?.success]);

    if (!flash) return null;

    return (
        <div className="space-y-2 px-4 pt-3 sm:px-6">
            {/* Alerta de Error / Falla de conexión o lógica */}
            {flash.error && !dismissed['error'] && (
                <div
                    role="alert"
                    className="relative flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-200 shadow-lg backdrop-blur-md transition-all duration-300 dark:border-red-500/40 dark:bg-red-950/60"
                >
                    <div className="mt-0.5 flex-shrink-0 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-100">
                            Aviso de Incidencia o Falla en el Sistema
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-red-200/90">
                            {flash.error}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed((prev) => ({ ...prev, error: true }))}
                        className="rounded-lg p-1 text-red-300 hover:bg-red-900/50 hover:text-white focus:outline-none"
                        aria-label="Cerrar notificación"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Alerta de Advertencia */}
            {flash.warning && !dismissed['warning'] && (
                <div
                    role="alert"
                    className="relative flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-amber-200 shadow-lg backdrop-blur-md transition-all duration-300 dark:border-amber-500/40 dark:bg-amber-950/60"
                >
                    <div className="mt-0.5 flex-shrink-0 text-amber-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-100">
                            Advertencia del Sistema
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-amber-200/90">
                            {flash.warning}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed((prev) => ({ ...prev, warning: true }))}
                        className="rounded-lg p-1 text-amber-300 hover:bg-amber-900/50 hover:text-white focus:outline-none"
                        aria-label="Cerrar notificación"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

