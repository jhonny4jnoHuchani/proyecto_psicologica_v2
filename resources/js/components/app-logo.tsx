import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 shadow-xs overflow-hidden shrink-0">
                <AppLogoIcon className="size-7 object-contain" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-foreground tracking-tight">Psicología UPEA</span>
                <span className="truncate text-[10px] text-muted-foreground font-medium">Carrera de Psicología</span>
            </div>
        </div>
    );
}
