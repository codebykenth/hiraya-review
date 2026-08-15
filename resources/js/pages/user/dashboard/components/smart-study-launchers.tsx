import { Link } from '@inertiajs/react';
import {
    Target,
    Brain,
    BookOpen,
    ClipboardList,
    ChevronRight,
    Sparkles,
    Zap,
    Clock,
} from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { index as drillsIndex } from '@/routes/drills';
import { index as examsIndex } from '@/routes/exams';
import { index as learnIndex } from '@/routes/learn';
import type { NextModuleItem } from '../types';

interface SmartStudyLaunchersProps {
    nextModule?: NextModuleItem | null;
    primaryWeakness?: string | null;
}

export function SmartStudyLaunchers({
    nextModule,
    primaryWeakness,
}: SmartStudyLaunchersProps) {
    return (
        <Card className="relative flex min-h-[460px] h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 sm:p-6">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                        <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Smart Study Launchers
                        </h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Jump straight into your high-yield study modes
                        </p>
                    </div>
                </div>
            </div>

            {/* 4 Contextual Tiles Grid */}
            <div className="my-auto py-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Tile 1: Practice Drills */}
                <Link
                    href={
                        primaryWeakness
                            ? '/drills/smart-weakness?from=/dashboard'
                            : drillsIndex({ query: { from: '/dashboard' } })
                    }
                    className="group relative flex flex-col justify-between rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-indigo-950/60 dark:from-indigo-950/30 dark:to-slate-900/60 dark:hover:border-indigo-800"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                                <Target className="size-4" />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                <Zap className="size-2.5 fill-current" />
                                {primaryWeakness ? 'Smart Drill' : '10 Qs'}
                            </span>
                        </div>
                        <h3 className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                            Practice Drills
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {primaryWeakness
                                ? `Fix: ${primaryWeakness}`
                                : 'Sharpen specific subtopics'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600 transition-transform group-hover:translate-x-0.5 dark:text-indigo-400">
                        <span>Launch Drill</span>
                        <ChevronRight className="size-3" />
                    </div>
                </Link>

                {/* Tile 2: Custom Drill Builder */}
                <Link
                    href="/drills?tab=custom&from=/dashboard"
                    className="group relative flex flex-col justify-between rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-violet-950/60 dark:from-violet-950/30 dark:to-slate-900/60 dark:hover:border-violet-800"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                                <Sparkles className="size-4" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                                Custom Mix
                            </span>
                        </div>
                        <h3 className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                            Custom Drills
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Build multi-topic &amp; mistake sets
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-violet-600 transition-transform group-hover:translate-x-0.5 dark:text-violet-400">
                        <span>Build Drill</span>
                        <ChevronRight className="size-3" />
                    </div>
                </Link>

                {/* Tile 3: Learn Modules */}
                <Link
                    href={nextModule ? `/learn/${nextModule.slug}` : learnIndex()}
                    className="group relative flex flex-col justify-between rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-sky-950/60 dark:from-sky-950/30 dark:to-slate-900/60 dark:hover:border-sky-800"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
                                <BookOpen className="size-4" />
                            </div>
                            {nextModule?.estimated_minutes && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                                    <Clock className="size-2.5" />
                                    {nextModule.estimated_minutes}m
                                </span>
                            )}
                        </div>
                        <h3 className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                            Learn Scope
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {nextModule?.title
                                ? `Next: ${nextModule.title}`
                                : 'Core syllabus modules'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sky-600 transition-transform group-hover:translate-x-0.5 dark:text-sky-400">
                        <span>Continue Reading</span>
                        <ChevronRight className="size-3" />
                    </div>
                </Link>

                {/* Tile 4: Mock Exams */}
                <Link
                    href={examsIndex({ query: { from: '/dashboard' } })}
                    className="group relative flex flex-col justify-between rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-emerald-950/60 dark:from-emerald-950/30 dark:to-slate-900/60 dark:hover:border-emerald-800"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                                <ClipboardList className="size-4" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                                Full Mock
                            </span>
                        </div>
                        <h3 className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                            Mock Exams
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Timed official exam simulation
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 transition-transform group-hover:translate-x-0.5 dark:text-emerald-400">
                        <span>View Exams</span>
                        <ChevronRight className="size-3" />
                    </div>
                </Link>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <Link
                    href="/guide"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <span>View CSE Reviewer Guide</span>
                    <ChevronRight className="size-3" />
                </Link>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    4 Core Modes
                </span>
            </div>
        </Card>
    );
}
