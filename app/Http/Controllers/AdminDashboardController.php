<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\ExamAttempt;
use App\Models\User;
use App\Models\TrackConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Display the dynamic administrator stats overview panel.
     */
    public function index(Request $request): Response
    {
        // 1. Database model counters
        $metrics = [
            'total_questions' => Question::count(),
            'active_questions' => Question::where('status', 'ACTIVE')->count(),
            'draft_questions' => Question::where('status', 'DRAFT')->count(),
            'total_categories' => Category::count(),
            'total_subcategories' => Subcategory::count(),
            'total_examinees' => User::where('role', '!=', 'admin')->count(),
            'total_attempts' => ExamAttempt::count(),
            'track_configs' => TrackConfig::count(),
        ];

        // 2. Real-time question distribution count across exam categories
        $categoriesStats = Category::all()->map(function ($category) {
            $subIds = Subcategory::where('category_id', $category->id)->pluck('id');
            $questionCount = Question::whereIn('subcategory_id', $subIds)->count();
            
            return [
                'id' => $category->id,
                'name' => $category->name,
                'question_count' => $questionCount,
            ];
        });

        // 3. Recent examinee attempt activities with grade computations
        $recentAttempts = ExamAttempt::with(['user', 'category'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                $totalScore = 0;
                $maxPossible = 0;
                
                if ($attempt->cat_scores && is_array($attempt->cat_scores)) {
                    foreach ($attempt->cat_scores as $scores) {
                        $totalScore += $scores['score'] ?? 0;
                        $maxPossible += $scores['total'] ?? 0;
                    }
                }
                
                $percentage = $maxPossible > 0 ? round(($totalScore / $maxPossible) * 100) : 75;

                return [
                    'id' => $attempt->id,
                    'user' => [
                        'name' => $attempt->user?->name ?? 'Examinee',
                        'email' => $attempt->user?->email ?? '',
                    ],
                    'category' => $attempt->category?->name ?? 'Full CSC Blueprint',
                    'percentage' => $percentage,
                    'created_at' => $attempt->created_at?->diffForHumans() ?? 'Just now',
                ];
            });

        // 4. Custom syllabus tracks
        $tracks = TrackConfig::with('category')->get()->map(function ($track) {
            return [
                'id' => $track->id,
                'track' => $track->track,
                'category' => $track->category?->name ?? 'All Scope',
                'item_count' => $track->item_count,
                'time_limit' => $track->time_limit_secs ? round($track->time_limit_secs / 60) . ' mins' : 'No limit',
            ];
        });

        return Inertia::render('admin-dashboard', [
            'metrics' => $metrics,
            'recentAttempts' => $recentAttempts,
            'categoriesStats' => $categoriesStats,
            'tracks' => $tracks,
        ]);
    }
}
