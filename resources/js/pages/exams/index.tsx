import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { index as examsIndex } from '@/routes/exams';
import {
    Award,
    ClipboardList,
    List,
    CheckCircle2,
    Clock,
    Timer,
    ArrowRight,
} from 'lucide-react';

type Exam = {
    id: number;
    title: string;
    questions: number;
};

type ExamIndexProps = {
    exams: Exam[];
};

export default function ExamIndex({ exams }: ExamIndexProps) {
    // Default to the first exam (Professional Level, ID 1) matching the user mockup initial state
    const [selectedExamId, setSelectedExamId] = useState<number>(1);

    // Dynamic metrics configured to update the simulation parameters instantly
    const getSimulationDetails = (examId: number) => {
        if (examId === 1) {
            return {
                totalItems: 170,
                scoredItems: 150,
                timeLimit: '3h 10m',
                targetPace: '1.1 min/item',
            };
        }
        return {
            totalItems: 150,
            scoredItems: 130,
            timeLimit: '2h 30m',
            targetPace: '1.0 min/item',
        };
    };

    const details = getSimulationDetails(selectedExamId);

    return (
        <>
            <Head title="Exam Setup" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6">
                {/* Header Information Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                        Exam Setup
                    </h1>
                    <p className="text-sm text-slate-500 md:text-base dark:text-slate-400">
                        Select your target certification level to configure the
                        simulation parameters.
                    </p>
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
                                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
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
                                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
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
                            <div className="rounded-lg border border-slate-200 bg-white/70 p-3.5 text-center text-[11px] leading-relaxed font-medium text-slate-600 shadow-2xs dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                                Ensure you have a stable connection. The timer
                                will begin immediately upon confirmation.
                            </div>

                            {/* Action CTA Button */}
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-xs font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
                                Begin Exam
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Set global shell layouts for navigation links tracking
ExamIndex.layout = {
    breadcrumbs: [
        {
            title: 'Exams',
            href: examsIndex(),
        },
    ],
};
