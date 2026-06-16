<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePreferencesRequest;
use App\Models\ExamAttempt;
use App\Models\UserAiAnalysis;
use App\Services\DeterministicAnalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PreferencesController extends Controller
{
    /**
     * Show the user's preferences page.
     */
    public function edit(Request $request): Response
    {
        $userId = $request->user()->id;
        $analysisMode = Cache::get("user-analysis-mode-{$userId}", 'instant');
        $aiAvailable = (bool) config('services.ai.analysis_enabled');

        return Inertia::render('settings/preferences', [
            'analysisMode' => $analysisMode,
            'aiAvailable' => $aiAvailable,
        ]);
    }

    /**
     * Update the user's preferences.
     */
    public function update(UpdatePreferencesRequest $request): RedirectResponse
    {
        $userId = $request->user()->id;
        $mode = $request->validated('analysis_mode');

        Cache::forever("user-analysis-mode-{$userId}", $mode);

        // When switching to instant, regenerate deterministic report immediately
        if ($mode === 'instant') {
            $latestAttemptId = ExamAttempt::where('user_id', $userId)->latest()->value('id');
            if ($latestAttemptId) {
                $deterministicService = new DeterministicAnalysisService;
                UserAiAnalysis::updateOrCreate(
                    ['user_id' => $userId],
                    [
                        'last_exam_attempt_id' => $latestAttemptId,
                        'analysis_json' => $deterministicService->generate($userId, $latestAttemptId),
                    ]
                );
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Analysis preferences updated.')]);

        return to_route('preferences.edit');
    }
}
