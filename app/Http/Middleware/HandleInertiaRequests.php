<?php

namespace App\Http\Middleware;

use App\Models\Configuracion;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'notificaciones' => $request->user() ? $request->user()->notificaciones()->noLeidas()->recientes(10)->get() : [],
            ],
            'config' => Configuracion::first(),  // ← NUEVO
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'sugerir_refuerzo' => $request->session()->get('sugerir_refuerzo'),
                'entrega_refuerzo_id' => $request->session()->get('entrega_refuerzo_id'),
                'motivo_no_refuerzo' => $request->session()->get('motivo_no_refuerzo'),
            ],
        ];
    }
}
