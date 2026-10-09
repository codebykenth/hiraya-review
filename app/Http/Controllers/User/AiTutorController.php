<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AiTutor\AskAiTutorRequest;
use App\Models\LearnModule;
use App\Services\Ai\RagTutorService;
use Inertia\Response;

class AiTutorController extends Controller
{
    public function __construct(
        protected RagTutorService $tutorService
    ) {}

    /**
     * Display the AI Tutor chat page.
     */
    public function index(): Response
    {
        $modules = LearnModule::where('is_published', true)
            ->get(['id', 'title', 'slug'])
            ->map(fn (LearnModule $m) => [
                'title' => $m->title,
                'slug' => $m->slug,
                'url' => "/learn/{$m->slug}",
            ]);

        return $this->render('user/tutor/index', [
            'modules' => $modules,
        ]);
    }

    /**
     * Ask an open-ended CSE syllabus question to the AI Tutor.
     */
    public function ask(AskAiTutorRequest $request)
    {
        if ($request->hasHeader('Accept') && str_contains((string) $request->header('Accept'), 'text/event-stream')) {
            return $this->tutorService->askStream(
                query: $request->question(),
                subcategoryId: $request->subcategoryId(),
                history: $request->history()
            );
        }

        $result = $this->tutorService->ask(
            query: $request->question(),
            subcategoryId: $request->subcategoryId(),
            history: $request->history()
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
