<?php

namespace App\Jobs;

use App\Events\AiGenerationCompleted;
use App\Models\UserAiAnalysis;
use App\Services\DeterministicAnalysisService;
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
        protected int $latestAttemptId,
        protected string $primaryModel = 'llama-3.3-70b-versatile'
    ) {}

    public function handle(): void
    {
        set_time_limit(300);
        Log::info("GenerateUserAnalysisJob: Started for user {$this->userId} with attempt {$this->latestAttemptId}");

        try {
            $deterministicService = new DeterministicAnalysisService;
            $deterministicData = $deterministicService->generate($this->userId, $this->latestAttemptId);

            $groqKey = config('services.groq.key') ?: env('GROQ_API_KEY');
            $geminiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
            $aiAnalysisEnabled = config('services.ai.analysis_enabled');

            if (! $aiAnalysisEnabled || (! $groqKey && ! $geminiKey)) {
                Log::info('GenerateUserAnalysisJob: AI analysis is disabled or API keys are missing. Saving deterministic analysis directly.');
                UserAiAnalysis::updateOrCreate(
                    ['user_id' => $this->userId],
                    [
                        'last_exam_attempt_id' => $this->latestAttemptId,
                        'analysis_json' => $deterministicData,
                    ]
                );
                event(new AiGenerationCompleted($this->userId, 'analysis', 'analysis'));

                return;
            }

            $systemPrompt = "
        Your task is to rewrite the verbal commentary fields to make them highly personalized, coaching-oriented, professional, and natural.
        
        CRITICAL RULES:
        1. Rewrite only the following text fields: `verdict`, `encouragement`, the `insight` and `recommended_action` in `subject_mastery`, and the `reason_for_struggle` and `coaching_tip` in `remediation_matrix`.
        2. Keep the mathematical values, percentages, category/subject names, and study plan structure EXACTLY as provided. Do not invent new subjects or category names.
        3. Every subject name in `subject_mastery`, `strengths`, and `critical_weaknesses` must strictly use the exact spelling of the 5 standard categories: 'Verbal Ability', 'Clerical Ability', 'General Information', 'Numerical Ability', and 'Analytical Ability'.
        4. You must respond ONLY with a valid JSON object matching the provided schema.";

            $userPrompt = 'Here is the computed deterministic analysis data for the student:
        '.json_encode($deterministicData).'
        
        Please rewrite the verbal fields to make them sound like a highly supportive, professional, and personalized Philippines CSE coach. Make sure all numerical facts and structure are strictly preserved.';

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

            Log::info("GenerateUserAnalysisJob: Calling Gemini API with model: {$this->primaryModel}");
            $success = $attemptGemini($this->primaryModel);
            Log::info('GenerateUserAnalysisJob: Gemini API responded. Success: '.($success ? 'true' : 'false'));

            if (! $success) {
                Log::warning('GenerateUserAnalysisJob: AI generation model failed, falling back to deterministic data: '.$errorMsg);
                UserAiAnalysis::updateOrCreate(
                    ['user_id' => $this->userId],
                    [
                        'last_exam_attempt_id' => $this->latestAttemptId,
                        'analysis_json' => $deterministicData,
                    ]
                );
                event(new AiGenerationCompleted($this->userId, 'analysis', 'analysis'));

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

            Log::warning('GenerateUserAnalysisJob: AI returned invalid JSON structure, falling back to deterministic data.');
            UserAiAnalysis::updateOrCreate(
                ['user_id' => $this->userId],
                [
                    'last_exam_attempt_id' => $this->latestAttemptId,
                    'analysis_json' => $deterministicData,
                ]
            );
            event(new AiGenerationCompleted($this->userId, 'analysis', 'analysis'));

        } catch (\Exception $e) {
            Log::error('GenerateUserAnalysisJob Exception, falling back to deterministic data: '.$e->getMessage());
            UserAiAnalysis::updateOrCreate(
                ['user_id' => $this->userId],
                [
                    'last_exam_attempt_id' => $this->latestAttemptId,
                    'analysis_json' => $deterministicData,
                ]
            );
            event(new AiGenerationCompleted($this->userId, 'analysis', 'analysis'));
        } finally {
            Cache::forget("ai-analysis-generating-{$this->userId}");
        }
    }
}
