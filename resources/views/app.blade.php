<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">  

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" type="image/webp" href="{{ $config && $config->logo ? asset('storage/'.$config->logo) : asset('storage/logos/ri0uWptALTdyWeHiLlg3QFIZlQgFBKGx869M7fX2.webp') }}">
        <link rel="apple-touch-icon" href="{{ $config && $config->logo ? asset('storage/'.$config->logo) : asset('storage/logos/ri0uWptALTdyWeHiLlg3QFIZlQgFBKGx869M7fX2.webp') }}">

        <script>
            (function() {
                try {
                    const appearance = localStorage.getItem('appearance') || 'system';
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (appearance === 'dark' || (appearance === 'system' && prefersDark)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead

        @if($config)
        <style id="custom-brand-theme">
            :root {
                @if($config->color_primario)
                    --primary: {{ $config->color_primario }} !important;
                    --primary-foreground: {{ $primario_fg }} !important;
                    --primary-hover: {{ $primario_hover }} !important;
                    --primary-light: {{ $primario_light }} !important;
                    --primary-border: {{ $primario_border }} !important;
                    --ring: {{ $config->color_primario }} !important;
                    --sidebar-primary: {{ $config->color_primario }} !important;
                    --sidebar-primary-foreground: {{ $primario_fg }} !important;
                    --sidebar-ring: {{ $config->color_primario }} !important;
                @endif
                @if($config->color_secundario)
                    --secondary: {{ $config->color_secundario }} !important;
                    --secondary-foreground: {{ $secundario_fg }} !important;
                    --secondary-hover: {{ $secundario_hover }} !important;
                    --secondary-light: {{ $secundario_light }} !important;
                    --secondary-border: {{ $secundario_border }} !important;
                @endif
            }
            .dark {
                @if($config->color_primario)
                    --primary: {{ $config->color_primario }} !important;
                    --primary-foreground: {{ $primario_fg }} !important;
                    --primary-hover: {{ $primario_hover_dark }} !important;
                    --primary-light: {{ $primario_light }} !important;
                    --primary-border: {{ $primario_border }} !important;
                    --ring: {{ $config->color_primario }} !important;
                    --sidebar-primary: {{ $config->color_primario }} !important;
                    --sidebar-primary-foreground: {{ $primario_fg }} !important;
                    --sidebar-ring: {{ $config->color_primario }} !important;
                @endif
                @if($config->color_secundario)
                    --secondary: {{ $config->color_secundario }} !important;
                    --secondary-foreground: {{ $secundario_fg }} !important;
                    --secondary-hover: {{ $secundario_hover_dark }} !important;
                    --secondary-light: {{ $secundario_light }} !important;
                    --secondary-border: {{ $secundario_border }} !important;
                @endif
            }
        </style>
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>