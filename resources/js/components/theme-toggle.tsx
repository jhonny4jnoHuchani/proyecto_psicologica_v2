import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                    title="Cambiar tono / tema"
                    aria-label="Cambiar tema de la interfaz"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                    <span className="sr-only">Cambiar tema</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem
                    onClick={() => updateAppearance('light')}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        Modo Claro
                    </span>
                    {appearance === 'light' && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('dark')}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-400" />
                        Modo Oscuro
                    </span>
                    {appearance === 'dark' && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('system')}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-neutral-400" />
                        Sistema
                    </span>
                    {appearance === 'system' && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
