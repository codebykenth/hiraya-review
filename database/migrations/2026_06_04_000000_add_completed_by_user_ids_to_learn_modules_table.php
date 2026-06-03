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
        Schema::table('learn_modules', function (Blueprint $table) {
            $table->json('completed_by_user_ids')->nullable()->after('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learn_modules', function (Blueprint $table) {
            $table->dropColumn('completed_by_user_ids');
        });
    }
};
