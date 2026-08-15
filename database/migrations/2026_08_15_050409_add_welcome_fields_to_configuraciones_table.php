<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->text('mision')->nullable();
            $table->text('vision')->nullable();
            $table->string('lema', 200)->nullable();
            $table->string('organigrama')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->dropColumn(['mision', 'vision', 'lema', 'organigrama']);
        });
    }
};
