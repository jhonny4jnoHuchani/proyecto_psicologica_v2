import '../css/app.css';

import axios from 'axios';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
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
    }
);

const appName = import.meta.env.VITE_APP_NAME || 'Sistema';





createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster richColors position="top-right" />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();