<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\AnnouncementRepository;
use App\Repositories\AnnouncementRepositoryInterface;
use App\Repositories\CategoryRepository;
use App\Repositories\CategoryRepositoryInterface;
use App\Repositories\ExamAttemptRepository;
use App\Repositories\ExamAttemptRepositoryInterface;
use App\Repositories\FeedbackRepository;
use App\Repositories\FeedbackRepositoryInterface;
use App\Repositories\LearnModuleRepository;
use App\Repositories\LearnModuleRepositoryInterface;
use App\Repositories\LegalContentRepository;
use App\Repositories\LegalContentRepositoryInterface;
use App\Repositories\PaymentRepository;
use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\QuestionRepository;
use App\Repositories\QuestionRepositoryInterface;
use App\Repositories\SavedDrillSetRepository;
use App\Repositories\SavedDrillSetRepositoryInterface;
use App\Repositories\StudyScheduleRepository;
use App\Repositories\StudyScheduleRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(
            QuestionRepositoryInterface::class,
            QuestionRepository::class
        );

        $this->app->singleton(
            ExamAttemptRepositoryInterface::class,
            ExamAttemptRepository::class
        );

        $this->app->singleton(
            LearnModuleRepositoryInterface::class,
            LearnModuleRepository::class
        );

        $this->app->singleton(
            StudyScheduleRepositoryInterface::class,
            StudyScheduleRepository::class
        );

        $this->app->singleton(
            SavedDrillSetRepositoryInterface::class,
            SavedDrillSetRepository::class
        );

        $this->app->singleton(
            AnnouncementRepositoryInterface::class,
            AnnouncementRepository::class
        );

        $this->app->singleton(
            FeedbackRepositoryInterface::class,
            FeedbackRepository::class
        );

        $this->app->singleton(
            UserRepositoryInterface::class,
            UserRepository::class
        );

        $this->app->singleton(
            CategoryRepositoryInterface::class,
            CategoryRepository::class
        );

        $this->app->singleton(
            LegalContentRepositoryInterface::class,
            LegalContentRepository::class
        );

        $this->app->singleton(
            PaymentRepositoryInterface::class,
            PaymentRepository::class
        );
    }
}
