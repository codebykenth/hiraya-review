<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\ApplySuggestionsRequest;
use App\Http\Requests\ApplyTemplateRequest;
use App\Models\StudySchedule;
use App\Services\StudyPlanAnalyzer;
use App\Services\StudyPlanTemplateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudySuggestionController
{
    public function __construct(
        private StudyPlanAnalyzer $analyzer,
        private StudyPlanTemplateService $templateService
    ) {}

    public function getTemplates()
    {
        return response()->json([
            'templates' => array_values($this->templateService->getTemplates()),
        ]);
    }

    public function applyTemplate(ApplyTemplateRequest $request)
    {
        $validated = $request->validated();
        $count = $this->templateService->applyTemplate(
            $validated['template_id'],
            $validated['start_date'],
            $validated['preferred_time'] ?? '19:00',
            $request->boolean('replace_existing', false)
        );

        return response()->json([
            'message' => "Successfully applied study template! Created {$count} daily study sessions.",
            'count' => $count,
        ], 201);
    }

    public function getSuggestions(Request $request)
    {
        $track = $request->query('track', 'All');
        $timeOfDay = $request->query('time_of_day', 'Evening');
        $topicsPerDay = (int) $request->query('topics_per_day', 1);
        $suggestions = $this->analyzer->generateSuggestions(Auth::user(), $track, $timeOfDay, $topicsPerDay);

        return response()->json($suggestions);
    }

    public function applySuggestions(ApplySuggestionsRequest $request)
    {
        $validated = $request->validated();

        $created = [];

        foreach ($validated['suggestions'] as $suggestion) {
            $desc = $suggestion['description'] ?? '';

            if (! empty($suggestion['module_links']) && is_array($suggestion['module_links'])) {
                $desc .= "\n\nLinks:";
                foreach ($suggestion['module_links'] as $link) {
                    $desc .= ' ['.$link['title'].']('.$link['url'].')';
                }
            }

            $schedule = StudySchedule::firstOrCreate([
                'user_id' => Auth::id(),
                'study_date' => $suggestion['study_date'],
                'study_time' => $suggestion['study_time'] ?? null,
                'title' => $suggestion['title'],
            ], [
                'description' => $desc,
            ]);

            if ($schedule->wasRecentlyCreated) {
                $created[] = $schedule;
            }
        }

        return response()->json([
            'message' => count($created).' study sessions added to your calendar',
            'count' => count($created),
        ], 201);
    }
}
