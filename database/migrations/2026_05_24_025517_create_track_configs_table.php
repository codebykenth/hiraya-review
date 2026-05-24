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
        Schema::create('track_configs', function (Blueprint $table) {
            $table->id();
            $table->string('track');
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->integer('item_count');
            $table->integer('time_limit_secs');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('track_configs');

    }
};
