<?php

namespace App\Observers;

use App\Events\LearnModulePublished;
use App\Models\LearnModule;
use Illuminate\Support\Facades\Cache;

class LearnModuleObserver
{
    /**
     * Handle the LearnModule "created" event.
     */
    public function created(LearnModule $learnModule): void
    {
        $this->clearCache($learnModule);

        if ($learnModule->is_published) {
            event(new LearnModulePublished($learnModule));
        }
    }

    /**
     * Handle the LearnModule "updated" event.
     */
    public function updated(LearnModule $learnModule): void
    {
        $this->clearCache($learnModule);

        if ($learnModule->is_published && ($learnModule->wasChanged('is_published') || $learnModule->wasChanged('title') || $learnModule->wasChanged('summary') || $learnModule->wasChanged('content'))) {
            event(new LearnModulePublished($learnModule));
        }
    }

    /**
     * Handle the LearnModule "deleted" event.
     */
    public function deleted(LearnModule $learnModule): void
    {
        $this->clearCache($learnModule);
    }

    /**
     * Clear the cache.
     */
    private function clearCache(LearnModule $learnModule): void
    {
        Cache::forget('learn.modules.published');
        Cache::forget('categories.tree');
        Cache::forget("learn.module.show.{$learnModule->slug}");
        Cache::forget("learn.module.recommended.{$learnModule->id}");
    }
}
