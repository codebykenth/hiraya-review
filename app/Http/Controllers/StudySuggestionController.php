<?php

namespace App\Http\Controllers;

use App\Services\StudyPlanAnalyzer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\StudySchedule;

class StudySuggestionController extends Controller
{
    public function __construct(private StudyPlanAnalyzer $analyzer)
    {
    }

    public function getSuggestions(Request $request)
    {
        $track = $request->query('track', 'All');
        $timeOfDay = $request->query('time_of_day', 'Evening');
        $topicsPerDay = (int) $request->query('topics_per_day', 1);
        $suggestions = $this->analyzer->generateSuggestions(Auth::user(), $track, $timeOfDay, $topicsPerDay);

        return response()->json($suggestions);
    }

    public function applySuggestions(Request $request)
    {
        $validated = $request->validate([
            'suggestions' => 'required|array',
            'suggestions.*.study_date' => 'required|date',
            'suggestions.*.study_time' => 'nullable|string',
            'suggestions.*.title' => 'required|string|max:255',
            'suggestions.*.description' => 'nullable|string',
            'suggestions.*.module_links' => 'nullable|array',
            'suggestions.*.module_links.*.title' => 'required_with:suggestions.*.module_links|string',
            'suggestions.*.module_links.*.url' => 'required_with:suggestions.*.module_links|string',
        ]);

        $created = [];

        foreach ($validated['suggestions'] as $suggestion) {
            $desc = $suggestion['description'] ?? '';
            
            if (!empty($suggestion['module_links']) && is_array($suggestion['module_links'])) {
                $desc .= "\n\nLinks:";
                foreach ($suggestion['module_links'] as $link) {
                    $desc .= " [" . $link['title'] . "](" . $link['url'] . ")";
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
            'message' => count($created) . ' study sessions added to your calendar',
            'count' => count($created),
        ], 201);
    }
}

