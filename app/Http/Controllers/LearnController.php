<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearnModule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;

class LearnController extends Controller
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
            return Category::with(['subcategory' => function($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        return Inertia::render('learn/index', [
            'modules' => $modules,
            'categories' => $categories,
        ]);
    }

    /**
     * Display the full details of a specific learning module.
     */
    public function show(string $slug): Response
    {
        $isAdmin = auth()->user() && auth()->user()->role === 'admin';

        if ($isAdmin) {
            // Admins can see draft/unpublished modules in real-time without caching
            $module = LearnModule::with(['category', 'subcategory', 'creator'])
                ->where('slug', $slug)
                ->firstOrFail();
        } else {
            // General users fetch cached module details for blazing fast speeds
            $module = Cache::rememberForever("learn.module.show.{$slug}", function () use ($slug) {
                return LearnModule::with(['category', 'subcategory', 'creator'])
                    ->where('slug', $slug)
                    ->where('is_published', true)
                    ->firstOrFail();
            });
        }

        // Fetch recommended lessons from cache
        $recommended = Cache::rememberForever("learn.module.recommended.{$module->id}", function () use ($module) {
            return LearnModule::where('category_id', $module->category_id)
                ->where('id', '!=', $module->id)
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

        return Inertia::render('learn/show', [
            'module' => [
                'id' => $module->id,
                'title' => $module->title,
                'slug' => $module->slug,
                'topic' => $module->topic,
                'summary' => $module->summary,
                'content' => $module->content,
                'estimated_minutes' => $module->estimated_minutes,
                'is_published' => (bool) $module->is_published,
                'category' => $module->category?->name ?? 'General Info',
                'subcategory' => $module->subcategory?->name ?? 'Core Concepts',
                'creator_name' => $module->creator?->name ?? 'Expert Reviewer',
                'updated_at' => $module->updated_at->format('M d, Y'),
            ],
            'recommended' => $recommended,
        ]);
    }
}
