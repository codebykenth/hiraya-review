<?php

namespace App\Jobs;

use App\Models\Category;
use App\Models\Question;
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

class GenerateQuestionsJob implements ShouldQueue
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
        set_time_limit(300);
        $validated = $this->validated;

        $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (! $apiKey) {
            Log::error('GenerateQuestionsJob: GEMINI_API_KEY is missing.');
            return;
        }

        $systemPrompt = "You are a professional Civil Service Exam reviewer writer in the Philippines.
Generate multiple-choice questions that are challenging, syllabus-aligned, and strictly realistic according to the official CSC Exam Scope.

Official Category & Subcategory Schema:
- General Information: 'Philippine Constitution', 'Code of Conduct and Ethical Standards (R.A. 6713)', 'Peace and Human Rights Issues and Concepts', 'Environment Management and Protection'
- Verbal Ability: 'Word meaning', 'Sentence completion', 'Error recognition', 'Sentence structure', 'Paragraph organization', 'Reading comprehension'
- Analytical Ability: 'Word analogy', 'Symbolic logic / abstract reasoning', 'Identifying assumptions and drawing conclusions', 'Data interpretation'
- Numerical Ability: 'Basic operations', 'Number sequence', 'Word problems'
- Clerical Ability: 'Filing', 'Spelling'

For 'Symbolic logic / abstract reasoning' questions, formulate rigorous conditional logic scenarios. In the question and explanation, always use sequential uppercase letters (A, B, C, D) for the logical propositions in sequence. In the explanation block, you MUST first explicitly define/tell what each variable represents (e.g., 'Let A = adhere to the Code of Conduct, B = avoid conflicts of interest, C = public trust is maintained, D = receive high integrity ratings') so the user can easily understand the symbols, and then represent formal deductive logic chains using standard operators (e.g. 'A -> B -> C -> D' or '~D -> ~C -> ~B -> ~A') to describe Modus Tollens or contraposition rules, ensuring they are rendered visually as interactive logic chains by the UI parser.

For 'Numerical Ability' questions, you MUST include a dedicated section in the explanation starting with '🧠 Mental Math Shortcut:' or 'Mental Math Shortcut:' that details the fastest and most efficient way to solve the problem mentally or via rapid approximation, showing standard exam cognitive shortcuts to save valuable time.

Return a valid JSON array of question objects. Do not include markdown wraps or block formatting (no ```json ... ```), return raw JSON text.
Each object in the array must contain:
1. 'stem': the question stem text or scenario.
2. 'category': strictly matching the category parameter.
3. 'subcategory': strictly matching the subcategory parameter.
4. 'options': an array of exactly 5 strings for choices (A to E).
5. 'correct_option': an integer index (0 for A, 1 for B, 2 for C, 3 for D, 4 for E) representing the correct choice.
6. 'explanation': a thorough explanation of the logic or steps leading to the correct answer.

Output format:
[
  {
    \"stem\": \"...\",
    \"category\": \"...\",
    \"subcategory\": \"...\",
    \"options\": [\"...\", \"...\", \"...\", \"...\", \"...\"],
    \"correct_option\": 0,
    \"explanation\": \"...\"
  }
]";

        $userPrompt = "Generate exactly {$validated['count']} multiple-choice questions for the following category and subcategory:
Category: {$validated['category']}
Subcategory: {$validated['subcategory']}
Language: {$validated['language']}
" . (!empty($validated['prompt']) ? "Additional Context/Directives: {$validated['prompt']}" : '');

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
                            'type' => 'ARRAY',
                            'items' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'stem' => [
                                        'type' => 'STRING',
                                        'description' => 'The question stem or scenario. If it includes a data table, represent it beautifully as a formatted text/markdown table.',
                                    ],
                                    'category' => ['type' => 'STRING'],
                                    'subcategory' => ['type' => 'STRING'],
                                    'options' => [
                                        'type' => 'ARRAY',
                                        'minItems' => 5,
                                        'maxItems' => 5,
                                        'items' => ['type' => 'STRING'],
                                    ],
                                    'correct_option' => ['type' => 'INTEGER'],
                                    'explanation' => [
                                        'type' => 'STRING',
                                        'description' => 'A detailed explanation of the steps leading to the correct option.',
                                    ],
                                ],
                                'required' => ['stem', 'category', 'subcategory', 'options', 'correct_option', 'explanation'],
                            ],
                        ],
                        'thinkingConfig' => [
                            'thinkingLevel' => 'high',
                        ],
                    ],
                ]
            );

            if ($response->failed()) {
                Log::error("GenerateQuestionsJob: API failed with status " . $response->status() . ": " . $response->body());
                return;
            }

            $result = $response->json();
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $text = trim($text);
            if (str_starts_with($text, '```')) {
                $text = preg_replace('/^```(?:json)?\n?|```$/', '', $text);
            }
            $text = trim($text);

            $questions = json_decode($text, true);
            if (! $questions || ! is_array($questions)) {
                Log::error('GenerateQuestionsJob: Invalid JSON structure. Raw output: ' . $text);
                return;
            }

            foreach ($questions as $q) {
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
                        'language' => $validated['language'],
                    ]
                );

                Question::create([
                    'subcategory_id' => $subcategory->id,
                    'language' => $validated['language'],
                    'stem' => $q['stem'] ?? '',
                    'options' => $q['options'] ?? [],
                    'correct_option' => (int) ($q['correct_option'] ?? 0),
                    'explanation' => $q['explanation'] ?? '',
                    'created_by' => $this->userId,
                    'status' => 'draft',
                ]);
            }

            Cache::forget('questions.all');
            Cache::forget('questions.active');
            Cache::forget('categories.tree');

        } catch (\Exception $e) {
            Log::error('GenerateQuestionsJob: Error: ' . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
        }
    }
}
