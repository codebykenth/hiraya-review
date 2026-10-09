<?php

namespace App\Observers;

use App\Models\Question;
use Illuminate\Support\Facades\Cache;

class QuestionObserver
{
    /**
     * Handle the Question "created" event.
     */
    public function created(Question $question): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Question "updated" event.
     */
    public function updated(Question $question): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Question "deleted" event.
     */
    public function deleted(Question $question): void
    {
        $this->clearCache();
    }

    /**
     * Clear the cache.
     */
    private function clearCache(): void
    {
        Cache::forget('questions.all');
        Cache::forget('questions.active');
        Cache::forget('questions.active.exam_resources');
        Cache::forget('questions.active.drill_resources');
        Cache::forget('categories.tree');
    }
}
