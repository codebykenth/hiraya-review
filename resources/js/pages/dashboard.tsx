import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    Play,
    TrendingUp,
    TrendingDown,
    Award,
    FileText,
    ChevronDown,
    Zap,
} from 'lucide-react';

export default function Dashboard() {
    // Access Inertia shared props to greet the user dynamically
    const { auth } = usePage().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    // Mock data matching the curve and data points of the user mockup
    const chartDataPoints = [40, 52, 45, 68, 60, 85];
    const chartWidth = 500;
    const chartHeight = 180;
    const chartPadding = 20;

    // Map stats points to coordinate space within the responsive SVG viewport
    const points = chartDataPoints.map((val, idx) => {
        const x =
            chartPadding +
            (idx * (chartWidth - chartPadding * 2)) /
                (chartDataPoints.length - 1);
        const y =
            chartHeight -
            chartPadding -
            (val * (chartHeight - chartPadding * 2)) / 100;
        return { x, y };
    });

    // Generate smooth bezier curves connecting the score data points
    const pathD = points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;
        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    // Form an enclosed shape path to apply the soft gradient background fill
    const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`;

    const categories = [
        {
            name: 'Verbal',
            percentage: 92,
            color: 'bg-emerald-600 dark:bg-emerald-500',
        },
        {
            name: 'Clerical',
            percentage: 85,
            color: 'bg-blue-600 dark:bg-blue-500',
        },
        {
            name: 'Gen. Info',
            percentage: 78,
            color: 'bg-emerald-800 dark:bg-emerald-700',
        },
        {
            name: 'Numerical',
            percentage: 65,
            color: 'bg-rose-600 dark:bg-rose-500',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6">
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
                            <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
                                <Play className="size-3.5 fill-current" />
                                Start Professional Exam
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100/50 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                Start Subprofessional Exam
                            </button>
                        </div>
                        <button className="flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                            <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                            Practice Drill
                        </button>
                    </div>
                </div>

                {/* Stats Dashboard Overview Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* AVG SCORE */}
                    <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-5 shadow-sm transition hover:shadow-md dark:border-blue-950/30 dark:from-blue-950/10 dark:to-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                Avg Score
                            </span>
                            <Award className="size-4 text-blue-500" />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                84%
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                <TrendingUp className="size-3" />
                                +2%
                            </span>
                        </div>
                    </div>

                    {/* TOTAL EXAMS */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Total Exams
                            </span>
                            <FileText className="size-4 text-slate-400" />
                        </div>
                        <div className="mt-3">
                            <span className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                12
                            </span>
                            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                Completed this month
                            </p>
                        </div>
                    </div>

                    {/* STRONGEST AREA */}
                    <div className="relative overflow-hidden rounded-xl border border-l-4 border-slate-100 border-l-emerald-500 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                Strongest Area
                            </span>
                            <TrendingUp className="size-4 text-emerald-500" />
                        </div>
                        <div className="mt-3">
                            <span className="line-clamp-1 font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Verbal Reasoning
                            </span>
                        </div>
                    </div>

                    {/* WEAKEST AREA */}
                    <div className="relative overflow-hidden rounded-xl border border-l-4 border-slate-100 border-l-rose-500 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                Weakest Area
                            </span>
                            <TrendingDown className="size-4 text-rose-500" />
                        </div>
                        <div className="mt-3">
                            <span className="line-clamp-1 font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Numerical Ability
                            </span>
                        </div>
                    </div>
                </div>

                {/* Score Trends & Category breakdown container layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Score Trends Section */}
                    <div className="dark:border-slate-850 overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 dark:bg-slate-950">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                Score Trends
                            </h2>
                            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                                Last 30 Days
                                <ChevronDown className="size-3.5" />
                            </button>
                        </div>

                        {/* Custom SVG line chart visualization with background patterns */}
                        <div className="relative h-[180px] w-full rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800/40 dark:bg-slate-900/10">
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

                                {/* Background grid mesh matching user interface template design */}
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
                                        <line
                                            key={level}
                                            x1={chartPadding}
                                            y1={y}
                                            x2={chartWidth - chartPadding}
                                            y2={y}
                                            stroke="currentColor"
                                            strokeWidth="0.5"
                                            className="text-blue-100/30 dark:text-slate-800/30"
                                            strokeDasharray="4 4"
                                        />
                                    );
                                })}

                                <path d={areaD} fill="url(#chartGradient)" />
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {points.map((p, idx) => (
                                    <g key={idx}>
                                        <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r="4.5"
                                            fill="#ffffff"
                                            stroke="#2563eb"
                                            strokeWidth="2"
                                        />
                                        {idx === points.length - 1 && (
                                            <text
                                                x={p.x - 15}
                                                y={p.y - 12}
                                                fontSize="9"
                                                fontWeight="bold"
                                                fill="#2563eb"
                                                className="dark:fill-blue-400"
                                            >
                                                {chartDataPoints[idx]}%
                                            </text>
                                        )}
                                    </g>
                                ))}
                            </svg>
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <span className="rounded bg-white/70 px-2 py-0.5 text-xs font-semibold tracking-wider text-blue-500/25 uppercase dark:bg-slate-900/70 dark:text-blue-400/15">
                                    Line Chart Visualization
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown list */}
                    <div className="dark:border-slate-850 overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:bg-slate-950">
                        <h2 className="mb-5 font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            Category Breakdown
                        </h2>

                        <div className="flex flex-col gap-4">
                            {categories.map((cat) => (
                                <div
                                    key={cat.name}
                                    className="flex flex-col gap-1.5"
                                >
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            {cat.name}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {cat.percentage}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                                            style={{
                                                width: `${cat.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
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
