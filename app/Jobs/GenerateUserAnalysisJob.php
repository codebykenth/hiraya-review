<?php

namespace App\Jobs;

use App\Events\AiGenerationCompleted;
use App\Events\AiGenerationFailed;
use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\UserAiAnalysis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateUserAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;

    public $tries = 3;

    public function __construct(
        protected int $userId,
        protected int $latestAttemptId
    ) {}

    public function handle(): void
    {
        set_time_limit(300);

        $groqKey = config('services.groq.key') ?: env('GROQ_API_KEY');
        $geminiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
        if (! $groqKey && ! $geminiKey) {
            Log::error('GenerateUserAnalysisJob: Both GROQ_API_KEY and GEMINI_API_KEY are missing.');
            event(new AiGenerationFailed($this->userId, 'analysis', 'analysis'));

            return;
        }

        $allAttempts = ExamAttempt::where('user_id', $this->userId)->orderBy('created_at', 'asc')->get();
        $totalAttempts = $allAttempts->count();

        if ($totalAttempts === 0) {
            return;
        }

        $scores = [];
        $totalScoreSum = 0;
        $mockExamCount = 0;
        $passCount = 0;

        $categoriesMap = Category::all()->keyBy('id');

        $categoryTotals = [
            'Verbal Ability' => ['correct' => 0, 'total' => 0],
            'Clerical Ability' => ['correct' => 0, 'total' => 0],
            'General Information' => ['correct' => 0, 'total' => 0],
            'Numerical Ability' => ['correct' => 0, 'total' => 0],
            'Analytical Ability' => ['correct' => 0, 'total' => 0],
        ];

        foreach ($allAttempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $correct = $meta['correct_count'] ?? 0;
            $total = $meta['total_questions'] ?? count($attempt->question_ids);
            $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;

            $scores[] = $percentage;
            $totalScoreSum += $percentage;

            $track = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! isset($meta['track'])) {
                $track = 'Drill';
            }

            if ($track !== 'Drill') {
                $mockExamCount++;
                if ($percentage >= 80) {
                    $passCount++;
                }
            }

            $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? [];
            if (! empty($scoreMap)) {
                foreach ($scoreMap as $catName => $scoreData) {
                    $normalizedCat = $catName;
                    if (str_contains($catName, 'Verbal')) {
                        $normalizedCat = 'Verbal Ability';
                    }
                    if (str_contains($catName, 'Clerical')) {
                        $normalizedCat = 'Clerical Ability';
                    }
                    if (str_contains($catName, 'General')) {
                        $normalizedCat = 'General Information';
                    }
                    if (str_contains($catName, 'Numerical')) {
                        $normalizedCat = 'Numerical Ability';
                    }
                    if (str_contains($catName, 'Analytical')) {
                        $normalizedCat = 'Analytical Ability';
                    }

                    if (isset($categoryTotals[$normalizedCat])) {
                        $categoryTotals[$normalizedCat]['correct'] += $scoreData['correct'] ?? 0;
                        $categoryTotals[$normalizedCat]['total'] += $scoreData['total'] ?? 0;
                    }
                }
            } else {
                $drillCatId = $attempt->category_id;
                $drillCategoryName = null;
                if ($drillCatId && isset($categoriesMap[$drillCatId])) {
                    $drillCategoryName = $categoriesMap[$drillCatId]->name;
                } elseif (isset($meta['category_name'])) {
                    $drillCategoryName = $meta['category_name'];
                }

                if ($drillCategoryName) {
                    $normalizedCat = $drillCategoryName;
                    if (str_contains($drillCategoryName, 'Verbal')) {
                        $normalizedCat = 'Verbal Ability';
                    }
                    if (str_contains($drillCategoryName, 'Clerical')) {
                        $normalizedCat = 'Clerical Ability';
                    }
                    if (str_contains($drillCategoryName, 'General')) {
                        $normalizedCat = 'General Information';
                    }
                    if (str_contains($drillCategoryName, 'Numerical')) {
                        $normalizedCat = 'Numerical Ability';
                    }
                    if (str_contains($drillCategoryName, 'Analytical')) {
                        $normalizedCat = 'Analytical Ability';
                    }

                    if (isset($categoryTotals[$normalizedCat])) {
                        $categoryTotals[$normalizedCat]['correct'] += $correct;
                        $categoryTotals[$normalizedCat]['total'] += $total;
                    }
                }
            }
        }

        $avgScore = round($totalScoreSum / $totalAttempts);
        $passingRate = $mockExamCount > 0 ? round(($passCount / $mockExamCount) * 100) : 0;

        $categoryBreakdown = [];
        foreach ($categoryTotals as $catName => $data) {
            if ($data['total'] > 0) {
                $categoryBreakdown[$catName] = [
                    'correct' => $data['correct'],
                    'total' => $data['total'],
                    'percentage' => round(($data['correct'] / $data['total']) * 100).'%',
                ];
            }
        }

        // Calculate accurate per-subtopic correctness from historical responses
        $subtopicStats = [];
        $allQuestionIds = [];
        foreach ($allAttempts as $attempt) {
            if ($attempt->question_ids) {
                $allQuestionIds = array_merge($allQuestionIds, $attempt->question_ids);
            }
        }
        $allQuestionIds = array_unique($allQuestionIds);

        $questionsMap = [];
        if (! empty($allQuestionIds)) {
            $questionsMap = Question::whereIn('id', $allQuestionIds)
                ->with('subcategory')
                ->get()
                ->keyBy('id');
        }

        foreach ($allAttempts as $attempt) {
            $answers = $attempt->answers ?? [];
            if (empty($answers)) {
                continue;
            }
            foreach ($attempt->question_ids as $qId) {
                if (! isset($questionsMap[$qId])) {
                    continue;
                }
                $q = $questionsMap[$qId];
                $subcatName = $q->subcategory?->name ?? 'General Info';
                $userAns = $answers[$qId] ?? null;
                $isCorrect = ($userAns === $q->correct_option);

                if (! isset($subtopicStats[$subcatName])) {
                    $subtopicStats[$subcatName] = ['correct' => 0, 'total' => 0];
                }
                $subtopicStats[$subcatName]['total']++;
                if ($isCorrect) {
                    $subtopicStats[$subcatName]['correct']++;
                }
            }
        }

        $subtopicBreakdown = [];
        foreach ($subtopicStats as $subcatName => $data) {
            if ($data['total'] > 0) {
                $pct = round(($data['correct'] / $data['total']) * 100);
                $subtopicBreakdown[$subcatName] = "{$pct}% accuracy ({$data['correct']}/{$data['total']} correct)";
            }
        }

        // Fetch available subcategories in the system database with parent categories
        $availableSubcategories = Subcategory::with('category')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'category_name' => $s->category?->name,
        ])->toArray();

        $systemPrompt = "
        You are an expert Civil Service Exam (CSE) coach in the Philippines. Analyze the student's exam performance data and produce a highly comprehensive and predictive diagnostic report. Be direct, encouraging but honest. Do not sugarcoat poor performance. Respond ONLY with a valid JSON object.

        CRITICAL ACCURACY RULES:
        1. You MUST evaluate and base the subject_mastery rating and color strictly on the actual categoryBreakdown accuracy percentages passed to you:
        - 80% or above accuracy: 'Mastered' (emerald)
        - 60% to 79% accuracy: 'Needs Practice' (amber)
        - below 60% accuracy: 'Critical Concern' (rose)
        - No attempts or 0% total questions: 'Insufficient Data' (sky)
        2. You must NOT guess or make up rating scores, mock pass confidence levels, or trends outside these direct relationships.
        3. Make sure all recommendations and action plans correspond exactly to the available subcategories provided. Do not invent subtopics that are not in the list.
        4. Every subcategory listed in recommended_modules MUST strictly belong to one of the category names listed in critical_weaknesses to prevent student confusion. Do not suggest subcategories from outside your identified critical weaknesses.
        5. All subject names in subject_mastery, strengths, and critical_weaknesses MUST strictly use the exact spelling of the 5 standard categories: 'Verbal Ability', 'Clerical Ability', 'General Information', 'Numerical Ability', and 'Analytical Ability'. Do not abbreviate or invent category names.";

        $userPrompt = "Analyze this student's exam performance:
        - Total Attempts: {$totalAttempts}
        - Average Score: {$avgScore}%
        - Passing Rate (Full Mock Exams): {$passingRate}%
        - Score Trend (oldest to newest): ".json_encode($scores).'
        - Per-category accuracy breakdown across all attempts: '.json_encode($categoryBreakdown).'
        - Detailed subtopic performance (actual answers): '.json_encode($subtopicBreakdown).'
        - Available subcategories in our database: '.json_encode($availableSubcategories)."

        Expected JSON response schema:
        {
            \"pass_probability\": integer 0-100,
            \"verdict\": \"1-2 sentence honest assessment\",
            \"trend\": \"improving|declining|stable|insufficient_data\",
            \"strengths\": [\"category name\"],
            \"critical_weaknesses\": [\"worst category first, max 3\"],
            \"priority_action\": \"one specific actionable thing to do today\",
            \"recommended_modules\": [\"subcategory names to study, max 3\"],
            \"encouragement\": \"1 sentence motivation\",
            
            \"predictive_metrics\": {
                \"estimated_exam_score\": \"string (e.g., '72% - 76% predicted actual score')\",
                \"days_to_readiness\": \"string (e.g., '25 days of targeted practice')\",
                \"completion_pace\": \"string (1 concise sentence explaining pace, e.g., 'Fast but prone to careless errors.')\",
                \"mock_pass_confidence\": \"high|moderate|low\"
            },
            \"subject_mastery\": [
                {
                \"subject\": \"string (e.g., 'Numerical Ability')\",
                \"rating\": \"string (e.g., 'Needs Practice' or 'Mastered' or 'Critical Concern')\",
                \"color\": \"rose|amber|emerald|sky\",
                \"insight\": \"1 sentence explanation of why this rating was given\"
                }
            ],
            \"timeline_prediction\": {
                \"current_stage\": \"string (e.g., 'Foundation Building')\",
                \"milestone_prediction\": \"1 sentence prediction of what they can achieve in 10 days if they study\",
                \"potential_score_improvement\": \"string (e.g., '+15% with consistent practice')\"
            },
            \"remediation_matrix\": [
                {
                \"subtopic\": \"string (e.g., 'Word Analogy')\",
                \"difficulty_level\": \"Hard|Medium|Easy\",
                \"reason_for_struggle\": \"1 concise reason why they might be failing\",
                \"coaching_tip\": \"1 highly specific study tactic for this subtopic\"
                }
            ],
            \"personalized_7_day_plan\": [
                // This must be a dynamic plan of days (minimum 7 days, maximum 14 days) exactly aligning with your estimation in days_to_readiness (e.g. if you estimate '10 days of targeted practice', generate 10 days; if you estimate 14 or more days, generate exactly 14 days representing the first crucial phase).
                {
                \"day\": \"string (e.g., 'Day 1')\",
                \"focus_topic\": \"string (e.g., 'Numerical: Fractions & Decimals')\",
                \"activity\": \"string (e.g., 'Solve 20 practice questions')\",
                \"subcategory_id\": integer|null (referencing the matching ID from the available subcategories list provided, or null if none fit)
                }
            ],
            \"long_term_roadmap\": [
                // If their days_to_readiness is longer than 14 days (e.g., 25 days or 60 days), supply a high-level weekly milestone plan here for the phases after Day 14 (e.g. Weeks 3-4, Weeks 5-6, etc.) up to their total estimated readiness window. Focus on category consolidation and mock sprints. If readiness is 14 days or less, you can leave this empty.
                {
                \"phase\": \"string (e.g., 'Phase 2 (Weeks 3-4)')\",
                \"focus\": \"string (e.g., 'Core Numerical & Verbal Mastery')\",
                \"milestone\": \"string (e.g., 'Achieve >75% correctness on fractions & vocabulary drills')\"
                }
            ]
        }";

        try {
            $resultText = null;
            $errorMsg = null;

            $attemptGemini = function ($model = 'gemini-3.5-flash') use ($geminiKey, $systemPrompt, $userPrompt, &$resultText, &$errorMsg) {
                if (! $geminiKey) {
                    $errorMsg = 'GEMINI_API_KEY is missing.';

                    return false;
                }
                try {
                    $response = Http::withHeaders([
                        'x-goog-api-key' => $geminiKey,
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
                                        'pass_probability' => ['type' => 'INTEGER'],
                                        'verdict' => ['type' => 'STRING'],
                                        'trend' => ['type' => 'STRING'],
                                        'strengths' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                                        'critical_weaknesses' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                                        'priority_action' => ['type' => 'STRING'],
                                        'recommended_modules' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                                        'encouragement' => ['type' => 'STRING'],
                                        'predictive_metrics' => [
                                            'type' => 'OBJECT',
                                            'properties' => [
                                                'estimated_exam_score' => ['type' => 'STRING'],
                                                'days_to_readiness' => ['type' => 'STRING'],
                                                'completion_pace' => ['type' => 'STRING'],
                                                'mock_pass_confidence' => ['type' => 'STRING'],
                                            ],
                                            'required' => ['estimated_exam_score', 'days_to_readiness', 'completion_pace', 'mock_pass_confidence'],
                                        ],
                                        'subject_mastery' => [
                                            'type' => 'ARRAY',
                                            'items' => [
                                                'type' => 'OBJECT',
                                                'properties' => [
                                                    'subject' => ['type' => 'STRING'],
                                                    'rating' => ['type' => 'STRING'],
                                                    'color' => ['type' => 'STRING'],
                                                    'insight' => ['type' => 'STRING'],
                                                ],
                                                'required' => ['subject', 'rating', 'color', 'insight'],
                                            ],
                                        ],
                                        'timeline_prediction' => [
                                            'type' => 'OBJECT',
                                            'properties' => [
                                                'current_stage' => ['type' => 'STRING'],
                                                'milestone_prediction' => ['type' => 'STRING'],
                                                'potential_score_improvement' => ['type' => 'STRING'],
                                            ],
                                            'required' => ['current_stage', 'milestone_prediction', 'potential_score_improvement'],
                                        ],
                                        'remediation_matrix' => [
                                            'type' => 'ARRAY',
                                            'items' => [
                                                'type' => 'OBJECT',
                                                'properties' => [
                                                    'subtopic' => ['type' => 'STRING'],
                                                    'difficulty_level' => ['type' => 'STRING'],
                                                    'reason_for_struggle' => ['type' => 'STRING'],
                                                    'coaching_tip' => ['type' => 'STRING'],
                                                ],
                                                'required' => ['subtopic', 'difficulty_level', 'reason_for_struggle', 'coaching_tip'],
                                            ],
                                        ],
                                        'personalized_7_day_plan' => [
                                            'type' => 'ARRAY',
                                            'items' => [
                                                'type' => 'OBJECT',
                                                'properties' => [
                                                    'day' => ['type' => 'STRING'],
                                                    'focus_topic' => ['type' => 'STRING'],
                                                    'activity' => ['type' => 'STRING'],
                                                    'subcategory_id' => ['type' => 'INTEGER'],
                                                ],
                                                'required' => ['day', 'focus_topic', 'activity'],
                                            ],
                                        ],
                                        'long_term_roadmap' => [
                                            'type' => 'ARRAY',
                                            'items' => [
                                                'type' => 'OBJECT',
                                                'properties' => [
                                                    'phase' => ['type' => 'STRING'],
                                                    'focus' => ['type' => 'STRING'],
                                                    'milestone' => ['type' => 'STRING'],
                                                ],
                                                'required' => ['phase', 'focus', 'milestone'],
                                            ],
                                        ],
                                    ],
                                    'required' => [
                                        'pass_probability', 'verdict', 'trend', 'strengths',
                                        'critical_weaknesses', 'priority_action', 'recommended_modules',
                                        'encouragement',
                                    ],
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

            $attemptGroq = function ($model) use ($groqKey, $systemPrompt, $userPrompt, &$resultText, &$errorMsg) {
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

            $success = false;

            // Try Groq first for analysis as standard
            foreach ($groqModels as $model) {
                Log::info('GenerateUserAnalysisJob: Attempting Groq model: '.$model);
                if ($attemptGroq($model)) {
                    $success = true;
                    break;
                }
                Log::warning('GenerateUserAnalysisJob: Groq model '.$model.' failed: '.$errorMsg);
            }

            // Fallback to Gemini
            if (! $success) {
                foreach ($geminiModels as $model) {
                    Log::info('GenerateUserAnalysisJob: Attempting Gemini fallback model: '.$model);
                    if ($attemptGemini($model)) {
                        $success = true;
                        break;
                    }
                    Log::warning('GenerateUserAnalysisJob: Gemini model '.$model.' failed: '.$errorMsg);
                }
            }

            if (! $success) {
                Log::error('GenerateUserAnalysisJob: All AI generation models failed.');
                event(new AiGenerationFailed($this->userId, 'analysis', 'analysis'));

                return;
            }

            $text = trim($resultText);
            if (str_starts_with($text, '```')) {
                $text = preg_replace('/^```(?:json)?\n?|```$/', '', $text);
            }
            $text = trim($text);

            $decoded = json_decode($text, true);

            if ($decoded && isset($decoded['pass_probability'], $decoded['verdict'])) {
                UserAiAnalysis::updateOrCreate(
                    ['user_id' => $this->userId],
                    [
                        'last_exam_attempt_id' => $this->latestAttemptId,
                        'analysis_json' => $decoded,
                    ]
                );

                event(new AiGenerationCompleted($this->userId, 'analysis', 'analysis'));

                return;
            }

            Log::error('GenerateUserAnalysisJob: API failed or returned invalid JSON structure.');
            event(new AiGenerationFailed($this->userId, 'analysis', 'analysis'));

        } catch (\Exception $e) {
            Log::error('GenerateUserAnalysisJob Exception: '.$e->getMessage());
            event(new AiGenerationFailed($this->userId, 'analysis', 'analysis'));
        } finally {
            Cache::forget("ai-analysis-generating-{$this->userId}");
        }
    }
}
