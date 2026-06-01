import { CheckCircle2, XCircle } from 'lucide-react';

export function TrackBadge({ track }: { track: string }) {
    const lowerTrack = track.toLowerCase();
    let trackLabel = track;
    let trackClass = '';

    if (lowerTrack.includes('subprofessional')) {
        trackLabel = 'Subprofessional';
        trackClass =
            'bg-slate-150 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    } else if (lowerTrack.includes('professional')) {
        trackLabel = 'Professional';
        trackClass = 'bg-blue-600 text-white dark:bg-blue-750';
    } else {
        // Drill
        trackLabel = 'Drill';
        trackClass = 'bg-emerald-600 text-white dark:bg-emerald-750';
    }

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${trackClass}`}
        >
            {trackLabel}
        </span>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();
    let badgeClass = '';
    let StatusIcon = CheckCircle2;
    let text = '';

    if (normalized === 'pass' || normalized === 'passed') {
        badgeClass =
            'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900/30';
        StatusIcon = CheckCircle2;
        text = 'Pass';
    } else if (normalized === 'fail' || normalized === 'failed') {
        badgeClass =
            'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-200 dark:border-rose-900/30';
        StatusIcon = XCircle;
        text = 'Fail';
    } else {
        // Completed
        badgeClass =
            'bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-450 border border-blue-200 dark:border-blue-900/30';
        StatusIcon = CheckCircle2;
        text = 'Completed';
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${badgeClass}`}
        >
            <StatusIcon className="size-3 shrink-0" />
            {text}
        </span>
    );
}

interface CategoryScore {
    name: string;
    correct: number;
    total: number;
    percentage: number;
}

interface ScoreProgressProps {
    score: number;
    status: string;
    detail?: string;
    categoryScores?: CategoryScore[];
}

export function ScoreProgress({
    score,
    status,
    detail,
    categoryScores = [],
}: ScoreProgressProps) {
    const normalizedStatus = status.toLowerCase();
    const isPass = normalizedStatus === 'pass' || normalizedStatus === 'passed';
    const isFail = normalizedStatus === 'fail' || normalizedStatus === 'failed';

    const scoreColor = isPass
        ? 'text-emerald-700 dark:text-emerald-450'
        : isFail
          ? 'text-rose-650 dark:text-rose-400'
          : 'text-blue-600 dark:text-blue-450';

    const scoreBarColor = isPass
        ? 'bg-emerald-600'
        : isFail
          ? 'bg-rose-600'
          : 'bg-blue-600';

    // Parse fraction from detail string if available (e.g. "68/170 Correct" or "11/150")
    let fraction = '';

    if (detail) {
        const match = detail.match(/(\d+\/\d+)/);

        if (match) {
            fraction = match[1];
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1">
                    <span
                        className={`shrink-0 text-xs font-black ${scoreColor}`}
                    >
                        {score}%
                    </span>
                    {fraction && (
                        <span className="text-[10px] font-semibold text-muted-foreground">
                            ({fraction})
                        </span>
                    )}
                </div>
                {/* Progress bar with dark mode visible background track */}
                <div className="h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${scoreBarColor}`}
                        style={{ width: `${Math.max(3, score)}%` }}
                    />
                </div>
            </div>

            {categoryScores && categoryScores.length > 0 && (
                <div className="flex max-w-[24rem] flex-wrap gap-1.5">
                    {categoryScores.map((cat) => (
                        <span
                            key={cat.name}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground dark:border-slate-800 dark:bg-slate-900"
                            title={`${cat.correct}/${cat.total} correct`}
                        >
                            {cat.name}:{' '}
                            <span className="text-foreground">
                                {cat.percentage}%
                            </span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
