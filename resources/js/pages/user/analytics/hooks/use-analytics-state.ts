import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { Auth } from '@/types';
import type { AnalyticsProps, AnalyticsStats } from '../types';

const defaultStats: AnalyticsStats = {
    avgScore: 84,
    totalExams: 12,
    strongestArea: 'Verbal',
    weakestArea: 'Numerical',
    passingRate: 75,
    totalDuration: '3h 15m',
    avgDuration: '16m 15s',
    totalQuestionsSolved: 340,
    chartData: [
        {
            score: 40,
            label: 'Run 1',
            date: 'May 20',
            track: 'Professional Exam',
            detail: '68/170 Correct',
            categoryScores: [],
        },
        {
            score: 52,
            label: 'Run 2',
            date: 'May 21',
            track: 'Subprofessional Exam',
            detail: '78/150 Correct',
            categoryScores: [],
        },
        {
            score: 45,
            label: 'Run 3',
            date: 'May 22',
            track: 'Analytical Drill',
            detail: '18/40 Correct',
            categoryScores: [],
        },
        {
            score: 68,
            label: 'Run 4',
            date: 'May 23',
            track: 'Verbal Drill',
            detail: '27/40 Correct',
            categoryScores: [],
        },
        {
            score: 60,
            label: 'Run 5',
            date: 'May 24',
            track: 'Numerical Drill',
            detail: '24/40 Correct',
            categoryScores: [],
        },
        {
            score: 85,
            label: 'Run 6',
            date: 'May 25',
            track: 'Professional Exam',
            detail: '144/170 Correct',
            categoryScores: [],
        },
    ],
    categories: [
        {
            name: 'Verbal Ability',
            percentage: 92,
            color: 'bg-emerald-650 dark:bg-emerald-500',
            correct: 46,
            total: 50,
        },
        {
            name: 'Clerical Ability',
            percentage: 85,
            color: 'bg-blue-650 dark:bg-blue-500',
            correct: 34,
            total: 40,
        },
        {
            name: 'General Information',
            percentage: 78,
            color: 'bg-indigo-650 dark:bg-indigo-500',
            correct: 39,
            total: 50,
        },
        {
            name: 'Numerical Ability',
            percentage: 65,
            color: 'bg-rose-650 dark:bg-rose-500',
            correct: 26,
            total: 40,
        },
        {
            name: 'Analytical Ability',
            percentage: 70,
            color: 'bg-amber-650 dark:bg-amber-500',
            correct: 28,
            total: 40,
        },
    ],
};

export function useAnalyticsState({ stats }: AnalyticsProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isRunsOpen, setIsRunsOpen] = useState(false);

    const currentTrack = stats?.filters?.track || 'Professional';
    const currentRuns = stats?.filters?.runs || '1';

    const updateFilter = (key: 'track' | 'runs', value: string) => {
        router.get(
            '/analytics',
            { track: currentTrack, runs: currentRuns, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    useEffect(() => {
        const handleBodyClick = () => {
            setHoveredIdx(null);
        };
        document.body.addEventListener('click', handleBodyClick);

        return () => {
            document.body.removeEventListener('click', handleBodyClick);
        };
    }, []);

    const activeStats = stats || defaultStats;
    const isDemoMode = !stats || stats.totalExams === 0;
    const filteredChartData = [
        ...(activeStats.chartData || defaultStats.chartData),
    ];

    return {
        firstName,
        hoveredIdx,
        setHoveredIdx,
        isOpen,
        setIsOpen,
        isRunsOpen,
        setIsRunsOpen,
        currentTrack,
        currentRuns,
        updateFilter,
        activeStats,
        isDemoMode,
        filteredChartData,
        categories: activeStats.categories,
    };
}
