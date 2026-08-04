<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestion_id')->constrained('gestions')->onDelete('cascade');
            $table->string('paralelo', 10);
            $table->enum('estado', ['activo', 'inactivo', 'completado'])->default('activo');
            $table->integer('cupos')->default(30);
            $table->enum('turno', ['mañana', 'tarde', 'noche']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};