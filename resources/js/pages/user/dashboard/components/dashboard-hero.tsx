import { Link } from '@inertiajs/react';
import {
    Sparkles,
    Calendar,
    ChevronDown,
    Play,
    Flame,
    GraduationCap,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index as examsIndex } from '@/routes/exams';
import type { DashboardStats } from '../types';

interface DashboardHeroProps {
    firstName: string;
    stats?: DashboardStats | null;
    motivationText?: string | null;
    streak?: number;
}

export function DashboardHero({
    firstName,
    stats,
    motivationText,
    streak = 0,
}: DashboardHeroProps) {
    const daysUntilExam = stats?.daysUntilExam;
    const examDate = stats?.examDate;
    const examDescription = stats?.examDescription;

    const defaultMotivation =
        'Consistency is your superpower. Master your weak spots and claim your eligibility!';
    const motivation = motivationText || defaultMotivation;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/40 p-5 shadow-sm sm:p-7 dark:border-slate-800/80 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-blue-950/20">
            {/* Background Decorative Glow Elements */}
            <div
                className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15"
                aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left Side: Greeting & Motivation */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur-md dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                            <Sparkles className="size-3.5 animate-pulse text-blue-500 dark:text-blue-400" />
                            <span>Study Command Center</span>
                        </div>

                        {streak > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-700 backdrop-blur-md dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                                <Flame className="size-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                                <span>{streak} Day Streak</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                            Welcome back,{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
                                {firstName}
                            </span>
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                            {motivation}
                        </p>
                    </div>
                </div>

                {/* Right Side: Compact Exam Countdown & Main CTA */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    {examDate && typeof daysUntilExam === 'number' && (
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                                <Calendar className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Civil Service Exam
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                        {daysUntilExam > 0
                                            ? `${daysUntilExam}d left`
                                            : 'Exam Day'}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {examDate}
                                    {examDescription
                                        ? ` · ${examDescription}`
                                        : ''}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick Mock Exam Launcher CTA */}
                    <div className="flex w-full gap-2 sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="default"
                                    className="group w-full gap-2 bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-500"
                                >
                                    <Play className="size-4 fill-current transition-transform group-hover:scale-110" />
                                    <span>Take Mock Exam</span>
                                    <ChevronDown className="size-3.5 opacity-70 transition-transform group-data-[state=open]:rotate-180" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
                            >
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={
                                            examsIndex({
                                                query: {
                                                    start: 'professional',
                                                },
                                            }).url
                                        }
                                        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                                    >
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="size-4 text-blue-600 dark:text-blue-400" />
                                            <span>Professional Exam</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            170 Qs
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={
                                            examsIndex({
                                                query: {
                                                    start: 'subprofessional',
                                                },
                                            }).url
                                        }
                                        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                                    >
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="size-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>Subprofessional</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            165 Qs
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
