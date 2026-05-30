<?php

namespace App\Jobs;

use App\Models\Category;
use App\Models\LearnModule;
use App\Models\Subcategory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GenerateLearnModuleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 3;

    protected $validated;
    protected $userId;

    public function __construct(array $validated, int $userId)
    {
        $this->validated = $validated;
        $this->userId = $userId;
    }

    public function handle(): void
    {
        $validated = $this->validated;

        $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (! $apiKey) {
            Log::error('GenerateLearnModuleJob: GEMINI_API_KEY is missing.');
            return;
        }

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
" . (!empty($validated['prompt']) ? "Additional Directives: {$validated['prompt']}" : '');

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(300)->post(
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
                Log::error('GenerateLearnModuleJob: API failed: ' . $response->body());
                return;
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
                Log::error('GenerateLearnModuleJob: Invalid JSON structure: ' . $text);
                return;
            }

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
                $slug = $originalSlug . '-' . $count++;
            }

            LearnModule::create([
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'title' => $moduleData['title'] ?? $validated['topic'],
                'slug' => $slug,
                'topic' => $validated['topic'],
                'summary' => $moduleData['summary'] ?? '',
                'content' => $moduleData['content'] ?? '',
                'estimated_minutes' => (int) ($moduleData['estimated_minutes'] ?? 8),
                'is_published' => false,
                'created_by' => $this->userId,
            ]);

            Cache::forget('learn.modules.published');
            Cache::forget('categories.tree');

        } catch (\Exception $e) {
            Log::error('GenerateLearnModuleJob: Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
        }
    }
}
