import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { index as dashboardIndex } from '@/routes/dashboard';
import type { Auth } from '@/types';
import type { DashboardProps, DashboardStats } from '../types';

const defaultStats: DashboardStats = {
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
            name: 'Verbal',
            percentage: 92,
            color: 'bg-emerald-600 dark:bg-emerald-500',
            correct: 46,
            total: 50,
        },
        {
            name: 'Clerical',
            percentage: 85,
            color: 'bg-blue-600 dark:bg-blue-500',
            correct: 34,
            total: 40,
        },
        {
            name: 'General',
            percentage: 78,
            color: 'bg-indigo-600 dark:bg-indigo-500',
            correct: 39,
            total: 50,
        },
        {
            name: 'Numerical',
            percentage: 65,
            color: 'bg-rose-600 dark:bg-rose-500',
            correct: 26,
            total: 40,
        },
        {
            name: 'Analytical',
            percentage: 70,
            color: 'bg-amber-600 dark:bg-amber-500',
            correct: 28,
            total: 40,
        },
    ],
};

export function useDashboardState({ stats }: DashboardProps) {
    const { auth } = usePage<{ auth: { user: Auth } }>().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isRunsOpen, setIsRunsOpen] = useState(false);

    const currentTrack = stats?.filters?.track || 'Professional';
    const currentRuns = stats?.filters?.runs || '6';

    const updateFilter = (key: 'track' | 'runs', value: string) => {
        router.get(
            dashboardIndex().url,
            { track: currentTrack, runs: currentRuns, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    useEffect(() => {
        const pendingExam = localStorage.getItem('pending_free_exam');

        if (pendingExam) {
            router.visit('/exams');
        }
    }, []);

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

    const chartWidth = 800;
    const chartHeight = 260;
    const chartPadding = 32;
    const chartPaddingLeft = 50;
    const chartPaddingRight = 32;

    const points = filteredChartData.map((dp, idx) => {
        const x =
            chartPaddingLeft +
            (idx * (chartWidth - chartPaddingLeft - chartPaddingRight)) /
                (filteredChartData.length - 1 || 1);
        const y =
            chartHeight -
            chartPadding -
            (dp.score * (chartHeight - chartPadding * 2)) / 100;

        return { x, y };
    });

    const pathD = points.reduce((acc, p, i) => {
        if (i === 0) {
            return `M ${p.x} ${p.y}`;
        }

        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;

        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    const areaD =
        points.length > 0
            ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`
            : '';

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
        chartWidth,
        chartHeight,
        chartPadding,
        chartPaddingLeft,
        chartPaddingRight,
        points,
        pathD,
        areaD,
        categories: activeStats.categories,
    };
}
