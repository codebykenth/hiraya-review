<?php

namespace App\Observers;

use App\Models\ExamDate;
use Illuminate\Support\Facades\Cache;

class ExamDateObserver
{
    /**
     * Handle the ExamDate "created" event.
     */
    public function created(ExamDate $examDate): void
    {
        $this->clearCache();
    }

    /**
     * Handle the ExamDate "updated" event.
     */
    public function updated(ExamDate $examDate): void
    {
        $this->clearCache();
    }

    /**
     * Handle the ExamDate "deleted" event.
     */
    public function deleted(ExamDate $examDate): void
    {
        $this->clearCache();
    }

    /**
     * Clear the cache.
     */
    private function clearCache(): void
    {
        Cache::forget('exam_dates.active');
    }
}
