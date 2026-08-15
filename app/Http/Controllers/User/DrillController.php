<?php

namespace App\Http\Controllers\User;

use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DrillController
{
    /**
     * Render the dynamic diagnostic drills interface.
     */
    public function index(Request $request)
    {
        $questions = Cache::rememberForever('questions.active', function () {
            return Question::where('status', 'active')
                ->with(['subcategory.category'])
                ->get()
                ->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'stem' => $q->stem,
                        'options' => $q->options ?? [],
                        'correct_option' => $q->correct_option,
                        'explanation' => $q->explanation ?? '',
                        'category' => $q->subcategory?->category?->name ?? 'General Information',
                        'subcategory' => $q->subcategory?->name ?? '',
                        'language' => (str_contains(strtolower($q->language ?? ''), 'tagalog') || str_contains(strtolower($q->language ?? ''), 'filipino')) ? 'Filipino' : 'English',
                        'isDemographic' => $q->subcategory?->category?->is_demographic ?? false,
                    ];
                })->toArray();
        });

        $categories = Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        return Inertia::render('user/drills/index', [
            'questions' => $questions,
            'categories' => $categories,
        ]);
    }

    /**
     * Get weak subcategory questions for Smart Weakness Drill.
     */
    public function smartWeakness(Request $request)
    {
        $userId = auth()->id();
        $attempts = ExamAttempt::where('user_id', $userId)->get();

        $subcatStats = [];
        foreach ($attempts as $attempt) {
            $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? $attempt->cat_scores ?? [];
            foreach ($scoreMap as $scoreData) {
                $subcats = $scoreData['subcats'] ?? [];
                foreach ($subcats as $subName => $subScore) {
                    if (! is_array($subScore)) {
                        continue;
                    }
                    if (! isset($subcatStats[$subName])) {
                        $subcatStats[$subName] = ['correct' => 0, 'total' => 0];
                    }
                    $subcatStats[$subName]['correct'] += $subScore['correct'] ?? 0;
                    $subcatStats[$subName]['total'] += $subScore['total'] ?? 0;
                }
            }
        }

        // Filter subcategories with accuracy < 65%
        $weakSubcatNames = [];
        foreach ($subcatStats as $subName => $stats) {
            if ($stats['total'] > 0 && ($stats['correct'] / $stats['total']) < 0.65) {
                $weakSubcatNames[] = $subName;
            }
        }

        $query = Question::where('status', 'active')->with(['subcategory.category']);

        if (! empty($weakSubcatNames)) {
            $query->whereHas('subcategory', function ($q) use ($weakSubcatNames) {
                $q->whereIn('name', $weakSubcatNames);
            });
        }

        $questions = $query->inRandomOrder()->limit(20)->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'stem' => $q->stem,
                'options' => $q->options ?? [],
                'correct_option' => $q->correct_option,
                'explanation' => $q->explanation ?? '',
                'category' => $q->subcategory?->category?->name ?? 'General Information',
                'subcategory' => $q->subcategory?->name ?? '',
                'language' => (str_contains(strtolower($q->language ?? ''), 'tagalog') || str_contains(strtolower($q->language ?? ''), 'filipino')) ? 'Filipino' : 'English',
                'isDemographic' => $q->subcategory?->category?->is_demographic ?? false,
            ];
        });

        return response()->json([
            'weak_subcategories' => $weakSubcatNames,
            'questions' => $questions,
        ]);
    }
}
