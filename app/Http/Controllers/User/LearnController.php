<?php

namespace App\Http\Controllers\User;

use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\LearnModule;
use App\Services\StudyPlanAnalyzer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class LearnController
{
    /**
     * Display a grouped index of all published learning modules.
     */
    public function index(Request $request): Response
    {
        // Load published learning modules with relations from cache to avoid N+1 queries and DB pressure
        $modules = Cache::rememberForever('learn.modules.published', function () {
            return LearnModule::with(['category', 'subcategory'])
                ->where('is_published', true)
                ->latest()
                ->get()
                ->map(function ($mod) {
                    return [
                        'id' => $mod->id,
                        'title' => $mod->title,
                        'slug' => $mod->slug,
                        'topic' => $mod->topic,
                        'summary' => $mod->summary,
                        'estimated_minutes' => $mod->estimated_minutes,
                        'category' => $mod->category?->name ?? 'General Info',
                        'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                    ];
                })->toArray();
        });

        // Load all active categories from shared categories tree cache
        $categories = Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        if (auth()->check()) {
            $attempts = ExamAttempt::where('user_id', auth()->id())
                ->orderByDesc('created_at')
                ->get();

            if ($attempts->isNotEmpty()) {
                $analyzer = app(StudyPlanAnalyzer::class);
                $weakAreas = $analyzer->identifyWeakAreas($attempts);

                if ($weakAreas->isNotEmpty()) {
                    $weakCategoryNames = $weakAreas->pluck('category')->toArray();

                    usort($categories, function ($a, $b) use ($weakCategoryNames) {
                        $posA = array_search($a['name'], $weakCategoryNames);
                        $posB = array_search($b['name'], $weakCategoryNames);

                        if ($posA !== false && $posB !== false) {
                            return $posA <=> $posB;
                        } elseif ($posA !== false) {
                            return -1;
                        } elseif ($posB !== false) {
                            return 1;
                        } else {
                            return ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0);
                        }
                    });
                }
            }
        }

        $userId = auth()->id();
        $completedModuleIds = [];
        if ($userId) {
            $completedModuleIds = LearnModule::whereJsonContains('completed_by_user_ids', $userId)->pluck('id')->toArray();
        }

        $modules = array_map(function ($mod) use ($completedModuleIds) {
            $mod['is_completed'] = in_array($mod['id'], $completedModuleIds);

            return $mod;
        }, $modules);

        return Inertia::render('user/learn/index', [
            'modules' => $modules,
            'categories' => $categories,
        ]);
    }

    public function show(string $slug): Response
    {
        $isAdmin = auth()->user() && auth()->user()->role === 'admin';

        if ($isAdmin) {
            // Admins can see draft/unpublished modules in real-time without caching
            $mod = LearnModule::with(['category', 'subcategory', 'creator'])
                ->where('slug', $slug)
                ->firstOrFail();
            $module = [
                'id' => $mod->id,
                'category_id' => $mod->category_id,
                'title' => $mod->title,
                'slug' => $mod->slug,
                'topic' => $mod->topic,
                'summary' => $mod->summary,
                'content' => $mod->content,
                'estimated_minutes' => $mod->estimated_minutes,
                'is_published' => (bool) $mod->is_published,
                'category' => $mod->category?->name ?? 'General Info',
                'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                'creator_name' => $mod->creator?->name ?? 'Expert Reviewer',
                'updated_at' => $mod->updated_at?->format('M d, Y') ?? now()->format('M d, Y'),
            ];
        } else {
            // General users fetch cached module details for blazing fast speeds
            $module = Cache::rememberForever("learn.module.show.{$slug}", function () use ($slug) {
                $mod = LearnModule::with(['category', 'subcategory', 'creator'])
                    ->where('slug', $slug)
                    ->where('is_published', true)
                    ->firstOrFail();

                return [
                    'id' => $mod->id,
                    'category_id' => $mod->category_id,
                    'title' => $mod->title,
                    'slug' => $mod->slug,
                    'topic' => $mod->topic,
                    'summary' => $mod->summary,
                    'content' => $mod->content,
                    'estimated_minutes' => $mod->estimated_minutes,
                    'is_published' => (bool) $mod->is_published,
                    'category' => $mod->category?->name ?? 'General Info',
                    'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                    'creator_name' => $mod->creator?->name ?? 'Expert Reviewer',
                    'updated_at' => $mod->updated_at?->format('M d, Y') ?? now()->format('M d, Y'),
                ];
            });
        }

        // Inline self-healing check to clear and rebuild corrupt stale cache entries
        if (is_object($module) || ! is_array($module)) {
            Cache::forget("learn.module.show.{$slug}");
            $mod = LearnModule::with(['category', 'subcategory', 'creator'])
                ->where('slug', $slug)
                ->where('is_published', true)
                ->firstOrFail();
            $module = [
                'id' => $mod->id,
                'category_id' => $mod->category_id,
                'title' => $mod->title,
                'slug' => $mod->slug,
                'topic' => $mod->topic,
                'summary' => $mod->summary,
                'content' => $mod->content,
                'estimated_minutes' => $mod->estimated_minutes,
                'is_published' => (bool) $mod->is_published,
                'category' => $mod->category?->name ?? 'General Info',
                'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                'creator_name' => $mod->creator?->name ?? 'Expert Reviewer',
                'updated_at' => $mod->updated_at?->format('M d, Y') ?? now()->format('M d, Y'),
            ];
            Cache::forever("learn.module.show.{$slug}", $module);
        }

        // Fetch recommended lessons from cache
        $recommended = Cache::rememberForever("learn.module.recommended.{$module['id']}", function () use ($module) {
            return LearnModule::where('category_id', $module['category_id'])
                ->where('id', '!=', $module['id'])
                ->where('is_published', true)
                ->take(3)
                ->get()
                ->map(function ($mod) {
                    return [
                        'title' => $mod->title,
                        'slug' => $mod->slug,
                        'estimated_minutes' => $mod->estimated_minutes,
                    ];
                })->toArray();
        });

        if (is_object($recommended) || ! is_array($recommended)) {
            Cache::forget("learn.module.recommended.{$module['id']}");
            $recommended = LearnModule::where('category_id', $module['category_id'])
                ->where('id', '!=', $module['id'])
                ->where('is_published', true)
                ->take(3)
                ->get()
                ->map(function ($mod) {
                    return [
                        'title' => $mod->title,
                        'slug' => $mod->slug,
                        'estimated_minutes' => $mod->estimated_minutes,
                    ];
                })->toArray();
            Cache::forever("learn.module.recommended.{$module['id']}", $recommended);
        }

        $userId = auth()->id();
        $module['is_completed'] = false;
        if ($userId) {
            $mod = LearnModule::find($module['id']);
            if ($mod) {
                $module['is_completed'] = $mod->isCompletedBy($userId);
            }
        }

        return Inertia::render('user/learn/show', [
            'module' => $module,
            'recommended' => $recommended,
        ]);
    }

    /**
     * Toggle the completion status of a learning module for the authenticated user.
     */
    public function toggleComplete(Request $request, string $slug)
    {
        $userId = auth()->id();
        if (! $userId) {
            return redirect()->back();
        }

        $module = LearnModule::where('slug', $slug)->firstOrFail();
        $completedByUserIds = $module->completed_by_user_ids ?? [];

        if (in_array($userId, $completedByUserIds)) {
            $completedByUserIds = array_values(array_diff($completedByUserIds, [$userId]));
        } else {
            $completedByUserIds[] = $userId;
        }

        $module->completed_by_user_ids = $completedByUserIds;
        $module->save();

        return redirect()->back();
    }
}
