<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    public function marcarLeida(Request $request, Notificacion $notificacion)
    {
        // Verificar propio dueño
        if ($notificacion->user_id !== Auth::id()) {
            abort(403);
        }

        $notificacion->marcarComoLeida();

        return back();
    }
}
