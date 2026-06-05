import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    PenLine,
    HelpCircle,
    Sparkles,
    Globe,
    Layers,
    Activity,
} from 'lucide-react';
import { getCategoryStyles } from '@/components/domain/curation-index-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { renderFormattedText } from '@/lib/exam-formatters';

import {
    index as questionsIndex,
    edit as questionsEdit,
} from '@/routes/questions';

interface QuestionItem {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    options: string[];
    correct_option: number;
    explanation: string;
    language: string;
    status: string;
}

interface QuestionShowProps {
    question: QuestionItem;
}

export default function QuestionShow({ question }: QuestionShowProps) {
    return (
        <>
            <Head title={`Question Details #${question.id}`} />
            <PageContainer>
                {/* Back Link */}
                <Link
                    href={questionsIndex().url}
                    className="group flex w-fit items-center gap-1 text-xs font-black text-foreground transition transition-all duration-300 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400"
                >
                    <ChevronLeft className="size-4" />
                    Back to Curation Manager
                </Link>

                {/* Title & Edit Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Question Details"
                        description="Inspect CSE practice content, correct answer configurations, and cognitive rationales."
                    />

                    <Link href={questionsEdit(question.id).url}>
                        <Button
                            type="button"
                            variant="default"
                            size="default"
                            icon={PenLine}
                        >
                            Edit Question Content
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-3">
                    {/* Left & Middle Column: Question Stem & Choices */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* 1. Main Question Card */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center justify-between border-b border-border pb-3.5">
                                <span className="flex items-center gap-1.5 text-xs font-black text-foreground uppercase">
                                    <HelpCircle className="size-4.5 text-blue-600 dark:text-blue-400" />
                                    Exam Practice Question
                                </span>

                                <span
                                    className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(question.category)}`}
                                >
                                    {question.category}
                                </span>
                            </div>

                            {/* Stem */}
                            <div className="mb-6 text-sm leading-relaxed font-semibold whitespace-pre-line text-foreground">
                                {renderFormattedText(question.stem)}
                            </div>

                            {/* Option list stack */}
                            <div className="space-y-3">
                                {question.options.map((option, idx) => {
                                    const isCorrect =
                                        question.correct_option === idx;

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-4 rounded-xl border p-4 transition duration-200 ${
                                                isCorrect
                                                    ? 'border-emerald-250 dark:bg-emerald-950/30/20 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/10'
                                                    : 'border-border'
                                            }`}
                                        >
                                            {/* Choice Index Badge */}
                                            <span
                                                className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                                    isCorrect
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {String.fromCharCode(65 + idx)}
                                            </span>

                                            {/* Option text */}
                                            <span
                                                className={`text-xs leading-relaxed font-semibold ${
                                                    isCorrect
                                                        ? 'font-extrabold text-foreground'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {renderFormattedText(
                                                    option,
                                                    false,
                                                    undefined,
                                                    true,
                                                )}
                                            </span>

                                            {/* Correct marker check */}
                                            {isCorrect && (
                                                <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100/70 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                    Correct Answer
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Rationale Card */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                            <h2 className="mb-4 flex items-center gap-1.5 border-b border-border pb-3.5 text-sm font-black text-foreground uppercase">
                                <Sparkles className="size-4.5 text-blue-600 dark:text-blue-400" />
                                Cognitive Explanation & Rationale
                            </h2>
                            <div className="text-sm leading-relaxed text-muted-foreground">
                                {renderFormattedText(question.explanation)}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Metadata details card */}
                    <div className="space-y-6">
                        {/* Summary specifications card */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                            <h2 className="mb-4 block border-b border-border pb-3 text-xs font-black tracking-wider text-foreground uppercase">
                                Question Metrics
                            </h2>

                            <div className="space-y-4">
                                {/* Unique ID */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                        Record ID
                                    </span>
                                    <span className="font-mono font-black text-foreground">
                                        #{question.id}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                        Publish Status
                                    </span>
                                    {question.status === 'ACTIVE' ? (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 uppercase dark:border-blue-900/30 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400">
                                            Draft
                                        </span>
                                    )}
                                </div>

                                {/* Target Subcategory */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                        Subcategory
                                    </span>
                                    <span className="font-bold text-foreground capitalize">
                                        {question.subcategory}
                                    </span>
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                        <Globe className="size-3.5 text-muted-foreground" />
                                        Language
                                    </span>
                                    <span className="text-foreground">
                                        {question.language}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CSE Syllabus Mapping specs */}
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                            <h2 className="mb-4 block border-b border-border pb-3 text-xs font-black tracking-wider text-foreground uppercase">
                                CSE Curation Guidelines
                            </h2>

                            <div className="space-y-3.5 text-xs leading-relaxed font-semibold text-muted-foreground">
                                <div className="flex gap-2">
                                    <Layers className="mt-0.5 size-4.5 shrink-0 text-blue-600 dark:text-blue-400" />
                                    <p>
                                        Always align practice questions directly
                                        to the official syllabus structure for
                                        maximum efficacy.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Activity className="mt-0.5 size-4.5 shrink-0 text-blue-600 dark:text-blue-400" />
                                    <p>
                                        Ensure distractor options are authentic
                                        and that rationales detail standard
                                        time-saving approximation shortcuts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </>
    );
}

QuestionShow.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Question Preview',
            href: '',
        },
    ],
};
