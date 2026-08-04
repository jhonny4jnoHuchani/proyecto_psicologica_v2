<?php

namespace App\Providers;

use App\Models\Configuracion;
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