<?php

namespace App\Services;

use App\Models\ExamAttempt;

class ExamAttemptFormatter
{
    /**
     * Format duration from seconds to a readable string (e.g. 1h 20m or 45s).
     */
    public function formatDurationText(int $seconds): string
    {
        $seconds = max(0, $seconds);

        if ($seconds < 60) {
            return $seconds.'s';
        }

        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);

        if ($hours > 0) {
            return $hours.'h '.$minutes.'m';
        }

        return $minutes.'m';
    }

    /**
     * Format a past exam attempt's category scores.
     */
    public function formatAttemptCategoryScores(array $catScores): array
    {
        $scoreMap = $catScores['categoryScoreMap'] ?? $catScores ?? [];
        $meta = $catScores['metadata'] ?? [];
        $isDrill = ($meta['track'] ?? null) === 'Drill';
        $selectedSubcategories = collect($meta['selected_subcategories'] ?? [])
            ->filter()
            ->map(fn ($name) => strtolower((string) $name))
            ->values();
        $formatted = [];

        foreach ($scoreMap as $catName => $scoreData) {
            if ($catName === 'metadata' || ! is_array($scoreData)) {
                continue;
            }

            if ($isDrill && isset($scoreData['subcats']) && is_array($scoreData['subcats'])) {
                foreach ($scoreData['subcats'] as $subcatName => $subcatScore) {
                    if (! is_array($subcatScore)) {
                        continue;
                    }

                    if ($selectedSubcategories->isNotEmpty()) {
                        $normalizedSubcatName = strtolower((string) $subcatName);
                        $matchesSelection = $selectedSubcategories->contains(function ($selectedName) use ($normalizedSubcatName) {
                            return str_contains($normalizedSubcatName, $selectedName) || str_contains($selectedName, $normalizedSubcatName);
                        });

                        if (! $matchesSelection) {
                            continue;
                        }
                    }

                    $correct = (int) ($subcatScore['correct'] ?? 0);
                    $total = (int) ($subcatScore['total'] ?? 0);

                    if ($total <= 0) {
                        continue;
                    }

                    $formatted[] = [
                        'name' => (string) $subcatName,
                        'correct' => $correct,
                        'total' => $total,
                        'percentage' => round(($correct / $total) * 100),
                    ];
                }

                continue;
            }

            $correct = (int) ($scoreData['correct'] ?? 0);
            $total = (int) ($scoreData['total'] ?? 0);

            if ($total <= 0) {
                continue;
            }

            $formatted[] = [
                'name' => str_replace(' Ability', '', str_replace(' Information', '', $catName)),
                'correct' => $correct,
                'total' => $total,
                'percentage' => round(($correct / $total) * 100),
            ];
        }

        return $formatted;
    }

    /**
     * Collect question IDs the user has already faced, grouped by exam track.
     *
     * @return array{Professional: int[], Subprofessional: int[], Drill: int[]}
     */
    public function seenQuestionIdsByTrack(?int $userId): array
    {
        $byTrack = [
            'Professional' => [],
            'Subprofessional' => [],
            'Drill' => [],
        ];

        if (! $userId) {
            return $byTrack;
        }

        $attempts = ExamAttempt::where('user_id', $userId)->get();

        foreach ($attempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $track = $meta['track'] ?? ($attempt->category_id !== null ? 'Drill' : 'Professional');
            if (! isset($byTrack[$track])) {
                $track = 'Professional';
            }
            $byTrack[$track] = array_merge($byTrack[$track], $attempt->question_ids ?? []);
        }

        foreach ($byTrack as $track => $ids) {
            $byTrack[$track] = array_values(array_unique($ids));
        }

        return $byTrack;
    }
}
