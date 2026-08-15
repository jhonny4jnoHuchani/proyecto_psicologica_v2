<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('libros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->string('nombre', 200);
            $table->string('autor', 150)->nullable();
            $table->integer('anio_lanzamiento')->nullable();
            $table->string('archivo', 255)->nullable();   // ← NUEVO
            $table->string('portada', 255)->nullable();   // ← NUEVO
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};