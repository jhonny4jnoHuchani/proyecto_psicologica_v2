<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\MateriaController;   
use App\Http\Controllers\CursoController;      
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeccionController;
use App\Http\Controllers\EntregaController; 
use App\Http\Controllers\CalificacionController; 
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\ConfiguracionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ========================
    // RUTAS SOLO ADMIN
    // ========================
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('gestiones', GestionController::class);

        Route::prefix('materias')->name('materias.')->controller(MateriaController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/eliminados', 'trashed')->name('trashed');
            Route::post('/', 'store')->name('store');
            Route::put('/{materia}', 'update')->name('update');
            Route::delete('/{materia}', 'destroy')->name('destroy');
            Route::post('/{id}/restore', 'restore')->name('restore');
        });

        Route::prefix('docentes')->name('docentes.')->controller(DocenteController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/eliminados', 'trashed')->name('trashed');
            Route::get('/{docente}', 'show')->name('show');
            Route::post('/', 'store')->name('store');
            Route::put('/{docente}', 'update')->name('update');
            Route::delete('/{docente}', 'destroy')->name('destroy');
            Route::post('/{docente}/reset-password', 'resetPassword')->name('reset-password');
            Route::post('/{id}/restore', 'restore')->name('restore');
        });

        Route::prefix('estudiantes')->name('estudiantes.')->controller(EstudianteController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/eliminados', 'trashed')->name('trashed');
            Route::get('/{estudiante}', 'show')->name('show');
            Route::post('/', 'store')->name('store');
            Route::put('/{estudiante}', 'update')->name('update');
            Route::delete('/{estudiante}', 'destroy')->name('destroy');
            Route::post('/{estudiante}/reset-password', 'resetPassword')->name('reset-password');
            Route::post('/{id}/restore', 'restore')->name('restore');
        });

        Route::prefix('cursos')->name('cursos.')->controller(CursoController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/eliminados', 'trashed')->name('trashed');
            Route::get('/{curso}', 'show')->name('show');
            Route::post('/', 'store')->name('store');
            Route::put('/{curso}', 'update')->name('update');
            Route::delete('/{curso}', 'destroy')->name('destroy');
            Route::post('/{id}/restore', 'restore')->name('restore');
        });
    });

    // ========================
    // LECCIONES (Admin, Docente, Estudiante)
    // ========================
    Route::prefix('lecciones')->name('lecciones.')->controller(LeccionController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{leccion}', 'show')->name('show');
        Route::get('/{leccion}/entregas', 'entregas')->name('entregas')->middleware('role:admin|docente');
        Route::post('/', 'store')->name('store')->middleware('role:admin|docente');
        Route::put('/{leccion}', 'update')->name('update')->middleware('role:admin|docente');
        Route::delete('/{leccion}', 'destroy')->name('destroy')->middleware('role:admin|docente');
    });

    // ========================
    // ENTREGAS
    // ========================
    Route::middleware(['role:estudiante'])->prefix('entregas')->name('entregas.')->group(function () {
        Route::get('/', [EntregaController::class, 'index'])->name('index');
        Route::post('/', [EntregaController::class, 'store'])->name('store');
    });

    Route::middleware(['role:docente|admin'])->prefix('entregas')->name('entregas.')->group(function () {
        Route::get('/docente', [EntregaController::class, 'docente'])->name('docente');
    });

    // Calificaciones
    Route::middleware(['role:docente|admin'])->group(function () {
        Route::post('/calificaciones', [CalificacionController::class, 'store'])->name('calificaciones.store');
    });

    // Reportes (admin y docente)
    Route::middleware(['role:admin|docente'])->prefix('reportes')->name('reportes.')->controller(ReporteController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/pdf', 'pdf')->name('pdf');
        Route::get('/excel', 'excel')->name('excel');
    });

    // Configuración de Apariencia
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/apariencia', [ConfiguracionController::class, 'index'])->name('apariencia');
        Route::post('/apariencia', [ConfiguracionController::class, 'update'])->name('apariencia.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';