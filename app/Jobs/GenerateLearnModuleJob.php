<?php

namespace App\Jobs;

use App\Events\AiGenerationCompleted;
use App\Events\AiGenerationFailed;
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

    protected $primaryModel;

    public function __construct(array $validated, int $userId, string $primaryModel = 'llama-3.3-70b-versatile')
    {
        $this->validated = $validated;
        $this->userId = $userId;
        $this->primaryModel = $primaryModel;
    }

    public function handle(): void
    {
        set_time_limit(300);
        $validated = $this->validated;

        $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (! $apiKey) {
            Log::error('GenerateLearnModuleJob: GEMINI_API_KEY is missing.');
            AiGenerationFailed::dispatch($this->userId, 'API Key is missing.', 'module');

            return;
        }

        $systemPrompt = "You are a top-tier Civil Service Exam (CSE) instructor and curriculum writer in the Philippines.
Generate a rich, readable, syllabus-aligned learning tutorial/module for Filipino examinees preparing for the Professional or Subprofessional exam.

Official Category & Subcategory Schema (With Exam Level context):
* General Information (Both Levels): 'Philippine Constitution', 'Code of Conduct and Ethical Standards (R.A. 6713)', 'Peace and Human Rights Issues and Concepts', 'Environment Management and Protection'
* Verbal Ability (Both Levels): 'Word meaning', 'Sentence completion', 'Error recognition', 'Sentence structure', 'Paragraph organization', 'Reading comprehension'
* Analytical Ability (Professional Level ONLY): 'Word analogy', 'Symbolic logic / abstract reasoning', 'Identifying assumptions and drawing conclusions', 'Data interpretation'
* Numerical Ability (Both Levels): 'Basic operations', 'Number sequence', 'Word problems'
* Clerical Ability (Subprofessional Level ONLY): 'Filing', 'Spelling'

Philippine Context Rule:
For Word Problems, Reading Comprehension, Data Interpretation, and any Example Scenarios, you MUST use realistic Philippine context. Use Philippine Pesos (₱), local Philippine cities (e.g., Manila, Cebu, Davao), local names (e.g., Juan, Maria, Santos), and real Philippine government agencies (e.g., CSC, BIR, DOH) to make the module authentic to the CSE. Tailor the tone of the module depending on whether the topic is exclusively for the Professional or Subprofessional exam.

Use clean standard Markdown only. Do not use decorative emoji, mojibake, HTML, or code fences. Prefer short paragraphs, clear headings, bullet lists, and readable tables when helpful.
Structure the content with:
1. ## Core Concept and Context - introduce the topic and explain why it matters in the exam.
2. ## Key Rules and Principles - give a clear bulleted breakdown of the theory, rules, spelling laws, or math logic.
3. ## Mental Shortcut or Strategy Tip - explain fast exam-time solving methods.
4. ## Realistic Example Scenario - walk through a step-by-step example. If mathematical, use Markdown tables with pipes. CRITICAL RULES FOR VISUAL TOPICS:
- If the topic is 'Symbolic logic / abstract reasoning', you MUST generate visual-spatial geometric puzzles (like finding the next shape in a sequence, folding patterns, or rotating grids) using raw, scalable SVG code. Output raw <svg viewBox=\"...\">...</svg> blocks directly inside the markdown. You MUST include SVG visuals not just in the scenario, but ALSO in every single option of the Check Your Understanding questions (Options A to D must be standalone SVGs showing the possible answers, do NOT use descriptive text for options), AND in the explanation block to visually demonstrate the correct pattern and solution. Keep SVGs clean with simple paths, <rect>, <circle>, or <polygon>. Ensure the visual sequence is logically solvable and visually clear. In the explanation block, explicitly define the visual pattern (e.g. 'The black dot rotates 90 degrees clockwise') and provide the correct logical solution alongside the SVG. Do NOT use standard deductive logic chains for Abstract Reasoning, use visual SVG puzzles instead!
- If the topic is 'Data interpretation', you MUST provide a data source for interpretation. You should provide a beautifully formatted markdown table AND/OR a chart visualization (e.g., bar chart, line graph, pie chart) using raw, scalable SVG code directly inside the text. Feel free to use both a table and an SVG chart together, or vary them. If using an SVG chart, ensure it has clear axes, data labels, titles, and legends using <text> elements. The options should be text or numbers based on the data, and the explanation block must reference the specific data points. Keep any SVG code clean and well-structured.
- If it is standard verbal logic, you may use propositional variables.
- CRITICAL HIDDEN MECHANICS: NEVER mention terms like 'SVG', 'SVG-visualized', 'scalable vector', or 'raw code' anywhere in the title, summary, or user-facing text. The end-user examinee should just read the text naturally; they do not need to know the images are SVGs. Refer to them simply as 'the chart', 'the image', or 'the pattern'.
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
".(! empty($validated['prompt']) ? "Additional Directives: {$validated['prompt']}" : '');

        try {
            $resultText = null;
            $errorMsg = null;
            $firstAttemptFailed = false;

            $attemptGemini = function ($model = 'gemini-3.5-flash') use ($apiKey, $systemPrompt, $userPrompt, &$resultText, &$errorMsg) {
                if (! $apiKey) {
                    $errorMsg = 'GEMINI_API_KEY is missing.';

                    return false;
                }
                try {
                    $response = Http::withHeaders([
                        'x-goog-api-key' => $apiKey,
                        'Content-Type' => 'application/json',
                    ])->timeout(300)->post(
                        'https://generativelanguage.googleapis.com/v1beta/models/'.$model.':generateContent',
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

                    if ($response->successful()) {
                        $result = $response->json();
                        $resultText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

                        return true;
                    } else {
                        $errorMsg = 'Gemini API failed with status '.$response->status().': '.$response->body();

                        return false;
                    }
                } catch (\Exception $e) {
                    $errorMsg = 'Gemini Exception: '.$e->getMessage();

                    return false;
                }
            };

            $attemptGroq = function ($model) use ($systemPrompt, $userPrompt, &$resultText, &$errorMsg) {
                $groqKey = config('services.groq.key') ?: env('GROQ_API_KEY');
                if (! $groqKey) {
                    $errorMsg = 'GROQ_API_KEY is missing.';

                    return false;
                }

                try {
                    $groqResponse = Http::withToken($groqKey)
                        ->timeout(300)
                        ->post('https://api.groq.com/openai/v1/chat/completions', [
                            'model' => $model,
                            'messages' => [
                                ['role' => 'system', 'content' => $systemPrompt],
                                ['role' => 'user', 'content' => $userPrompt],
                            ],
                            'temperature' => 0.7,
                            'response_format' => ['type' => 'json_object'],
                        ]);

                    if ($groqResponse->successful()) {
                        $result = $groqResponse->json();
                        $resultText = $result['choices'][0]['message']['content'] ?? '';

                        return true;
                    } else {
                        $errorMsg = 'Groq API failed with status '.$groqResponse->status().': '.$groqResponse->body();

                        return false;
                    }
                } catch (\Exception $e) {
                    $errorMsg = 'Groq Exception: '.$e->getMessage();

                    return false;
                }
            };

            // Define fallback lists of free models (ordered from best to worst)
            $groqModels = ['llama-3.3-70b-versatile', 'gemma2-9b-it', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'];
            $geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];

            $primaryIsGemini = str_starts_with($this->primaryModel, 'gemini');

            $geminiChain = array_unique(array_merge([$this->primaryModel], $geminiModels));
            $groqChain = array_unique(array_merge([$this->primaryModel], $groqModels));

            // Clean chains to keep only relevant models
            $geminiChain = array_values(array_filter($geminiChain, fn ($m) => str_starts_with($m, 'gemini')));
            $groqChain = array_values(array_filter($groqChain, fn ($m) => ! str_starts_with($m, 'gemini')));

            $success = false;

            if ($primaryIsGemini) {
                // Try Gemini first
                foreach ($geminiChain as $model) {
                    Log::info('GenerateLearnModuleJob: Attempting Gemini model: '.$model);
                    if ($attemptGemini($model)) {
                        $success = true;
                        break;
                    }
                    Log::warning('GenerateLearnModuleJob: Gemini model '.$model.' failed: '.$errorMsg);
                }

                // Fallback to Groq
                if (! $success) {
                    foreach ($groqChain as $model) {
                        Log::info('GenerateLearnModuleJob: Attempting Groq fallback model: '.$model);
                        if ($attemptGroq($model)) {
                            $success = true;
                            break;
                        }
                        Log::warning('GenerateLearnModuleJob: Groq model '.$model.' failed: '.$errorMsg);
                    }
                }
            } else {
                // Try Groq first
                foreach ($groqChain as $model) {
                    Log::info('GenerateLearnModuleJob: Attempting Groq model: '.$model);
                    if ($attemptGroq($model)) {
                        $success = true;
                        break;
                    }
                    Log::warning('GenerateLearnModuleJob: Groq model '.$model.' failed: '.$errorMsg);
                }

                // Fallback to Gemini
                if (! $success) {
                    foreach ($geminiChain as $model) {
                        Log::info('GenerateLearnModuleJob: Attempting Gemini fallback model: '.$model);
                        if ($attemptGemini($model)) {
                            $success = true;
                            break;
                        }
                        Log::warning('GenerateLearnModuleJob: Gemini model '.$model.' failed: '.$errorMsg);
                    }
                }
            }

            if (! $success) {
                Log::error('GenerateLearnModuleJob: All AI generation models failed.');
                AiGenerationFailed::dispatch($this->userId, 'AI Generation failed across all primary and fallback free models.', 'module');

                return;
            }

            $text = $resultText;

            $text = trim($text);
            if (str_starts_with($text, '```')) {
                $text = preg_replace('/^```(?:json)?\n?|```$/', '', $text);
            }
            $text = trim($text);

            $moduleData = json_decode($text, true);
            if (! $moduleData || ! isset($moduleData['content'])) {
                Log::error('GenerateLearnModuleJob: Invalid JSON structure: '.$text);
                AiGenerationFailed::dispatch($this->userId, 'AI Generation failed. Invalid response format.', 'module');

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
                $slug = $originalSlug.'-'.$count++;
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

            AiGenerationCompleted::dispatch($this->userId, 'Learning module generation completed! Check your drafts.', 'module');

        } catch (\Exception $e) {
            Log::error('GenerateLearnModuleJob: Error: '.$e->getMessage()."\n".$e->getTraceAsString());
            AiGenerationFailed::dispatch($this->userId, 'An unexpected error occurred during AI generation.', 'module');
        }
    }
}
