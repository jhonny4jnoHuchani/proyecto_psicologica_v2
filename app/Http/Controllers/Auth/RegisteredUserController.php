<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'required|string|max:100',
            'ci' => 'required|string|max:20|unique:'.User::class,
            'celular' => 'required|string|max:20',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'genero' => 'nullable|in:M,F,Otro',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'nombre' => $request->nombre,
            'apellido_paterno' => $request->apellido_paterno,
            'apellido_materno' => $request->apellido_materno,
            'ci' => $request->ci,
            'celular' => $request->celular,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'genero' => $request->genero,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'direccion' => $request->direccion,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}