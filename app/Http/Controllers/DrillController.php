<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DrillController extends Controller
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
                        'language' => $q->language ?? 'English',
                        'isDemographic' => $q->subcategory?->category?->is_demographic ?? false,
                    ];
                })->toArray();
        });

        $categories = Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        return Inertia::render('drills/index', [
            'questions' => $questions,
            'categories' => $categories,
        ]);
    }
}
