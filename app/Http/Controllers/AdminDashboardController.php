<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\TrackConfig;
use App\Models\User;
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
            'active_questions' => Question::where('status', 'active')->count(),
            'draft_questions' => Question::where('status', 'draft')->count(),
            'total_categories' => Category::count(),
            'total_subcategories' => Subcategory::count(),
            'total_examinees' => User::where('role', '!=', 'admin')->count(),
            'total_attempts' => ExamAttempt::whereHas('user', function ($q) {
                $q->where('role', '!=', 'admin');
            })->count(),
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
        $recentAttempts = ExamAttempt::whereHas('user', function ($q) {
            $q->where('role', '!=', 'admin');
        })
            ->with(['user', 'category'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];

                // Get correct counts and totals from metadata or fallbacks
                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids ?? []);
                $percentage = $total > 0 ? round(($correct / $total) * 100, 2) : 0;

                // Build a descriptive track or category name
                $trackName = $meta['track'] ?? null;
                $categoryName = 'Full Mock Exam';

                if ($attempt->category) {
                    $categoryName = $attempt->category->name;
                } elseif ($trackName) {
                    $categoryName = $trackName.' Level Reviewer';
                } elseif (isset($meta['category_name'])) {
                    $categoryName = $meta['category_name'];
                }

                return [
                    'id' => $attempt->id,
                    'user' => [
                        'name' => $attempt->user?->name ?? 'Examinee',
                        'email' => $attempt->user?->email ?? '',
                    ],
                    'category' => $categoryName,
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
                'time_limit' => $track->time_limit_secs ? round($track->time_limit_secs / 60).' mins' : 'No limit',
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
