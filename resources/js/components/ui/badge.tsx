import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/85 shadow-2xs',
                secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                outline: 'text-foreground border-border',
                success: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-2xs',
                warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-300 font-semibold shadow-2xs',
                info: 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-2xs',
                purple: 'border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800/80 dark:bg-purple-950/60 dark:text-purple-300 font-semibold shadow-2xs',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
