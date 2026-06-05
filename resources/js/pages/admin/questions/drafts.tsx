import { Head, router } from '@inertiajs/react';
import { Check, X, Edit3, ListChecks, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DraftsReviewShell } from '@/components/domain/drafts-review-shell';
import type { CategoryItem } from '@/components/domain/drafts-review-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { renderFormattedText } from '@/lib/exam-formatters';
import {
    index as questionsIndex,
    store as questionsStore,
    create as questionsCreate,
    destroy as questionsDestroy,
    bulkDestroy as questionsBulkDestroy,
    update as questionsUpdate,
} from '@/routes/questions';

interface DraftQuestion {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    options: string[];
    correct_option: number;
    explanation: string;
    approved: boolean;
    isEditing?: boolean;
}

interface DraftsProps {
    initialDrafts?: DraftQuestion[];
    categories?: CategoryItem[];
}

export default function DraftsQuestionList({
    initialDrafts = [],
    categories = [],
}: DraftsProps) {
    const [draftQuestions, setDraftQuestions] =
        useState<DraftQuestion[]>(initialDrafts);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editingBackup, setEditingBackup] = useState<
        Record<number, DraftQuestion>
    >({});

    // Sync local state when Inertia refreshes initialDrafts from backend
    useEffect(() => {
        const timer = setTimeout(() => {
            setDraftQuestions(initialDrafts);
        }, 0);

        return () => clearTimeout(timer);
    }, [initialDrafts]);

    // Actions
    const toggleApproveDraft = (id: number) => {
        setDraftQuestions((prev) =>
            prev.map((q) =>
                q.id === id ? { ...q, approved: !q.approved } : q,
            ),
        );
    };

    const handleToggleAllDrafts = () => {
        const allApproved = draftQuestions.every((q) => q.approved);
        setDraftQuestions((prev) =>
            prev.map((q) => ({ ...q, approved: !allApproved })),
        );
    };

    const deleteDraft = async (id: number) => {
        setDraftQuestions((prev) => prev.filter((q) => q.id !== id));

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';
            await fetch(questionsDestroy(id).url, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });
        } catch {
            setErrorMessage(
                'Failed to permanently delete draft. Please check your connection and try again.',
            );
        }
    };

    const toggleEditDraft = async (id: number) => {
        const questionToEdit = draftQuestions.find((q) => q.id === id);

        if (questionToEdit && !questionToEdit.isEditing) {
            setEditingBackup((prev) => ({
                ...prev,
                [id]: {
                    ...questionToEdit,
                    options: [...questionToEdit.options],
                },
            }));
            setDraftQuestions((prev) =>
                prev.map((q) => (q.id === id ? { ...q, isEditing: true } : q)),
            );

            return;
        }

        const current = draftQuestions.find((q) => q.id === id);
        const original = editingBackup[id];

        if (!current) {
            return;
        }

        const hasChanges =
            original &&
            (current.stem !== original.stem ||
                current.correct_option !== original.correct_option ||
                current.explanation !== original.explanation ||
                current.options.length !== original.options.length ||
                current.options.some(
                    (opt, idx) => opt !== original.options[idx],
                ));

        setDraftQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, isEditing: false } : q)),
        );

        setEditingBackup((prev) => {
            const copy = { ...prev };
            delete copy[id];

            return copy;
        });

        if (hasChanges) {
            try {
                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';
                const response = await fetch(questionsUpdate(id).url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        category: current.category,
                        subcategory: current.subcategory,
                        language: (current as any).language || 'English',
                        stem: current.stem,
                        options: current.options,
                        correct_option: current.correct_option,
                        explanation: current.explanation,
                        status: 'draft',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Save failed');
                }
            } catch {
                setErrorMessage(
                    'Failed to save draft edits. Please check your connection.',
                );
                setDraftQuestions((prev) =>
                    prev.map((q) =>
                        q.id === id ? { ...q, isEditing: true } : q,
                    ),
                );

                if (original) {
                    setEditingBackup((prev) => ({
                        ...prev,
                        [id]: { ...original, options: [...original.options] },
                    }));
                }
            }
        }
    };

    const cancelEditDraft = (id: number) => {
        const original = editingBackup[id];

        if (original) {
            setDraftQuestions((prev) =>
                prev.map((q) =>
                    q.id === id
                        ? {
                              ...original,
                              options: [...original.options],
                              isEditing: false,
                          }
                        : q,
                ),
            );
            setEditingBackup((prev) => {
                const copy = { ...prev };
                delete copy[id];

                return copy;
            });
        }
    };

    const handleUpdateDraftStem = (id: number, val: string) => {
        setDraftQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, stem: val } : q)),
        );
    };

    const handleUpdateDraftOption = (
        id: number,
        optIdx: number,
        val: string,
    ) => {
        setDraftQuestions((prev) =>
            prev.map((q) => {
                if (q.id === id) {
                    const newOpts = [...q.options];
                    newOpts[optIdx] = val;

                    return { ...q, options: newOpts };
                }

                return q;
            }),
        );
    };

    const handleUpdateDraftCorrectOption = (id: number, optIdx: number) => {
        setDraftQuestions((prev) =>
            prev.map((q) =>
                q.id === id ? { ...q, correct_option: optIdx } : q,
            ),
        );
    };

    const handleCommitApproved = () => {
        const approvedQuestions = draftQuestions.filter((q) => q.approved);

        if (approvedQuestions.length === 0) {
            return;
        }

        const questionsToSave = approvedQuestions.map((q) => {
            const copy = { ...q } as any;
            delete copy.isEditing;
            delete copy.approved;

            return copy;
        });

        router.post(
            questionsStore().url,
            {
                questions: questionsToSave,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleBulkDeletePending = () => {
        const pendingIds = draftQuestions
            .filter((q) => !q.approved)
            .map((q) => q.id);

        if (pendingIds.length === 0) {
            return;
        }

        if (
            confirm(
                `Are you sure you want to delete ${pendingIds.length} unapproved draft(s)? This action cannot be undone.`,
            )
        ) {
            router.post(
                questionsBulkDestroy().url,
                {
                    ids: pendingIds,
                },
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <>
            <Head title="Drafts Review Center" />

            <DraftsReviewShell<DraftQuestion>
                title="Drafts Review Center"
                subtitle="Review, edit, and approve draft exam items generated by AI or written manually."
                backUrl={questionsIndex().url}
                backLabel="Back to Question Management"
                items={draftQuestions}
                categories={categories}
                searchPlaceholder="Search drafts (stem, category, subcategory)..."
                searchMatcher={(q, search) =>
                    q.stem.toLowerCase().includes(search.toLowerCase()) ||
                    q.category.toLowerCase().includes(search.toLowerCase()) ||
                    q.subcategory.toLowerCase().includes(search.toLowerCase())
                }
                commitLabel="Commit Approved"
                onCommit={handleCommitApproved}
                onToggleAll={handleToggleAllDrafts}
                onBulkDeletePending={handleBulkDeletePending}
                emptyStateTitle="No Drafts Pending Review"
                emptyStateDescription="There are currently no draft questions in the review queue. Select options in the AI Generator or manual form to add more."
                emptyStateActionUrl={questionsCreate().url}
                emptyStateActionLabel="Generate or Create Questions"
                emptyStateActionIcon={ListChecks}
                renderItem={(q) => (
                    <div
                        key={q.id}
                        className={`rounded-2xl border bg-card p-6 shadow-xs transition duration-205 ${
                            q.approved
                                ? 'border-emerald-250 ring-1 shadow-emerald-50/10 ring-emerald-500/10 dark:border-emerald-800'
                                : 'hover:border-slate-350 border-border dark:hover:border-slate-700'
                        }`}
                    >
                        {/* Card Header metadata */}
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-semibold text-foreground">
                                    {q.category}
                                </span>
                                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-300">
                                    {q.subcategory}
                                </span>
                                {q.approved ? (
                                    <span className="bg-emerald-555/10 rounded-full border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/30 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        Approved
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/30 dark:bg-amber-950/40 dark:text-amber-300">
                                        Pending Review
                                    </span>
                                )}
                            </div>

                            {/* Card Actions toolbar */}
                            <div className="flex items-center gap-1.5">
                                <TooltipProvider delayDuration={150}>
                                    {q.isEditing ? (
                                        <>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleEditDraft(
                                                                q.id,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 transition dark:border-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                    >
                                                        <Save className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Save Changes
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cancelEditDraft(
                                                                q.id,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 transition dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Cancel Edits
                                                </TooltipContent>
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleApproveDraft(
                                                                q.id,
                                                            )
                                                        }
                                                        className={`cursor-pointer rounded-lg border p-1.5 transition ${
                                                            q.approved
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                : 'border-border bg-card text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Check className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {q.approved
                                                        ? 'Approved (Click to Unapprove)'
                                                        : 'Mark Approved'}
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleEditDraft(
                                                                q.id,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:text-foreground"
                                                    >
                                                        <Edit3 className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Edit Draft Inline
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteDraft(q.id)
                                                        }
                                                        className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:border-red-200 hover:text-red-600 dark:hover:border-red-900/50"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Delete Draft
                                                </TooltipContent>
                                            </Tooltip>
                                        </>
                                    )}
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Question Stem block */}
                        <div className="mb-4">
                            {q.isEditing ? (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">
                                        Stem
                                    </label>
                                    <textarea
                                        value={q.stem}
                                        onChange={(e) =>
                                            handleUpdateDraftStem(
                                                q.id,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-border bg-background p-3 text-sm font-medium text-foreground focus:border-blue-500 focus:outline-none"
                                        rows={3}
                                    />
                                </div>
                            ) : (
                                renderFormattedText(q.stem)
                            )}
                        </div>

                        {/* Options grid */}
                        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {q.options.map((opt, optIdx) => {
                                const isCorrect = q.correct_option === optIdx;

                                return (
                                    <div
                                        key={optIdx}
                                        className="relative flex items-center"
                                    >
                                        {q.isEditing ? (
                                            <div className="flex w-full items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`draft-${q.id}-correct`}
                                                    checked={isCorrect}
                                                    onChange={() =>
                                                        handleUpdateDraftCorrectOption(
                                                            q.id,
                                                            optIdx,
                                                        )
                                                    }
                                                    className="size-4 shrink-0 cursor-pointer accent-emerald-600"
                                                />
                                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                                    {String.fromCharCode(
                                                        65 + optIdx,
                                                    )}
                                                </span>
                                                <Input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) =>
                                                        handleUpdateDraftOption(
                                                            q.id,
                                                            optIdx,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleUpdateDraftCorrectOption(
                                                        q.id,
                                                        optIdx,
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                                                    isCorrect
                                                        ? 'border-emerald-250 dark:bg-emerald-950/30/70 bg-emerald-50 font-bold text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                        : 'border-border bg-muted font-semibold text-foreground hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className={`inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                            isCorrect
                                                                ? 'bg-emerald-600 text-white dark:bg-emerald-400'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(
                                                            65 + optIdx,
                                                        )}
                                                    </span>
                                                    <div className="w-full flex-1 text-sm leading-tight">
                                                        {renderFormattedText(
                                                            opt,
                                                            false,
                                                            undefined,
                                                            true,
                                                        )}
                                                    </div>
                                                </div>
                                                {isCorrect && (
                                                    <Check className="size-4 shrink-0 text-emerald-400" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation and rationale */}
                        <div className="rounded-xl border border-border bg-muted p-3.5 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            <span className="mb-1 block font-bold text-foreground">
                                Explanation & Rationale:
                            </span>
                            {q.isEditing ? (
                                <textarea
                                    value={q.explanation}
                                    onChange={(e) =>
                                        setDraftQuestions((prev) =>
                                            prev.map((item) =>
                                                item.id === q.id
                                                    ? {
                                                          ...item,
                                                          explanation:
                                                              e.target.value,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                    className="w-full rounded-lg border border-border bg-background p-2 text-xs font-medium text-foreground focus:border-blue-500 focus:outline-none"
                                    rows={2}
                                />
                            ) : (
                                renderFormattedText(q.explanation)
                            )}
                        </div>
                    </div>
                )}
            />

            {/* Error Modal */}
            <Dialog
                open={!!errorMessage}
                onOpenChange={(open) => !open && setErrorMessage(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            Error
                        </DialogTitle>
                        <p className="mt-2 text-base leading-relaxed text-slate-600">
                            {errorMessage}
                        </p>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setErrorMessage(null)}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Dismiss
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

DraftsQuestionList.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Question Drafts Review',
        },
    ],
};
