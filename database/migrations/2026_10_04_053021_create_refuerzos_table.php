<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refuerzos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entrega_id')->unique()->constrained('entregas')->onDelete('cascade');
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('leccion_id')->constrained('lecciones')->onDelete('cascade');
            $table->foreignId('curso_materia_id')->constrained('curso_materia')->onDelete('cascade');
            $table->json('preguntas');
            $table->json('respuestas')->nullable();
            $table->text('recomendacion')->nullable();
            $table->boolean('completado')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refuerzos');
    }
};