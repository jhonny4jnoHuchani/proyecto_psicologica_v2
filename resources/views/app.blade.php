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

        @if($config)
        <style id="custom-brand-theme">
            :root {
                @if($config->color_primario)
                    --primary: {{ $config->color_primario }};
                    --primary-foreground: {{ $primario_fg }};
                @endif
                @if($config->color_secundario)
                    --secondary: {{ $config->color_secundario }};
                    --secondary-foreground: {{ $secundario_fg }};
                @endif
            }
            .dark {
                @if($config->color_primario)
                    --primary: {{ $config->color_primario }};
                    --primary-foreground: {{ $primario_fg }};
                @endif
                @if($config->color_secundario)
                    --secondary: {{ $config->color_secundario }};
                    --secondary-foreground: {{ $secundario_fg }};
                @endif
            }
        </style>
        @endif

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>