<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectNumericRouteKeys
{
    /**
     * Handle an incoming request.
     * Si una ruta GET recibe un ID numérico plano para un modelo que usa ofuscación,
     * redirige a la URL canónica con el código cifrado para que en la barra de direcciones
     * nunca se expongan IDs planos (ej. /lecciones/1 -> /lecciones/g9x...).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            return $next($request);
        }

        $route = $request->route();
        if (! $route || ! $route->getName()) {
            return $next($request);
        }

        $parameters = $route->parameters();
        $originalParameters = $route->originalParameters();
        $needsRedirect = false;

        foreach ($parameters as $name => $param) {
            if ($param instanceof Model && method_exists($param, 'getRouteKey')) {
                $originalVal = $originalParameters[$name] ?? null;

                if ($originalVal !== null && is_string($originalVal) && ctype_digit($originalVal)) {
                    $routeKey = (string) $param->getRouteKey();
                    if ($routeKey !== (string) $originalVal) {
                        $needsRedirect = true;
                        break;
                    }
                }
            }
        }

        if ($needsRedirect) {
            $query = $request->query();
            $targetUrl = route($route->getName(), array_merge($parameters, $query));

            return redirect()->to($targetUrl);
        }

        return $next($request);
    }
}
