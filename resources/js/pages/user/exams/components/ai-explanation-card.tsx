import { Sparkles, Bot, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { renderFormattedText } from '@/lib/exam-formatters';
import { TutorMessageContent } from '@/pages/user/tutor/components/tutor-message-content';

interface AiExplanationCardProps {
    questionId: number;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    initialExplanation?: { explanation: string; source: string };
}

interface ExplanationRecord {
    explanation: string;
    source: string;
}

export function AiExplanationCard({
    questionId,
    selectedOption,
    correctOption,
    isCorrect,
    initialExplanation,
}: AiExplanationCardProps) {
    const itemKey = `${questionId}-${selectedOption}`;
    const [explanationCache, setExplanationCache] = useState<Record<string, ExplanationRecord>>(
        initialExplanation ? { [itemKey]: initialExplanation } : {}
    );
    const [openKey, setOpenKey] = useState<string | null>(initialExplanation ? itemKey : null);
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [errorMap, setErrorMap] = useState<Record<string, string>>({});

    const currentRecord = explanationCache[itemKey];
    const isLoading = loadingKey === itemKey;
    const isOpen = openKey === itemKey;
    const currentError = errorMap[itemKey];

    const fetchExplanation = useCallback(async () => {
        if (currentRecord) {
            setOpenKey((prev) => (prev === itemKey ? null : itemKey));

            return;
        }

        setLoadingKey(itemKey);
        setErrorMap((prev) => ({ ...prev, [itemKey]: '' }));
        setOpenKey(itemKey);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
                '';

            const response = await fetch(`/exams/questions/${questionId}/ai-explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    selected_option: selectedOption >= 0 ? selectedOption : correctOption,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));

                throw new Error(errData.message || `Request failed with status ${response.status}`);
            }

            const json = await response.json();

            if (json.success && json.data?.explanation) {
                setExplanationCache((prev) => ({
                    ...prev,
                    [itemKey]: {
                        explanation: json.data.explanation,
                        source: json.data.source || (json.data.cached ? 'cache' : 'ai'),
                    },
                }));
            } else {
                throw new Error(json.message || 'Unable to load AI explanation.');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch AI explanation.';

            setErrorMap((prev) => ({ ...prev, [itemKey]: msg }));
        } finally {
            setLoadingKey(null);
        }
    }, [currentRecord, itemKey, questionId, selectedOption, correctOption]);

    return (
        <div className="mt-3 overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-card to-purple-50/30 text-sm shadow-xs transition-all dark:border-indigo-900/40 dark:from-indigo-950/20 dark:via-card dark:to-purple-950/10">
            {/* Header Trigger */}
            <button
                type="button"
                onClick={fetchExplanation}
                aria-expanded={isOpen}
                aria-label="Toggle AI Tutor deep explanation"
                className="flex w-full items-center justify-between p-4 font-semibold text-foreground transition hover:bg-indigo-500/5 sm:p-5"
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                        <Sparkles className="size-4 animate-pulse" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="font-heading text-sm font-bold text-foreground">
                                Ask Hiraya AI Tutor
                            </span>
                            {/* <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                RAG Grounded
                            </span> */}
                        </div>
                        <p className="text-xs font-normal text-muted-foreground">
                            {isCorrect
                                ? 'Why this option was correct & official syllabus rule'
                                : 'Why your choice was a distractor trap & how to solve it'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {isOpen ? 'Collapse' : 'Explain Choice'}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="size-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                        <ChevronDown className="size-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                </div>
            </button>

            {/* Content Drawer */}
            {isOpen && (
                <div className="border-t border-indigo-100 bg-background/80 p-5 backdrop-blur-xs dark:border-indigo-900/30">
                    {isLoading && (
                        <div className="space-y-3 py-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                <Bot className="size-4 animate-spin" />
                                <span>Analyzing question & syllabus notes...</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-5/6 animate-pulse rounded bg-indigo-200/50 dark:bg-indigo-900/30" />
                                <div className="h-4 w-full animate-pulse rounded bg-indigo-200/50 dark:bg-indigo-900/30" />
                                <div className="h-4 w-4/6 animate-pulse rounded bg-indigo-200/50 dark:bg-indigo-900/30" />
                            </div>
                        </div>
                    )}

                    {currentError && !isLoading && (
                        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                                <span>{currentError}</span>
                            </div>
                            <button
                                type="button"
                                onClick={fetchExplanation}
                                className="inline-flex shrink-0 items-center gap-1 font-semibold underline hover:no-underline"
                            >
                                <RefreshCw className="size-3" />
                                Retry
                            </button>
                        </div>
                    )}

                    {currentRecord && !isLoading && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Bot className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                                    Cognitive Breakdown
                                </span>
                                {currentRecord.source === 'cache' && (
                                    <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                        <Zap className="size-3 text-emerald-600 dark:text-emerald-400" />
                                        Instant Cache
                                    </span>
                                )}
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-foreground">
                                <TutorMessageContent content={currentRecord.explanation} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
