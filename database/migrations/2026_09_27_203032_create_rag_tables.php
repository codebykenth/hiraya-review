<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();
        $hasPgvector = false;

        if ($driver === 'pgsql') {
            try {
                $available = DB::selectOne("SELECT 1 FROM pg_available_extensions WHERE name = 'vector'");
                if ($available) {
                    DB::statement('CREATE EXTENSION IF NOT EXISTS vector;');
                    $hasPgvector = true;
                }
            } catch (Throwable) {
                $hasPgvector = false;
            }
        }

        Schema::create('document_embeddings', function (Blueprint $table) use ($hasPgvector) {
            $table->id();
            $table->foreignId('subcategory_id')->nullable()->index();
            $table->morphs('sourceable');
            $table->text('chunk_content');
            $table->json('metadata')->nullable();
            if (! $hasPgvector) {
                $table->text('embedding')->nullable();
            }
            $table->timestamps();
        });

        if ($hasPgvector) {
            DB::statement('ALTER TABLE document_embeddings ADD COLUMN embedding vector(768);');
            DB::statement('CREATE INDEX doc_embeddings_hnsw_idx ON document_embeddings USING hnsw (embedding vector_cosine_ops);');
        }

        Schema::create('question_ai_explanations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->integer('selected_option');
            $table->text('explanation');
            $table->json('referenced_module_ids')->nullable();
            $table->integer('tokens_used')->default(0);
            $table->timestamps();

            $table->unique(['question_id', 'selected_option'], 'q_ai_expl_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_ai_explanations');
        Schema::dropIfExists('document_embeddings');
    }
};
