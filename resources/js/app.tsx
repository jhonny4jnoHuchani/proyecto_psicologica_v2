import "../css/app.css";

import axios from "axios";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { route as routeFn } from "ziggy-js";
import { initializeTheme } from "./hooks/use-appearance";

declare global {
  const route: typeof routeFn;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustHex(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);
  r = Math.max(0, Math.min(255, Math.round(r + (255 * percent) / 100)));
  g = Math.max(0, Math.min(255, Math.round(g + (255 * percent) / 100)));
  b = Math.max(0, Math.min(255, Math.round(b + (255 * percent) / 100)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function applyBrandTheme(config: any) {
  if (!config || typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");

  if (config.color_primario) {
    const prim = config.color_primario;
    root.style.setProperty("--primary", prim);
    root.style.setProperty("--ring", prim);
    root.style.setProperty("--sidebar-primary", prim);
    root.style.setProperty("--sidebar-ring", prim);
    root.style.setProperty(
      "--primary-hover",
      adjustHex(prim, isDark ? 15 : -14),
    );
    root.style.setProperty(
      "--primary-light",
      hexToRgba(prim, isDark ? 0.2 : 0.12),
    );
    root.style.setProperty(
      "--primary-border",
      hexToRgba(prim, isDark ? 0.4 : 0.28),
    );
  }

  if (config.color_secundario) {
    const sec = config.color_secundario;
    root.style.setProperty("--secondary", sec);
    root.style.setProperty(
      "--secondary-hover",
      adjustHex(sec, isDark ? 15 : -14),
    );
    root.style.setProperty(
      "--secondary-light",
      hexToRgba(sec, isDark ? 0.2 : 0.12),
    );
    root.style.setProperty(
      "--secondary-border",
      hexToRgba(sec, isDark ? 0.4 : 0.28),
    );
  }
}

// ============================================================
// CONFIGURACIÓN DE AXIOS CON CSRF AUTOMÁTICO
// ============================================================
window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;

// Guardamos el token fresco en una variable
let currentCsrfToken = "";

// Obtener token fresco desde el backend
async function refreshCsrfToken(): Promise<string> {
  try {
    const res = await axios.get("/csrf-token");
    if (res.data?.token) {
      currentCsrfToken = res.data.token;
      return res.data.token;
    }
  } catch {
    console.warn("NS");
  }
  return "";
}

// Inicializar el token al cargar la app
refreshCsrfToken();

// Interceptor de request: siempre manda el token fresco
window.axios.interceptors.request.use((config) => {
  if (currentCsrfToken) {
    config.headers = config.headers || {};
    config.headers["X-CSRF-TOKEN"] = currentCsrfToken;
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
        originalRequest.headers["X-CSRF-TOKEN"] = newToken;
        return window.axios(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

const appName = import.meta.env.VITE_APP_NAME || "Sistema";

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx"),
    ),
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
    color: "#4B5563",
  },
});

// Sincronizar tema de color en cada navegación SPA de Inertia
router.on("navigate", (event) => {
  const config = event.detail.page?.props?.config;
  if (config) {
    applyBrandTheme(config);
  }
});

// This will set light / dark mode on load...
initializeTheme();
