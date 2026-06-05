import { useState, useMemo } from 'react';
import type { LearnModule, LearnIndexProps } from '../types';

export const categoryColors: Record<
    string,
    { bg: string; text: string; border: string; glow: string }
> = {
    'General Information': {
        bg: 'bg-teal-50 dark:bg-teal-950/20',
        text: 'text-teal-700 dark:text-teal-400',
        border: 'border-teal-150 dark:border-teal-900/35',
        glow: 'shadow-teal-100/50',
    },
    'Verbal Ability': {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-150 dark:border-blue-900/35',
        glow: 'shadow-blue-100/50',
    },
    'Analytical Ability': {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-150 dark:border-emerald-900/35',
        glow: 'shadow-emerald-100/50',
    },
    'Numerical Ability': {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-150 dark:border-orange-900/35',
        glow: 'shadow-orange-100/50',
    },
    'Clerical Ability': {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-150 dark:border-indigo-900/35',
        glow: 'shadow-indigo-100/50',
    },
};

export function useLearnState({
    modules = [],
    categories = [],
}: LearnIndexProps) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);

            return params.get('search') || '';
        }

        return '';
    });
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredModules = useMemo(() => {
        return modules.filter((mod) => {
            const queryLower = searchQuery.toLowerCase().trim();
            let matchesQuery = true;

            if (queryLower) {
                const titleLower = mod.title.toLowerCase();
                const topicLower = mod.topic.toLowerCase();
                const summaryLower = mod.summary.toLowerCase();

                const fullMatch =
                    titleLower.includes(queryLower) ||
                    topicLower.includes(queryLower) ||
                    summaryLower.includes(queryLower);

                if (fullMatch) {
                    matchesQuery = true;
                } else {
                    const queryWords = queryLower
                        .split(/\s+/)
                        .filter((word) => word.length > 2);
                    matchesQuery =
                        queryWords.length > 0 &&
                        queryWords.some(
                            (word) =>
                                titleLower.includes(word) ||
                                topicLower.includes(word) ||
                                summaryLower.includes(word),
                        );
                }
            }

            const matchesCategory =
                selectedCategory === 'all' || mod.category === selectedCategory;

            return matchesQuery && matchesCategory;
        });
    }, [modules, searchQuery, selectedCategory]);

    const groupedModules = useMemo(() => {
        const reduced = filteredModules.reduce(
            (acc, mod) => {
                if (!acc[mod.category]) {
                    acc[mod.category] = [];
                }

                acc[mod.category].push(mod);

                return acc;
            },
            {} as Record<string, LearnModule[]>,
        );

        return Object.entries(reduced).sort(([a], [b]) => {
            const indexA = categories.findIndex((c) => c.name === a);
            const indexB = categories.findIndex((c) => c.name === b);

            if (indexA === -1 && indexB === -1) {
                return a.localeCompare(b);
            }

            if (indexA === -1) {
                return 1;
            }

            if (indexB === -1) {
                return -1;
            }

            return indexA - indexB;
        });
    }, [filteredModules, categories]);

    return {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredModules,
        groupedModules,
    };
}
