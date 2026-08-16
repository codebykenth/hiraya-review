import {
    ChevronDown,
    ChevronUp,
    CheckSquare,
    Square,
    CheckCircle2,
    RotateCcw,
    EyeOff,
    Lightbulb,
    User,
} from 'lucide-react';
import React, { useState } from 'react';
import { ExplanationPreview } from '@/components/domain/explanation-preview';
import { renderFormattedText } from '@/lib/exam-formatters';

export interface QuestionPreviewData {
    id: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation?: string | null;
    category: string;
    subcategory?: string | null;
    language?: string | null;
    isCustom?: boolean;
    isMistake?: boolean;
    isUnseen?: boolean;
    isMastered?: boolean;
}

export interface QuestionPreviewCardProps {
    question: QuestionPreviewData;
    selectable?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: number) => void;
    expanded?: boolean;
    onToggleExpand?: () => void;
    showStatusBadge?: boolean;
    showOptionsByDefault?: boolean;
    actionSlot?: React.ReactNode;
    className?: string;
}

export function QuestionPreviewCard({
    question,
    selectable = true,
    isSelected = false,
    onToggleSelect,
    expanded: controlledExpanded,
    onToggleExpand: controlledOnToggleExpand,
    showStatusBadge = true,
    showOptionsByDefault = false,
    actionSlot,
    className = '',
}: QuestionPreviewCardProps) {
    const [internalExpanded, setInternalExpanded] = useState(showOptionsByDefault);

    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
    const toggleExpand = () => {
        if (controlledOnToggleExpand) {
            controlledOnToggleExpand();
        } else {
            setInternalExpanded((prev) => !prev);
        }
    };

    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelect?.(question.id);
    };

    return (
        <div
            className={`shadow-3xs relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                isSelected
                    ? 'border-blue-600 bg-card ring-2 ring-blue-500/30 dark:border-blue-500 dark:ring-blue-500/40'
                    : 'border-border bg-card hover:border-border/90'
            } ${className}`}
        >
            {/* Top Exam-Style Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Selection Checkbox */}
                    {selectable && (
                        <button
                            type="button"
                            onClick={handleSelectClick}
                            aria-label={isSelected ? 'Deselect question' : 'Select question'}
                            className="mr-1 flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
                        >
                            {isSelected ? (
                                <CheckSquare className="size-4.5 fill-blue-600 text-white dark:fill-blue-500" />
                            ) : (
                                <Square className="size-4.5 text-muted-foreground/50 hover:text-muted-foreground" />
                            )}
                            <span className="hidden sm:inline text-[11px] font-extrabold uppercase tracking-wide">
                                {isSelected ? 'Selected' : 'Select'}
                            </span>
                        </button>
                    )}

                    {/* Category Badge matching Live/Review Exam */}
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        {question.category}
                    </span>

                    {/* Subcategory Badge */}
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-extrabold text-muted-foreground">
                        {question.subcategory || 'General Concepts'}
                    </span>

                    {/* Status Badges */}
                    {showStatusBadge && question.isCustom && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] font-black text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-300">
                            <User className="size-3" />
                            Custom Question
                        </span>
                    )}

                    {showStatusBadge && question.isMistake && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/40 dark:text-rose-300">
                            <RotateCcw className="size-3" />
                            Past Mistake
                        </span>
                    )}

                    {showStatusBadge && question.isUnseen && !question.isMistake && !question.isCustom && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <EyeOff className="size-3" />
                            Fresh / Unseen
                        </span>
                    )}
                </div>

                {/* Right Header Actions: Custom Action Slot + Expand Button */}
                <div className="flex items-center gap-1.5">
                    {actionSlot}
                    <button
                        type="button"
                        onClick={toggleExpand}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse choices and explanation' : 'Expand choices and explanation'}
                        className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
                    >
                        <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                        {isExpanded ? (
                            <ChevronUp className="size-3.5" />
                        ) : (
                            <ChevronDown className="size-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Question Stem Body */}
            <div className="p-4 sm:p-6">
                <div
                    onClick={selectable ? handleSelectClick : toggleExpand}
                    className={`cursor-pointer select-none text-sm font-semibold leading-relaxed text-foreground sm:text-base ${
                        !isExpanded ? 'line-clamp-2' : ''
                    }`}
                >
                    {renderFormattedText(question.stem, true)}
                </div>

                {/* Full Exam-Style Options Stack & Explanation when Expanded */}
                {isExpanded && (
                    <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
                        {/* Options Stack identical to Live Exam / Review Exam */}
                        <div className="flex flex-col gap-3">
                            {question.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isCorrectOption = idx === question.correct_option;

                                return (
                                    <div
                                        key={idx}
                                        className={`shadow-3xs flex items-center gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-200 ${
                                            isCorrectOption
                                                ? 'border-emerald-500 bg-emerald-50/40 font-bold text-emerald-950 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200'
                                                : 'border-border bg-card text-foreground/80'
                                        }`}
                                    >
                                        <span
                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
                                                isCorrectOption
                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                    : 'border-border bg-background text-muted-foreground'
                                            }`}
                                        >
                                            {letter}
                                        </span>
                                        <div className="flex flex-1 items-center justify-between gap-3">
                                            <p className="text-sm font-bold leading-relaxed transition sm:text-base">
                                                {renderFormattedText(opt, false, undefined, true)}
                                            </p>
                                            {isCorrectOption && (
                                                <div className="flex shrink-0 items-center gap-1.5 pl-2">
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Correct Answer
                                                    </span>
                                                    <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation & Rationale Card matching Exam Review */}
                        {question.explanation && (
                            <div className="shadow-3xs overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-50/40 text-sm leading-relaxed transition-all dark:border-blue-900/40 dark:bg-blue-950/20">
                                <div className="flex items-center gap-2 border-b border-blue-200/50 bg-blue-100/40 px-4 py-2.5 text-xs font-bold text-blue-950 dark:border-blue-900/30 dark:bg-blue-950/40 dark:text-blue-200">
                                    <Lightbulb className="size-4 text-amber-500" />
                                    <span className="font-heading font-black uppercase tracking-wider">
                                        Explanation & Rationale
                                    </span>
                                </div>
                                <div className="p-4 sm:p-5 text-xs sm:text-sm text-foreground/90">
                                    <ExplanationPreview text={question.explanation} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
