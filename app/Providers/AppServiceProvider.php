<?php

namespace App\Providers;

use App\Models\Calificacion;
use App\Models\Configuracion;
use App\Models\Refuerzo;
use App\Observers\CalificacionObserver;
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

        // 🎨 View composer para configuración visual
        View::composer('app', function ($view) {
            $config = Configuracion::first();

            $view->with([
                'config' => $config,
                'primario_fg' => Configuracion::colorContraste($config?->color_primario),
                'secundario_fg' => Configuracion::colorContraste($config?->color_secundario),
            ]);
        });
    }
}