<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearnModule;
use App\Models\Subcategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminLearnController extends Controller
{
    /**
     * Helper to ensure user has admin role access.
     */
    private function checkAdminAccess(): void
    {
        if (! auth()->user() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to learning administration.');
        }
    }

    /**
     * Clear all related learning caches when content is modified.
     */
    private function clearCache(?LearnModule $module = null): void
    {
        Cache::forget('learn.modules.published');
        Cache::forget('categories.tree');
        if ($module) {
            Cache::forget("learn.module.show.{$module->slug}");
            Cache::forget("learn.module.recommended.{$module->id}");
        }
    }

    /**
     * List all learn modules for admin curation dashboard.
     */
    public function index(Request $request): Response
    {
        $this->checkAdminAccess();

        $modules = LearnModule::with(['category', 'subcategory'])
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
                    'is_published' => (bool) $mod->is_published,
                    'category' => $mod->category?->name ?? 'General Info',
                    'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                    'updated_at' => $mod->updated_at->format('Y-m-d H:i'),
                ];
            });

        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/index', [
            'modules' => $modules,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the learning module creation panel.
     */
    public function create(Request $request): Response
    {
        $this->checkAdminAccess();

        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/create', [
            'categories' => $categories,
            'initialTopic' => $request->query('topic', ''),
        ]);
    }

    /**
     * Store a manually created or generated learn module in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->checkAdminAccess();

        // Bulk AI Learn Module commit
        if ($request->has('modules') && is_array($request->input('modules'))) {
            $modulesData = $request->input('modules');
            $savedCount = 0;

            foreach ($modulesData as $mData) {
                try {
                    $category = Category::firstOrCreate(
                        ['slug' => Str::slug($mData['category'])],
                        ['name' => $mData['category']]
                    );

                    $subcategory = Subcategory::firstOrCreate(
                        [
                            'category_id' => $category->id,
                            'slug' => Str::slug($mData['subcategory']),
                        ],
                        [
                            'name' => $mData['subcategory'],
                            'language' => 'English',
                        ]
                    );

                    $dbModule = null;
                    if (isset($mData['id'])) {
                        $dbModule = LearnModule::find($mData['id']);
                    }

                    if ($dbModule) {
                        $dbModule->update([
                            'category_id' => $category->id,
                            'subcategory_id' => $subcategory->id,
                            'title' => $mData['title'],
                            'topic' => $mData['topic'],
                            'summary' => $mData['summary'],
                            'content' => $mData['content'],
                            'estimated_minutes' => (int) $mData['estimated_minutes'],
                            'is_published' => true,
                        ]);
                    } else {
                        $slug = Str::slug($mData['title']);
                        $originalSlug = $slug;
                        $count = 1;
                        while (LearnModule::where('slug', $slug)->exists()) {
                            $slug = $originalSlug.'-'.$count++;
                        }

                        LearnModule::create([
                            'category_id' => $category->id,
                            'subcategory_id' => $subcategory->id,
                            'title' => $mData['title'],
                            'slug' => $slug,
                            'topic' => $mData['topic'],
                            'summary' => $mData['summary'],
                            'content' => $mData['content'],
                            'estimated_minutes' => (int) $mData['estimated_minutes'],
                            'is_published' => true,
                            'created_by' => auth()->id(),
                        ]);
                    }
                    $savedCount++;
                } catch (\Exception $e) {
                    // Silent fail
                }
            }

            $this->clearCache();

            return redirect()->route('admin.learn.drafts')->with('success', "{$savedCount} approved learning modules published successfully!");
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'title' => 'required|string|max:255',
            'topic' => 'required|string|max:255',
            'summary' => 'required|string',
            'content' => 'required|string',
            'estimated_minutes' => 'required|integer|min:1|max:120',
            'is_published' => 'required|boolean',
        ]);

        $slug = Str::slug($validated['title']);

        // Ensure slug uniqueness
        $originalSlug = $slug;
        $count = 1;
        while (LearnModule::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count++;
        }

        LearnModule::create([
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'title' => $validated['title'],
            'slug' => $slug,
            'topic' => $validated['topic'],
            'summary' => $validated['summary'],
            'content' => $validated['content'],
            'estimated_minutes' => (int) $validated['estimated_minutes'],
            'is_published' => (bool) $validated['is_published'],
            'created_by' => auth()->id(),
        ]);

        $this->clearCache();

        return redirect()->route('admin.learn.index')->with('success', 'Learning module created successfully!');
    }

    /**
     * Show the edit panel for a learning module.
     */
    public function edit(string $id): Response
    {
        $this->checkAdminAccess();

        $module = LearnModule::findOrFail($id);
        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/edit', [
            'module' => [
                'id' => $module->id,
                'category_id' => $module->category_id,
                'subcategory_id' => $module->subcategory_id,
                'title' => $module->title,
                'topic' => $module->topic,
                'summary' => $module->summary,
                'content' => $module->content,
                'estimated_minutes' => $module->estimated_minutes,
                'is_published' => (bool) $module->is_published,
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified learning module.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $this->checkAdminAccess();

        $module = LearnModule::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'title' => 'required|string|max:255',
            'topic' => 'required|string|max:255',
            'summary' => 'required|string',
            'content' => 'required|string',
            'estimated_minutes' => 'required|integer|min:1|max:120',
            'is_published' => 'required|boolean',
        ]);

        // Keep or update slug if title changed
        if ($module->title !== $validated['title']) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (LearnModule::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug.'-'.$count++;
            }
            $module->slug = $slug;
        }

        $module->update([
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'title' => $validated['title'],
            'topic' => $validated['topic'],
            'summary' => $validated['summary'],
            'content' => $validated['content'],
            'estimated_minutes' => (int) $validated['estimated_minutes'],
            'is_published' => (bool) $validated['is_published'],
        ]);

        $this->clearCache($module);

        return redirect()->route('admin.learn.index')->with('success', 'Learning module updated successfully!');
    }

    /**
     * Remove the specified learning module.
     */
    public function destroy(string $id): RedirectResponse
    {
        $this->checkAdminAccess();

        $module = LearnModule::findOrFail($id);
        $module->delete();

        $this->clearCache($module);

        return redirect()->route('admin.learn.index')->with('success', 'Learning module deleted successfully!');
    }

    /**
     * Generate an educational review module using Gemini 3.5 Flash API.
     */
    public function generate(Request $request)
    {
        $this->checkAdminAccess();

        $validated = $request->validate([
            'category' => 'required|string',
            'subcategory' => 'required|string',
            'topic' => 'required|string|max:255',
            'prompt' => 'nullable|string',
        ]);

        $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (! $apiKey) {
            return response()->json([
                'error' => 'GEMINI_API_KEY is not configured in environment settings.',
            ], 400);
        }

        $systemPrompt = "You are a top-tier Civil Service Exam (CSE) instructor and curriculum writer in the Philippines.
Generate an incredibly rich, engaging, and syllabus-aligned learning tutorial/module for Filipino examinees preparing for the Professional or Subprofessional exam.

Your lesson content should be thorough, detailed, and formatted beautifully in standard Markdown. Make it feel highly premium and state-of-the-art.
Structure the content with:
1. 💡 Core Concept & Context: Introduction and why this topic is vital for the exam.
2. 🚀 Key Rules & Principles: A clear, bulleted breakdown of fundamental theory, rules, spelling laws, or math logic.
3. 🧠 Mental Shortcut / Strategy Tip: A dedicated section detailing the fastest ways to solve problems under strict exam timer conditions.
4. 📝 Realistic Example Scenario: Walk through a comprehensive step-by-step example. If logical, list out uppercase propositional variables (e.g. A, B, C) and contrapositions clearly using logic arrows (e.g., A -> B -> C). If mathematical, outline tabular data using markdown pipes (|) so it displays beautifully as an interactive HTML table.
5. Check Your Understanding: Add exactly 3 self-check multiple-choice questions with answers and detailed inline explanations to allow students to test their understanding instantly.

Return a valid JSON object. Do not include markdown wraps (no ```json ... ```). Return raw JSON.
The object must contain:
1. 'title': A compelling, professional tutorial title (e.g. 'Mastering Alpha-Filing & Indexing Rules').
2. 'summary': A concise 1-2 sentence preview summary of the lesson.
3. 'content': The complete, detailed markdown content.
4. 'estimated_minutes': An integer representing reading time (typically between 5 and 15 mins).

JSON Output schema:
{
  \"title\": \"...\",
  \"summary\": \"...\",
  \"content\": \"...\",
  \"estimated_minutes\": 8
}";

        $systemPrompt = "You are a top-tier Civil Service Exam (CSE) instructor and curriculum writer in the Philippines.
Generate a rich, readable, syllabus-aligned learning tutorial/module for Filipino examinees preparing for the Professional or Subprofessional exam.

Use clean standard Markdown only. Do not use decorative emoji, mojibake, HTML, or code fences. Prefer short paragraphs, clear headings, bullet lists, and readable tables when helpful.
Structure the content with:
1. ## Core Concept and Context - introduce the topic and explain why it matters in the exam.
2. ## Key Rules and Principles - give a clear bulleted breakdown of the theory, rules, spelling laws, or math logic.
3. ## Mental Shortcut or Strategy Tip - explain fast exam-time solving methods.
4. ## Realistic Example Scenario - walk through a step-by-step example. If logical, use uppercase propositional variables such as A, B, C and arrows like A -> B -> C. If mathematical, use Markdown tables with pipes.
5. ## Check Your Understanding - this must be the final section in content.

The final ## Check Your Understanding section must contain exactly 3 multiple-choice questions. Each question must use this exact visible format:
Q1: [question]
A) [choice]
B) [choice]
C) [choice]
D) [choice]
Answer: [correct letter and answer]
Explanation: [brief explanation]

Repeat the same format for Q2 and Q3. Answers must be visible immediately under each question.

Return a valid JSON object. Do not include markdown wraps (no ```json ... ```). Return raw JSON.
The object must contain:
1. 'title': A compelling, professional tutorial title (e.g. 'Mastering Alpha-Filing and Indexing Rules').
2. 'summary': A concise 1-2 sentence preview summary of the lesson.
3. 'content': The complete, detailed markdown content.
4. 'estimated_minutes': An integer representing reading time (typically between 5 and 15 mins).

JSON Output schema:
{
  \"title\": \"...\",
  \"summary\": \"...\",
  \"content\": \"...\",
  \"estimated_minutes\": 8
}";

        $userPrompt = "Write a comprehensive review module for:
Category: {$validated['category']}
Subcategory: {$validated['subcategory']}
Topic: {$validated['topic']}
".($validated['prompt'] ? "Additional Directives: {$validated['prompt']}" : '');

        set_time_limit(300);
        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(300)->retry(3, 10000)->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
                [
                    'system_instruction' => [
                        'parts' => [['text' => $systemPrompt]],
                    ],
                    'contents' => [
                        [
                            'parts' => [['text' => $userPrompt]],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topP' => 0.9,
                        'responseMimeType' => 'application/json',
                        'responseSchema' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'title' => ['type' => 'STRING'],
                                'summary' => ['type' => 'STRING'],
                                'content' => ['type' => 'STRING'],
                                'estimated_minutes' => ['type' => 'INTEGER'],
                            ],
                            'required' => ['title', 'summary', 'content', 'estimated_minutes'],
                        ],
                    ],
                ]
            );

            if ($response->failed()) {
                Log::error('Gemini Learn Module Generation failed: '.$response->body());

                return response()->json([
                    'error' => 'The AI service is temporarily busy. Please wait a moment and try again.',
                ], 500);
            }

            $result = $response->json();
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $text = trim($text);
            if (str_starts_with($text, '```')) {
                $text = preg_replace('/^```(?:json)?\n?|```$/', '', $text);
            }
            $text = trim($text);

            $moduleData = json_decode($text, true);
            if (! $moduleData || ! isset($moduleData['content'])) {
                Log::error('Gemini returned invalid learn JSON structure: '.$text);

                return response()->json([
                    'error' => 'The generator encountered an unexpected formatting issue. Please try again.',
                ], 500);
            }

            // Strict 1-liner comment: Locate category and subcategory dynamic records or seeders
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($validated['category'])],
                ['name' => $validated['category']]
            );

            $subcategory = Subcategory::firstOrCreate(
                [
                    'category_id' => $category->id,
                    'slug' => Str::slug($validated['subcategory']),
                ],
                [
                    'name' => $validated['subcategory'],
                    'language' => 'English',
                ]
            );

            $slug = Str::slug($moduleData['title'] ?? $validated['topic']);
            $originalSlug = $slug;
            $count = 1;
            while (LearnModule::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$count++;
            }

            $dbModule = LearnModule::create([
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'title' => $moduleData['title'] ?? $validated['topic'],
                'slug' => $slug,
                'topic' => $validated['topic'],
                'summary' => $moduleData['summary'] ?? '',
                'content' => $moduleData['content'] ?? '',
                'estimated_minutes' => (int) ($moduleData['estimated_minutes'] ?? 8),
                'is_published' => false,
                'created_by' => auth()->id(),
            ]);

            $this->clearCache($dbModule);

            return response()->json([
                'success' => true,
                'module' => $dbModule,
            ]);

        } catch (\Exception $e) {
            Log::error('Learn module AI generation error: '.$e->getMessage()."\n".$e->getTraceAsString());

            return response()->json([
                'error' => 'A system error occurred while generating learning content.',
            ], 500);
        }
    }

    /**
     * Display a listing of draft learning modules for review.
     */
    public function drafts(Request $request): Response
    {
        $this->checkAdminAccess();

        $drafts = LearnModule::with(['category', 'subcategory'])
            ->where('is_published', false)
            ->latest()
            ->get()
            ->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'title' => $mod->title,
                    'slug' => $mod->slug,
                    'topic' => $mod->topic,
                    'summary' => $mod->summary,
                    'content' => $mod->content,
                    'estimated_minutes' => $mod->estimated_minutes,
                    'category_id' => $mod->category_id,
                    'subcategory_id' => $mod->subcategory_id,
                    'category' => $mod->category?->name ?? 'General Info',
                    'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                    'updated_at' => $mod->updated_at->format('Y-m-d H:i'),
                    'approved' => true,
                ];
            });

        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/drafts', [
            'initialDrafts' => $drafts,
            'categories' => $categories,
        ]);
    }
}
