<?php

namespace App\Jobs;

use App\Events\AiGenerationCompleted;
use App\Events\AiGenerationFailed;
use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\UserAiAnalysis;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class GenerateUserAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;

    public $tries = 3;

    public function __construct(
        protected int $userId,
        protected int $latestAttemptId,
        protected string $primaryModel = 'llama-3.3-70b-versatile'
    ) {}

    public function handle(): void
    {
        set_time_limit(300);
        Log::info("GenerateUserAnalysisJob: Started for user {$this->userId} with attempt {$this->latestAttemptId}");

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

        $daysUntilExam = null;
        $examDateStr = 'Not set';
        if (Schema::hasTable('exam_dates')) {
            $examDate = ExamDate::where('is_active', true)
                ->where('date', '>', now())
                ->orderBy('date')
                ->first();
            if ($examDate) {
                $examDateCarbon = Carbon::parse($examDate->date);
                $daysUntilExam = now()->diffInDays($examDateCarbon, false);
                $examDateStr = $examDateCarbon->format('F j, Y');
            }
        }

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
        - Days Until Next Exam: " . ($daysUntilExam !== null ? "{$daysUntilExam} days (Exam Date: {$examDateStr})" : "No active exam date set") . "
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
                \"insight\": \"1 sentence explanation of why this rating was given\",
                \"recommended_action\": \"1 specific actionable step to improve or maintain this subject\"
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
            \"personalized_study_plan\": [
                // IMPORTANT: Generate a highly actionable 7-day study roadmap (Day 1 to Day 7) that directly maps to their diagnostic performance, is fully coherent with the 'days_to_readiness' estimation, and critically factors in the number of days remaining until their exam.
                // Coherence & Urgency Rules:
                // 1. Weakness Prioritization: Heavily prioritize the student's weakest categories and subtopics (specifically those identified under 'critical_weaknesses' or having the lowest accuracy scores in the breakdown). Day 1, Day 2, and Day 3 MUST focus primarily on these highest-priority weak areas.
                // 2. Density & Urgency: If the user requires a lot of prep (e.g., 'days_to_readiness' indicates they need 30+ or 60+ days of intensive practice, or their weaknesses are severe), OR if their actual exam is very close (e.g., less than 30 days away), do NOT suggest just 1 simple topic per day. Instead, suggest multiple intensive study tasks per day (e.g., 2 or 3 distinct subtopics or activities on Day 1, Day 2, etc.) to match the density and urgency of their study timeline.
                // 3. Extreme Urgency: If the exam is extremely close (e.g., under 10 days away) and they still have critical concern areas, prioritize maximum density (3+ distinct tasks covering key weak areas daily) to cover as much ground as possible.
                // 4. Stable Maintenance: Conversely, if they are close to passing and the exam is far away, suggest lighter focus areas (1 targeted topic per day).
                // 5. Strict Uniqueness Rule: Ensure each focus_topic and subcategory suggested across the entire 7 days is completely unique. Do NOT duplicate or repeat the exact same subcategory_id or focus_topic (e.g., if you suggest 'Numerical Ability: Fractions' on Day 1, do NOT suggest it again on Day 3; instead, suggest different subtopics like 'Decimals', 'Word Problems', etc.). Every day should cover distinct topics to maximize breadth of study coverage.
                // Do NOT limit yourself to short descriptions; write detailed, clear, and fully descriptive focus_topic names and activity descriptions so the student knows exactly what to study.
                {
                \"day\": \"string (e.g., 'Day 1')\",
                \"tasks\": [
                    {
                    \"focus_topic\": \"string (e.g., 'Numerical Ability: Fractions & Decimals Word Problems')\",
                    \"activity\": \"string (e.g., 'Review fractional conversions, work on 15 long-form practice drills, and note time spent per question.')\",
                    \"subcategory_id\": integer|null (referencing the matching ID from the available subcategories list provided, or null if none fit)
                    }
                ]
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
                                                    'recommended_action' => ['type' => 'STRING'],
                                                ],
                                                'required' => ['subject', 'rating', 'color', 'insight', 'recommended_action'],
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
                                        'personalized_study_plan' => [
                                            'type' => 'ARRAY',
                                            'items' => [
                                                'type' => 'OBJECT',
                                                'properties' => [
                                                    'day' => ['type' => 'STRING'],
                                                    'tasks' => [
                                                        'type' => 'ARRAY',
                                                        'items' => [
                                                            'type' => 'OBJECT',
                                                            'properties' => [
                                                                'focus_topic' => ['type' => 'STRING'],
                                                                'activity' => ['type' => 'STRING'],
                                                                'subcategory_id' => ['type' => 'INTEGER'],
                                                            ],
                                                            'required' => ['focus_topic', 'activity'],
                                                        ],
                                                    ],
                                                ],
                                                'required' => ['day', 'tasks'],
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

            $isGemini = str_starts_with($this->primaryModel, 'gemini-');

            if ($isGemini) {
                Log::info("GenerateUserAnalysisJob: Calling Gemini API with model: {$this->primaryModel}");
                $success = $attemptGemini($this->primaryModel);
                Log::info('GenerateUserAnalysisJob: Gemini API responded. Success: '.($success ? 'true' : 'false'));
            } else {
                Log::info("GenerateUserAnalysisJob: Calling Groq API with model: {$this->primaryModel}");
                $success = $attemptGroq($this->primaryModel);
                Log::info('GenerateUserAnalysisJob: Groq API responded. Success: '.($success ? 'true' : 'false'));
            }

            if (! $success) {
                Log::error('GenerateUserAnalysisJob: AI generation model failed: '.$errorMsg);
                Cache::put("ai-analysis-failed-{$this->userId}", true, 300);
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

                Log::info("GenerateUserAnalysisJob: Successfully saved analysis and dispatched event for user {$this->userId}.");
                event(new AiGenerationCompleted($this->userId, 'analysis', 'analysis'));

                return;
            }

            Log::error('GenerateUserAnalysisJob: API failed or returned invalid JSON structure. Raw output: '.substr($text, 0, 500));
            Cache::put("ai-analysis-failed-{$this->userId}", true, 300);
            event(new AiGenerationFailed($this->userId, 'analysis', 'analysis'));

        } catch (\Exception $e) {
            Log::error('GenerateUserAnalysisJob Exception: '.$e->getMessage()."\n".$e->getTraceAsString());
            Cache::put("ai-analysis-failed-{$this->userId}", true, 300);
            event(new AiGenerationFailed($this->userId, 'analysis', 'analysis'));
        } finally {
            Cache::forget("ai-analysis-generating-{$this->userId}");
        }
    }
}
