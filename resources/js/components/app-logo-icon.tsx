import { usePage } from '@inertiajs/react';
import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '', alt = 'Logo Psicología UPEA', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    const pageProps = usePage().props as { config?: { logo?: string | null } };
    const logoSrc = pageProps?.config?.logo
        ? `/storage/${pageProps.config.logo}`
        : '/storage/logos/ri0uWptALTdyWeHiLlg3QFIZlQgFBKGx869M7fX2.webp';

    return (
        <img
            src={logoSrc}
            alt={alt}
            className={`object-contain shrink-0 ${className}`}
            {...props}
        />
    );
}