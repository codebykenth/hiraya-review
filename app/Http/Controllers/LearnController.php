<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearnModule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearnController extends Controller
{
    /**
     * Display a grouped index of all published learning modules.
     */
    public function index(Request $request): Response
    {
        // Load published learning modules with relations to avoid N+1 queries
        $modules = LearnModule::with(['category', 'subcategory'])
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
            });

        // Load all active categories to help filter modules on the frontend
        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

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
        $query = LearnModule::with(['category', 'subcategory', 'creator'])
            ->where('slug', $slug);

        // Allow admins to preview draft/unpublished modules
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            $query->where('is_published', true);
        }

        $module = $query->firstOrFail();

        // Load up next/recommended modules under the same category to prompt next reads
        $recommended = LearnModule::where('category_id', $module->category_id)
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
