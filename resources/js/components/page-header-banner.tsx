import React from 'react';
import { type LucideIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatItem {
    label: string;
    value: string | number;
    sublabel?: string;
    color?: string;
}

interface PageHeaderBannerProps {
    title: string;
    subtitle: string;
    icon?: LucideIcon;
    badgeText?: string;
    actions?: React.ReactNode;
    stats?: StatItem[];
}

export function PageHeaderBanner({
    title,
    subtitle,
    icon: Icon,
    badgeText = 'MÓDULO ACTIVO',
    actions,
    stats = [],
}: PageHeaderBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl transition-all duration-500 mb-8"
            style={{
                background: 'var(--brand-hero-bg, linear-gradient(135deg, #1e1b4b, #0f172a))',
                border: '1px solid var(--primary-border, rgba(255,255,255,0.15))',
            }}
        >
            {/* Auras y destellos decorativos en esquinas */}
            <div
                className="absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--secondary, #06b6d4) 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--primary, #4f46e5) 0%, transparent 70%)',
                }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Columna Izquierda: Identidad y Título */}
                <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 dark:bg-white/5 border border-white/20 text-white backdrop-blur-md shadow-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            {badgeText}
                        </span>
                        <span className="text-xs font-medium text-white/70 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                            Psicología UPEA
                        </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                        {Icon && (
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 text-white shadow-lg">
                                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                                {title}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Acciones y Estadísticas Rápidas */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:self-center">
                    {stats.length > 0 && (
                        <div className="flex items-center gap-2.5 bg-white/10 dark:bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/15">
                            {stats.map((st, i) => (
                                <div key={i} className="px-3 py-1 text-center">
                                    <p className="text-lg sm:text-xl font-extrabold text-white leading-none">
                                        {st.value}
                                    </p>
                                    <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mt-0.5">
                                        {st.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {actions && (
                        <div className="flex flex-wrap items-center gap-2.5">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
