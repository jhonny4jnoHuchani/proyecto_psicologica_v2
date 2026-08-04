<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/apariencia', [
            'config' => Configuracion::first(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'color_primario' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'color_secundario' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'logo' => 'nullable|image|max:2048',
        ]);

        $config = Configuracion::firstOrCreate([], [
            'color_primario' => '#4f46e5',
            'color_secundario' => '#06b6d4',
        ]);

        $data = [
            'color_primario' => $request->color_primario,
            'color_secundario' => $request->color_secundario,
        ];

        if ($request->hasFile('logo')) {
            if ($config->logo) {
                Storage::disk('public')->delete($config->logo);
            }
            $data['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $config->update($data);

        return back()->with('success', 'Configuración actualizada.');
    }
}