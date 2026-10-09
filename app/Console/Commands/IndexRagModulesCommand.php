<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\LearnModule;
use App\Services\Ai\RagExplanationService;
use Illuminate\Console\Command;

class IndexRagModulesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rag:index {--module= : Specific LearnModule ID to index}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Chunk and index LearnModules into vector embeddings for RAG retrieval';

    public function handle(RagExplanationService $ragService): int
    {
        $moduleId = $this->option('module');

        $query = LearnModule::query()->where('is_published', true);
        if ($moduleId) {
            $query->where('id', $moduleId);
        }

        $modules = $query->get();
        if ($modules->isEmpty()) {
            $this->warn('No published learning modules found to index.');

            return self::SUCCESS;
        }

        $this->info("Indexing {$modules->count()} learning module(s) into vector embeddings...");
        $totalChunks = 0;

        $bar = $this->output->createProgressBar($modules->count());
        $bar->start();

        foreach ($modules as $module) {
            $chunksIndexed = $ragService->indexLearnModule($module);
            $totalChunks += $chunksIndexed;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully indexed {$totalChunks} chunks across {$modules->count()} module(s).");

        return self::SUCCESS;
    }
}
