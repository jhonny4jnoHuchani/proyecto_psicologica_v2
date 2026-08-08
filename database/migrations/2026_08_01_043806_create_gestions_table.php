<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gestions', function (Blueprint $table) {

            $table->id();
            $table->integer('año');
            $table->string('etapa', 50);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestamps();
            //creado y actualizadp
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gestions');
    }
};