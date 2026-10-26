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
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->text('telegram_bot_token')->nullable()->after('organigrama');
            $table->string('telegram_chat_id', 100)->nullable()->after('telegram_bot_token');
            $table->string('telegram_bot_username', 100)->nullable()->after('telegram_chat_id');
            $table->boolean('telegram_activo')->default(true)->after('telegram_bot_username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->dropColumn([
                'telegram_bot_token',
                'telegram_chat_id',
                'telegram_bot_username',
                'telegram_activo',
            ]);
        });
    }
};
