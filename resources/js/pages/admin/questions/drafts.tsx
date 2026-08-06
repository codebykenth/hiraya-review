import { Head, router } from '@inertiajs/react';
import { Check, X, Edit3, ListChecks, Save, Eye, FileImage, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DraftsReviewShell } from '@/components/domain/drafts-review-shell';
import type { CategoryItem } from '@/components/domain/drafts-review-shell';
import { ConfirmModal } from '@/components/shared/confirm-modal';
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
    bulkEdit as questionsBulkEdit,
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
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'single' | 'bulk';
        id: number | null;
    }>({ isOpen: false, type: 'single', id: null });
    const [previewQuestion, setPreviewQuestion] =
        useState<DraftQuestion | null>(null);

    const getCleanStemText = (stem: string) => {
        if (!stem) return '';
        let text = stem.replace(/<svg[\s\S]*?<\/svg>/gi, '').trim();
        text = text.replace(/<[^>]+>/g, '').trim();
        text = text.replace(/#+\s*/g, '').replace(/\s+/g, ' ');
        return text || 'Visual Question (Chart/Diagram)';
    };

    const hasSvgContent = (stem: string) => {
        return /<svg[\s\S]*?<\/svg>/i.test(stem || '');
    };

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

    const promptDeleteDraft = (id: number) => {
        setDeleteModal({ isOpen: true, type: 'single', id });
    };

    const confirmDeleteAction = async () => {
        if (deleteModal.type === 'single' && deleteModal.id !== null) {
            const id = deleteModal.id;
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
        } else if (deleteModal.type === 'bulk') {
            const pendingIds = draftQuestions
                .filter((q) => !q.approved)
                .map((q) => q.id);

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

    const promptBulkDeletePending = () => {
        const pendingIds = draftQuestions
            .filter((q) => !q.approved)
            .map((q) => q.id);

        if (pendingIds.length === 0) {
            return;
        }

        setDeleteModal({ isOpen: true, type: 'bulk', id: null });
    };

    const handleBulkEdit = () => {
        const approvedIds = draftQuestions
            .filter((q) => q.approved)
            .map((q) => q.id);

        if (approvedIds.length === 0) return;

        router.get(questionsBulkEdit().url, {
            ids: approvedIds.join(','),
        });
    };

    return (
        <>
            <Head title="Drafts Review Center" />

            <DraftsReviewShell<DraftQuestion>
                title="Drafts Review Center"
                subtitle="Review, edit, and approve draft exam items generated by AI or written manually."
                backUrl={questionsIndex().url}
                backLabel="Back to Question Management"
                customActions={
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={draftQuestions.filter((q) => q.approved).length === 0}
                        icon={Edit3}
                        onClick={handleBulkEdit}
                    >
                        Bulk Edit Selected ({draftQuestions.filter((q) => q.approved).length})
                    </Button>
                }
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
                onBulkDeletePending={promptBulkDeletePending}
                emptyStateTitle="No Drafts Pending Review"
                emptyStateDescription="There are currently no draft questions in the review queue. Select options in the AI Generator or manual form to add more."
                emptyStateActionUrl={questionsCreate().url}
                emptyStateActionLabel="Generate or Create Questions"
                emptyStateActionIcon={ListChecks}
                renderTableView={(items) => (
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-border bg-muted/60 text-[11px] font-black tracking-wider text-muted-foreground uppercase">
                                    <th className="w-12 px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={items.length > 0 && items.every((q) => q.approved)}
                                            onChange={handleToggleAllDrafts}
                                            className="size-4 cursor-pointer accent-blue-600"
                                        />
                                    </th>
                                    <th className="min-w-[400px] px-4 py-3.5">
                                        Question Stem
                                    </th>
                                    <th className="w-48 px-4 py-3.5">
                                        Correct Option
                                    </th>
                                    <th className="w-44 px-4 py-3.5">
                                        Category & Subcategory
                                    </th>
                                    <th className="w-28 px-4 py-3.5 text-center">
                                        Status
                                    </th>
                                    <th className="w-32 py-3.5 pr-4 pl-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.map((q) => {
                                    const correctOptIndex = q.correct_option;
                                    const correctOptText =
                                        q.options[correctOptIndex] || 'None';
                                    return (
                                        <tr
                                            key={q.id}
                                            className={`transition hover:bg-muted/30 ${
                                                q.approved
                                                    ? 'bg-emerald-500/5 dark:bg-emerald-950/10'
                                                    : ''
                                            }`}
                                        >
                                            <td className="w-12 px-4 py-4 text-center align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={q.approved}
                                                    onChange={() => toggleApproveDraft(q.id)}
                                                    className="size-4 mt-1 cursor-pointer accent-blue-600"
                                                />
                                            </td>
                                            <td className="min-w-[400px] px-4 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="line-clamp-2 font-semibold text-foreground">
                                                            {getCleanStemText(q.stem)}
                                                        </div>
                                                        {hasSvgContent(q.stem) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewQuestion(q)}
                                                                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                                                title="Quick preview diagram"
                                                            >
                                                                <FileImage className="size-3" />
                                                                <span>Diagram</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                                                        {q.options && q.options.length > 0 ? (
                                                            (() => {
                                                                const choicesStr = q.options.map((opt, i) => {
                                                                    const cleanText = opt ? String(opt).replace(/<[^>]+>/g, '').trim() : '';
                                                                    return `${String.fromCharCode(65 + i)}) ${cleanText}`;
                                                                }).join(' • ');
                                                                return choicesStr;
                                                            })()
                                                        ) : (
                                                            <span className="text-red-400 italic">No options found for this question (Possible cache issue)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="w-48 px-4 py-4 align-top">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                    <span className="flex size-4 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-black text-white dark:bg-emerald-400">
                                                        {String.fromCharCode(
                                                            65 +
                                                                correctOptIndex,
                                                        )}
                                                    </span>
                                                    <span className="max-w-[150px] truncate">
                                                        {renderFormattedText(
                                                            correctOptText,
                                                            false,
                                                            undefined,
                                                            true,
                                                        )}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="w-44 px-4 py-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="w-fit max-w-[150px] truncate rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                                                        {q.category}
                                                    </span>
                                                    <span className="w-fit max-w-[150px] truncate rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
                                                        {q.subcategory}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center align-top">
                                                {q.approved ? (
                                                    <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 pr-4 pl-3 text-right align-top">
                                                <div className="flex items-center justify-end gap-1">
                                                    {q.isEditing ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleEditDraft(
                                                                        q.id,
                                                                    )
                                                                }
                                                                title="Save Edits"
                                                                className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                            >
                                                                <Save className="size-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    cancelEditDraft(
                                                                        q.id,
                                                                    )
                                                                }
                                                                title="Cancel Edits"
                                                                className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setPreviewQuestion(
                                                                        q,
                                                                    )
                                                                }
                                                                title="Quick Preview"
                                                                className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:border-blue-200 hover:text-blue-600 dark:hover:text-blue-400"
                                                            >
                                                                <Eye className="size-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleEditDraft(
                                                                        q.id,
                                                                    )
                                                                }
                                                                title="Edit Inline"
                                                                className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:border-blue-200 hover:text-blue-600 dark:hover:text-blue-400"
                                                            >
                                                                <Edit3 className="size-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    promptDeleteDraft(
                                                                        q.id,
                                                                    )
                                                                }
                                                                title="Delete Draft"
                                                                className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:border-red-200 hover:text-red-600 dark:hover:text-red-400"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                renderItem={(q) => (
                    <div
                        key={q.id}
                        className={`group relative rounded-2xl border bg-card p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6 ${
                            q.approved
                                ? 'border-emerald-250 ring-2 ring-emerald-500 shadow-emerald-50/10 dark:border-emerald-800'
                                : 'border-border dark:hover:border-slate-700'
                        }`}
                    >
                        {/* Checkbox for Approval */}
                        <div className="absolute top-4 right-4 z-10">
                            <input
                                type="checkbox"
                                checked={q.approved}
                                onChange={() => toggleApproveDraft(q.id)}
                                className="size-4 cursor-pointer accent-emerald-600"
                                title="Toggle Approve"
                            />
                        </div>

                        {/* Card Header metadata */}
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-3 pr-8">
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
                                                            toggleEditDraft(
                                                                q.id,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:text-foreground hover:border-blue-200 hover:text-blue-600 dark:hover:text-blue-400"
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
                                                            promptDeleteDraft(
                                                                q.id,
                                                            )
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
                                            <div
                                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                                                    isCorrect
                                                        ? 'border-emerald-250 bg-emerald-50 font-bold text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                        : 'border-border bg-muted font-semibold text-foreground'
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
                                            </div>
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

            {/* Quick Preview Modal */}
            <Dialog
                open={!!previewQuestion}
                onOpenChange={(open) => !open && setPreviewQuestion(null)}
            >
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh]">
                    {previewQuestion && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Draft #{previewQuestion.id} Preview
                                    </DialogTitle>
                                    <span className="w-fit rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                                        {previewQuestion.category}
                                    </span>
                                    <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
                                        {previewQuestion.subcategory}
                                    </span>
                                </div>
                            </DialogHeader>

                            <div className="flex flex-col gap-4 py-2">
                                <div className="rounded-xl border border-border bg-card p-4">
                                    <div className="text-sm font-medium leading-relaxed text-foreground">
                                        {renderFormattedText(
                                            previewQuestion.stem,
                                        )}
                                    </div>
                                </div>

                                {previewQuestion.options &&
                                    previewQuestion.options.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold uppercase text-muted-foreground">
                                                Answer Options
                                            </span>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {previewQuestion.options.map(
                                                    (
                                                        opt: string,
                                                        idx: number,
                                                    ) => {
                                                        const isCorrect =
                                                            previewQuestion.correct_option ===
                                                            idx;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                                                                    isCorrect
                                                                        ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                                                                        : 'border-border bg-background text-foreground'
                                                                }`}
                                                            >
                                                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black">
                                                                    {String.fromCharCode(
                                                                        65 + idx,
                                                                    )}
                                                                </span>
                                                                <span className="font-medium">
                                                                    {renderFormattedText(
                                                                        opt,
                                                                        false,
                                                                        undefined,
                                                                        true,
                                                                    )}
                                                                </span>
                                                                {isCorrect && (
                                                                    <span className="ml-auto rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                                                                        Correct
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {previewQuestion.explanation && (
                                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
                                        <span className="text-xs font-bold uppercase text-blue-800 dark:text-blue-300">
                                            Explanation
                                        </span>
                                        <div className="mt-1 text-xs leading-relaxed text-blue-950 dark:text-blue-200">
                                            {renderFormattedText(
                                                previewQuestion.explanation,
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewQuestion(null)}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() =>
                    setDeleteModal({ isOpen: false, type: 'single', id: null })
                }
                onConfirm={confirmDeleteAction}
                title="Delete Draft"
                message={
                    deleteModal.type === 'bulk'
                        ? `Are you sure you want to delete ${
                              draftQuestions.filter((q) => !q.approved).length
                          } unapproved draft(s)? This action cannot be undone.`
                        : 'Are you sure you want to delete this draft? This action cannot be undone.'
                }
                confirmLabel={
                    deleteModal.type === 'bulk'
                        ? 'Delete Drafts'
                        : 'Delete Draft'
                }
                variant="danger"
            />
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
