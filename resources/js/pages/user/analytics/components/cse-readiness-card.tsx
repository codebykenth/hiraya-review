import { Link } from '@inertiajs/react';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Users,
    Zap,
    HelpCircle,
} from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { index as drillsIndex } from '@/routes/drills';
import type { AnalyticsStats } from '../types';

interface CseReadinessCardProps {
    stats: AnalyticsStats;
    isDemoMode: boolean;
}

export function CseReadinessCard({ stats, isDemoMode }: CseReadinessCardProps) {
    const readinessIndex = stats.cseReadinessIndex ?? stats.avgScore ?? 0;
    const hasSubtestRisk = stats.hasSubtestRisk ?? false;
    const percentile = stats.percentileRank ?? 50;
    const subtestThresholds = stats.subtestThresholds ?? [];
    const daysUntilExam = stats.daysUntilExam;
    const examDate = stats.examDate;

    const isIncompleteSyllabus =
        stats.isIncompleteSyllabus ??
        ((stats.mockExamCount ?? 0) === 0 &&
            (stats.coveredCategoriesCount ?? 0) < 3);
    const coveredCount = stats.coveredCategoriesCount ?? 0;

    // Determine readiness level
    const isPassing = !isIncompleteSyllabus && readinessIndex >= 80 && !hasSubtestRisk;
    const isMarginal = !isIncompleteSyllabus && readinessIndex >= 70 && !hasSubtestRisk;

    const statusBadge = isIncompleteSyllabus
        ? {
              text: `Syllabus Incomplete (${coveredCount}/5 Subjects)`,
              color: 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
              dotColor: 'bg-violet-500',
          }
        : isPassing
          ? {
                text: 'Exam Ready (Passing Track)',
                color: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                dotColor: 'bg-emerald-500',
            }
          : hasSubtestRisk
            ? {
                  text: 'Subtest Risk (< 70% Cutoff)',
                  color: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                  dotColor: 'bg-rose-500',
              }
            : isMarginal
              ? {
                    text: 'Near Passing (70–79%)',
                    color: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                    dotColor: 'bg-amber-500',
                }
              : {
                    text: 'Needs Preparation (< 70%)',
                    color: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
                    dotColor: 'bg-blue-500',
                };

    return (
        <Card className="relative overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 sm:p-6">
            {/* Top Row: Readiness Index, Status, Percentile, Countdown */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Overall Readiness Gauge & Core Status */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    {/* Score Circle / Metric */}
                    <div className="relative flex size-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 shadow-inner sm:size-28">
                        <span className="font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            {readinessIndex}%
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                            Readiness
                        </span>
                    </div>

                    {/* Status Info */}
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusBadge.color}`}
                            >
                                <span
                                    className={`size-2 rounded-full ${statusBadge.dotColor}`}
                                />
                                {statusBadge.text}
                            </span>

                            {percentile > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                                    <Users className="size-3" />
                                    Top {Math.max(1, 100 - percentile)}%
                                </span>
                            )}
                        </div>

                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                                Civil Service Exam Passing Readiness
                            </h2>
                            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {isIncompleteSyllabus
                                    ? `You've only practiced ${coveredCount} of 5 exam subjects so far. Complete a Full Mock Exam to unlock an accurate Civil Service passing prediction.`
                                    : hasSubtestRisk
                                      ? 'Caution: While your overall average is calculated, one or more core subtests are currently below the official 70% cutoff requirement.'
                                      : isPassing
                                        ? 'Outstanding! Your performance meets both the 80% General Weighted Average and the 70% subtest minimums across all subjects.'
                                        : 'To pass the CSE, you need at least an 80% general average with no subtest rating falling below 70%.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Action & Exam Target */}
                <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                    {daysUntilExam !== null && daysUntilExam !== undefined && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Calendar className="size-3.5 text-blue-500" />
                            <span>
                                {daysUntilExam > 0
                                    ? `${daysUntilExam} Days to CSE`
                                    : 'Exam is Today!'}
                            </span>
                            {examDate && (
                                <span className="text-[10px] text-muted-foreground">
                                    ({examDate})
                                </span>
                            )}
                        </div>
                    )}

                    <Link
                        href={drillsIndex({
                            query: {
                                category:
                                    stats.weakestArea &&
                                    stats.weakestArea !== 'Not Started'
                                        ? stats.weakestArea.includes(
                                              'Ability',
                                          ) ||
                                          stats.weakestArea.includes(
                                              'Information',
                                          )
                                            ? stats.weakestArea
                                            : `${stats.weakestArea} Ability`
                                        : 'Verbal Ability',
                                from: '/analytics',
                            },
                        })}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 active:scale-95"
                    >
                        <Zap className="size-3.5 fill-current" />
                        Launch Focus Drill Setup
                    </Link>
                </div>
            </div>

            {/* Bottom Row: Official CSC Subtest Cutoff Checklist (70% Rule) */}
            <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-primary" />
                        <span className="text-xs font-black tracking-wide text-slate-900 uppercase dark:text-white">
                            Subtest Cutoff Compliance (Minimum 70%)
                        </span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Subtest cutoff explanation"
                                        className="text-muted-foreground transition hover:text-foreground"
                                    >
                                        <HelpCircle className="size-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-2xl text-xs">
                                    Official Civil Service Commission rule: A
                                    candidate must obtain a general rating of at
                                    least 80.00% AND no subtest score below
                                    70.00%.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <span className="text-[11px] font-semibold text-muted-foreground">
                        {subtestThresholds.filter((s) => s.passed).length} of{' '}
                        {subtestThresholds.length || 5} passing
                    </span>
                </div>

                {/* Subtest Pills Grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {subtestThresholds.length > 0
                        ? subtestThresholds.map((subtest) => {
                              const shortName = subtest.category
                                  .replace(' Ability', '')
                                  .replace(' Information', '');

                              return (
                                  <div
                                      key={subtest.category}
                                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition ${
                                          subtest.passed
                                              ? 'border-emerald-200/80 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                                              : 'border-rose-200/80 bg-rose-50/50 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'
                                      }`}
                                  >
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                          {subtest.passed ? (
                                              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                          ) : (
                                              <AlertTriangle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                                          )}
                                          <span className="truncate font-bold">
                                              {shortName}
                                          </span>
                                      </div>
                                      <span
                                          className={`font-black ${
                                              subtest.passed
                                                  ? 'text-emerald-700 dark:text-emerald-300'
                                                  : 'text-rose-700 dark:text-rose-400'
                                          }`}
                                      >
                                          {subtest.score}%
                                      </span>
                                  </div>
                              );
                          })
                        : [
                              'Verbal',
                              'Clerical',
                              'General Info',
                              'Numerical',
                              'Analytical',
                          ].map((cat) => (
                              <div
                                  key={cat}
                                  className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/40 px-3 py-2 text-xs text-muted-foreground dark:border-slate-800 dark:bg-slate-900/40"
                              >
                                  <span className="font-bold">{cat}</span>
                                  <span className="font-semibold text-slate-400">
                                      {isDemoMode ? '70%+' : 'Pending'}
                                  </span>
                              </div>
                          ))}
                </div>
            </div>
        </Card>
    );
}
