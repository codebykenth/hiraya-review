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

    protected ?string $lockOwner;

    public function __construct(array $validated, int $userId, string $primaryModel = 'gemini-3.5-flash', ?string $lockOwner = null)
    {
        $this->validated = $validated;
        $this->userId = $userId;
        $this->primaryModel = $primaryModel;
        $this->lockOwner = $lockOwner;
    }

    public function handle(): void
    {
        try {
            set_time_limit(300);
            $validated = $this->validated;

            $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
            if (! $apiKey) {
                Log::error('GenerateLearnModuleJob: GEMINI_API_KEY is missing.');
                AiGenerationFailed::dispatch($this->userId, 'API Key is missing.', 'module');

                return;
            }

            $subcategory = $validated['subcategory'];
            $categorySpecificRules = '';

            if ($subcategory === 'Symbolic logic / abstract reasoning') {
                $categorySpecificRules = "- If the topic is 'Symbolic logic / abstract reasoning', you MUST generate visual-spatial geometric puzzles using raw, scalable SVG code. Output raw <svg viewBox=\"...\">...</svg> blocks directly inside the markdown. You MUST include SVG visuals not just in the scenario, but ALSO in every single option of the Check Your Understanding questions (Options A to D must be standalone SVGs showing the possible answers, do NOT use descriptive text for options), AND in the explanation block to visually demonstrate the correct pattern and solution. Keep SVGs clean with simple paths, <rect>, <circle>, or <polygon>.
- CRITICAL VARIETY RULE: To prevent repetitive tutorials, randomly select one of the following abstract reasoning formats:
  * Grid-based Logical Matrix: A single SVG showing a grid of shapes (e.g. 2x2, 3x3, or 4x4 cells). The bottom-right cell MUST show a question mark '?' indicating the missing symbol. The other cells must follow a logical grid-based pattern (e.g. addition, subtraction, or overlap of lines/shapes in rows or columns).
  * Sequence Puzzle: A sequence of frames (ranging from 3 to 6 frames) showing a progressive transformation. You can either generate a single SVG displaying all frames side-by-side, or individual labeled frames (e.g. '**Frame 1:**\n<svg...>\n**Frame 2:**\n<svg...>').
  * Visual Analogy: Frame A is to Frame B, as Frame C is to '?'. Render as a single SVG or individual labeled frames.
  * Rotation/Reflection Grid: A grid of shaded shapes (e.g., 2x2, 3x3, 4x4) that rotate, mirror, or shift.
  * Odd One Out / Classification: The problem asks to find the figure that does not belong. Options show different SVG figures, where all but one share a geometric/symmetrical rule.
  * Cube Folding / 3D Net: The problem shows a 2D unfolded cube net, and the options show folded 3D cube representations.
  * Dot Placement / Intersection Logic: The problem shows a reference diagram where shapes overlap and a dot is placed in a specific intersection; the options test matching placement conditions.
  * Mirror/Water Reflections: Identifying reflections of geometric shapes across axes.
- CRITICAL GEOMETRIC COHERENCE RULE: Ensure that all elements (e.g. dots, lines, shapes) inside the SVGs never unintentionally overlap or intersect, unless it is a deliberate part of the puzzle logic. For multiple-choice options, every option must be constructed with clean spatial layouts and correct coordinate separation so that the correct answer cannot be easily guessed by simply choosing the only option without overlapping elements.
- CRITICAL HIDDEN MECHANICS: NEVER mention terms like 'SVG', 'SVG-visualized', 'scalable vector', or 'raw code' anywhere in the title, summary, or user-facing text. The end-user examinee should just read the text naturally; they do not need to know the images are SVGs. Refer to them simply as 'the chart', 'the image', or 'the pattern'.";
            } elseif ($subcategory === 'Data interpretation') {
                $categorySpecificRules = "- If the topic is 'Data interpretation', you MUST provide a data source for interpretation based on realistic Philippine public administration data.
  * CRITICAL VARIETY RULE: To prevent repetitive lessons, randomly select one of the following formats:
    - Format A: Bar Chart. Render a clean vertical or horizontal bar chart using raw SVG. Base the data on 4 to 6 categories/years. Vertical bars must grow bottom-up from the X-axis (e.g., if X-axis is at y=250, a bar of height 100 must be positioned at y=150, height=100). Ensure it has clear axes, gridlines, data labels, and a title.
    - Format B: Line Graph. Render a clean line graph representing trends over 4 to 6 periods using raw SVG. Draw distinct data points connected by lines, with gridlines, axes, data labels, and a title.
    - Format C: Pie Chart or Donut Chart. Render a clean pie or donut chart representing shares or percentages using raw SVG paths (<path d=\"...\">) or SVG circle segments, with different filled colors for each slice, percentage labels, a clear legend, and a title.
    - Format D: Formatted Table. Provide a beautifully formatted markdown table with columns and rows showing statistical data (DO NOT use SVG code).
    - Format E: Combined Table and Chart. Provide both a formatted markdown table and a matching SVG chart (bar chart or line graph) to allow comprehensive interpretation of multi-variable data.
  * CRITICAL SVG RULES: Use a fixed viewBox='0 0 600 400' for charts. Ensure all text labels use <text> elements with clear font sizes and do not overlap with other visual elements. Keep any SVG code clean, well-structured, and minified without comments. The options should be plain text or numbers based on the data, and the explanation block must reference the specific data points.
  * CRITICAL HIDDEN MECHANICS: NEVER mention terms like 'SVG', 'SVG-visualized', 'scalable vector', or 'raw code' anywhere in the title, summary, or user-facing text. The end-user examinee should just read the text naturally; they do not need to know the images are SVGs. Refer to them simply as 'the chart', 'the image', or 'the pattern'.";
            } else {
                $categorySpecificRules = '- If it is standard verbal logic, you may use propositional variables.';
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
{$categorySpecificRules}
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
                            $body = $response->json();
                            $errorMsg = $body['error']['message'] ?? $response->body();

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
                            $body = $groqResponse->json();
                            $errorMsg = $body['error']['message'] ?? $groqResponse->body();

                            return false;
                        }
                    } catch (\Exception $e) {
                        $errorMsg = 'Groq Exception: '.$e->getMessage();

                        return false;
                    }
                };

                $success = false;
                $primaryIsGemini = str_starts_with($this->primaryModel, 'gemini');

                if ($primaryIsGemini) {
                    Log::info('GenerateLearnModuleJob: Attempting Gemini model: '.$this->primaryModel);
                    if ($attemptGemini($this->primaryModel)) {
                        $success = true;
                    } else {
                        Log::warning('GenerateLearnModuleJob: Gemini model '.$this->primaryModel.' failed: '.$errorMsg);
                    }
                } else {
                    Log::info('GenerateLearnModuleJob: Attempting Groq model: '.$this->primaryModel);
                    if ($attemptGroq($this->primaryModel)) {
                        $success = true;
                    } else {
                        Log::warning('GenerateLearnModuleJob: Groq model '.$this->primaryModel.' failed: '.$errorMsg);
                    }
                }

                if (! $success) {
                    Log::error('GenerateLearnModuleJob: AI generation failed using model: '.$this->primaryModel.'. Error: '.$errorMsg);
                    AiGenerationFailed::dispatch($this->userId, $errorMsg ?: 'AI Generation failed using the selected model.', 'module');

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

                Log::info('GenerateLearnModuleJob: Successfully generated module "'.($moduleData['title'] ?? $validated['topic']).'" for topic "'.$validated['topic'].'" using model '.$this->primaryModel.' for user '.$this->userId.'.');

                AiGenerationCompleted::dispatch($this->userId, 'Learning module generation completed! Check your drafts.', 'module');

            } catch (\Exception $e) {
                Log::error('GenerateLearnModuleJob: Error: '.$e->getMessage()."\n".$e->getTraceAsString());
                AiGenerationFailed::dispatch($this->userId, 'An unexpected error occurred during AI generation.', 'module');
            }
        } finally {
            if ($this->lockOwner) {
                $topic = $this->validated['topic'] ?? 'default';
                $lockKey = 'generate-learn-lock:'.Str::slug($topic);
                Cache::lock($lockKey, 180, $this->lockOwner)->release();
            }
        }
    }
}
