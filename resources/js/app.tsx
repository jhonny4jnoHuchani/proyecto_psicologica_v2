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

// Interceptor de response: si hay 419, refresca y reintenta
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

// Sincronizar tema de color en cada navegación SPA de Inertia
router.on('navigate', (event) => {
    const config = event.detail.page?.props?.config;
    if (config) {
        applyBrandTheme(config);
    }
});

// This will set light / dark mode on load...
initializeTheme();
