<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recursos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->foreignId('tema_id')->nullable()->constrained('temas')->onDelete('cascade');
            $table->foreignId('curso_id')->nullable()->constrained('cursos')->onDelete('cascade');
            $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');

            $table->string('titulo', 200);
            $table->text('descripcion')->nullable();
            // Tipo de recurso: pdf, enlace (youtube/web), documento
            $table->enum('tipo', ['pdf', 'enlace', 'documento'])->default('pdf');
            $table->string('archivo', 255)->nullable();
            $table->string('enlace_url', 500)->nullable();
            $table->unsignedInteger('orden')->default(1);
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recursos');
    }
};

