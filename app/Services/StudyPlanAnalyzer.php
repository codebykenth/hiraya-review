<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\LearnModule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class StudyPlanAnalyzer
{
    private const EXAM_DATE = '2026-08-09';

    public function generateSuggestions(User $user, ?string $track = null, ?string $timeOfDay = 'Evening', int $topicsPerDay = 1): array
    {
        $attempts = ExamAttempt::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        if ($track && $track !== 'All') {
            $attempts = $attempts->filter(function ($attempt) use ($track) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $attemptTrack = $meta['track'] ?? 'Drill';
                if ($attempt->category_id !== null && ! isset($meta['track'])) {
                    $attemptTrack = 'Drill';
                }

                return strtolower($attemptTrack) === strtolower($track);
            });
        }

        if ($attempts->isEmpty()) {
            return [
                'suggestions' => [],
                'weak_areas' => [],
                'days_until_exam' => $this->daysUntilExam(),
            ];
        }

        $weakAreas = $this->identifyWeakAreas($attempts);

        if ($weakAreas->isEmpty()) {
            return [
                'suggestions' => [],
                'weak_areas' => [],
                'days_until_exam' => $this->daysUntilExam(),
            ];
        }

        $suggestions = $this->createStudySchedule($weakAreas, $timeOfDay, $topicsPerDay);
        $examDateStr = $this->getNextExamDate()->format('F j, Y');

        return [
            'suggestions' => $suggestions,
            'weak_areas' => $weakAreas->toArray(),
            'days_until_exam' => $this->daysUntilExam(),
            'exam_date' => $examDateStr,
        ];
    }

    public function identifyWeakAreas(Collection $attempts): Collection
    {
        $categoryScores = [];

        foreach ($attempts as $attempt) {
            $catScores = $attempt->cat_scores;

            if (! is_array($catScores)) {
                continue;
            }

            $scores = $catScores['categoryScoreMap'] ?? $catScores;

            if (! is_array($scores)) {
                continue;
            }

            foreach ($scores as $categoryName => $categoryData) {
                if ($categoryName === 'metadata' || ! is_array($categoryData)) {
                    continue;
                }

                if (! isset($categoryScores[$categoryName])) {
                    $categoryScores[$categoryName] = [];
                }

                $hasSubcats = isset($categoryData['subcats']) && is_array($categoryData['subcats']) && count($categoryData['subcats']) > 0;

                if (! $hasSubcats && isset($categoryData['correct'], $categoryData['total'])) {
                    if ($categoryData['total'] > 0) {
                        $percentage = ($categoryData['correct'] / $categoryData['total']) * 100;
                        if (! isset($categoryScores[$categoryName])) {
                            $categoryScores[$categoryName] = [];
                        }
                        $categoryScores[$categoryName][] = $percentage;
                    }
                }

                if ($hasSubcats) {
                    foreach ($categoryData['subcats'] as $subcatName => $subcatScore) {
                        if (is_array($subcatScore) && isset($subcatScore['correct'], $subcatScore['total'])) {
                            if ($subcatScore['total'] > 0) {
                                $percentage = ($subcatScore['correct'] / $subcatScore['total']) * 100;
                                $key = (string) $subcatName;
                                if (! isset($categoryScores[$key])) {
                                    $categoryScores[$key] = [];
                                }
                                $categoryScores[$key][] = $percentage;
                            }
                        }
                    }
                }
            }
        }

        // Calculate averages for all topics
        $averages = [];
        foreach ($categoryScores as $area => $scores) {
            if (count($scores) === 0) {
                continue;
            }
            $avg = array_sum($scores) / count($scores);
            $averages[$area] = round($avg, 1);
        }

        asort($averages);

        $categoryAverages = [];
        foreach ($averages as $area => $score) {
            $category = $this->getOverarchingCategory($area);
            if (! isset($categoryAverages[$category])) {
                $categoryAverages[$category] = ['score' => 0, 'count' => 0];
            }
            $categoryAverages[$category]['score'] += $score;
            $categoryAverages[$category]['count']++;
        }

        $weakCategories = [];
        foreach ($categoryAverages as $category => $data) {
            $avgScore = $data['score'] / $data['count'];
            $weakCategories[] = [
                'name' => ucwords($category),
                'score' => round($avgScore, 1),
            ];
        }

        usort($weakCategories, fn ($a, $b) => $a['score'] <=> $b['score']);

        return collect($weakCategories)
            ->map(function ($cat) {
                $maxTopics = $this->getTopicCountForArea($cat['name']);

                if ($cat['score'] < 50) {
                    $sessions = $maxTopics;
                } elseif ($cat['score'] < 75) {
                    $sessions = max(2, intval(ceil($maxTopics / 2)));
                } else {
                    $sessions = max(1, intval(ceil($maxTopics / 4)));
                }

                return [
                    'name' => $cat['name'],
                    'score' => $cat['score'],
                    'sessions' => $sessions,
                ];
            })->values();
    }

    private function getOverarchingCategory(string $areaName): string
    {
        $categoryMapping = [
            'verbal ability' => ['verbal', 'word meaning', 'error recognition', 'sentence structure', 'reading comprehension', 'paragraph organization', 'sentence completion', 'grammar', 'vocabulary'],
            'analytical ability' => ['analytical', 'identifying assumptions', 'drawing conclusions', 'symbolic logic', 'abstract reasoning', 'logical reasoning', 'word analogy', 'data interpretation'],
            'clerical' => ['clerical', 'alphabetizing', 'spelling', 'filing'],
            'numerical ability' => ['numerical', 'word problems', 'number sequence', 'basic operations', 'math'],
            'general information' => ['general information', 'philippine constitution', 'r.a. 6713', 'code of conduct', 'peace and human rights', 'environment management', 'environmental'],
        ];

        foreach ($categoryMapping as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($areaName, $keyword) !== false) {
                    return $category;
                }
            }
        }

        return strtolower($areaName);
    }

    private function getTopicCountForArea(string $areaName): int
    {
        $categoryMapping = [
            'verbal ability' => ['verbal', 'word meaning', 'error recognition', 'sentence structure', 'reading comprehension', 'paragraph organization', 'sentence completion', 'grammar', 'vocabulary'],
            'analytical ability' => ['analytical', 'identifying assumptions', 'drawing conclusions', 'symbolic logic', 'abstract reasoning', 'logical reasoning', 'word analogy', 'data interpretation'],
            'clerical' => ['clerical', 'alphabetizing', 'spelling', 'filing'],
            'numerical ability' => ['numerical', 'word problems', 'number sequence', 'basic operations', 'math'],
            'general information' => ['general information', 'philippine constitution', 'r.a. 6713', 'code of conduct', 'peace and human rights', 'environment management', 'environmental'],
        ];

        $counts = [
            'verbal ability' => 13,
            'analytical ability' => 6,
            'clerical' => 3,
            'numerical ability' => 16,
            'general information' => 4,
        ];

        foreach ($categoryMapping as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($areaName, $keyword) !== false) {
                    return $counts[$category];
                }
            }
        }

        return 3;
    }

    private function createStudySchedule(Collection $weakAreas, string $timeOfDay, int $topicsPerDay = 1): array
    {
        $suggestions = [];
        $daysUntilExam = $this->daysUntilExam();
        $startDate = Carbon::now();
        $examDate = $this->getNextExamDate();

        $totalSessions = $weakAreas->sum('sessions');

        // Automatically determine the optimal topics per day to ensure ALL sessions are completed before the exam date
        if ($daysUntilExam > 0) {
            $topicsPerDay = max(1, (int) ceil($totalSessions / $daysUntilExam));
        } else {
            $topicsPerDay = max(1, $totalSessions); // If exam is today, schedule everything today
        }

        $totalDaysNeeded = ceil($totalSessions / $topicsPerDay);
        $daysPerSession = max(1, intval($daysUntilExam / max(1, $totalDaysNeeded)));

        $currentDate = $startDate->copy();
        $sessionCount = 0;
        $dailyCount = 0;

        $allModules = collect();
        if (Schema::hasTable('learn_modules')) {
            // Self-healing database cleanup for incorrect module topics
            LearnModule::where('title', 'like', '%Number Series%')
                ->where('topic', 'like', '%GCF%')
                ->update(['topic' => 'Number Series']);

            LearnModule::where('title', 'like', '%PEMDAS%')
                ->where('topic', 'like', '%Multiples and Factors%')
                ->update(['topic' => 'PEMDAS and Fractions']);

            $allModules = LearnModule::where('is_published', true)
                ->with('subcategory')
                ->get();
        }

        foreach ($weakAreas as $area) {
            for ($i = 0; $i < $area['sessions']; $i++) {
                $subtopic = $this->getSubtopicForArea($area['name'], $i);

                $titleText = $subtopic ? "Study: {$area['name']} - {$subtopic['title']}" : "Study: {$area['name']}";
                $descText = $subtopic ? $subtopic['desc'] : $this->getSpecificTopics($area['name']);

                // Extract exact search terms for this study suggestion
                $terms = $this->getSearchTerms($titleText, $descText);

                // Find matching modules using precise search terms
                $matchedModules = [];
                foreach ($allModules as $mod) {
                    if ($this->isModuleRelatedToTerms($mod, $terms)) {
                        $matchedModules[] = [
                            'url' => "/learn/{$mod->slug}",
                            'title' => $mod->title,
                        ];
                    }
                }

                $suggestions[] = [
                    'id' => uniqid(),
                    'study_date' => $currentDate->format('Y-m-d'),
                    'study_time' => $this->suggestTime($dailyCount, $timeOfDay),
                    'title' => $titleText,
                    'description' => $descText,
                    'area_name' => $area['name'],
                    'score' => $area['score'],
                    'module_links' => $matchedModules,
                ];

                $sessionCount++;
                $dailyCount++;

                if ($dailyCount >= $topicsPerDay) {
                    $currentDate->addDays($daysPerSession);
                    $dailyCount = 0;
                }
            }
        }

        return $suggestions;
    }

    private function getSubtopicForArea(string $areaName, int $index): ?array
    {
        $categoryMapping = [
            'verbal ability' => ['verbal', 'word meaning', 'error recognition', 'sentence structure', 'reading comprehension', 'paragraph organization', 'sentence completion', 'grammar', 'vocabulary'],
            'analytical ability' => ['analytical', 'identifying assumptions', 'drawing conclusions', 'symbolic logic', 'abstract reasoning', 'logical reasoning', 'word analogy', 'data interpretation'],
            'clerical' => ['clerical', 'alphabetizing', 'spelling', 'filing'],
            'numerical ability' => ['numerical', 'word problems', 'number sequence', 'basic operations', 'math'],
            'general information' => ['general information', 'philippine constitution', 'r.a. 6713', 'code of conduct', 'peace and human rights', 'environment management', 'environmental'],
        ];

        $matchedCategory = null;
        foreach ($categoryMapping as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($areaName, $keyword) !== false) {
                    $matchedCategory = $category;
                    break 2;
                }
            }
        }

        if (! $matchedCategory) {
            return null;
        }

        $subtopics = [
            'verbal ability' => [
                ['title' => 'Grammatical Categories', 'desc' => 'Focus on Nouns, Gender, Grammatical Number, Verbs, Tenses, Pronouns, Adjectives, Adverbs, Prepositions, Conjunctions, and Interjections.'],
                ['title' => 'Articles', 'desc' => 'Review definite and indefinite articles.'],
                ['title' => 'Subject-Verb Agreement', 'desc' => 'Practice ensuring verbs agree with subjects in number and person.'],
                ['title' => 'Sentence Constructions', 'desc' => 'Focus on building structurally sound sentences.'],
                ['title' => 'Affixes', 'desc' => 'Review prefixes and suffixes.'],
                ['title' => 'Punctuations', 'desc' => 'Practice the correct usage of commas, periods, semicolons, etc.'],
                ['title' => 'Correct Usage', 'desc' => 'Focus on the proper application of grammar rules in context.'],
                ['title' => 'Error Identification', 'desc' => 'Practice spotting grammatical and structural errors in sentences.'],
                ['title' => 'Synonyms', 'desc' => 'Review words with similar meanings.'],
                ['title' => 'Antonyms', 'desc' => 'Review words with opposite meanings.'],
                ['title' => 'Analogy', 'desc' => 'Practice identifying logical relationships between pairs of words.'],
                ['title' => 'Paragraph Organization', 'desc' => 'Focus on structuring sentences logically within a paragraph.'],
                ['title' => 'Reading Comprehension', 'desc' => 'Practice finding the main idea, context clues, and drawing conclusions.'],
            ],
            'analytical ability' => [
                ['title' => 'Logical Reasoning', 'desc' => 'Focus on deductive and inductive reasoning, syllogisms, and sequence solving.'],
                ['title' => 'Flowchart', 'desc' => 'Practice tracing algorithms, conditions, and logical flow.'],
                ['title' => 'Problem Solving', 'desc' => 'Focus on applying logic to resolve complex scenarios and mathematical puzzles.'],
                ['title' => 'Cognitive Reasoning', 'desc' => 'Practice critical thinking and evaluating arguments or hypotheses.'],
                ['title' => 'Symbolic Reasoning', 'desc' => 'Analyze patterns, symbols, and sequence translations.'],
                ['title' => 'Abstract Reasoning', 'desc' => 'Identify non-verbal patterns, shapes, and spatial logic.'],
                ['title' => 'Word Analogy', 'desc' => 'Identify relationships between words and solve corresponding pairs.'],
                ['title' => 'Data Interpretation', 'desc' => 'Analyze and draw conclusions from tables, graphs, and statistical data.'],
            ],
            'clerical' => [
                ['title' => 'Vocabulary and Spelling', 'desc' => 'Focus on correct word usage, spelling rules, and vocabulary building.'],
                ['title' => 'Alphabetizing', 'desc' => 'Practice sorting words, names, and records in exact alphabetical order.'],
                ['title' => 'Filing', 'desc' => 'Review standard office filing procedures and record keeping methodologies.'],
            ],
            'numerical ability' => [
                ['title' => 'Divisibility Rules', 'desc' => 'Review rules for dividing numbers without a remainder.'],
                ['title' => 'Multiples and Factors', 'desc' => 'Practice finding LCM, GCF, and prime factorization.'],
                ['title' => 'Integers', 'desc' => 'Focus on addition, subtraction, multiplication, and division of positive and negative numbers.'],
                ['title' => 'PEMDAS', 'desc' => 'Practice the order of operations.'],
                ['title' => 'Decimals', 'desc' => 'Review operations and word problems involving decimals.'],
                ['title' => 'Fractions', 'desc' => 'Practice simplifying, converting, and operating on fractions.'],
                ['title' => 'Percent', 'desc' => 'Focus on percentage calculations and applications like discounts and interest.'],
                ['title' => 'Ratio and Proportion', 'desc' => 'Practice solving direct, inverse, and partitive proportions.'],
                ['title' => 'Averages', 'desc' => 'Review mean, median, mode, and weighted averages.'],
                ['title' => 'Linear Equations', 'desc' => 'Practice solving one-variable and two-variable equations.'],
                ['title' => 'Number Problem', 'desc' => 'Focus on translating word problems into mathematical equations.'],
                ['title' => 'Age Problem', 'desc' => 'Practice solving past, present, and future age relationships.'],
                ['title' => 'Work Problem', 'desc' => 'Focus on calculating time needed to complete tasks individually or together.'],
                ['title' => 'Motion Problem', 'desc' => 'Review distance, rate, and time (D=RT) calculations.'],
                ['title' => 'Sequence', 'desc' => 'Practice identifying arithmetic and geometric progressions.'],
                ['title' => 'Geometry Problem', 'desc' => 'Focus on area, perimeter, and volume calculations.'],
            ],
            'general information' => [
                ['title' => 'The 1987 Constitution', 'desc' => 'Review the Bill of Rights and the 3 branches of government.'],
                ['title' => 'Republic Act No. 6713', 'desc' => 'Code of Conduct and Ethical Standards for Public Officials and Employees.'],
                ['title' => 'Peace and Human Rights Issues and Concepts', 'desc' => 'Review core concepts of peace and human rights issues.'],
                ['title' => 'Environmental Management and Protection', 'desc' => 'Review ecological laws and environmental conservation.'],
            ],
        ];

        return $subtopics[$matchedCategory][$index % count($subtopics[$matchedCategory])];
    }

    private function getSpecificTopics(string $areaName): string
    {
        $map = [
            'Grammatical Categories' => 'Focus on Nouns, Gender, Grammatical Number, Verbs, Tenses, Pronouns, Adjectives, Adverbs, Prepositions, Conjunctions, and Interjections.',
            'Articles' => 'Review definite and indefinite articles.',
            'Subject-Verb Agreement' => 'Practice ensuring verbs agree with subjects in number and person.',
            'Sentence Constructions' => 'Focus on building structurally sound sentences.',
            'Affixes' => 'Review prefixes and suffixes.',
            'Punctuations' => 'Practice the correct usage of commas, periods, semicolons, etc.',
            'Correct Usage' => 'Focus on the proper application of grammar rules in context.',
            'Error Identification' => 'Practice spotting grammatical and structural errors in sentences.',
            'Synonyms' => 'Review words with similar meanings.',
            'Antonyms' => 'Review words with opposite meanings.',
            'Analogy' => 'Practice identifying logical relationships between pairs of words.',
            'Paragraph Organization' => 'Focus on structuring sentences logically within a paragraph.',
            'Reading Comprehension' => 'Practice finding the main idea, context clues, and drawing conclusions.',
            'Verbal Ability' => 'Review Grammar (Nouns, Verbs, Pronouns), Subject-Verb Agreement, Error Identification, Synonyms/Antonyms, and Reading Comprehension.',
            'Grammar' => 'Focus on Nouns, Verbs, Pronouns, and Sentence Structure.',
            'Vocabulary' => 'Review synonyms, antonyms, root words, and contextual usage.',
            'Basic Operations' => 'Practice fractions, decimals, percentages, and PEMDAS.',
            'Word Problems' => 'Focus on algebraic translations, age problems, distance, and work/time problems.',
            'Data Interpretation' => 'Analyze line graphs, pie charts, and statistical data tables.',
            'Logical Reasoning' => 'Focus on sequence solving, syllogisms, and spatial reasoning.',
            'Symbolic logic' => 'Practice analyzing patterns, symbols, and abstract logic sequences.',
            'Abstract reasoning' => 'Practice analyzing patterns, symbols, and abstract logic sequences.',
            'Philippine Constitution' => 'Review the Bill of Rights, 3 branches of government, and RA 6713.',
            'General Information' => 'Review current events, environmental issues, and human rights concepts.',
            'Peace and Human Rights' => 'Review core concepts of peace, human rights issues, and constitutional rights.',
            'Environment' => 'Review environmental management and protection, and ecological laws.',
        ];

        foreach ($map as $key => $topics) {
            if (stripos($areaName, $key) !== false) {
                return $topics;
            }
        }

        return 'Review core concepts, practice past questions, and analyze your previous mistakes.';
    }

    private function suggestTime(int $sessionIndex, string $timeOfDay): string
    {
        $times = match (strtolower($timeOfDay)) {
            'morning' => ['06:00', '07:00', '08:00', '09:00', '10:00'],
            'afternoon' => ['13:00', '14:00', '15:00', '16:00', '17:00'],
            'evening' => ['18:30', '19:30', '20:00', '20:30', '21:00'],
            default => ['18:30', '19:30', '20:00', '20:30', '21:00'],
        };

        return $times[$sessionIndex % count($times)];
    }

    private function getNextExamDate(): Carbon
    {
        if (Schema::hasTable('exam_dates')) {
            $examDate = ExamDate::where('is_active', true)
                ->where('date', '>', now())
                ->orderBy('date')
                ->first();
            if ($examDate) {
                return Carbon::parse($examDate->date);
            }
        }

        return Carbon::parse(self::EXAM_DATE);
    }

    private function daysUntilExam(): int
    {
        return now()->diffInDays($this->getNextExamDate(), false);
    }

    /**
     * Extract precise search terms/topics from title and description.
     *
     * @return array<int, string>
     */
    private function getSearchTerms(string $title, string $description): array
    {
        $terms = [];

        // 1. Extract subtopic from title (part after " - ")
        if (str_contains($title, ' - ')) {
            $parts = explode(' - ', $title);
            $subtopic = trim($parts[1]);
        } else {
            $subtopic = trim($title);
        }

        // Remove prefix "Study: " if present
        $subtopic = preg_replace('/^Study:\s*/i', '', $subtopic);

        if (strlen($subtopic) >= 2) {
            $terms[] = strtolower($subtopic);
        }

        // 2. Parse and split description
        $descLower = strtolower($description);

        // Extract acronyms in parentheses (e.g. "(LCM)")
        if (preg_match_all('/\(([a-z0-9]{2,6})\)/i', $descLower, $matches)) {
            foreach ($matches[1] as $acronym) {
                $terms[] = strtolower($acronym);
            }
        }

        // Clean common introductory noise from description
        $cleanedDesc = $descLower;
        $noisePrefixes = [
            'focus on the proper application of',
            'focus on translating',
            'focus on calculating',
            'focus on building',
            'focus on structuring',
            'focus on deductive and inductive',
            'focus on',
            'practice ensuring',
            'practice identifying',
            'practice finding',
            'practice spotting',
            'practice solving',
            'practice tracing',
            'practice',
            'review rules for',
            'review',
            'identify',
            'analyze',
        ];

        foreach ($noisePrefixes as $prefix) {
            if (str_starts_with(trim($cleanedDesc), $prefix)) {
                $cleanedDesc = preg_replace('/^'.preg_quote($prefix, '/').'\b/i', '', trim($cleanedDesc));
                break;
            }
        }

        // Split by punctuation and conjunctions
        $parts = preg_split('/[\s,;]+and\s+|[\s,;]+or\s+|[\s,;]+&\s+|[,;.]+/', $cleanedDesc, -1, PREG_SPLIT_NO_EMPTY);

        $broadStopWords = [
            'rules', 'numbers', 'operations', 'word', 'problems', 'tasks', 'relationships',
            'concept', 'concepts', 'issues', 'laws', 'etc', 'meaning', 'structure',
            'application', 'context', 'pairs', 'main', 'idea', 'clues', 'conclusions',
            'arguments', 'hypotheses', 'shapes', 'order', 'arithmetic', 'basic',
            'ability', 'general', 'information', 'clerical', 'verbal', 'analytical',
            'numerical', 'solving', 'identifying', 'finding', 'spotting',
        ];

        foreach ($parts as $part) {
            $part = trim($part);
            if (strlen($part) < 2) {
                continue;
            }
            if (in_array($part, $broadStopWords)) {
                continue;
            }
            $terms[] = $part;
        }

        return array_values(array_unique($terms));
    }

    private function isModuleRelatedToTerms(object $mod, array $terms): bool
    {
        $modTitle = strtolower(trim($mod->title ?? ''));
        $modTopic = strtolower(trim($mod->topic ?? ''));

        foreach ($terms as $term) {
            $baseTerm = $term;
            // Strip trailing s if it's not part of ss
            if (str_ends_with($baseTerm, 's') && ! str_ends_with($baseTerm, 'ss')) {
                $baseTerm = substr($baseTerm, 0, -1);
            }

            // Build safe word boundary pattern with optional plural 's'
            $pattern = '/';
            if (preg_match('/^\w/', $baseTerm)) {
                $pattern .= '\b';
            }
            $pattern .= preg_quote($baseTerm, '/');
            if (preg_match('/\w$/', $baseTerm)) {
                $pattern .= 's?\b';
            }
            $pattern .= '/i';

            if (($modTitle !== '' && preg_match($pattern, $modTitle)) ||
                ($modTopic !== '' && preg_match($pattern, $modTopic))) {
                return true;
            }
        }

        return false;
    }
}
