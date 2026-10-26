import { LucideIcon } from 'lucide-react';
import { AxiosInstance } from 'axios';


declare global {
    interface Window {
        axios: AxiosInstance;
    }
}

export interface NotificacionItem {
    id: number;
    user_id: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    url?: string | null;
    leida: boolean;
    leida_at?: string | null;
    icono?: string;
    created_at: string;
    updated_at: string;
}

export interface Auth {
    user: User;
    roles?: string[];
    permissions?: string[];
    notificaciones?: NotificacionItem[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    expedido?: string | null;
    celular: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    genero: string | null;
    fecha_nacimiento: string | null;
    direccion: string | null;
    foto_perfil: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}