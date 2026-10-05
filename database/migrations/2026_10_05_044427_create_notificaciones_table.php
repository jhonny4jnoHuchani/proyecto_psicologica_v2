<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->enum('tipo', [
                'tarea_calificada',
                'refuerzo_generado',
                'credenciales_enviadas',
                'tarea_nueva',
                'sistema',
            ]);

            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->string('url', 255)->nullable();

            // Estado campanita
            $table->boolean('leida')->default(false);
            $table->timestamp('leida_at')->nullable();

            // Estado Telegram
            $table->boolean('enviada_telegram')->default(false);
            $table->timestamp('enviada_telegram_at')->nullable();
            $table->text('telegram_error')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'leida']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};