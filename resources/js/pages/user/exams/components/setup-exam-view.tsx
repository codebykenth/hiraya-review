import { Head } from '@inertiajs/react';
import {
    Award,
    ClipboardList,
    List,
    CheckCircle2,
    Clock,
    Timer,
    ArrowRight,
} from 'lucide-react';
import React from 'react';
import { HowItWorksModal } from '@/components/how-it-works-modal';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';

interface SetupExamViewProps {
    selectedExamId: number | null;
    setSelectedExamId: (id: number) => void;
    details: {
        title: string;
        timeLimitSecs: number;
        totalItems: number;
        scoredItems: number;
        timeLimit: string;
        targetPace: string;
    };
    handleBeginExam: () => void;
    customConfirmModal: React.ReactNode;
}

export function SetupExamView({
    selectedExamId,
    setSelectedExamId,
    details,
    handleBeginExam,
    customConfirmModal,
}: SetupExamViewProps) {
    return (
        <>
            <Head title="Mock Exams" />

            <PageContainer>
                {/* Header Information Section */}
                <div className="mb-8 flex items-start gap-3">
                    <PageHeader
                        title="Mock Exams"
                        description="Select your target certification level to configure the simulation parameters."
                        tooltip="A full-length timed mock examination simulating the official Civil Service Exam environment."
                    />
                    <div className="mt-1">
                        <HowItWorksModal
                            title="How Mock Exams Work"
                            tips={[
                                {
                                    icon: 'â±ï¸',
                                    title: 'Full Simulation',
                                    text: 'This is a strict simulation of the actual Civil Service Exam. Once started, the timer cannot be paused.',
                                },
                                {
                                    icon: 'ðŸ“Š',
                                    title: 'Post-Exam Review',
                                    text: 'You will only see your score and the correct answers after you submit the entire exam. Use the review mode to analyze your mistakes.',
                                },
                                {
                                    icon: 'ðŸŽ¯',
                                    title: 'Passing Target',
                                    text: 'Aim for a score of 80% or higher, which is the actual passing rate for the official Civil Service Exam.',
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Primary Column Grid Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Panel: Level Selectors */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Professional Level Card */}
                        <div
                            onClick={() => setSelectedExamId(1)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-5 shadow-sm transition hover:shadow-md ${
                                selectedExamId === 1
                                    ? 'border-blue-600 bg-blue-50/10 dark:border-blue-500 dark:bg-blue-950/10'
                                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <Award className="size-6 fill-current text-white" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                        Professional Level
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm dark:text-slate-400">
                                        Comprehensive assessment for supervisory
                                        and advanced technical positions.
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 pl-4">
                                <div
                                    className={`flex size-5 items-center justify-center rounded-full border ${
                                        selectedExamId === 1
                                            ? 'border-blue-600 dark:border-blue-500'
                                            : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                >
                                    {selectedExamId === 1 && (
                                        <div className="size-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Subprofessional Level Card */}
                        <div
                            onClick={() => setSelectedExamId(2)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-5 shadow-sm transition hover:shadow-md ${
                                selectedExamId === 2
                                    ? 'border-blue-600 bg-blue-50/10 dark:border-blue-500 dark:bg-blue-950/10'
                                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    <ClipboardList className="size-6" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                        Subprofessional Level
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm dark:text-slate-400">
                                        Standardized assessment for clerical,
                                        routine, and manual service positions.
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 pl-4">
                                <div
                                    className={`flex size-5 items-center justify-center rounded-full border ${
                                        selectedExamId === 2
                                            ? 'border-blue-600 dark:border-blue-500'
                                            : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                >
                                    {selectedExamId === 2 && (
                                        <div className="size-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Simulation Overview */}
                    <div className="flex min-h-[380px] flex-col justify-between rounded-xl border border-blue-100/50 bg-blue-50/30 p-6 shadow-sm dark:border-blue-950/20 dark:bg-blue-950/10">
                        <div>
                            <h2 className="mb-4 border-b border-blue-100/40 pb-2 font-heading text-lg font-bold tracking-tight text-slate-900 dark:border-blue-950/20 dark:text-white">
                                Simulation Overview
                            </h2>

                            {/* Simulation Specs List */}
                            <div className="mt-2 flex flex-col gap-4.5">
                                {/* Total Items */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <List className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Total Items</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.totalItems}
                                    </span>
                                </div>

                                {/* Scored Items */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <CheckCircle2 className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Scored Items</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.scoredItems}
                                    </span>
                                </div>

                                {/* Time Limit */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Clock className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Time Limit</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.timeLimit}
                                    </span>
                                </div>

                                {/* Target Pace */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Timer className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Target Pace</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.targetPace}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions and Stable Connection Alert */}
                        <div className="mt-6 flex flex-col gap-4">
                            {/* Technical check callout to avoid data losses */}
                            <div className="rounded-lg border border-slate-200 bg-white/70 p-3.5 text-center text-[11px] leading-relaxed font-medium text-slate-600 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                                Ensure you have a stable connection. The timer
                                will begin immediately upon confirmation.
                            </div>

                            {/* Action CTA Button */}
                            <button
                                onClick={handleBeginExam}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-xs font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Begin Exam
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </PageContainer>
            {customConfirmModal}
        </>
    );
}
