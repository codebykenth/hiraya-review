import { Head, Link } from '@inertiajs/react';
import { Award, BookOpen, ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/exam-formatters';

interface ScorecardViewProps {
    details: any;
    isDrillSession: boolean;
    drillCategoryName: string | null;
    savedAttempt: any;
    results: any;
    isTimed: boolean;
    getActiveTimeLimitSecs: () => number;
    submittedByTimer: boolean;
    setReviewScreenActive: (val: boolean) => void;
    handleBeginExam: () => void;
}

export function ScorecardView({
    details,
    isDrillSession,
    drillCategoryName,
    savedAttempt,
    results,
    isTimed,
    getActiveTimeLimitSecs,
    submittedByTimer,
    setReviewScreenActive,
}: ScorecardViewProps) {
    const elapsedSecs = results?.elapsedSecs ?? 0;
    const remainingSecs = isTimed
        ? Math.max(0, getActiveTimeLimitSecs() - elapsedSecs)
        : 0;
    const elapsedText = formatDuration(elapsedSecs);
    const underLimitText =
        remainingSecs > 0
            ? `${formatDuration(remainingSecs, false)} under limit`
            : 'Used full time limit';

    let aiAnalysisText = '';

    if (results?.correctCount === 0) {
        aiAnalysisText =
            'You did not answer any questions correctly on this attempt. We recommend reviewing the foundational concepts across all categories, starting with General Information and Verbal Ability, to build up your core competencies.';
    } else if (results) {
        if (isDrillSession) {
            let strongestSubcat = '';
            let strongestSubcatPct = -1;
            let weakestSubcat = '';
            let weakestSubcatPct = 101;
            let targetCategoryName = drillCategoryName || 'Practice Drill';

            Object.entries(results.categoryScoreMap || {}).forEach(
                ([cat, val]: [string, any]) => {
                    targetCategoryName = cat;
                    Object.entries(val.subcats || {}).forEach(
                        ([sub, subVal]: [string, any]) => {
                            const subPct =
                                subVal.total > 0
                                    ? (subVal.correct / subVal.total) * 100
                                    : 0;

                            if (subPct > strongestSubcatPct) {
                                strongestSubcatPct = subPct;
                                strongestSubcat = sub;
                            }

                            if (subPct < weakestSubcatPct) {
                                weakestSubcatPct = subPct;
                                weakestSubcat = sub;
                            }
                        },
                    );
                },
            );

            if (!strongestSubcat) {
                strongestSubcat = 'fundamental questions';
            }

            if (!weakestSubcat) {
                weakestSubcat = 'specific target modules';
            }

            if (strongestSubcat === weakestSubcat) {
                if (results.percentage >= 80) {
                    aiAnalysisText = `You completed a focused drill in ${targetCategoryName}. Your accuracy was consistent and strong across your targeted subcategories. Keep practicing to maintain this level!`;
                } else {
                    aiAnalysisText = `You completed a focused drill in ${targetCategoryName}. We recommend spending more time reviewing the core concepts of "${strongestSubcat}" to raise your overall accuracy.`;
                }
            } else {
                aiAnalysisText = `In this ${targetCategoryName} practice drill, you showed strong proficiency in ${strongestSubcat} topics. To maximize your performance in this category, we recommend focusing review efforts on ${weakestSubcat}.`;
            }
        } else {
            let strongestCategory = '';
            let strongestPct = -1;
            let weakestCategory = '';
            let weakestPct = 101;
            let weakestSubcat = 'fundamental concepts';

            Object.entries(results.categoryScoreMap || {}).forEach(
                ([cat, val]: [string, any]) => {
                    if (
                        cat === 'Demographic Profile' ||
                        cat === 'Demographic'
                    ) {
                        return;
                    }

                    const catPct =
                        val.total > 0 ? (val.correct / val.total) * 100 : 0;

                    if (catPct > strongestPct) {
                        strongestPct = catPct;
                        strongestCategory = cat;
                    }

                    if (catPct < weakestPct) {
                        weakestPct = catPct;
                        weakestCategory = cat;
                        const subEntries = Object.entries(val.subcats || {});

                        if (subEntries.length > 0) {
                            const sortedSubs = [...subEntries].sort(
                                (a: any, b: any) => {
                                    const aPct =
                                        a[1].total > 0
                                            ? a[1].correct / a[1].total
                                            : 0;
                                    const bPct =
                                        b[1].total > 0
                                            ? b[1].correct / b[1].total
                                            : 0;

                                    return aPct - bPct;
                                },
                            );
                            weakestSubcat = sortedSubs[0][0];
                        }
                    }
                },
            );

            const weakCategories: string[] = [];
            Object.entries(results.categoryScoreMap || {}).forEach(
                ([cat, val]: [string, any]) => {
                    if (
                        cat === 'Demographic Profile' ||
                        cat === 'Demographic'
                    ) {
                        return;
                    }

                    const catPct =
                        val.total > 0 ? (val.correct / val.total) * 100 : 0;

                    if (catPct < 80 && cat !== strongestCategory) {
                        weakCategories.push(cat);
                    }
                },
            );

            if (!strongestCategory) {
                strongestCategory = 'Verbal Ability';
            }

            if (!weakestCategory) {
                weakestCategory = 'Numerical Ability';
            }

            const formattedStrongestPct = (
                Math.trunc(strongestPct * 100) / 100
            ).toFixed(2);

            if (strongestPct < 80 && strongestPct !== -1) {
                // The user did poorly across the board (all below passing grade)
                const otherSubjectsToStudy = [
                    ...weakCategories.filter((c) => c !== weakestCategory),
                    strongestCategory,
                ]
                    .join(', ')
                    .replace(/, ([^,]*)$/, ', and finally $1');
                aiAnalysisText = `While ${strongestCategory} was your highest scoring area (${formattedStrongestPct}%), your results indicate a need for comprehensive review across all subjects to reach the 80% passing grade. We recommend prioritizing ${weakestCategory} (specifically ${weakestSubcat}) before moving on to ${otherSubjectsToStudy}.`;
            } else if (weakCategories.length > 1) {
                const allWeakList = weakCategories
                    .join(', ')
                    .replace(/, ([^,]*)$/, ' and $1');
                aiAnalysisText = `Your strongest area was ${strongestCategory} (${formattedStrongestPct}%). You have multiple areas needing improvement, specifically ${allWeakList}. Focus your initial review efforts heavily on ${weakestCategory}, particularly the ${weakestSubcat} modules.`;
            } else if (weakCategories.length === 1) {
                aiAnalysisText = `Your strongest area was ${strongestCategory} (${formattedStrongestPct}%). To improve your overall score, focus your review efforts on ${weakestCategory}, specifically the ${weakestSubcat} modules.`;
            } else {
                aiAnalysisText = `Great job! Your strongest area was ${strongestCategory} (${formattedStrongestPct}%). While all your category scores are solid, you can further perfect your overall score by reviewing ${weakestCategory}, specifically ${weakestSubcat}.`;
            }
        }
    }

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="animate-in duration-200 fade-in">
            <Head
                title={
                    isDrillSession
                        ? `Scorecard: ${drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill'}`
                        : `Scorecard: ${details.title}`
                }
            />

            {savedAttempt && (
                <Link
                    href="/history"
                    className="text-slate-850 mb-4 flex w-fit cursor-pointer items-center gap-1 text-xs font-black transition hover:text-blue-600 focus:outline-none dark:text-white dark:hover:text-blue-400"
                >
                    <ChevronLeft className="size-4" /> Back to History
                </Link>
            )}

            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Award className="size-3" /> Review Panel
                    </span>
                    <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                        {isDrillSession ? 'Drill Results' : 'Exam Results'}
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Completed on{' '}
                        {savedAttempt?.created_at
                            ? new Date(
                                  savedAttempt.created_at,
                              ).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                              })
                            : new Date().toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                              })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setReviewScreenActive(true)}
                        className="shadow-3xs hover:bg-slate-55/60 flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold transition focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                        <BookOpen className="size-3.5" /> View Review
                    </button>
                </div>
            </div>

            {submittedByTimer && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    Time expired — your exam was submitted automatically and
                    your scorecard is shown below.
                </div>
            )}

            {results &&
                (() => {
                    const exactPercentage =
                        results.total > 0
                            ? (results.correctCount / results.total) * 100
                            : 0;
                    const formattedPercentage = (
                        Math.trunc(exactPercentage * 100) / 100
                    ).toFixed(2);
                    const strokeDashoffsetExact =
                        circumference - (exactPercentage / 100) * circumference;

                    return (
                        <div className="mt-4 flex flex-col gap-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 md:p-6 dark:border-slate-800 dark:bg-slate-950">
                                {/* Top Section: Circle & Categories */}
                                <div className="flex flex-row items-center gap-4 sm:gap-8">
                                    {/* Circle Percentage */}
                                    <div className="flex w-28 shrink-0 flex-col items-center sm:w-64 lg:w-72">
                                        <div className="relative flex flex-col items-center justify-center">
                                            <div className="relative flex size-24 items-center justify-center sm:size-40">
                                                <svg
                                                    className="size-full -rotate-90"
                                                    viewBox="0 0 100 100"
                                                >
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        className="fill-none stroke-slate-100 dark:stroke-slate-900"
                                                        strokeWidth="7"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        className="fill-none stroke-emerald-600 transition-all duration-500 dark:stroke-emerald-500"
                                                        strokeWidth="7"
                                                        strokeDasharray={
                                                            circumference
                                                        }
                                                        strokeDashoffset={
                                                            strokeDashoffsetExact
                                                        }
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-slate-850 text-xl leading-none font-black sm:text-3xl dark:text-white">
                                                        {formattedPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-col items-center gap-1 sm:mt-4 sm:gap-1.5">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-extrabold tracking-wider uppercase sm:px-3 sm:py-1 sm:text-[10px] ${exactPercentage >= 80 ? 'dark:text-emerald-450 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'dark:text-rose-450 bg-rose-50 text-rose-700 dark:bg-rose-950/40'}`}
                                                >
                                                    {exactPercentage >= 80
                                                        ? 'PASSED'
                                                        : 'FAILED'}
                                                </span>
                                                <p className="text-slate-550 mt-0.5 text-center text-[10px] leading-tight font-semibold sm:mt-1 sm:text-xs dark:text-slate-400">
                                                    Final Grade
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Breakdown */}
                                    <div className="flex w-full flex-1 flex-col">
                                        <div className="flex flex-col gap-2 sm:gap-3">
                                            {Object.entries(
                                                results.categoryScoreMap || {},
                                            ).map(
                                                ([cat, val]: [string, any]) => {
                                                    const catExactPct =
                                                        val.total > 0
                                                            ? (val.correct /
                                                                  val.total) *
                                                              100
                                                            : 0;
                                                    const catFormattedPct = (
                                                        Math.trunc(
                                                            catExactPct * 100,
                                                        ) / 100
                                                    ).toFixed(2);

                                                    return (
                                                        <div
                                                            key={cat}
                                                            className="rounded-xl border border-border bg-card p-2.5 transition-all duration-300 hover:shadow-sm sm:p-3.5"
                                                        >
                                                            <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                                                                <span className="truncate pr-2 text-[9px] font-black tracking-wider text-foreground uppercase sm:text-xs">
                                                                    {cat}
                                                                </span>
                                                                <span
                                                                    className={`rounded-md px-1 py-0.5 text-[8px] font-bold sm:px-1.5 sm:text-[10px] ${catExactPct >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'}`}
                                                                >
                                                                    {
                                                                        catFormattedPct
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                <div className="h-1 flex-1 rounded-full bg-muted sm:h-1.5">
                                                                    <div
                                                                        className={`h-1 rounded-full transition-all duration-1000 sm:h-1.5 ${catExactPct >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                        style={{
                                                                            width: `${catExactPct}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="w-6 text-right text-[8px] font-bold text-muted-foreground sm:w-8 sm:text-[10px]">
                                                                    {
                                                                        val.correct
                                                                    }
                                                                    /{val.total}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section: 4 Stat Boxes */}
                                <div className="mt-4 grid w-full grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4 dark:border-slate-800">
                                    <div className="dark:border-slate-850 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:bg-slate-900/50">
                                        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                            Correct
                                        </span>
                                        <p className="mt-1.5 text-xl font-black text-emerald-600 dark:text-emerald-400">
                                            {results.correctCount}
                                        </p>
                                        <span className="mt-1 text-[10px] font-bold text-slate-400">
                                            of {results.total}
                                        </span>
                                    </div>
                                    <div className="dark:border-slate-850 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:bg-slate-900/50">
                                        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                            Incorrect
                                        </span>
                                        <p className="mt-1.5 text-xl font-black text-rose-600 dark:text-rose-400">
                                            {results.wrongCount}
                                        </p>
                                        <span className="mt-1 text-[10px] font-bold text-slate-400">
                                            of {results.total}
                                        </span>
                                    </div>
                                    <div className="dark:border-slate-850 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:bg-slate-900/50">
                                        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                            Skipped
                                        </span>
                                        <p className="mt-1.5 text-xl font-black text-slate-500">
                                            {results.skippedCount}
                                        </p>
                                        <span className="mt-1 text-[10px] font-bold text-slate-400">
                                            unanswered
                                        </span>
                                    </div>
                                    <div className="dark:border-slate-850 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:bg-slate-900/50">
                                        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                            Time
                                        </span>
                                        <p className="mt-1.5 text-xl font-black text-blue-600 dark:text-blue-400">
                                            {elapsedText}
                                        </p>
                                        <span className="mt-1 w-full truncate px-1 text-[10px] font-bold text-slate-400">
                                            {underLimitText}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="flex flex-col gap-4 lg:col-span-2">
                                    <div className="rounded-xl border border-blue-100/50 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                                        <h3 className="mb-2 flex items-center gap-1.5 font-heading text-sm font-bold text-blue-900 dark:text-blue-300">
                                            <Award className="size-4" />{' '}
                                            Performance Analysis
                                        </h3>
                                        <p className="text-xs leading-relaxed text-blue-800/80 dark:text-blue-200/70">
                                            {aiAnalysisText}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-950">
                                        <h3 className="mb-3 font-heading text-sm font-bold text-slate-900 dark:text-white">
                                            Next Steps
                                        </h3>
                                        <p className="mb-4 text-xs text-slate-500">
                                            Based on your performance, we
                                            recommend taking another drill
                                            focused on your weak areas.
                                        </p>
                                        <Link href={'/drills'}>
                                            <Button className="w-full shadow-sm">
                                                Start Custom Drill{' '}
                                                <ArrowRight className="ml-1 size-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </div>
    );
}
