import { Link } from '@inertiajs/react';
import { BookOpen, RotateCcw, Clock, CheckCircle, XCircle, Layers, Tag } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { Attempt } from '../types';

interface AttemptExpandableRowProps {
    attempt: Attempt;
}

export function AttemptExpandableRow({ attempt }: AttemptExpandableRowProps) {
    const isDrill = attempt.track.toLowerCase().includes('drill');
    const categoryScores = attempt.category_scores || [];
    const subcategories = attempt.selected_subcategories || [];

    // Construct Retake URL
    let retakeUrl = '/exams';
    if (isDrill) {
        const queryParams = new URLSearchParams();
        if (attempt.category_id) {
            queryParams.set('category_id', String(attempt.category_id));
        }
        if (attempt.question_count && attempt.question_count !== 'all') {
            queryParams.set('count', String(attempt.question_count));
        }
        if (subcategories.length > 0) {
            queryParams.set('subcategories', subcategories.join(','));
        }
        retakeUrl = `/drills?${queryParams.toString()}`;
    } else {
        const trackParam = attempt.track.toLowerCase().includes('subprofessional')
            ? 'subprofessional'
            : 'professional';
        retakeUrl = `/exams?track=${trackParam}`;
    }

    return (
        <tr className="border-b border-border bg-slate-50/70 transition-colors dark:bg-slate-900/40">
            <td colSpan={9} className="px-6 py-4">
                <div className="flex flex-col gap-4">
                    {/* Header info & quick stats */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 font-bold text-foreground">
                                <Layers className="size-3.5 text-muted-foreground" />
                                {attempt.category}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="size-3.5" />
                                {attempt.correct} Correct
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                                <XCircle className="size-3.5" />
                                {attempt.wrong} Incorrect
                            </span>
                            {attempt.avg_time_per_q ? (
                                <>
                                    <span className="text-muted-foreground/60">•</span>
                                    <span className="flex items-center gap-1 font-medium text-muted-foreground">
                                        <Clock className="size-3.5" />
                                        Avg ~{attempt.avg_time_per_q}s / question
                                    </span>
                                </>
                            ) : null}
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-bold">
                                <Link href={retakeUrl}>
                                    <RotateCcw className="size-3.5 text-blue-600 dark:text-blue-400" />
                                    Retake {isDrill ? 'Drill' : 'Exam'}
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="h-8 gap-1.5 bg-blue-600 text-xs font-bold text-white hover:bg-blue-700">
                                <Link href={`/exams?attempt_id=${attempt.id}&from=history`}>
                                    <BookOpen className="size-3.5" />
                                    Review Answers
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Subcategories (if Drill) */}
                    {subcategories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase">
                                <Tag className="size-3" /> Subcategories:
                            </span>
                            {subcategories.map((sub, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center rounded-md border border-border/80 bg-white px-2 py-0.5 text-[11px] font-medium text-foreground dark:bg-slate-800"
                                >
                                    {sub}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Category score progress bars */}
                    {categoryScores.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                Section Performance Breakdown
                            </span>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                {categoryScores.map((cat) => {
                                    const isGood = cat.percentage >= 80;
                                    const isMedium = cat.percentage >= 60;
                                    const barColor = isGood
                                        ? 'bg-emerald-500'
                                        : isMedium
                                          ? 'bg-amber-500'
                                          : 'bg-rose-500';

                                    return (
                                        <div
                                            key={cat.name}
                                            className="flex flex-col gap-1.5 rounded-lg border border-border/60 bg-white p-2.5 dark:bg-slate-950/60"
                                        >
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span className="truncate text-foreground" title={cat.name}>
                                                    {cat.name}
                                                </span>
                                                <span className="shrink-0 text-muted-foreground">
                                                    {cat.correct}/{cat.total} ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                                    style={{ width: `${Math.max(4, cat.percentage)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
