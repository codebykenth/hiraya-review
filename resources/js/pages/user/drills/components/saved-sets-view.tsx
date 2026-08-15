import { Link, router } from '@inertiajs/react';
import {
    FolderPlus,
    Bookmark,
    Trash2,
    Play,
    Plus,
    X,
    Folder,
    Sparkles,
    FileText,
    Check,
    Pencil,
    SlidersHorizontal,
} from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Card } from '@/components/ui/card';
import type { SavedDrillSet, Question, Category } from '../types';
import { EditSavedSetDialog } from './edit-saved-set-dialog';

interface SavedSetsViewProps {
    savedDrillSets: SavedDrillSet[];
    allQuestions?: Question[];
    categories?: Category[];
    onLaunchSavedSetDrill: (setId: number) => void;
    onSetCreatedOrUpdated?: () => void;
}

export function SavedSetsView({
    savedDrillSets = [],
    allQuestions = [],
    categories = [],
    onLaunchSavedSetDrill,
    onSetCreatedOrUpdated,
}: SavedSetsViewProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [setName, setSetName] = useState('');
    const [setDescription, setSetDescription] = useState('');
    const [setColor, setSetColor] = useState('blue');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setToDelete, setSetToDelete] = useState<SavedDrillSet | null>(null);
    const [setForEdit, setSetForEdit] = useState<SavedDrillSet | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!setName.trim()) {
return;
}

        setIsSubmitting(true);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch('/drills/saved-sets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: setName.trim(),
                    description: setDescription.trim() || null,
                    color: setColor,
                }),
            });

            if (res.ok) {
                setSetName('');
                setSetDescription('');
                setIsCreateModalOpen(false);
                router.reload();
            }
        } catch {
            // handle error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) {
return;
}

        setIsDeleting(true);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch(`/drills/saved-sets/${setToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (res.ok) {
                setSetToDelete(null);
                router.reload();
            }
        } catch {
            // handle error
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Bookmark className="size-5" />
                    </div>
                    <div>
                        <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                            Saved Question Sets
                        </h2>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Personal practice sets created by bookmarking difficult items during exam and drill reviews.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="size-4" />
                    <span>New Practice Set</span>
                </button>
            </div>

            {/* Sets Grid */}
            {savedDrillSets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {savedDrillSets.map((set) => {
                        const hasQuestions = set.questions_count > 0;

                        return (
                            <Card
                                key={set.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-blue-500/50 hover:shadow-md"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                            <Folder className="size-5" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-black text-foreground">
                                                {set.questions_count} Question{set.questions_count === 1 ? '' : 's'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSetForEdit(set);
                                                }}
                                                title="Edit Set & Questions"
                                                className="rounded-lg p-1 text-muted-foreground opacity-70 transition hover:bg-blue-50 hover:text-blue-600 hover:opacity-100 dark:hover:bg-blue-950/40 cursor-pointer"
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSetToDelete(set);
                                                }}
                                                title="Delete Set"
                                                className="rounded-lg p-1 text-muted-foreground opacity-70 transition hover:bg-rose-50 hover:text-rose-600 hover:opacity-100 dark:hover:bg-rose-950/30 cursor-pointer"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                                        {set.name}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                        {set.description || 'Custom bookmarked practice set.'}
                                    </p>

                                    {/* Category tags */}
                                    {set.sample_categories && set.sample_categories.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {set.sample_categories.map((cat, idx) => (
                                                <span
                                                    key={idx}
                                                    className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                                    <button
                                        type="button"
                                        disabled={!hasQuestions}
                                        onClick={() => onLaunchSavedSetDrill(set.id)}
                                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Play className="size-3.5 fill-current" />
                                        <span>{hasQuestions ? 'Practice This Set' : 'No Questions Yet'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSetForEdit(set)}
                                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                    >
                                        <SlidersHorizontal className="size-3.5" />
                                        <span>Manage Questions</span>
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <FolderPlus className="size-6" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                        No Saved Sets Yet
                    </h3>
                    <p className="mx-auto mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                        Create a set or bookmark tricky questions while reviewing past exam results to build your targeted study deck.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
                    >
                        <Plus className="size-4" />
                        <span>Create Your First Set</span>
                    </button>
                </div>
            )}

            {/* Create Set Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in">
                    <div
                        className="relative flex w-full max-w-2xl animate-in flex-col rounded-2xl border border-border bg-card p-6 shadow-xl duration-200 zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-heading text-base font-bold text-foreground">
                                Create New Practice Set
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSet} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-foreground">
                                    Set Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Difficult Word Problems, Syllogisms"
                                    value={setName}
                                    onChange={(e) => setSetName(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-foreground">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief note about the focus of this set..."
                                    value={setDescription}
                                    onChange={(e) => setSetDescription(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !setName.trim()}
                                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95 disabled:opacity-40"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Set'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit / Manage Set Dialog */}
            <EditSavedSetDialog
                isOpen={setForEdit !== null}
                drillSet={setForEdit}
                allQuestions={allQuestions}
                categories={categories}
                onClose={() => setSetForEdit(null)}
                onUpdated={() => {
                    onSetCreatedOrUpdated?.();
                }}
            />

            {/* Delete Practice Set Confirmation Modal */}
            <ConfirmModal
                isOpen={setToDelete !== null}
                title="Delete Practice Set"
                message={
                    setToDelete
                        ? `Are you sure you want to delete "${setToDelete.name}"? This action cannot be undone.`
                        : ''
                }
                confirmLabel="Delete Set"
                cancelLabel="Keep Set"
                variant="danger"
                isLoading={isDeleting}
                onClose={() => setSetToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
