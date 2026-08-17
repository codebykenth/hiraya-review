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
        Schema::table('questions', function (Blueprint $table) {
            $table->index(['status', 'subcategory_id']);
            $table->index('language');
        });

        Schema::table('learn_modules', function (Blueprint $table) {
            $table->index(['is_published', 'category_id']);
            $table->index(['is_published', 'subcategory_id']);
        });

        Schema::table('feedbacks', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex(['status', 'subcategory_id']);
            $table->dropIndex(['language']);
        });

        Schema::table('learn_modules', function (Blueprint $table) {
            $table->dropIndex(['is_published', 'category_id']);
            $table->dropIndex(['is_published', 'subcategory_id']);
        });

        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'is_active']);
        });
    }
};
