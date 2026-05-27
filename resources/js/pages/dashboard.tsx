import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Play,
    TrendingUp,
    TrendingDown,
    Award,
    FileText,
    ChevronDown,
    Clock,
    Target,
    Info,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    TrackBadge,
    StatusBadge,
    ScoreProgress,
} from '@/components/attempt-components';
import { PageContainer } from '@/components/page-container';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as drillsIndex } from '@/routes/drills';
import { index as examsIndex } from '@/routes/exams';

interface ChartDataPoint {
    score: number;
    label: string;
    date: string;
    track: string;
    detail: string;
    categoryScores?: CategoryScore[];
}

interface CategoryScore {
    name: string;
    correct: number;
    total: number;
    percentage: number;
}

interface DashboardProps {
    stats?: {
        avgScore: number;
        totalExams: number;
        strongestArea: string;
        weakestArea: string;
        chartData: ChartDataPoint[];
        categories: {
            name: string;
            percentage: number;
            color: string;
            correct: number;
            total: number;
        }[];
        passingRate: number;
        totalDuration: string;
        avgDuration: string;
        totalQuestionsSolved: number;
    } | null;
}

export default function Dashboard({ stats }: DashboardProps) {
    // Access Inertia shared props to greet the user dynamically
    const { auth } = usePage().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<
        '6' | '12' | 'exams' | 'drills'
    >('6');

    // Redirect to exams page if a pending free exam session exists after registration
    useEffect(() => {
        const pendingExam = localStorage.getItem('pending_free_exam');

        if (pendingExam) {
            router.visit('/exams');
        }
    }, []);

    const defaultStats = {
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

    const activeStats = stats || defaultStats;
    const isDemoMode = !stats || stats.totalExams === 0;
    const chartData = activeStats.chartData || defaultStats.chartData;

    // Filter/slice the dynamic chart data points based on filter state
    const filteredChartData = (() => {
        let items = [...chartData];

        if (selectedFilter === 'exams') {
            items = items.filter((dp) =>
                dp.track.toLowerCase().includes('exam'),
            );
        } else if (selectedFilter === 'drills') {
            items = items.filter((dp) =>
                dp.track.toLowerCase().includes('drill'),
            );
        }

        const limitCount =
            selectedFilter === '12'
                ? 12
                : selectedFilter === '6'
                  ? 6
                  : items.length;

        return items.slice(-limitCount);
    })();

    const chartWidth = 500;
    const chartHeight = 210;
    const chartPadding = 24;
    const chartPaddingLeft = 46;
    const chartPaddingRight = 24;

    // Map stats points to coordinate space within the responsive SVG viewport
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

    // Generate smooth bezier curves connecting the score data points
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

    // Form an enclosed shape path to apply the soft gradient background fill
    const areaD =
        points.length > 0
            ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`
            : '';

    const categories = activeStats.categories;

    return (
        <>
            <Head title="Dashboard" />
            <PageContainer>
                {/* Greeting Header & Main Action Controls */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                            Welcome back,
                            <br />
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                {firstName}
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 md:text-base dark:text-slate-400">
                            Let's continue your preparation for the Civil
                            Service Exam.
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:items-end">
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={
                                    examsIndex({
                                        query: { start: 'professional' },
                                    }).url
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                <Play className="size-3.5 fill-current" />
                                Start Professional Exam
                            </Link>
                            <Link
                                href={
                                    examsIndex({
                                        query: { start: 'subprofessional' },
                                    }).url
                                }
                                className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100/50 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                                Start Subprofessional Exam
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Card Grid Layout - Upgraded to 6 dynamic indicators */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {/* AVG SCORE */}
                    <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-5 shadow-sm transition hover:shadow-md dark:border-blue-950/30 dark:from-blue-950/10 dark:to-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                Avg Score
                            </span>
                            <Award className="size-4 text-blue-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {activeStats.avgScore}%
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                <TrendingUp className="size-2.5" />
                                Live
                            </span>
                        </div>
                    </div>

                    {/* PASSING RATE */}
                    <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/20 to-white p-5 shadow-sm transition hover:shadow-md dark:border-emerald-950/30 dark:from-emerald-950/10 dark:to-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                Passing Rate
                            </span>
                            <Target className="size-4 text-emerald-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {activeStats.passingRate}%
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400">
                                Target 80%
                            </span>
                        </div>
                    </div>

                    {/* TOTAL EXAMS */}
                    <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-indigo-950/30 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                Total runs
                            </span>
                            <FileText className="size-4 text-indigo-400" />
                        </div>
                        <div className="mt-2">
                            <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {activeStats.totalExams}
                            </span>
                            <p className="text-[9px] text-slate-400">
                                Practice attempts
                            </p>
                        </div>
                    </div>

                    {/* QUESTIONS SOLVED */}
                    <div className="relative overflow-hidden rounded-xl border border-purple-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-purple-950/30 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
                                Avg Time
                            </span>
                            <Clock className="size-4 text-purple-400" />
                        </div>
                        <div className="mt-2">
                            <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {activeStats.avgDuration}
                            </span>
                            <p className="text-[9px] text-slate-400">
                                Per attempt
                            </p>
                        </div>
                    </div>

                    {/* STRONGEST AREA */}
                    <div className="relative overflow-hidden rounded-xl border border-l-4 border-slate-100 border-l-emerald-500 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                Strongest
                            </span>
                            <TrendingUp className="size-4 text-emerald-500" />
                        </div>
                        <div className="mt-2">
                            <span className="line-clamp-1 font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {activeStats.strongestArea}
                            </span>
                        </div>
                    </div>

                    {/* WEAKEST AREA */}
                    <div className="relative overflow-hidden rounded-xl border border-l-4 border-slate-100 border-l-rose-500 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                Focus Area
                            </span>
                            <TrendingDown className="size-4 text-rose-500" />
                        </div>
                        <div className="mt-2">
                            <span className="line-clamp-1 font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {activeStats.weakestArea}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Score Trends & Category breakdown container layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Score Trends Section */}
                    <Card className="relative p-6 lg:col-span-2">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <h2 className="flex items-center gap-2 font-heading text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                                    Score History
                                    {isDemoMode && (
                                        <span className="bg-amber-55 inline-flex items-center gap-1 rounded-full border border-amber-200/65 px-2 py-0.5 text-[9px] font-black tracking-wide text-amber-700 uppercase dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                                            Demo Data
                                        </span>
                                    )}
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Track your score percentage across recent
                                    attempts.
                                </p>
                                <div className="group relative flex w-fit items-center gap-1 text-xs font-bold text-slate-400">
                                    <Info className="size-3.5 cursor-help" />
                                    Trend details
                                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded bg-slate-900 p-2 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-800">
                                        Displays the scores of your last 6
                                        attempts. Hover on any node to view
                                        details.
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                                >
                                    {selectedFilter === '6' && 'Last 6 Runs'}
                                    {selectedFilter === '12' && 'Last 12 Runs'}
                                    {selectedFilter === 'exams' &&
                                        'Mock Exams Only'}
                                    {selectedFilter === 'drills' &&
                                        'Custom Drills Only'}
                                    <ChevronDown className="size-3.5" />
                                </button>

                                {isOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsOpen(false)}
                                        />
                                        <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-slate-800 dark:bg-slate-950">
                                            {[
                                                {
                                                    value: '6',
                                                    label: 'Last 6 Runs',
                                                },
                                                {
                                                    value: '12',
                                                    label: 'Last 12 Runs',
                                                },
                                                {
                                                    value: 'exams',
                                                    label: 'Mock Exams Only',
                                                },
                                                {
                                                    value: 'drills',
                                                    label: 'Custom Drills Only',
                                                },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setSelectedFilter(
                                                            opt.value as any,
                                                        );
                                                        setIsOpen(false);
                                                    }}
                                                    className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition ${
                                                        selectedFilter ===
                                                        opt.value
                                                            ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                                                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Interactive SVG line chart visualization */}
                        <div className="relative h-[260px] w-full rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 dark:border-slate-800/70 dark:from-slate-900/30 dark:to-slate-950">
                            {/* Detailed HTML absolute glassmorphic tooltip card */}
                            {hoveredIdx !== null &&
                                filteredChartData[hoveredIdx] &&
                                filteredChartData[hoveredIdx].track !==
                                    'No Data' && (
                                    <div
                                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-blue-200/50 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-all duration-150 dark:border-slate-800/50 dark:bg-slate-950/95"
                                        style={{
                                            left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
                                            top: `${(points[hoveredIdx].y / chartHeight) * 100 - 8}%`,
                                        }}
                                    >
                                        <div className="flex min-w-[130px] flex-col gap-1">
                                            <span className="text-[10px] font-extrabold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                                                {
                                                    filteredChartData[
                                                        hoveredIdx
                                                    ].track
                                                }
                                            </span>
                                            <div className="flex items-baseline justify-between gap-3">
                                                <span className="text-sm font-black text-slate-800 dark:text-white">
                                                    {
                                                        filteredChartData[
                                                            hoveredIdx
                                                        ].score
                                                    }
                                                    %
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {
                                                        filteredChartData[
                                                            hoveredIdx
                                                        ].detail
                                                    }
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-slate-400">
                                                Date:{' '}
                                                {
                                                    filteredChartData[
                                                        hoveredIdx
                                                    ].date
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}

                            <svg
                                className="h-full w-full"
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <pattern
                                        id="grid"
                                        width="40"
                                        height="20"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <path
                                            d="M 40 0 L 0 0 0 20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.5"
                                            className="text-blue-100/40 dark:text-slate-800/40"
                                        />
                                    </pattern>
                                    <linearGradient
                                        id="chartGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#2563eb"
                                            stopOpacity="0.2"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#2563eb"
                                            stopOpacity="0.0"
                                        />
                                    </linearGradient>
                                </defs>

                                {/* Background grid mesh */}
                                <rect
                                    width={chartWidth}
                                    height={chartHeight}
                                    fill="url(#grid)"
                                />

                                {/* Render clean guide metrics */}
                                {[0, 25, 50, 75, 100].map((level) => {
                                    const y =
                                        chartHeight -
                                        chartPadding -
                                        (level *
                                            (chartHeight - chartPadding * 2)) /
                                            100;

                                    return (
                                        <g key={level}>
                                            <line
                                                x1={chartPaddingLeft}
                                                y1={y}
                                                x2={
                                                    chartWidth -
                                                    chartPaddingRight
                                                }
                                                y2={y}
                                                stroke="currentColor"
                                                strokeWidth="0.5"
                                                className="text-blue-100/30 dark:text-slate-800/30"
                                                strokeDasharray="4 4"
                                            />
                                            <text
                                                x={chartPaddingLeft - 8}
                                                y={y + 3}
                                                textAnchor="end"
                                                fontSize="9"
                                                fontWeight="bold"
                                                className="fill-slate-400 dark:fill-slate-500"
                                            >
                                                {level}%
                                            </text>
                                        </g>
                                    );
                                })}

                                {points.length > 0 && (
                                    <>
                                        <path
                                            d={areaD}
                                            fill="url(#chartGradient)"
                                        />
                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke="#2563eb"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </>
                                )}

                                {points.length === 0 && (
                                    <text
                                        x={chartWidth / 2}
                                        y={chartHeight / 2}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="semibold"
                                        className="fill-slate-400 dark:fill-slate-500"
                                    >
                                        No matched attempts found.
                                    </text>
                                )}

                                {points.map((p, idx) => (
                                    <g key={idx}>
                                        {/* Outer glowing focus indicator on hover */}
                                        {hoveredIdx === idx && (
                                            <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r="9"
                                                fill="#2563eb"
                                                fillOpacity="0.15"
                                                className="animate-pulse"
                                            />
                                        )}
                                        <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r={hoveredIdx === idx ? '6' : '4.5'}
                                            fill="#ffffff"
                                            stroke="#2563eb"
                                            strokeWidth={
                                                hoveredIdx === idx ? '3' : '2'
                                            }
                                            className="cursor-pointer transition-all duration-150"
                                            onMouseEnter={() =>
                                                setHoveredIdx(idx)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredIdx(null)
                                            }
                                        />

                                        {/* Score tag text inside SVG */}
                                        {idx === points.length - 1 &&
                                            hoveredIdx === null && (
                                                <text
                                                    x={p.x - 15}
                                                    y={p.y - 12}
                                                    fontSize="11"
                                                    fontWeight="bold"
                                                    fill="#2563eb"
                                                    className="dark:fill-blue-400"
                                                >
                                                    {
                                                        filteredChartData[idx]
                                                            .score
                                                    }
                                                    %
                                                </text>
                                            )}

                                        {/* Dynamic X-Axis label dates */}
                                        <text
                                            x={p.x}
                                            y={chartHeight - 4}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fontWeight="bold"
                                            className="fill-slate-400 dark:fill-slate-500"
                                        >
                                            {filteredChartData[idx].date}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {/* Recent Attempts Table/List filling the empty space */}
                        <div className="dark:border-slate-850 mt-6 border-t border-slate-100 pt-6">
                            <h3 className="mb-4 flex items-center gap-1.5 text-xs font-black tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Run Details (
                                {
                                    filteredChartData.filter(
                                        (d) => d.track !== 'No Data',
                                    ).length
                                }{' '}
                                attempts matched)
                                {isDemoMode && (
                                    <span className="font-extrabold text-amber-500 lowercase dark:text-amber-400">
                                        (preview only)
                                    </span>
                                )}
                            </h3>
                            {filteredChartData.filter(
                                (d) => d.track !== 'No Data',
                            ).length === 0 ? (
                                <p className="border-slate-150 rounded-lg border border-dashed py-3 text-center text-xs text-slate-400 dark:border-slate-800">
                                    No attempt logs available for this filter
                                    range.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-left text-sm text-foreground">
                                        <thead className="border-b border-border bg-slate-50/50 text-[10px] font-black tracking-wider text-muted-foreground uppercase dark:bg-slate-900/30">
                                            <tr>
                                                <th className="px-4 py-2.5">
                                                    Attempt
                                                </th>
                                                <th className="px-4 py-2.5">
                                                    Date
                                                </th>
                                                <th className="px-4 py-2.5">
                                                    Type
                                                </th>
                                                <th className="px-4 py-2.5">
                                                    Score & Categories
                                                </th>
                                                <th className="px-4 py-2.5 text-right">
                                                    Result
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border bg-card dark:divide-slate-900/80">
                                            {[...filteredChartData]
                                                .reverse()
                                                .map((run, i) => {
                                                    if (
                                                        run.track === 'No Data'
                                                    ) {
                                                        return null;
                                                    }

                                                    const status =
                                                        run.score >= 80
                                                            ? 'Pass'
                                                            : 'Fail';

                                                    return (
                                                        <tr
                                                            key={i}
                                                            className="transition hover:bg-slate-50/20 dark:hover:bg-slate-900/10"
                                                        >
                                                            <td className="px-4 py-4 font-black text-slate-950 dark:text-white">
                                                                {run.label}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                                                                {run.date}
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <TrackBadge
                                                                    track={
                                                                        run.track
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <ScoreProgress
                                                                    score={
                                                                        run.score
                                                                    }
                                                                    status={
                                                                        status
                                                                    }
                                                                    detail={
                                                                        run.detail
                                                                    }
                                                                    categoryScores={
                                                                        run.categoryScores
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right">
                                                                <StatusBadge
                                                                    status={
                                                                        status
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Category Breakdown list */}
                    {/* Category Breakdown list */}
                    <Card className="relative p-6">
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-heading text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                                    Diagnostic Mastery
                                </h2>
                                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    Subject accuracy at a glance.
                                </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-500 uppercase dark:bg-slate-900 dark:text-slate-400">
                                Mastery
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {categories.map((cat) => {
                                // Compute dynamic mastery descriptors & badge styles
                                let label = 'Not Started';
                                let badgeClass =
                                    'bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';

                                if (cat.total && cat.total > 0) {
                                    if (cat.percentage >= 80) {
                                        label = 'Mastery';
                                        badgeClass =
                                            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
                                    } else if (cat.percentage >= 60) {
                                        label = 'Proficient';
                                        badgeClass =
                                            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
                                    } else {
                                        label = 'Needs Work';
                                        badgeClass =
                                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
                                    }
                                }

                                return (
                                    <div
                                        key={cat.name}
                                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-sm transition hover:border-blue-100 hover:shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-900/40"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <span className="block truncate text-base font-black text-slate-950 dark:text-white">
                                                    {cat.name} Ability
                                                </span>
                                                <span className="mt-0.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                                                    {cat.total && cat.total > 0
                                                        ? `${cat.correct}/${cat.total} solved`
                                                        : '0/0 solved'}
                                                </span>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <span className="font-heading text-2xl font-black text-slate-950 dark:text-white">
                                                    {cat.percentage}%
                                                </span>
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${badgeClass}`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                                                style={{
                                                    width: `${cat.percentage}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <Link
                                                href={
                                                    drillsIndex({
                                                        query: {
                                                            category:
                                                                cat.name ===
                                                                'General'
                                                                    ? 'General Information'
                                                                    : cat.name +
                                                                      ' Ability',
                                                        },
                                                    }).url
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                                            >
                                                Start {cat.name} Drill &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </PageContainer>
        </>
    );
}

// Preserve navigation breadcrumb tracking config logic
Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
