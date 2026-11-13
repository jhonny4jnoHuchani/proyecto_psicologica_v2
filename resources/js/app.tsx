import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return hex;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustHex(hex: string, percent: number): string {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return hex;
    let r = parseInt(clean.substring(0, 2), 16);
    let g = parseInt(clean.substring(2, 4), 16);
    let b = parseInt(clean.substring(4, 6), 16);
    r = Math.max(0, Math.min(255, Math.round(r + (255 * percent) / 100)));
    g = Math.max(0, Math.min(255, Math.round(g + (255 * percent) / 100)));
    b = Math.max(0, Math.min(255, Math.round(b + (255 * percent) / 100)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return { h: 220, s: 50, l: 50 };
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h = Math.round(h * 60);
    }

    return {
        h,
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

let cachedBrandConfig: any = null;

export function applyBrandTheme(config: any) {
    if (config) {
        cachedBrandConfig = config;
    }
    const activeConfig = config || cachedBrandConfig;
    if (!activeConfig || typeof document === 'undefined') return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    const prim = activeConfig.color_primario || '#4f46e5';
    const sec = activeConfig.color_secundario || '#06b6d4';

    const hslPrim = hexToHsl(prim);
    const hslSec = hexToHsl(sec);

    // Colores principales de marca
    root.style.setProperty('--primary', prim);
    root.style.setProperty('--ring', prim);
    root.style.setProperty('--sidebar-primary', prim);
    root.style.setProperty('--sidebar-ring', prim);
    root.style.setProperty('--secondary', sec);

    root.style.setProperty('--primary-hover', adjustHex(prim, isDark ? 15 : -14));
    root.style.setProperty('--primary-light', hexToRgba(prim, isDark ? 0.22 : 0.12));
    root.style.setProperty('--primary-border', hexToRgba(prim, isDark ? 0.45 : 0.28));

    root.style.setProperty('--secondary-hover', adjustHex(sec, isDark ? 15 : -14));
    root.style.setProperty('--secondary-light', hexToRgba(sec, isDark ? 0.22 : 0.12));
    root.style.setProperty('--secondary-border', hexToRgba(sec, isDark ? 0.45 : 0.28));

    // Variables personalizadas de degradado y aura
    root.style.setProperty('--brand-primario', prim);
    root.style.setProperty('--brand-secundario', sec);
    root.style.setProperty('--brand-gradient', `linear-gradient(135deg, ${prim}, ${sec})`);

    if (isDark) {
        // MODO OSCURO DINÁMICO (NO AZUL FIJO): Deriva matices oscuros del color primario configurado
        const satBg = Math.max(Math.min(hslPrim.s * 0.4, 30), 15);
        const satCard = Math.max(Math.min(hslPrim.s * 0.3, 22), 12);

        root.style.setProperty('--background', `hsl(${hslPrim.h}, ${satBg}%, 5%)`);
        root.style.setProperty('--card', `hsla(${hslPrim.h}, ${satCard}%, 9%, 0.75)`);
        root.style.setProperty('--popover', `hsl(${hslPrim.h}, ${satCard}%, 8%)`);
        root.style.setProperty('--border', `hsl(${hslPrim.h}, ${satCard}%, 16%)`);
        root.style.setProperty('--input', `hsl(${hslPrim.h}, ${satCard}%, 16%)`);
        root.style.setProperty('--sidebar-background', `hsla(${hslPrim.h}, ${satBg * 1.1}%, 6%, 0.45)`);
        root.style.setProperty('--sidebar-border', `hsla(${hslPrim.h}, ${satCard}%, 20%, 0.35)`);

        // Fondo del Hero Banner en modo oscuro (matizado con primario y secundario)
        root.style.setProperty(
            '--brand-hero-bg',
            `linear-gradient(135deg, hsl(${hslPrim.h}, 48%, 12%), hsl(${hslSec.h}, 42%, 9%), hsl(${hslPrim.h}, 36%, 6%))`,
        );
    } else {
        // MODO CLARO DINÁMICO (NO BLANCO PLANO): Matiz suave visible y elegante según el color primario
        const satBg = Math.max(Math.min(hslPrim.s * 0.32, 28), 16);
        const satCard = Math.max(Math.min(hslPrim.s * 0.12, 12), 6);

        root.style.setProperty('--background', `hsl(${hslPrim.h}, ${satBg}%, 94.8%)`);
        root.style.setProperty('--card', `hsla(${hslPrim.h}, ${satCard}%, 99%, 0.82)`);
        root.style.setProperty('--border', `hsl(${hslPrim.h}, ${Math.round(satBg * 0.65)}%, 86.5%)`);
        root.style.setProperty('--sidebar-background', `hsla(${hslPrim.h}, ${Math.round(satBg * 0.55)}%, 98%, 0.45)`);
        root.style.setProperty('--sidebar-border', `hsla(${hslPrim.h}, ${Math.round(satBg * 0.65)}%, 80%, 0.35)`);

        // Fondo del Hero Banner en modo claro (vivo, contrastado y elegante)
        root.style.setProperty(
            '--brand-hero-bg',
            `linear-gradient(135deg, hsl(${hslPrim.h}, 60%, 20%), hsl(${hslSec.h}, 55%, 16%), hsl(${hslPrim.h}, 50%, 14%))`,
        );
    }
}

// Sincronizar dinámicamente si el usuario cambia entre modo claro y oscuro
if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
    const themeObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (cachedBrandConfig) {
                    applyBrandTheme(cachedBrandConfig);
                }
            }
        }
    });
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

// ============================================================
// CONFIGURACIÓN DE AXIOS CON CSRF AUTOMÁTICO
// ============================================================
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Guardamos el token fresco en una variable
let currentCsrfToken = '';

// Obtener token fresco desde el backend
async function refreshCsrfToken(): Promise<string> {
    try {
        const res = await axios.get('/csrf-token');
        if (res.data?.token) {
            currentCsrfToken = res.data.token;
            return res.data.token;
        }
    } catch {
        console.warn('NS');
    }
    return '';
}

// Inicializar el token al cargar la app
refreshCsrfToken();

// Interceptor de request: siempre manda el token fresco
window.axios.interceptors.request.use((config) => {
    if (currentCsrfToken) {
        config.headers = config.headers || {};
        config.headers['X-CSRF-TOKEN'] = currentCsrfToken;
    }
    return config;
});

// Función centralizada para notificar mensajes flash en español
function processFlashMessages(flash?: { success?: string | null; error?: string | null; warning?: string | null }) {
    if (!flash) return;

    if (flash.error) {
        toast.error(flash.error, {
            id: `flash-error-${flash.error}`,
            duration: 8000,
        });
    }

    if (flash.warning) {
        toast.warning(flash.warning, {
            id: `flash-warning-${flash.warning}`,
            duration: 7000,
        });
    }

    if (flash.success) {
        toast.success(flash.success, {
            id: `flash-success-${flash.success}`,
            duration: 5000,
        });
    }
}

// Interceptor de response: si hay 419, refresca y reintenta; maneja caídas de red o servidor en español
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await refreshCsrfToken();

            if (newToken) {
                originalRequest.headers['X-CSRF-TOKEN'] = newToken;
                return window.axios(originalRequest);
            }
        }

        // Detección de fallos de red o servidor inalcanzable
        if (error.code === 'ERR_NETWORK' || !error.response) {
            toast.error('Error de Conexión: No se pudo contactar con el servidor. Revisa si la base de datos o el servicio web están activos.', {
                id: 'axios-network-error',
                duration: 7000,
            });
        } else if (error.response?.status === 503 || error.response?.status === 500) {
            const serverMsg = error.response?.data?.message || error.response?.data?.error;
            if (serverMsg) {
                toast.error(serverMsg, {
                    id: 'axios-server-error',
                    duration: 7000,
                });
            }
        }

        return Promise.reject(error);
    },
);

const appName = import.meta.env.VITE_APP_NAME || 'Sistema';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Aplicar tema institucional inmediatamente con la configuración inicial
        if (props.initialPage?.props?.config) {
            applyBrandTheme(props.initialPage.props.config);
        }

        // Procesar mensajes flash iniciales si existen
        if (props.initialPage?.props?.flash) {
            processFlashMessages(props.initialPage.props.flash as any);
        }

        root.render(
            <>
                <App {...props} />
                <Toaster richColors position="top-right" />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Sincronizar tema de color y procesar mensajes flash en cada navegación SPA de Inertia
router.on('navigate', (event) => {
    const page = event.detail.page;
    if (page?.props?.config) {
        applyBrandTheme(page.props.config);
    }
    if (page?.props?.flash) {
        processFlashMessages(page.props.flash as any);
    }
});

// Captura de respuestas no válidas de Inertia (HTTP 500, 503, etc.) para evitar modales en inglés
router.on('invalid', (event) => {
    event.preventDefault();
    const response = (event.detail as any).response;
    let mensaje = 'Ocurrió un error inesperado al procesar la solicitud.';

    if (response?.data?.message) {
        mensaje = response.data.message;
    } else if (response?.status === 503) {
        mensaje = 'Servicio no disponible: No se pudo conectar con la base de datos o el servidor se encuentra temporalmente inactivo.';
    } else if (response?.status === 500) {
        mensaje = 'Error del servidor: Ocurrió una falla en la lógica interna al procesar los datos.';
    } else if (response?.status === 404) {
        mensaje = 'Recurso no encontrado: La página o registro solicitado no existe.';
    } else if (response?.status === 403) {
        mensaje = 'Acceso denegado: No cuentas con los permisos requeridos para esta sección.';
    } else if (response?.status === 419) {
        mensaje = 'Sesión caducada por inactividad. La página se actualizará en unos instantes.';
        setTimeout(() => window.location.reload(), 2000);
    }

    toast.error(mensaje, {
        id: 'system-error-toast',
        duration: 8000,
    });
});

// Captura de excepciones no controladas de red o caída de conexión en Inertia
router.on('exception', (event) => {
    event.preventDefault();
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    const mensaje = isOffline
        ? 'Sin conexión a Internet. Por favor, comprueba tu enlace de red.'
        : 'Error de Conexión: No se pudo establecer comunicación con el servidor. Verifica que el servidor o la base de datos se encuentren activos.';

    toast.error(mensaje, {
        id: 'system-connection-toast',
        duration: 8000,
    });
});

// Monitoreo de estado de red (online / offline) con avisos en español
if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
        toast.error('Sin conexión a Internet: Se ha perdido la conexión de red.', {
            id: 'network-offline-toast',
            duration: Infinity,
        });
    });

    window.addEventListener('online', () => {
        toast.dismiss('network-offline-toast');
        toast.success('Conexión reestablecida con éxito.', {
            id: 'network-online-toast',
            duration: 4000,
        });
    });
}

// This will set light / dark mode on load...
initializeTheme();
