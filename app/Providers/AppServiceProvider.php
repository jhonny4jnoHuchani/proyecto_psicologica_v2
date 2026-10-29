<?php

namespace App\Providers;

use App\Models\Calificacion;
use App\Models\Configuracion;
use App\Models\Leccion;
use App\Models\Refuerzo;
use App\Observers\CalificacionObserver;
use App\Observers\LeccionObserver;
use App\Observers\RefuerzoObserver;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 🔔 Observers de notificaciones
        Calificacion::observe(CalificacionObserver::class);
        Refuerzo::observe(RefuerzoObserver::class);
        Leccion::observe(LeccionObserver::class);

        // 🎨 View composer para configuración visual
        View::composer('app', function ($view) {
            $config = Configuracion::first();
            $primario = $config?->color_primario ?? '#4f46e5';
            $secundario = $config?->color_secundario ?? '#06b6d4';

            $view->with([
                'config' => $config,
                'primario_fg' => Configuracion::colorContraste($primario),
                'primario_hover' => Configuracion::colorHover($primario),
                'primario_hover_dark' => Configuracion::colorHoverDark($primario),
                'primario_light' => Configuracion::colorLightRgba($primario, 0.12),
                'primario_border' => Configuracion::colorBorderRgba($primario, 0.28),
                'secundario_fg' => Configuracion::colorContraste($secundario),
                'secundario_hover' => Configuracion::colorHover($secundario),
                'secundario_hover_dark' => Configuracion::colorHoverDark($secundario),
                'secundario_light' => Configuracion::colorLightRgba($secundario, 0.12),
                'secundario_border' => Configuracion::colorBorderRgba($secundario, 0.28),
            ]);
        });
    }
}
