<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entregas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leccion_id')->constrained('lecciones')->onDelete('cascade');
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->enum('estado_entrega', ['pendiente', 'entregado', 'atrasado'])->default('pendiente');
            $table->enum('estado_calificacion', ['sin_calificar', 'calificado'])->default('sin_calificar');
            $table->dateTime('fecha_entrega')->nullable();
            $table->json('archivos_enviado')->nullable();
            $table->text('comentarios')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entregas');
    }
};