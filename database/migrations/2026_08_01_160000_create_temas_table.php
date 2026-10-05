<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('temas', function (Blueprint $table) {
            $table->id();
            // A qué materia pertenece el tema
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            // Nombre del tema (ej: "Tema 3: La Memoria")
            $table->string('nombre', 200);
            //resumen del tema 
            $table->text('resumen')->nullable();
            // LA SECUENCIA: tema 1, 2, 3... (el ML usa esto para saber qué viene después)
            $table->unsignedInteger('orden')->default(1);
            // Qué parte del libro-resumen corresponde (ej: "págs. 9-14")
            $table->string('paginas_libro', 50)->nullable();
            // ADMINISTRABLE: el docente marca si ya se vio, se pospuso o se saltó
            $table->enum('estado', ['programado', 'visto', 'omitido', 'pospuesto'])
                  ->default('programado');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::drop('temas');
    }
};