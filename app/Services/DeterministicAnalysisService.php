<?php

namespace App\Services;

use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\Question;
use App\Models\Subcategory;
use Illuminate\Support\Collection;

class DeterministicAnalysisService
{
    protected array $categories = [
        'Verbal Ability',
        'Clerical Ability',
        'General Information',
        'Numerical Ability',
        'Analytical Ability',
    ];

    /**
     * Generate deterministic analysis for a user's exam attempts.
     *
     * @return array<string, mixed>
     */
    public function generate(int $userId, int $latestAttemptId, bool $singleAttemptOnly = false): array
    {
        $attempts = $this->resolveAttempts($userId, $latestAttemptId, $singleAttemptOnly);
        if (! $attempts) {
            return $this->getEmptyAnalysis();
        }

        $metrics = $this->aggregateAttemptMetrics($attempts);
        $totalAttempts = $attempts->count();

        // Volume-weighted overall average calculation
        if ($metrics['mockTotalQuestions'] > 0) {
            $avgScore = (int) round(($metrics['mockTotalCorrect'] / $metrics['mockTotalQuestions']) * 100);
            $trendScores = ! empty($metrics['mockScores']) ? $metrics['mockScores'] : $metrics['scores'];
        } else {
            $avgScore = $metrics['allTotalQuestions'] > 0 ? (int) round(($metrics['allTotalCorrect'] / $metrics['allTotalQuestions']) * 100) : 0;
            $trendScores = ! empty($metrics['scores']) ? $metrics['scores'] : $metrics['mockScores'];
        }
        $passingRate = $metrics['mockExamCount'] > 0 ? round(($metrics['passCount'] / $metrics['mockExamCount']) * 100) : 0;

        $subtopicStats = $this->calculateSubtopicStats($attempts);
        $mastery = $this->evaluateSubjectMastery($metrics['categoryTotals']);
        $trend = $this->calculateTrend($trendScores);
        $examDate = $this->resolveExamDate();

        $prediction = $this->calculatePassPrediction(
            $metrics['mockExamCount'],
            $metrics['mockTotalCorrect'],
            $metrics['mockTotalQuestions'],
            $trend,
            $examDate['daysUntilExam'],
            $examDate['examDateStr']
        );

        $completionPace = $this->pickTemplate('completion_pace_'.$trend, compact('totalAttempts'));
        $remediation = $this->buildRemediationMatrix($subtopicStats, $mastery['criticalWeaknesses']);
        $studyPlan = $this->buildPersonalizedStudyPlan($remediation['recommendedSubcatIds'], $remediation['recommendedModules']);

        // Context-aware personalized text
        $scoreTier = $avgScore >= 80 ? 'high' : ($avgScore >= 60 ? 'mid' : 'low');
        $strengthsList = implode(' and ', array_slice($mastery['strengths'], 0, 2)) ?: 'none identified yet';
        $weakList = implode(' and ', array_slice($mastery['criticalWeaknesses'], 0, 2)) ?: 'none identified yet';
        $topModule = $remediation['recommendedModules'][0] ?? 'General Review';

        $daysUntilExam = $examDate['daysUntilExam'];
        $examDateStr = $examDate['examDateStr'];
        $passProbability = $prediction['passProbability'];
        $mockExamCount = $metrics['mockExamCount'];

        $templateVars = compact(
            'totalAttempts', 'avgScore', 'passProbability', 'daysUntilExam',
            'examDateStr', 'strengthsList', 'weakList', 'topModule',
            'mockExamCount', 'passingRate', 'trend'
        );

        if ($mockExamCount === 0) {
            $verdict = $metrics['allTotalQuestions'] > 0
                ? $this->pickTemplate('verdict_no_mock', $templateVars)
                : $this->pickTemplate('verdict_empty', []);
        } else {
            $verdict = $this->pickTemplate("verdict_{$scoreTier}", $templateVars);
        }

        $encouragement = $this->pickTemplate("encouragement_{$scoreTier}_{$trend}", $templateVars)
            ?? $this->pickTemplate("encouragement_{$scoreTier}", $templateVars);
        $priorityAction = count($remediation['recommendedModules']) > 0
            ? $this->pickTemplate('priority_action', $templateVars)
            : $this->pickTemplate('priority_action_none', $templateVars);

        return [
            'pass_probability' => $passProbability,
            'verdict' => $verdict,
            'trend' => $trend,
            'strengths' => $mastery['strengths'],
            'critical_weaknesses' => array_slice($mastery['criticalWeaknesses'], 0, 3),
            'priority_action' => $priorityAction,
            'recommended_modules' => array_slice($remediation['recommendedModules'], 0, 3),
            'encouragement' => $encouragement,
            'predictive_metrics' => [
                'estimated_exam_score' => $prediction['estimatedExamScore'],
                'days_to_readiness' => $prediction['daysToReadiness'],
                'completion_pace' => $completionPace,
                'mock_pass_confidence' => $prediction['mockPassConfidence'],
            ],
            'subject_mastery' => $mastery['subjectMastery'],
            'timeline_prediction' => [
                'current_stage' => $this->resolveCurrentStage($avgScore),
                'milestone_prediction' => $this->pickTemplate("milestone_{$scoreTier}", $templateVars),
                'potential_score_improvement' => $this->pickTemplate("improvement_{$scoreTier}", $templateVars),
            ],
            'remediation_matrix' => $remediation['remediationMatrix'],
            'personalized_study_plan' => $studyPlan,
        ];
    }

    /**
     * Resolve the collection of attempts to evaluate.
     *
     * @return Collection<int, ExamAttempt>|null
     */
    protected function resolveAttempts(int $userId, int $latestAttemptId, bool $singleAttemptOnly): ?Collection
    {
        // Limit evaluation to the latest 10 attempts to reflect current readiness rather than stale historical scores
        $allAttempts = ExamAttempt::where('user_id', $userId)->latest()->take(10)->get()->reverse()->values();

        if ($allAttempts->isEmpty()) {
            return null;
        }

        $latestAttempt = $allAttempts->firstWhere('id', $latestAttemptId) ?? ExamAttempt::find($latestAttemptId);
        if (! $latestAttempt) {
            return null;
        }

        if ($singleAttemptOnly) {
            return collect([$latestAttempt]);
        }

        $latestMeta = $latestAttempt->cat_scores['metadata'] ?? [];
        $latestTrack = $latestMeta['track'] ?? 'Drill';
        if ($latestAttempt->category_id !== null && ! isset($latestMeta['track'])) {
            $latestTrack = 'Drill';
        }

        if ($latestTrack === 'Drill') {
            $mostRecentMock = $allAttempts->reverse()->first(function (ExamAttempt $attempt): bool {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $track = $meta['track'] ?? 'Drill';
                if ($attempt->category_id !== null && ! isset($meta['track'])) {
                    $track = 'Drill';
                }

                return $track !== 'Drill';
            });
            if ($mostRecentMock) {
                $mockMeta = $mostRecentMock->cat_scores['metadata'] ?? [];
                $latestTrack = $mockMeta['track'] ?? 'Professional';
            } else {
                $latestTrack = 'Professional';
            }
        }

        $filteredAttempts = $allAttempts->filter(function (ExamAttempt $attempt) use ($latestTrack): bool {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $track = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! isset($meta['track'])) {
                $track = 'Drill';
            }

            return $track === $latestTrack || $track === 'Drill';
        });

        if ($filteredAttempts->count() === 0) {
            return null;
        }

        return $filteredAttempts;
    }

    /**
     * Aggregate volume-weighted scores, pass counts, and category totals.
     *
     * @param  Collection<int, ExamAttempt>  $attempts
     * @return array{
     *     scores: array<int, int>,
     *     mockScores: array<int, int>,
     *     mockExamCount: int,
     *     passCount: int,
     *     allTotalCorrect: int,
     *     allTotalQuestions: int,
     *     mockTotalCorrect: int,
     *     mockTotalQuestions: int,
     *     categoryTotals: array<string, array{correct: int, total: int}>
     * }
     */
    protected function aggregateAttemptMetrics(Collection $attempts): array
    {
        $scores = [];
        $mockScores = [];
        $mockExamCount = 0;
        $passCount = 0;
        $allTotalCorrect = 0;
        $allTotalQuestions = 0;
        $mockTotalCorrect = 0;
        $mockTotalQuestions = 0;

        $categoriesMap = Category::all()->keyBy('id');

        $categoryTotals = [];
        foreach ($this->categories as $cat) {
            $categoryTotals[$cat] = ['correct' => 0, 'total' => 0];
        }

        foreach ($attempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $correct = $meta['correct_count'] ?? 0;
            $total = $meta['total_questions'] ?? count($attempt->question_ids ?? []);
            $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;

            $track = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! isset($meta['track'])) {
                $track = 'Drill';
            }

            $allTotalCorrect += $correct;
            $allTotalQuestions += $total;

            if ($track !== 'Drill') {
                $mockExamCount++;
                $mockTotalCorrect += $correct;
                $mockTotalQuestions += $total;
                $mockScores[] = (int) $percentage;
                if ($percentage >= 80) {
                    $passCount++;
                }
            } else {
                $scores[] = (int) $percentage;
            }

            $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? [];
            if (! empty($scoreMap)) {
                foreach ($scoreMap as $catName => $scoreData) {
                    $normalizedCat = $this->normalizeCategory($catName);
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
                    $normalizedCat = $this->normalizeCategory($drillCategoryName);
                    if (isset($categoryTotals[$normalizedCat])) {
                        $categoryTotals[$normalizedCat]['correct'] += $correct;
                        $categoryTotals[$normalizedCat]['total'] += $total;
                    }
                }
            }
        }

        return [
            'scores' => $scores,
            'mockScores' => $mockScores,
            'mockExamCount' => $mockExamCount,
            'passCount' => $passCount,
            'allTotalCorrect' => $allTotalCorrect,
            'allTotalQuestions' => $allTotalQuestions,
            'mockTotalCorrect' => $mockTotalCorrect,
            'mockTotalQuestions' => $mockTotalQuestions,
            'categoryTotals' => $categoryTotals,
        ];
    }

    /**
     * Compute correctness counts per subtopic from attempt answers.
     *
     * @param  Collection<int, ExamAttempt>  $attempts
     * @return array<string, array{correct: int, total: int}>
     */
    protected function calculateSubtopicStats(Collection $attempts): array
    {
        $subtopicStats = [];
        $allQuestionIds = [];
        foreach ($attempts as $attempt) {
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

        foreach ($attempts as $attempt) {
            $answers = $attempt->answers ?? [];
            if (empty($answers) || empty($attempt->question_ids)) {
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

        return $subtopicStats;
    }

    /**
     * Evaluate subject mastery, strengths, and critical weaknesses.
     *
     * @param  array<string, array{correct: int, total: int}>  $categoryTotals
     * @return array{
     *     categoryBreakdown: array<string, array{correct: int, total: int, percentage: float|int}>,
     *     strengths: array<int, string>,
     *     criticalWeaknesses: array<int, string>,
     *     subjectMastery: array<int, array{subject: string, rating: string, color: string, insight: string, recommended_action: string}>
     * }
     */
    protected function evaluateSubjectMastery(array $categoryTotals): array
    {
        $categoryBreakdown = [];
        foreach ($categoryTotals as $catName => $data) {
            $categoryBreakdown[$catName] = [
                'correct' => $data['correct'],
                'total' => $data['total'],
                'percentage' => $data['total'] > 0 ? round(($data['correct'] / $data['total']) * 100) : 0,
            ];
        }

        $strengths = [];
        $weaknesses = [];
        $subjectMastery = [];

        foreach ($categoryBreakdown as $subject => $data) {
            $pct = $data['percentage'];
            $totalQ = $data['total'];

            if ($totalQ === 0) {
                $rating = 'Insufficient Data';
                $color = 'sky';
                $insight = $this->pickTemplate('insight_no_data', compact('subject'));
                $action = $this->pickTemplate('action_no_data', compact('subject'));
            } elseif ($pct >= 80) {
                $rating = 'Mastered';
                $color = 'emerald';
                $insight = $this->pickTemplate('insight_mastered', compact('subject', 'pct'));
                $action = $this->pickTemplate('action_mastered', compact('subject'));
                $strengths[] = $subject;
            } elseif ($pct >= 60) {
                $rating = 'Needs Practice';
                $color = 'amber';
                $insight = $this->pickTemplate('insight_moderate', compact('subject', 'pct'));
                $action = $this->pickTemplate('action_moderate', compact('subject'));
                $weaknesses[$subject] = $pct;
            } else {
                $rating = 'Critical Concern';
                $color = 'rose';
                $insight = $this->pickTemplate('insight_critical', compact('subject', 'pct'));
                $action = $this->pickTemplate('action_critical', compact('subject'));
                $weaknesses[$subject] = $pct;
            }

            $subjectMastery[] = [
                'subject' => $subject,
                'rating' => $rating,
                'color' => $color,
                'insight' => $insight,
                'recommended_action' => $action,
            ];
        }

        asort($weaknesses);
        $criticalWeaknesses = array_keys($weaknesses);

        if (empty($strengths) && empty($criticalWeaknesses)) {
            $criticalWeaknesses = [$this->categories[0]];
        }

        return [
            'categoryBreakdown' => $categoryBreakdown,
            'strengths' => $strengths,
            'criticalWeaknesses' => $criticalWeaknesses,
            'subjectMastery' => $subjectMastery,
        ];
    }

    /**
     * Determine trend direction based on historical score progression.
     *
     * @param  array<int, int>  $trendScores
     */
    protected function calculateTrend(array $trendScores): string
    {
        if (count($trendScores) >= 3) {
            $recent = array_slice($trendScores, -3);
            if ($recent[2] > $recent[0] + 5) {
                return 'improving';
            }
            if ($recent[2] < $recent[0] - 5) {
                return 'declining';
            }

            return 'stable';
        }

        if (count($trendScores) < 2) {
            return 'insufficient_data';
        }

        return 'stable';
    }

    /**
     * Resolve days until exam and formatted exam date string.
     *
     * @return array{daysUntilExam: int, examDateStr: string, description: string}
     */
    protected function resolveExamDate(): array
    {
        $targetExam = ExamDate::getNextActiveOrEstimated();

        return [
            'daysUntilExam' => $targetExam['days_until'],
            'examDateStr' => $targetExam['date_string'],
            'description' => $targetExam['description'],
        ];
    }

    /**
     * Calculate pass probability and mock predictive metrics.
     *
     * @return array{
     *     passProbability: int,
     *     estimatedExamScore: string,
     *     daysToReadiness: string,
     *     mockPassConfidence: string
     * }
     */
    protected function calculatePassPrediction(
        int $mockExamCount,
        int $mockTotalCorrect,
        int $mockTotalQuestions,
        string $trend,
        int $daysUntilExam,
        string $examDateStr
    ): array {
        if ($mockExamCount <= 0 || $mockTotalQuestions <= 0) {
            return [
                'passProbability' => 0,
                'estimatedExamScore' => 'Complete a Mock Exam to unlock score prediction',
                'daysToReadiness' => 'Complete a Mock Exam to estimate readiness timeline',
                'mockPassConfidence' => 'low',
            ];
        }

        $mockAvg = (int) round(($mockTotalCorrect / $mockTotalQuestions) * 100);
        $passProbability = (int) round($mockAvg * 0.9);
        if ($trend === 'improving') {
            $passProbability = min(98, $passProbability + 5);
        } elseif ($trend === 'declining') {
            $passProbability = max(5, $passProbability - 8);
        }
        $passProbability = max(0, min(100, $passProbability));

        $estimatedMin = max(0, $mockAvg - 4);
        $estimatedMax = min(100, $mockAvg + 4);
        $estimatedExamScore = "{$estimatedMin}% - {$estimatedMax}% predicted actual score";

        if ($daysUntilExam > 0 && $daysUntilExam <= 7) {
            if ($daysUntilExam <= 1) {
                $daysToReadiness = "Final 24-hour crunch review before exam day ({$examDateStr}).";
            } else {
                $daysToReadiness = "Urgent {$daysUntilExam}-day final sprint review before exam day ({$examDateStr}).";
            }
        } else {
            $daysToReadiness = $this->pickTemplate($mockAvg < 60 ? 'readiness_low' : ($mockAvg >= 80 ? 'readiness_high' : 'readiness_mid'), []);
        }

        $mockPassConfidence = 'moderate';
        if ($mockAvg >= 80) {
            $mockPassConfidence = 'high';
        } elseif ($mockAvg < 60) {
            $mockPassConfidence = 'low';
        }

        return [
            'passProbability' => $passProbability,
            'estimatedExamScore' => $estimatedExamScore,
            'daysToReadiness' => $daysToReadiness,
            'mockPassConfidence' => $mockPassConfidence,
        ];
    }

    /**
     * Build remediation matrix and recommended subcategories/modules based on weak subtopics.
     *
     * @param  array<string, array{correct: int, total: int}>  $subtopicStats
     * @param  array<int, string>  $criticalWeaknesses
     * @return array{
     *     remediationMatrix: array<int, array{subtopic: string, difficulty_level: string, reason_for_struggle: string, coaching_tip: string}>,
     *     recommendedSubcatIds: array<int, int>,
     *     recommendedModules: array<int, string>
     * }
     */
    protected function buildRemediationMatrix(array $subtopicStats, array $criticalWeaknesses): array
    {
        $subcategories = Subcategory::with('category')->get();

        $worstSubtopics = [];
        foreach ($subtopicStats as $subcatName => $data) {
            $pct = round(($data['correct'] / $data['total']) * 100);
            if ($pct < 75) {
                $worstSubtopics[$subcatName] = $pct;
            }
        }
        asort($worstSubtopics);

        $primaryWeakSubject = $criticalWeaknesses[0] ?? null;
        $remediationMatrix = [];
        $recommendedSubcatIds = [];
        $recommendedModules = [];

        $availableSubcatMap = [];
        foreach ($subcategories as $sub) {
            $availableSubcatMap[$sub->name] = $sub;
        }

        // 1. Prioritize worst subtopics belonging to the primary critical weakness subject
        if ($primaryWeakSubject) {
            foreach (array_keys($worstSubtopics) as $worstName) {
                if (isset($availableSubcatMap[$worstName])) {
                    $sub = $availableSubcatMap[$worstName];
                    if ($sub->category?->name === $primaryWeakSubject && ! in_array($sub->name, $recommendedModules, true)) {
                        $remediationMatrix[] = [
                            'subtopic' => $sub->name,
                            'difficulty_level' => 'Hard',
                            'reason_for_struggle' => $this->pickTemplate('struggle_reason_hard', ['subtopic' => $sub->name]),
                            'coaching_tip' => $this->pickTemplate('coaching_hard', ['subtopic' => $sub->name]),
                        ];
                        $recommendedSubcatIds[] = $sub->id;
                        $recommendedModules[] = $sub->name;
                        if (count($recommendedModules) >= 3) {
                            break;
                        }
                    }
                }
            }
        }

        // 2. If still need modules, add other worst subtopics
        if (count($recommendedModules) < 3) {
            foreach (array_keys($worstSubtopics) as $worstName) {
                if (isset($availableSubcatMap[$worstName])) {
                    $sub = $availableSubcatMap[$worstName];
                    if (! in_array($sub->name, $recommendedModules, true)) {
                        $remediationMatrix[] = [
                            'subtopic' => $sub->name,
                            'difficulty_level' => 'Hard',
                            'reason_for_struggle' => $this->pickTemplate('struggle_reason_hard', ['subtopic' => $sub->name]),
                            'coaching_tip' => $this->pickTemplate('coaching_hard', ['subtopic' => $sub->name]),
                        ];
                        $recommendedSubcatIds[] = $sub->id;
                        $recommendedModules[] = $sub->name;
                        if (count($recommendedModules) >= 3) {
                            break;
                        }
                    }
                }
            }
        }

        // 3. If still need modules, fill from critical weaknesses categories
        if (count($recommendedModules) < 3) {
            foreach ($criticalWeaknesses as $weakSubject) {
                foreach ($subcategories as $sub) {
                    if ($sub->category?->name === $weakSubject && ! in_array($sub->name, $recommendedModules, true)) {
                        $remediationMatrix[] = [
                            'subtopic' => $sub->name,
                            'difficulty_level' => 'Medium',
                            'reason_for_struggle' => $this->pickTemplate('struggle_reason_medium', ['subtopic' => $sub->name]),
                            'coaching_tip' => $this->pickTemplate('coaching_medium', ['subtopic' => $sub->name]),
                        ];
                        $recommendedSubcatIds[] = $sub->id;
                        $recommendedModules[] = $sub->name;
                        if (count($recommendedModules) >= 3) {
                            break 2;
                        }
                    }
                }
            }
        }

        return [
            'remediationMatrix' => $remediationMatrix,
            'recommendedSubcatIds' => $recommendedSubcatIds,
            'recommendedModules' => $recommendedModules,
        ];
    }

    /**
     * Build 7-day personalized study schedule tasks.
     *
     * @param  array<int, int>  $recommendedSubcatIds
     * @param  array<int, string>  $recommendedModules
     * @return array<int, array{day: string, tasks: array<int, array{focus_topic: string, activity: string, subcategory_id: int|null}>}>
     */
    protected function buildPersonalizedStudyPlan(array $recommendedSubcatIds, array $recommendedModules): array
    {
        $personalizedStudyPlan = [];
        for ($day = 1; $day <= 7; $day++) {
            $subcatIndex = ($day - 1) % max(1, count($recommendedSubcatIds));
            $subcatId = ! empty($recommendedSubcatIds) ? $recommendedSubcatIds[$subcatIndex] : null;
            $subcatName = ! empty($recommendedModules) ? $recommendedModules[$subcatIndex] : 'General Info';

            $personalizedStudyPlan[] = [
                'day' => "Day {$day}",
                'tasks' => [
                    [
                        'focus_topic' => "Targeted study: {$subcatName}",
                        'activity' => "Spend 30 minutes reading the modules for {$subcatName} and complete 10 topic drills.",
                        'subcategory_id' => $subcatId,
                    ],
                ],
            ];
        }

        return $personalizedStudyPlan;
    }

    /**
     * Resolve the current learning and readiness stage based on volume-weighted score.
     */
    protected function resolveCurrentStage(int $avgScore): string
    {
        if ($avgScore >= 85) {
            return 'Exam-Day Simulation';
        }
        if ($avgScore >= 80) {
            return 'Final Polish & Speed Drills';
        }
        if ($avgScore >= 70) {
            return 'Core Strengthening';
        }
        if ($avgScore >= 60) {
            return 'Concept Reinforcement';
        }

        return 'Foundation Building';
    }

    protected function normalizeCategory(string $catName): string
    {
        if (str_contains($catName, 'Verbal')) {
            return 'Verbal Ability';
        }
        if (str_contains($catName, 'Clerical')) {
            return 'Clerical Ability';
        }
        if (str_contains($catName, 'General')) {
            return 'General Information';
        }
        if (str_contains($catName, 'Numerical')) {
            return 'Numerical Ability';
        }
        if (str_contains($catName, 'Analytical')) {
            return 'Analytical Ability';
        }

        return $catName;
    }

    protected function getEmptyAnalysis(): array
    {
        return [
            'pass_probability' => 0,
            'verdict' => $this->pickTemplate('verdict_empty', []),
            'trend' => 'insufficient_data',
            'strengths' => [],
            'critical_weaknesses' => [],
            'priority_action' => $this->pickTemplate('priority_action_empty', []),
            'recommended_modules' => [],
            'encouragement' => $this->pickTemplate('encouragement_empty', []),
            'predictive_metrics' => [
                'estimated_exam_score' => 'N/A',
                'days_to_readiness' => 'N/A',
                'completion_pace' => 'N/A',
                'mock_pass_confidence' => 'low',
            ],
            'subject_mastery' => array_map(fn ($s) => [
                'subject' => $s,
                'rating' => 'Insufficient Data',
                'color' => 'sky',
                'insight' => $this->pickTemplate('insight_no_data', ['subject' => $s]),
                'recommended_action' => $this->pickTemplate('action_no_data', ['subject' => $s]),
            ], $this->categories),
            'timeline_prediction' => [
                'current_stage' => 'Evaluation Phase',
                'milestone_prediction' => $this->pickTemplate('milestone_empty', []),
                'potential_score_improvement' => $this->pickTemplate('improvement_empty', []),
            ],
            'remediation_matrix' => [],
            'personalized_study_plan' => [],
        ];
    }

    /**
     * Select a random template from a keyed pool and interpolate variables.
     */
    protected function pickTemplate(string $key, array $vars): string
    {
        $pool = $this->getTemplatePool($key);

        if ($pool->isEmpty()) {
            return '';
        }

        $template = $pool->random();

        foreach ($vars as $name => $value) {
            $template = str_replace("{{$name}}", (string) $value, $template);
        }

        return $template;
    }

    /**
     * Centralized template pools for all dynamic text.
     *
     * @return Collection<int, string>
     */
    protected function getTemplatePool(string $key): Collection
    {
        $pools = [
            // ── Verdicts ───────────────────────────────────────────
            'verdict_high' => [
                'Across {totalAttempts} attempts you\'ve reached {avgScore}% — you\'re in a strong position with {daysUntilExam} days to go.',
                'Your {avgScore}% average after {totalAttempts} attempts shows solid exam readiness. Stay sharp with timed drills before {examDateStr}.',
                'With {passProbability}% pass probability and strengths in {strengthsList}, you\'re on track. Fine-tune speed and accuracy in the final stretch.',
                'Impressive consistency — {avgScore}% across {totalAttempts} sessions. Channel your remaining {daysUntilExam} days into simulation exams.',
                '{totalAttempts} attempts, {avgScore}% average, and a {passProbability}% pass forecast. Lock in your strengths and sharpen weak edges.',
            ],
            'verdict_mid' => [
                'After {totalAttempts} attempts your average sits at {avgScore}%. Targeted work on {weakList} can push you past the 80% threshold.',
                'You\'re at {avgScore}% with {daysUntilExam} days left — closing the gap on {weakList} is the fastest path to a passing score.',
                'Your {totalAttempts}-attempt average of {avgScore}% is promising. Prioritizing {weakList} drills will accelerate your progress.',
                '{avgScore}% readiness after {totalAttempts} attempts. A focused sprint on your weaker areas before {examDateStr} can make the difference.',
                'Solid foundation at {avgScore}%. The next milestone: boost {weakList} performance to cross the 80% mark.',
            ],
            'verdict_low' => [
                'Your current {avgScore}% average across {totalAttempts} attempts indicates foundational gaps — but that\'s exactly what structured study fixes.',
                'At {avgScore}% after {totalAttempts} sessions, building strong basics in {weakList} is your top priority before {examDateStr}.',
                '{totalAttempts} attempts have mapped your weak spots clearly. Dedicate the next {daysUntilExam} days to core concepts in {weakList}.',
                'Your {avgScore}% baseline gives us a clear starting point. Focus on fundamentals and watch the numbers climb.',
                'Every expert was once a beginner — at {avgScore}% with {daysUntilExam} days left, a disciplined study plan can transform your scores.',
            ],
            'verdict_empty' => [
                'No exam attempts recorded yet. Complete your first mock exam or drill to unlock personalized analytics.',
                'Your performance dashboard is waiting for data — take a practice exam to get started.',
                'Start your first review session to unlock detailed readiness insights and study recommendations.',
            ],
            'verdict_no_mock' => [
                'You\'ve completed practice drills, but haven\'t taken a full Mock Exam yet. Complete a Professional or Sub-Professional Mock Exam to unlock your official CSE Passing Probability.',
                'Drill performance recorded! To unlock an accurate pass probability and exam score prediction, complete at least one full Mock Exam.',
                'Great effort on practice drills. Complete a full-length simulation exam (Professional or Sub-Professional) to calculate your overall exam readiness.',
            ],

            // ── Encouragement (by score tier + trend) ─────────────
            'encouragement_high' => [
                'You\'re doing outstanding work — maintain momentum and trust the process!',
                'Your dedication is paying off. Stay consistent and the exam will feel routine.',
                'Excellence is a habit, and yours is well-formed. Keep at it!',
                'The finish line is near and you\'re well-prepared. Confidence is earned — you\'ve earned it.',
            ],
            'encouragement_high_improving' => [
                'Your scores are climbing and you\'re already in the top tier — that\'s remarkable momentum!',
                'Upward trend at this level is impressive. You\'re sharpening an already strong edge.',
            ],
            'encouragement_high_declining' => [
                'A slight dip at high levels is normal fatigue — rest, reset, and you\'ll bounce right back.',
                'Don\'t let a small downtick shake your confidence. Your foundation is solid.',
            ],
            'encouragement_mid' => [
                'You\'re building real competence. Every drill moves you closer to passing.',
                'Steady progress adds up — keep your daily habit and you\'ll see the results compound.',
                'The gap between where you are and where you need to be is very closeable. Keep going!',
                'You\'re in the growth zone. This is where consistent practice creates breakthroughs.',
            ],
            'encouragement_mid_improving' => [
                'Your scores are trending up — this is exactly the momentum you need before exam day!',
                'Great trajectory! Each session is visibly improving your results.',
            ],
            'encouragement_mid_declining' => [
                'Scores may have dipped, but that often signals you\'re tackling harder material. That\'s growth.',
                'A temporary plateau is just a setup for a breakthrough. Refocus on weak spots and push through.',
            ],
            'encouragement_low' => [
                'The first step is always the hardest, and you\'ve already taken it. Build from here.',
                'Every high scorer once started where you are. Structured daily study will close the gap.',
                'Focus on one subject at a time and celebrate small wins. Progress compounds.',
                'Your weak areas are clearly identified — that\'s an advantage most test-takers don\'t have.',
            ],
            'encouragement_low_improving' => [
                'Your scores are moving in the right direction — proof that your effort is working!',
                'Improvement from a low base is the most impactful kind. Keep this momentum going!',
            ],
            'encouragement_low_declining' => [
                'It\'s okay to struggle — it means you\'re challenging yourself. Slow down and rebuild the basics.',
                'A downtrend now just means you need to refocus. Go back to fundamentals and rebuild.',
            ],
            'encouragement_empty' => [
                'Take the first step — one practice exam unlocks your entire study roadmap!',
                'Your journey begins with a single drill. Jump in and let the data guide you!',
                'Ready to find out where you stand? A quick mock exam gets things moving.',
            ],

            // ── Priority Actions ──────────────────────────────────
            'priority_action' => [
                'Complete a focused 30-minute study session on {topModule} today.',
                'Tackle a {topModule} drill right now to reinforce your weakest area.',
                'Open the {topModule} module and work through at least 10 practice questions.',
                'Your biggest score unlock: spend today\'s session drilling {topModule}.',
            ],
            'priority_action_none' => [
                'Take a quick practice drill to unlock detailed analytics.',
                'Start any drill session to generate your first performance insights.',
                'Complete a mock exam to identify your strengths and focus areas.',
            ],
            'priority_action_empty' => [
                'Take your first mock exam or drill today.',
                'Jump into a practice session — it only takes a few minutes to get started.',
                'Pick any subject and complete a short drill to kickstart your analytics.',
            ],

            // ── Subject Mastery Insights ──────────────────────────
            'insight_no_data' => [
                'No practice questions have been completed for {subject} yet.',
                '{subject} hasn\'t been explored yet — take a diagnostic drill to establish your baseline.',
                'Awaiting your first {subject} attempt to generate performance insights.',
            ],
            'insight_mastered' => [
                'Strong performance in {subject} with {pct}% accuracy — this is a reliable strength.',
                'You\'ve mastered {subject} at {pct}%. This subject is exam-ready.',
                '{pct}% accuracy in {subject} shows deep understanding. Well done!',
                '{subject} is one of your strongest areas at {pct}%. Focus your energy elsewhere.',
            ],
            'insight_moderate' => [
                'Moderate understanding of {subject} at {pct}% — close to mastery with focused effort.',
                '{subject} accuracy is {pct}%, showing good foundations that need reinforcement.',
                'You\'re scoring {pct}% in {subject} — a targeted drill push can tip this into mastery.',
                '{pct}% in {subject} is solid but leaves points on the table. Polish your weak subtopics.',
            ],
            'insight_critical' => [
                '{pct}% accuracy in {subject} reveals foundational gaps that need priority attention.',
                '{subject} at {pct}% is your biggest opportunity for score improvement.',
                'Low accuracy of {pct}% in {subject} — building core concepts here will have outsized impact.',
                '{subject} is currently at {pct}%. Dedicated study can move this significantly.',
            ],

            // ── Subject Mastery Recommended Actions ───────────────
            'action_no_data' => [
                'Begin with a basic diagnostic drill in {subject} to establish your initial score.',
                'Try a short {subject} quiz to discover your starting level.',
                'Take 10 minutes to complete a {subject} drill and get your first data point.',
            ],
            'action_mastered' => [
                'Maintain your edge with occasional timed review drills in {subject}.',
                'Focus on speed optimization — try {subject} drills under exam-time pressure.',
                'Keep {subject} sharp with one review session per week.',
                'Consider helping solidify this by attempting the hardest {subject} drills available.',
            ],
            'action_moderate' => [
                'Review core subtopics and practice targeted medium-difficulty {subject} drills.',
                'Spend 20 minutes on {subject} study guides, then attempt a timed drill.',
                'Identify and drill your weakest {subject} subtopics to push past 80%.',
                'Complete 2-3 focused {subject} sessions this week to cross into mastery.',
            ],
            'action_critical' => [
                'Pause mock exams and dedicate study time to {subject} fundamentals.',
                'Start with the {subject} study guide, then tackle easy-level drills.',
                'Break {subject} into subtopics and master them one at a time.',
                'Prioritize {subject} in your next 5 study sessions for maximum impact.',
            ],

            // ── Remediation: Struggle Reasons ────────────────────
            'struggle_reason_hard' => [
                'Consistent errors on {subtopic} suggest gaps in underlying concepts.',
                'Speed and accuracy both drop on {subtopic}-related questions.',
                '{subtopic} questions are answered incorrectly more often than average.',
                'Pattern analysis shows {subtopic} as a recurring stumbling block.',
            ],
            'struggle_reason_medium' => [
                'Core rules and terminology for {subtopic} need reinforcement.',
                '{subtopic} concepts are partially understood but not yet reliable under pressure.',
                'Mixed results on {subtopic} indicate inconsistent knowledge application.',
                '{subtopic} accuracy fluctuates — a sign that fundamentals need solidifying.',
            ],

            // ── Remediation: Coaching Tips ───────────────────────
            'coaching_hard' => [
                'Practice at least 10 drills of {subtopic} focusing on accuracy before speed.',
                'Review the {subtopic} study module, then drill until you hit 80%+ accuracy.',
                'Break {subtopic} into smaller concepts and tackle them individually.',
                'Spend 15 minutes reading {subtopic} theory, then do 10 practice questions.',
            ],
            'coaching_medium' => [
                'Review the study guides and summary sheet for {subtopic} before drilling.',
                'Complete 5 easy-level {subtopic} drills to rebuild confidence, then move to medium.',
                'Bookmark key {subtopic} questions into a saved drill set and practice them regularly.',
                'Do a quick {subtopic} refresher, then test yourself with a timed drill.',
            ],

            // ── Days to Readiness ────────────────────────────────
            'readiness_low' => [
                '30 days of dedicated foundational study recommended.',
                'Approximately 4 weeks of structured daily practice to reach exam readiness.',
                'Plan for 30+ days of focused concept-building before attempting full mocks.',
            ],
            'readiness_mid' => [
                '15 days of targeted practice on weak areas.',
                'About 2 weeks of focused drilling should close your performance gaps.',
                '10-15 days of consistent study on identified weak subjects.',
            ],
            'readiness_high' => [
                '5 days of maintenance review and simulation exams.',
                'A short tune-up period of 3-5 days of timed practice is sufficient.',
                'Light review for 5-7 days to stay sharp before exam day.',
            ],

            // ── Completion Pace (by trend) ──────────────────────
            'completion_pace_improving' => [
                'Your practice frequency is increasing — great momentum across {totalAttempts} attempts.',
                'Upward trend detected. You\'re accelerating your preparation pace.',
                'Strong engagement pattern — your recent sessions show increasing focus.',
            ],
            'completion_pace_declining' => [
                'Your practice frequency has dipped recently. Try to re-establish a daily habit.',
                'Activity has slowed down — schedule dedicated study blocks to get back on track.',
                'Recent sessions are less frequent. Consistency is key to retaining progress.',
            ],
            'completion_pace_stable' => [
                'Steady pacing observed across {totalAttempts} attempts — keep it up!',
                'Consistent practice rhythm detected. This is exactly how progress is made.',
                'Your study cadence is stable. Maintain this pattern through exam day.',
            ],
            'completion_pace_insufficient_data' => [
                'Not enough data to assess your study pace yet.',
                'Complete a few more sessions to establish your study pattern.',
            ],

            // ── Milestone Predictions ────────────────────────────
            'milestone_high' => [
                'At your current pace, you\'ll maintain peak readiness through {examDateStr}.',
                'You\'re on track to enter exam day with maximum confidence.',
                'Continue current habits and you\'ll peak at the perfect time for the exam.',
            ],
            'milestone_mid' => [
                'With daily practice, you can improve your confidence index by 10-15% in the next 10 days.',
                'Targeted study on {weakList} can push you past the 80% threshold within 2 weeks.',
                'Consistent daily drills should move your average score past the passing mark by {examDateStr}.',
            ],
            'milestone_low' => [
                'Focused foundational study can boost your score by 15-20% in the next 3 weeks.',
                'Building basics now will create compound gains — expect noticeable improvement within 2 weeks.',
                'With a structured study plan, a 20%+ improvement is achievable before exam day.',
            ],
            'milestone_empty' => [
                'Complete a practice exam to map out a clear study path.',
                'Take your first drill to unlock milestone tracking and study predictions.',
            ],

            // ── Score Improvement Predictions ────────────────────
            'improvement_high' => [
                '+3-5% fine-tuning possible with speed drills and simulation exams.',
                'Marginal gains of 3-5% available through timed practice and error analysis.',
                '+2-4% improvement by eliminating careless errors in timed conditions.',
            ],
            'improvement_mid' => [
                '+10-15% improvement achievable with consistent, targeted study habits.',
                '+12% or more by focusing on your 2-3 weakest subjects.',
                'A dedicated 2-week push can yield +8-12% score improvement.',
            ],
            'improvement_low' => [
                '+15-25% improvement potential with structured daily foundational study.',
                'Significant gains of 20%+ are realistic with a disciplined study plan.',
                '+18-25% improvement expected as you build core subject knowledge.',
            ],
            'improvement_empty' => [
                '+20% expected after first baseline assessment.',
                'Initial improvements of 15-25% are typical once structured study begins.',
            ],
        ];

        return collect($pools[$key] ?? []);
    }
}
