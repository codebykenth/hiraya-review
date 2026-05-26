import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ChevronLeft, 
    PenLine, 
    HelpCircle, 
    CheckCircle2, 
    Sparkles, 
    BookOpen, 
    Target, 
    ArrowRight,
    Globe,
    Layers,
    Activity
} from 'lucide-react';
import { index as questionsIndex, edit as questionsEdit } from '@/routes/questions';

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
    // Helper to render appropriate styling for categories
    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Analytical Ability':
                return 'bg-indigo-50 text-indigo-650 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
            case 'Numerical Ability':
                return 'bg-emerald-50 text-emerald-650 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
            case 'Verbal Ability':
                return 'bg-blue-50 text-blue-650 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
            case 'Clerical Ability':
                return 'bg-amber-50 text-amber-650 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
            case 'General Information':
                return 'bg-rose-50 text-rose-650 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
            default:
                return 'bg-slate-50 text-slate-650 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-850';
        }
    };

    // Helper for inline bold parsing
    const parseInlineBold = (text: string) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            parts.push(<strong key={match.index} className="font-black text-slate-900 dark:text-white">{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    // Premium Explanation Parser
    const parseExplanation = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];

        lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Handle Mental Math Shortcuts
            if (trimmed.toLowerCase().includes('mental math shortcut:') || trimmed.toLowerCase().includes('mental math shortcut')) {
                const label = trimmed.split(':')[0] || '🧠 Mental Math Shortcut';
                const content = trimmed.substring(trimmed.toLowerCase().indexOf('shortcut') + 9).replace(/^:/, '').trim();
                elements.push(
                    <div key={`shortcut-${idx}`} className="my-4 rounded-xl border border-amber-200 bg-amber-50/15 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
                        <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wide block mb-1">🧠 Mental Math Shortcut</span>
                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 font-semibold">{content}</p>
                    </div>
                );
                return;
            }

            // Handle deductive reasoning logic chains
            if (trimmed.includes('->') && !trimmed.startsWith('|')) {
                const nodes = trimmed.split('->').map(n => n.trim());
                elements.push(
                    <div key={`chain-${idx}`} className="my-4 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/10 p-3.5 dark:border-blue-900/20 dark:bg-blue-950/10">
                        {nodes.map((node, nIdx) => (
                            <React.Fragment key={nIdx}>
                                <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-3xs">
                                    {node}
                                </span>
                                {nIdx < nodes.length - 1 && (
                                    <ArrowRight className="size-4 text-blue-400 dark:text-blue-600 shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                );
                return;
            }

            // Handle bullet lists
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const textVal = trimmed.substring(1).trim();
                elements.push(
                    <ul key={`ul-${idx}`} className="list-disc pl-5 my-1.5 text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                        <li className="font-semibold">{parseInlineBold(textVal)}</li>
                    </ul>
                );
                return;
            }

            // Default paragraph
            elements.push(
                <p key={`p-${idx}`} className="text-xs leading-relaxed text-slate-650 dark:text-slate-400 my-2 font-semibold">
                    {parseInlineBold(trimmed)}
                </p>
            );
        });

        return elements;
    };

    return (
        <>
            <Head title={`Question Details #${question.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 bg-slate-50/30 dark:bg-slate-900/20">
                
                {/* Back Link */}
                <Link
                    href={questionsIndex().url}
                    className="flex w-fit items-center gap-1 text-xs font-black text-slate-855 hover:text-blue-655 dark:text-white dark:hover:text-blue-400 transition focus:outline-none"
                >
                    <ChevronLeft className="size-4" />
                    Back to Curation Manager
                </Link>

                {/* Title & Edit Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                            Question Details
                        </h1>
                        <p className="mt-2 text-sm text-slate-550 dark:text-slate-400">
                            Inspect CSE practice content, correct answer configurations, and cognitive rationales.
                        </p>
                    </div>

                    <Link
                        href={questionsEdit(question.id).url}
                        className="flex w-fit items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition focus:outline-none cursor-pointer"
                    >
                        <PenLine className="size-4" />
                        Edit Question Content
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & Middle Column: Question Stem & Choices */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Main Question Card */}
                        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-950">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5 dark:border-slate-850">
                                <span className="text-xs font-black text-slate-855 dark:text-white uppercase flex items-center gap-1.5">
                                    <HelpCircle className="size-4.5 text-blue-600" />
                                    Exam Practice Question
                                </span>
                                
                                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(question.category)}`}>
                                    {question.category}
                                </span>
                            </div>

                            {/* Stem */}
                            <div className="text-sm font-semibold text-slate-800 dark:text-white leading-relaxed whitespace-pre-line mb-6">
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
                                                    : 'border-slate-150 dark:border-slate-850'
                                            }`}
                                        >
                                            {/* Choice Index Badge */}
                                            <span className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-black shrink-0 ${
                                                isCorrect
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>

                                            {/* Option text */}
                                            <span className={`text-xs font-semibold leading-relaxed ${
                                                isCorrect 
                                                    ? 'text-slate-850 dark:text-white font-extrabold' 
                                                    : 'text-slate-600 dark:text-slate-350'
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
                        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-950">
                            <h2 className="text-sm font-black text-slate-855 dark:text-white uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3.5 mb-4 dark:border-slate-850">
                                <Sparkles className="size-4.5 text-blue-600" />
                                Cognitive Explanation & Rationale
                            </h2>
                            <div className="space-y-1">
                                {parseExplanation(question.explanation)}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Metadata details card */}
                    <div className="space-y-6">
                        
                        {/* Summary specifications card */}
                        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-950">
                            <h2 className="text-xs font-black text-slate-855 dark:text-white uppercase tracking-wider block mb-4 border-b border-slate-100 pb-3 dark:border-slate-855">
                                Question Metrics
                            </h2>

                            <div className="space-y-4">
                                {/* Unique ID */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Record ID</span>
                                    <span className="font-mono font-black text-slate-800 dark:text-white">#{question.id}</span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Publish Status</span>
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
                                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Subcategory</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-350 capitalize">{question.subcategory}</span>
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                        <Globe className="size-3.5 text-slate-450" />
                                        Language
                                    </span>
                                    <span className="text-slate-700 dark:text-slate-350">{question.language}</span>
                                </div>
                            </div>
                        </div>

                        {/* CSE Syllabus Mapping specs */}
                        <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-950">
                            <h2 className="text-xs font-black text-slate-855 dark:text-white uppercase tracking-wider block mb-4 border-b border-slate-100 pb-3 dark:border-slate-855">
                                CSE Curation Guidelines
                            </h2>

                            <div className="space-y-3.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">
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

            </div>
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
