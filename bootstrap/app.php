<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectNumericRouteKeys;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            // AddLinkHeadersForPreloadedAssets::class, // Deshabilitado para evitar headers excesivos en FastCGI (502 upstream sent too big header)
            RedirectNumericRouteKeys::class,
        ]);

        // Alias de Spatie Permission
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        // 🆕 Excluir webhook de Telegram del CSRF
        $middleware->validateCsrfTokens(except: [
            'telegram/webhook',
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            // No interceptar excepciones estándar de validación o redirección de login
            if ($e instanceof ValidationException || $e instanceof AuthenticationException) {
                return null;
            }

            // 1. Manejo especializado de errores de Base de Datos (falla de conexión o caída de servicio)
            if ($e instanceof PDOException || $e instanceof QueryException) {
                $msg = $e->getMessage();
                $isConnectionError = str_contains($msg, '2002')
                    || str_contains($msg, 'Connection refused')
                    || str_contains($msg, 'denegó')
                    || str_contains($msg, 'Access denied')
                    || str_contains($msg, 'Unknown database')
                    || str_contains($msg, 'No such host')
                    || str_contains($msg, 'server has gone away')
                    || str_contains($msg, 'could not find driver')
                    || str_contains($msg, 'No route to host')
                    || str_contains($msg, 'timed out');

                $titulo = $isConnectionError
                    ? 'Error de Conexión a la Base de Datos'
                    : 'Fallo al Procesar la Consulta';

                $detalle = $isConnectionError
                    ? 'No se pudo establecer comunicación con el servidor de base de datos. Por favor, verifica que el servicio MySQL o MariaDB esté activo en el servidor.'
                    : 'Ocurrió una inconsistencia en la base de datos al procesar los datos requeridos. Por favor, intenta de nuevo o contacta a soporte técnico.';

                if ($request->expectsJson() || $request->header('X-Inertia')) {
                    return response()->json([
                        'message' => "{$titulo}: {$detalle}",
                        'error' => $detalle,
                        'tipo' => 'database_connection_error',
                    ], 503);
                }

                return response()->view('errors.database', [
                    'titulo' => $titulo,
                    'detalle' => $detalle,
                ], 503);
            }

            // 2. Manejo de excepciones en peticiones Inertia/JSON para evitar modales o respuestas en inglés
            if ($request->header('X-Inertia') || $request->expectsJson()) {
                $statusCode = ($e instanceof HttpExceptionInterface)
                    ? $e->getStatusCode()
                    : 500;

                $mensajes = [
                    403 => 'Acceso restringido: No cuentas con los permisos institucionales necesarios para esta sección.',
                    404 => 'El recurso, lección o registro solicitado no fue encontrado.',
                    419 => 'Tu sesión de seguridad ha caducado por inactividad. Por favor, recarga la página.',
                    500 => 'Error interno en la lógica del servidor al procesar la solicitud.',
                    503 => 'El servicio o servidor se encuentra temporalmente no disponible.',
                ];

                $mensaje = $mensajes[$statusCode] ?? 'Ocurrió un error inesperado al procesar la solicitud.';

                // Si hay un mensaje explícito y claro en la excepción (no trazas técnicas de código o SQL crudo)
                $eMsg = $e->getMessage();
                if (! empty($eMsg) && ! str_starts_with($eMsg, 'SQLSTATE') && strlen($eMsg) < 200 && ! str_contains($eMsg, 'Stack trace:')) {
                    $mensaje = $eMsg;
                }

                return response()->json([
                    'message' => $mensaje,
                    'error' => $mensaje,
                ], $statusCode);
            }
        });
    })->create();
