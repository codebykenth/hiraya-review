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
        // Cleanly drop legacy flashcard tables if they exist
        Schema::dropIfExists('user_flashcard_progress');
        Schema::dropIfExists('flashcards');
        Schema::dropIfExists('flashcard_decks');

        Schema::create('saved_drill_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->default('blue');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('saved_drill_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saved_drill_set_id')->constrained('saved_drill_sets')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['saved_drill_set_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_drill_items');
        Schema::dropIfExists('saved_drill_sets');
    }
};
