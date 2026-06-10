import { Head, router } from '@inertiajs/react';
import { Check, X, Edit3, FileText, Sparkles, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DraftsReviewShell } from '@/components/domain/drafts-review-shell';
import type { CategoryItem } from '@/components/domain/drafts-review-shell';
import { LessonMarkdown } from '@/components/domain/lesson-markdown';
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
import {
    index as adminLearnIndex,
    drafts as adminLearnDrafts,
    store as adminLearnStore,
    destroy as adminLearnDestroy,
    bulkDestroy as adminLearnBulkDestroy,
    update as adminLearnUpdate,
} from '@/routes/admin/learn';

interface DraftModule {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string;
    content: string;
    estimated_minutes: number;
    category: string;
    subcategory: string;
    approved: boolean;
    isEditing?: boolean;
}

interface DraftsProps {
    initialDrafts?: DraftModule[];
    categories?: CategoryItem[];
}

export default function DraftsLearnList({
    initialDrafts = [],
    categories = [],
}: DraftsProps) {
    const [draftModules, setDraftModules] =
        useState<DraftModule[]>(initialDrafts);
    const [previewMode, setPreviewMode] = useState<
        Record<number, 'preview' | 'raw'>
    >({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editingBackup, setEditingBackup] = useState<
        Record<number, DraftModule>
    >({});
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'single' | 'bulk';
        id: number | null;
    }>({ isOpen: false, type: 'single', id: null });

    // Sync local state when Inertia refreshes initialDrafts from backend
    useEffect(() => {
        setTimeout(() => {
            setDraftModules(initialDrafts);
        }, 0);
    }, [initialDrafts]);

    // Actions
    const toggleApproveDraft = (id: number) => {
        setDraftModules((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, approved: !m.approved } : m,
            ),
        );
    };

    const handleToggleAllDrafts = () => {
        const allApproved = draftModules.every((m) => m.approved);
        setDraftModules((prev) =>
            prev.map((m) => ({ ...m, approved: !allApproved })),
        );
    };

    const promptDeleteDraft = (id: number) => {
        setDeleteModal({ isOpen: true, type: 'single', id });
    };

    const confirmDeleteAction = async () => {
        if (deleteModal.type === 'single' && deleteModal.id !== null) {
            const id = deleteModal.id;
            setDraftModules((prev) => prev.filter((m) => m.id !== id));

            try {
                const csrfToken =
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '';
                await fetch(adminLearnDestroy(id).url, {
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
            const pendingIds = draftModules
                .filter((m) => !m.approved)
                .map((m) => m.id);

            router.post(
                adminLearnBulkDestroy().url,
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
        const moduleToEdit = draftModules.find((m) => m.id === id);

        if (moduleToEdit && !moduleToEdit.isEditing) {
            setEditingBackup((prev) => ({
                ...prev,
                [id]: { ...moduleToEdit },
            }));
            setDraftModules((prev) =>
                prev.map((m) => (m.id === id ? { ...m, isEditing: true } : m)),
            );

            return;
        }

        const current = draftModules.find((m) => m.id === id);
        const original = editingBackup[id];

        if (!current) {
            return;
        }

        const hasChanges =
            original &&
            (current.title !== original.title ||
                current.topic !== original.topic ||
                current.summary !== original.summary ||
                current.content !== original.content);

        setDraftModules((prev) =>
            prev.map((m) => (m.id === id ? { ...m, isEditing: false } : m)),
        );

        setEditingBackup((prev) => {
            const copy = { ...prev };
            delete copy[id];

            return copy;
        });

        if (hasChanges) {
            try {
                const csrfToken =
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '';
                const response = await fetch(adminLearnUpdate(id).url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        category_id: (current as any).category_id,
                        subcategory_id: (current as any).subcategory_id,
                        title: current.title,
                        topic: current.topic,
                        summary: current.summary,
                        content: current.content,
                        estimated_minutes: current.estimated_minutes,
                        is_published: false,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Save failed');
                }
            } catch {
                setErrorMessage(
                    'Failed to save draft edits. Please check your connection.',
                );
                setDraftModules((prev) =>
                    prev.map((m) =>
                        m.id === id ? { ...m, isEditing: true } : m,
                    ),
                );

                if (original) {
                    setEditingBackup((prev) => ({
                        ...prev,
                        [id]: { ...original },
                    }));
                }
            }
        }
    };

    const cancelEditDraft = (id: number) => {
        const original = editingBackup[id];

        if (original) {
            setDraftModules((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...original, isEditing: false } : m,
                ),
            );
            setEditingBackup((prev) => {
                const copy = { ...prev };
                delete copy[id];

                return copy;
            });
        }
    };

    const handleUpdateDraftField = (
        id: number,
        field: keyof DraftModule,
        val: any,
    ) => {
        setDraftModules((prev) =>
            prev.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
        );
    };

    const handleCommitApproved = () => {
        const approvedModules = draftModules.filter((m) => m.approved);

        if (approvedModules.length === 0) {
            return;
        }

        const modulesToSave = approvedModules.map((m) => {
            const copy = { ...m } as any;
            delete copy.isEditing;
            delete copy.approved;

            return copy;
        });

        router.post(
            adminLearnStore().url,
            {
                modules: modulesToSave,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const promptBulkDeletePending = () => {
        const pendingIds = draftModules
            .filter((m) => !m.approved)
            .map((m) => m.id);

        if (pendingIds.length === 0) {
            return;
        }

        setDeleteModal({ isOpen: true, type: 'bulk', id: null });
    };

    return (
        <>
            <Head title="Drafts Review" />

            <DraftsReviewShell<DraftModule>
                title="Syllabus Drafts Reviewer"
                subtitle="Verify, polish, and publish draft learning modules generated by AI or written manually."
                backUrl={adminLearnIndex().url}
                backLabel="Back to Learn Management"
                items={draftModules}
                categories={categories}
                searchPlaceholder="Search draft titles, syllabus focus topics, subcategories..."
                searchMatcher={(m, search) =>
                    m.title.toLowerCase().includes(search.toLowerCase()) ||
                    m.topic.toLowerCase().includes(search.toLowerCase()) ||
                    m.category.toLowerCase().includes(search.toLowerCase()) ||
                    m.subcategory.toLowerCase().includes(search.toLowerCase())
                }
                commitLabel="Publish Approved"
                onCommit={handleCommitApproved}
                onToggleAll={handleToggleAllDrafts}
                onBulkDeletePending={promptBulkDeletePending}
                emptyStateTitle="No Syllabus Drafts Pending"
                emptyStateDescription="There are currently no draft modules waiting in the curation pipeline. Launch the AI Lesson Generator or create one manually to populate this review center."
                emptyStateActionUrl="/admin/learn/create"
                emptyStateActionLabel="Generate Syllabus Modules"
                emptyStateActionIcon={Sparkles}
                renderItem={(m) => (
                    <div
                        key={m.id}
                        className={`rounded-2xl border bg-card p-4 shadow-xs transition duration-205 sm:p-6 ${
                            m.approved
                                ? 'border-emerald-250 ring-1 shadow-emerald-50/10 ring-emerald-500/10 dark:border-emerald-900/40'
                                : 'hover:border-slate-350 border-border dark:hover:border-slate-700'
                        }`}
                    >
                        {/* Card Header metadata */}
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-semibold text-foreground">
                                    {m.category}
                                </span>
                                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400">
                                    {m.subcategory}
                                </span>
                                <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-semibold text-foreground">
                                    {m.estimated_minutes} mins
                                </span>
                                {m.approved ? (
                                    <span className="bg-emerald-550/10 rounded-full border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/30 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
                                        Approved
                                    </span>
                                ) : (
                                    <span className="dark:text-amber-450 rounded-full border border-amber-100 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:bg-amber-950/30">
                                        Pending Review
                                    </span>
                                )}
                            </div>

                            {/* Card Actions toolbar */}
                            <div className="flex items-center gap-1.5">
                                <TooltipProvider delayDuration={150}>
                                    {m.isEditing ? (
                                        <>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleEditDraft(
                                                                m.id,
                                                            )
                                                        }
                                                        className="border-emerald-250 cursor-pointer rounded-lg border bg-emerald-50 text-emerald-700 transition dark:border-emerald-800 dark:bg-emerald-950/30 dark:bg-emerald-950/40 dark:text-emerald-400"
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
                                                                m.id,
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
                                                                m.id,
                                                            )
                                                        }
                                                        className={`cursor-pointer rounded-lg border p-1.5 transition ${
                                                            m.approved
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                                : 'border-border bg-card text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Check className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {m.approved
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
                                                                m.id,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:text-foreground"
                                                    >
                                                        <Edit3 className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Edit Lesson Content Inline
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            promptDeleteDraft(
                                                                m.id,
                                                            )
                                                        }
                                                        className="hover:text-red-650 cursor-pointer rounded-lg border border-border bg-card p-1.5 text-muted-foreground transition hover:border-red-200 dark:hover:text-red-500"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Delete Draft Module
                                                </TooltipContent>
                                            </Tooltip>
                                        </>
                                    )}
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Title and Summary Block */}
                        <div className="mb-4 space-y-4">
                            {m.isEditing ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">
                                            Lesson Title
                                        </label>
                                        <Input
                                            type="text"
                                            value={m.title}
                                            onChange={(e) =>
                                                handleUpdateDraftField(
                                                    m.id,
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">
                                            Focus Topic
                                        </label>
                                        <Input
                                            type="text"
                                            value={m.topic}
                                            onChange={(e) =>
                                                handleUpdateDraftField(
                                                    m.id,
                                                    'topic',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">
                                            Preview Summary
                                        </label>
                                        <Input
                                            type="text"
                                            value={m.summary}
                                            onChange={(e) =>
                                                handleUpdateDraftField(
                                                    m.id,
                                                    'summary',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">
                                            Markdown Content
                                        </label>
                                        <textarea
                                            value={m.content}
                                            onChange={(e) =>
                                                handleUpdateDraftField(
                                                    m.id,
                                                    'content',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-border bg-background p-3 font-mono text-sm font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                                            rows={12}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <h2 className="text-lg leading-tight font-black text-foreground">
                                            {m.title}
                                        </h2>
                                        <p className="mt-0.5 text-sm leading-relaxed font-bold text-muted-foreground">
                                            Focus: {m.topic}
                                        </p>
                                    </div>
                                    <blockquote className="rounded-r-lg border-l-3 border-border bg-muted/40 py-1 pr-2 pl-3.5 text-sm leading-relaxed font-semibold text-muted-foreground">
                                        {m.summary}
                                    </blockquote>

                                    <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-5">
                                        {/* Toggle Mode Tabs */}
                                        <div className="mb-4 flex items-center justify-between gap-1.5 border-b border-border pb-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <FileText className="size-4 text-muted-foreground" />
                                                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                                    Lesson Material Preview
                                                </span>
                                            </div>

                                            <div className="inline-flex rounded-lg bg-muted p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewMode(
                                                            (prev) => ({
                                                                ...prev,
                                                                [m.id]: 'preview',
                                                            }),
                                                        )
                                                    }
                                                    className={`cursor-pointer rounded-md px-2 py-1 text-[9.5px] font-extrabold uppercase transition ${
                                                        (previewMode[m.id] ||
                                                            'preview') ===
                                                        'preview'
                                                            ? 'shadow-3xs bg-card text-blue-600 dark:text-blue-400 dark:text-white'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Visual Format
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewMode(
                                                            (prev) => ({
                                                                ...prev,
                                                                [m.id]: 'raw',
                                                            }),
                                                        )
                                                    }
                                                    className={`cursor-pointer rounded-md px-2 py-1 text-[9.5px] font-extrabold uppercase transition ${
                                                        previewMode[m.id] ===
                                                        'raw'
                                                            ? 'shadow-3xs bg-card text-blue-600 dark:text-blue-400 dark:text-white'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Raw Source
                                                </button>
                                            </div>
                                        </div>

                                        {(previewMode[m.id] || 'preview') ===
                                        'preview' ? (
                                            <div className="max-h-[450px] overflow-y-auto pr-2 text-xs leading-relaxed text-foreground">
                                                <LessonMarkdown
                                                    content={m.content}
                                                />
                                            </div>
                                        ) : (
                                            <pre className="max-h-[300px] overflow-y-auto rounded-lg border border-border bg-muted p-3 pr-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground select-all">
                                                {m.content}
                                            </pre>
                                        )}
                                    </div>
                                </div>
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
                              draftModules.filter((m) => !m.approved).length
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

// Register layout configuration
DraftsLearnList.layout = {
    breadcrumbs: [
        {
            title: 'Module Management',
            href: adminLearnIndex().url,
        },
        {
            title: 'Drafts Review',
            href: adminLearnDrafts().url,
        },
    ],
};
