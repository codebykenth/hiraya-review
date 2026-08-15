import { router } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    Plus,
    X,
    Search,
    Bookmark,
    Check,
    Loader2,
    BookOpen,
    Layers,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { SavedDrillSet, Question, Category } from '../types';

interface EditSavedSetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    drillSet: SavedDrillSet | null;
    allQuestions: Question[];
    categories: Category[];
    onUpdated?: () => void;
}

export function EditSavedSetDialog({
    isOpen,
    onClose,
    drillSet,
    allQuestions = [],
    categories = [],
    onUpdated,
}: EditSavedSetDialogProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'questions' | 'add'>('questions');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('blue');
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    // Questions in this set
    const [setQuestions, setSetQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [removingQuestionId, setRemovingQuestionId] = useState<number | null>(null);
    const [addingQuestionId, setAddingQuestionId] = useState<number | null>(null);

    // Add Questions Search & Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Populate initial state when drillSet changes
    useEffect(() => {
        if (drillSet && isOpen) {
            setName(drillSet.name);
            setDescription(drillSet.description || '');
            setColor(drillSet.color || 'blue');
            fetchSetQuestions(drillSet.id);
        }
    }, [drillSet, isOpen]);

    const fetchSetQuestions = async (setId: number) => {
        setIsLoadingQuestions(true);
        try {
            const res = await fetch(`/drills/saved-sets/${setId}/questions`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setSetQuestions(data.questions || []);
            }
        } catch {
            toast.error('Failed to load questions in this set.');
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!drillSet || !name.trim()) return;

        setIsSavingDetails(true);
        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch(`/drills/saved-sets/${drillSet.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    color,
                }),
            });

            if (res.ok) {
                toast.success('Practice set updated.');
                router.reload();
                onUpdated?.();
            } else {
                toast.error('Failed to update practice set.');
            }
        } catch {
            toast.error('An error occurred while saving.');
        } finally {
            setIsSavingDetails(false);
        }
    };

    const handleRemoveQuestion = async (questionId: number) => {
        if (!drillSet) return;

        setRemovingQuestionId(questionId);
        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch(`/drills/saved-sets/${drillSet.id}/questions/${questionId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (res.ok) {
                setSetQuestions((prev) => prev.filter((q) => q.id !== questionId));
                toast.success('Question removed from set.');
                router.reload();
                onUpdated?.();
            } else {
                toast.error('Failed to remove question.');
            }
        } catch {
            toast.error('Error removing question.');
        } finally {
            setRemovingQuestionId(null);
        }
    };

    const handleAddQuestion = async (questionId: number) => {
        if (!drillSet) return;

        setAddingQuestionId(questionId);
        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch('/drills/saved-sets/add-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    saved_drill_set_id: drillSet.id,
                    question_id: questionId,
                }),
            });

            if (res.ok) {
                const addedQ = allQuestions.find((q) => q.id === questionId);
                if (addedQ) {
                    setSetQuestions((prev) => [...prev, addedQ]);
                }
                toast.success('Question added to set.');
                router.reload();
                onUpdated?.();
            } else {
                toast.error('Failed to add question.');
            }
        } catch {
            toast.error('Error adding question.');
        } finally {
            setAddingQuestionId(null);
        }
    };

    // Filter available questions to add
    const currentQuestionIds = useMemo(() => new Set(setQuestions.map((q) => q.id)), [setQuestions]);

    const availableToAddQuestions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return allQuestions.filter((q) => {
            if (currentQuestionIds.has(q.id)) return false;

            if (selectedCategory !== 'all') {
                const matches =
                    q.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                    selectedCategory.toLowerCase().includes(q.category.toLowerCase());
                if (!matches) return false;
            }

            if (query) {
                const stemMatch = q.stem.toLowerCase().includes(query);
                const subcatMatch = (q.subcategory || '').toLowerCase().includes(query);
                const catMatch = (q.category || '').toLowerCase().includes(query);
                return stemMatch || subcatMatch || catMatch;
            }

            return true;
        });
    }, [allQuestions, currentQuestionIds, selectedCategory, searchQuery]);

    if (!drillSet) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-3xl overflow-hidden p-0 gap-0">
                {/* Header */}
                <DialogHeader className="border-b border-border p-5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Bookmark className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-heading text-base font-bold text-foreground">
                                    Manage Practice Set
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {drillSet.name} • {setQuestions.length} Questions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-4 flex gap-1 rounded-xl bg-muted/70 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('questions')}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                                activeTab === 'questions'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <BookOpen className="size-3.5" />
                            <span>Questions ({setQuestions.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('add')}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                                activeTab === 'add'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Plus className="size-3.5" />
                            <span>Add Questions</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
                                activeTab === 'details'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Pencil className="size-3.5" />
                            <span>Set Details</span>
                        </button>
                    </div>
                </DialogHeader>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* TAB 1: Questions in Set */}
                    {activeTab === 'questions' && (
                        <div className="space-y-3">
                            {isLoadingQuestions ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Loader2 className="size-6 animate-spin" />
                                    <p className="mt-2 text-xs">Loading set questions...</p>
                                </div>
                            ) : setQuestions.length > 0 ? (
                                <div className="space-y-2.5">
                                    {setQuestions.map((q, idx) => (
                                        <div
                                            key={q.id}
                                            className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3.5 transition hover:border-blue-500/40"
                                        >
                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-black text-muted-foreground">
                                                    {idx + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                                            {q.category}
                                                        </span>
                                                        {q.subcategory && (
                                                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                                {q.subcategory}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs leading-relaxed text-foreground line-clamp-2">
                                                        {q.stem}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={removingQuestionId === q.id}
                                                onClick={() => handleRemoveQuestion(q.id)}
                                                className="shrink-0 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                                title="Remove from set"
                                            >
                                                {removingQuestionId === q.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                        <Layers className="size-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">No Questions in Set</h4>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Switch to the &ldquo;Add Questions&rdquo; tab or bookmark items during exam reviews.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveTab('add')}
                                        className="mt-3 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>Add Questions Now</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: Add Questions */}
                    {activeTab === 'add' && (
                        <div className="space-y-3.5">
                            {/* Search & Category Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by keyword, stem, or topic..."
                                        className="pl-8 text-xs"
                                    />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categories
                                        .filter((c) => c.name.toLowerCase() !== 'demographic')
                                        .map((c) => (
                                            <option key={c.id} value={c.name}>
                                                {c.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Available Questions List */}
                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                {availableToAddQuestions.length > 0 ? (
                                    availableToAddQuestions.slice(0, 30).map((q) => (
                                        <div
                                            key={q.id}
                                            className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-blue-500/40"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                                        {q.category}
                                                    </span>
                                                    {q.subcategory && (
                                                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                            {q.subcategory}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs leading-relaxed text-foreground line-clamp-2">
                                                    {q.stem}
                                                </p>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={addingQuestionId === q.id}
                                                onClick={() => handleAddQuestion(q.id)}
                                                className="shrink-0 gap-1 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                            >
                                                {addingQuestionId === q.id ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Plus className="size-3.5" />
                                                )}
                                                <span>Add</span>
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No matching questions found to add.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Set Details */}
                    {activeTab === 'details' && (
                        <form onSubmit={handleSaveDetails} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-foreground">
                                    Set Name
                                </label>
                                <Input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Difficult Word Problems, Syllogisms"
                                    className="text-xs"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-foreground">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief note about what this practice set covers..."
                                    className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onClose}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSavingDetails || !name.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                                >
                                    {isSavingDetails && <Loader2 className="size-3.5 animate-spin" />}
                                    <span>Save Changes</span>
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
