<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Exam\ExplainQuestionRequest;
use App\Models\Question;
use App\Services\Ai\RagExplanationService;
use Illuminate\Http\JsonResponse;

class QuestionExplanationController extends Controller
{
    public function __construct(
        protected RagExplanationService $ragService
    ) {}

    /**
     * Generate or fetch cached RAG cognitive explanation for a specific question choice.
     */
    public function explain(ExplainQuestionRequest $request, Question $question): JsonResponse
    {
        $result = $this->ragService->explain(
            question: $question,
            selectedOption: $request->selectedOption()
        );

        return $this->jsonSuccess($result);
    }
}
