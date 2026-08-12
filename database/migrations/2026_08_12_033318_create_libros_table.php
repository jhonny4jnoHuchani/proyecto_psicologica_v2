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
            $table->timestamps();
            $table->softDeletes(); // ← NUEVO: columna deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};