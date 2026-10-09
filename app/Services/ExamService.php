<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\Exam\ExamSessionQueryData;
use App\Http\Resources\ExamQuestionResource;
use App\Http\Resources\ExamScorecardResource;
use App\Repositories\QuestionRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class ExamService
{
    public function __construct(
        protected QuestionRepositoryInterface $questionRepository,
        protected ExamAttemptService $attemptService,
        protected CategoryService $categoryService,
        protected ExamAttemptFormatter $formatter,
        protected DeterministicAnalysisService $deterministicService,
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Prepare all data required to initialize the interactive exam simulation session.
     *
     * @return array{
     *     questions: array<int, mixed>,
     *     categories: array<int, mixed>,
     *     savedAttempt: array<string, mixed>|null,
     *     retakeSource: array{attempt_id: int, question_ids: array<int, int>, track: string, mode: string}|null,
     *     seenQuestionIdsByTrack: array<string, array<int, int>>,
     *     wrongQuestionIdsByTrack: array<string, array<int, int>>,
     *     aiAnalysis: array{status: string, data: array<string, mixed>|null}
     * }
     */
    public function getExamSessionData(ExamSessionQueryData $query, ?int $userId): array
    {
        $formattedQuestions = Cache::rememberForever('questions.active.exam_resources', function () {
            $activeQuestions = $this->questionRepository->getActivePool();

            return ExamQuestionResource::collection($activeQuestions)->resolve();
        });
        $questions = collect($formattedQuestions);

        $savedAttempt = null;
        $retakeSource = null;
        $attempt = null;

        if ($query->attemptId !== null) {
            $attempt = $this->attemptService->getScorecardAttempt(
                attemptId: $query->attemptId,
                userId: $userId,
                pendingGuestId: $query->pendingGuestAttemptId
            );

            $questions = $questions->whereIn('id', $attempt->question_ids);
            $savedAttempt = (new ExamScorecardResource($attempt))->resolve();
        } elseif ($query->retakeSame !== null || $query->retakeFresh !== null) {
            $retakeId = $query->retakeSame ?? $query->retakeFresh;
            $mode = $query->retakeSame !== null ? 'same' : 'fresh';

            if ($userId !== null && $retakeId !== null) {
                $retakeSource = $this->attemptService->getRetakeSource($retakeId, $userId, $mode);
                $attempt = $this->attemptService->getScorecardAttempt($retakeId, $userId, null);
            }
        }

        if (($savedAttempt || $retakeSource) && $attempt) {
            $questions = $questions->sortBy(function ($q) use ($attempt) {
                return array_search($q['id'], $attempt->question_ids);
            })->values();
        } else {
            $questions = $questions->values();
        }

        $categories = $this->categoryService->getCategoryTree();

        $seenQuestionIdsByTrack = $this->formatter->seenQuestionIdsByTrack($userId);
        $wrongQuestionIdsByTrack = $this->formatter->wrongQuestionIdsByTrack($userId);

        $aiAnalysis = [
            'status' => 'no_data',
            'data' => null,
        ];

        if ($userId !== null) {
            $targetAttemptId = $query->attemptId ?? $this->attemptService->getLatestUserAttemptId($userId);

            if ($targetAttemptId) {
                $analysisData = $this->deterministicService->generate($userId, $targetAttemptId, true);
                $aiAnalysis = [
                    'status' => 'ready',
                    'data' => $analysisData,
                ];
            }
        }

        return [
            'questions' => $questions->all(),
            'categories' => $categories,
            'savedAttempt' => $savedAttempt,
            'retakeSource' => $retakeSource,
            'seenQuestionIdsByTrack' => $seenQuestionIdsByTrack,
            'wrongQuestionIdsByTrack' => $wrongQuestionIdsByTrack,
            'aiAnalysis' => $aiAnalysis,
        ];
    }

    /**
     * Record a successful examination booklet PDF export.
     */
    public function trackPdfDownload(int $userId): void
    {
        $this->userRepository->incrementPdfDownloads($userId);
    }
}
