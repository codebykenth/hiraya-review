import React from 'react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Head, Link } from '@inertiajs/react';
import { 
    ChevronLeft, 
    PenLine, 
    HelpCircle, 
    Sparkles, 
    Globe, 
    Layers, 
    Activity 
} from 'lucide-react';
import { index as questionsIndex, edit as questionsEdit } from '@/routes/questions';
import { getCategoryStyles } from '@/components/curation-index-shell';
import { ExplanationPreview } from '@/components/explanation-preview';

import { Button } from '@/components/ui/button';

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
                    className="flex w-fit items-center gap-1 text-xs font-black text-foreground hover:text-blue-600 transition focus:outline-none"
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & Middle Column: Question Stem & Choices */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Main Question Card */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-3.5 mb-5">
                                <span className="text-xs font-black text-foreground uppercase flex items-center gap-1.5">
                                    <HelpCircle className="size-4.5 text-blue-600" />
                                    Exam Practice Question
                                </span>
                                
                                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(question.category)}`}>
                                    {question.category}
                                </span>
                            </div>

                            {/* Stem */}
                            <div className="text-sm font-semibold text-foreground leading-relaxed whitespace-pre-line mb-6">
                                {question.stem}
                            </div>

                            {/* Option list stack */}
                            <div className="space-y-3">
                                {question.options.map((option, idx) => {
                                    const isCorrect = question.correct_option === idx;
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center gap-4 rounded-xl border p-4 transition duration-200 ${
                                                isCorrect 
                                                    ? 'border-emerald-250 bg-emerald-50/20 dark:border-emerald-800 dark:bg-emerald-950/10' 
                                                    : 'border-border'
                                            }`}
                                        >
                                            {/* Choice Index Badge */}
                                            <span className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-black shrink-0 ${
                                                isCorrect
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>

                                            {/* Option text */}
                                            <span className={`text-xs font-semibold leading-relaxed ${
                                                isCorrect 
                                                    ? 'text-foreground font-extrabold' 
                                                    : 'text-muted-foreground'
                                            }`}>
                                                {option}
                                            </span>

                                            {/* Correct marker check */}
                                            {isCorrect && (
                                                <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase">
                                                    Correct Answer
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Rationale Card */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-sm font-black text-foreground uppercase flex items-center gap-1.5 border-b border-border pb-3.5 mb-4">
                                <Sparkles className="size-4.5 text-blue-600" />
                                Cognitive Explanation & Rationale
                            </h2>
                            <ExplanationPreview text={question.explanation} />
                        </div>

                    </div>

                    {/* Right Column: Metadata details card */}
                    <div className="space-y-6">
                        
                        {/* Summary specifications card */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-xs font-black text-foreground uppercase tracking-wider block mb-4 border-b border-border pb-3">
                                Question Metrics
                            </h2>

                            <div className="space-y-4">
                                {/* Unique ID */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-muted-foreground uppercase tracking-wider text-[10px]">Record ID</span>
                                    <span className="font-mono font-black text-foreground">#{question.id}</span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-muted-foreground uppercase tracking-wider text-[10px]">Publish Status</span>
                                    {question.status === 'ACTIVE' ? (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 border border-emerald-100 uppercase">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 border border-blue-100 uppercase">
                                            Draft
                                        </span>
                                    )}
                                </div>

                                {/* Target Subcategory */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-muted-foreground uppercase tracking-wider text-[10px]">Subcategory</span>
                                    <span className="font-bold text-foreground capitalize">{question.subcategory}</span>
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="font-extrabold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1">
                                        <Globe className="size-3.5 text-muted-foreground" />
                                        Language
                                    </span>
                                    <span className="text-foreground">{question.language}</span>
                                </div>
                            </div>
                        </div>

                        {/* CSE Syllabus Mapping specs */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-xs font-black text-foreground uppercase tracking-wider block mb-4 border-b border-border pb-3">
                                CSE Curation Guidelines
                            </h2>

                            <div className="space-y-3.5 text-xs leading-relaxed text-muted-foreground font-semibold">
                                <div className="flex gap-2">
                                    <Layers className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
                                    <p>
                                        Always align practice questions directly to the official syllabus structure for maximum efficacy.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Activity className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
                                    <p>
                                        Ensure distractor options are authentic and that rationales detail standard time-saving approximation shortcuts.
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
