import {
    BookOpen,
    Edit3,
    Layers,
    Loader2,
    Plus,
    Search,
    Trash2,
    X,
    Check,
    HelpCircle,
    Calendar,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface CardItem {
    id: number;
    front_content: string;
    back_content: string;
    explanation?: string;
    ease_factor: number;
    interval_days: number;
    repetitions: number;
    next_review_at?: string;
}

export interface DeckItem {
    id: number;
    title: string;
    category: string;
    description: string;
    is_system: boolean;
    is_owner: boolean;
    total_cards: number;
    due_cards: number;
}

interface ManageCardsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deck: DeckItem | null;
    onCardCountChanged?: () => void;
}

interface ManageCardsContentProps {
    deck: DeckItem;
    onClose: () => void;
    onCardCountChanged?: () => void;
}

function ManageCardsContent({
    deck,
    onCardCountChanged,
}: ManageCardsContentProps) {
    const [cards, setCards] = useState<CardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Add Form State
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [newExplanation, setNewExplanation] = useState('');
    const [isSavingNew, setIsSavingNew] = useState(false);

    // Edit Card State
    const [editingCardId, setEditingCardId] = useState<number | null>(null);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');
    const [editExplanation, setEditExplanation] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Fetch cards on mount
    useEffect(() => {
        let isMounted = true;
        fetch(`/flashcards/decks/${deck.id}?mode=all`, {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    setCards(data.cards || []);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    toast.error('Failed to load flashcards for this deck.');
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [deck.id]);

    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) {
return cards;
}

        const q = searchQuery.toLowerCase();

        return cards.filter(
            (c) =>
                c.front_content.toLowerCase().includes(q) ||
                c.back_content.toLowerCase().includes(q) ||
                (c.explanation && c.explanation.toLowerCase().includes(q))
        );
    }, [cards, searchQuery]);

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newFront.trim() || !newBack.trim()) {
return;
}

        setIsSavingNew(true);

        try {
            const res = await fetch(`/flashcards/decks/${deck.id}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    front_content: newFront,
                    back_content: newBack,
                    explanation: newExplanation,
                }),
            });

            if (!res.ok) {
throw new Error('Failed to create card');
}

            const data = await res.json();
            setCards((prev) => [
                ...prev,
                {
                    id: data.card.id,
                    front_content: data.card.front_content,
                    back_content: data.card.back_content,
                    explanation: data.card.explanation,
                    ease_factor: 2.5,
                    interval_days: 0,
                    repetitions: 0,
                },
            ]);

            setNewFront('');
            setNewBack('');
            setNewExplanation('');
            setShowAddForm(false);
            toast.success('Card added to deck!');
            onCardCountChanged?.();
        } catch {
            toast.error('Could not save card.');
        } finally {
            setIsSavingNew(false);
        }
    };

    const handleStartEdit = (card: CardItem) => {
        setEditingCardId(card.id);
        setEditFront(card.front_content);
        setEditBack(card.back_content);
        setEditExplanation(card.explanation || '');
    };

    const handleCancelEdit = () => {
        setEditingCardId(null);
        setEditFront('');
        setEditBack('');
        setEditExplanation('');
    };

    const handleSaveEdit = async (cardId: number) => {
        if (!editFront.trim() || !editBack.trim()) {
return;
}

        setIsSavingEdit(true);

        try {
            const res = await fetch(`/flashcards/cards/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    front_content: editFront,
                    back_content: editBack,
                    explanation: editExplanation,
                }),
            });

            if (!res.ok) {
throw new Error('Failed to update card');
}

            setCards((prev) =>
                prev.map((c) =>
                    c.id === cardId
                        ? {
                              ...c,
                              front_content: editFront,
                              back_content: editBack,
                              explanation: editExplanation,
                          }
                        : c
                )
            );

            setEditingCardId(null);
            toast.success('Card updated successfully.');
        } catch {
            toast.error('Could not update card.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Delete Confirmation State
    const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const handleDeleteCard = (cardId: number) => {
        setDeletingCardId(cardId);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDeleteCard = async () => {
        if (!deletingCardId) {
            return;
        }

        try {
            const res = await fetch(`/flashcards/cards/${deletingCardId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to delete card');
            }

            setCards((prev) => prev.filter((c) => c.id !== deletingCardId));
            toast.success('Card removed from deck.');
            onCardCountChanged?.();
        } catch {
            toast.error('Could not delete card.');
        } finally {
            setDeletingCardId(null);
            setIsConfirmDeleteOpen(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border bg-card">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                                <Layers className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-foreground">
                                    Manage Cards &bull; {deck.title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    {deck.is_system ? 'Official System Deck (Read-Only)' : 'Personal Custom Deck'} &bull; {cards.length} card{cards.length === 1 ? '' : 's'}
                                </DialogDescription>
                            </div>
                        </div>
                        {deck.is_owner && !deck.is_system && (
                            <Button
                                size="sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-semibold"
                            >
                                {showAddForm ? (
                                    <>
                                        <X className="size-3.5" /> Close Form
                                    </>
                                ) : (
                                    <>
                                        <Plus className="size-3.5" /> Add Card
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {/* Search Bar */}
                <div className="mt-4 relative">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search cards by question, answer, or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Add New Card Form */}
                {showAddForm && deck.is_owner && (
                    <form
                        onSubmit={handleCreateCard}
                        className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3 shadow-sm animate-in fade-in"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            <Sparkles className="size-3.5" /> Create New Flashcard
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-[11px] text-muted-foreground">Front Side (Question)</Label>
                                <Textarea
                                    required
                                    rows={2}
                                    value={newFront}
                                    onChange={(e) => setNewFront(e.target.value)}
                                    placeholder="e.g. What is the deadline to file SALN?"
                                    className="mt-1 text-xs bg-background"
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] text-muted-foreground">Back Side (Answer)</Label>
                                <Textarea
                                    required
                                    rows={2}
                                    value={newBack}
                                    onChange={(e) => setNewBack(e.target.value)}
                                    placeholder="e.g. On or before April 30 of every year"
                                    className="mt-1 text-xs bg-background"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-[11px] text-muted-foreground">Explanation / Reference (Optional)</Label>
                            <Input
                                value={newExplanation}
                                onChange={(e) => setNewExplanation(e.target.value)}
                                placeholder="e.g. RA 6713 Section 8"
                                className="mt-1 h-8 text-xs bg-background"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddForm(false)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSavingNew}
                                size="sm"
                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1"
                            >
                                {isSavingNew ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Check className="size-3.5" />
                                )}
                                Save Card
                            </Button>
                        </div>
                    </form>
                )}

                {/* Cards List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2">
                        <Loader2 className="size-8 animate-spin text-indigo-500" />
                        <p className="text-xs">Loading deck flashcards...</p>
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl p-8">
                        <BookOpen className="size-10 text-muted-foreground/50 mb-2" />
                        <h4 className="text-sm font-bold text-foreground">
                            {searchQuery ? 'No matching flashcards' : 'This deck has no flashcards yet'}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                            {searchQuery
                                ? 'Try a different search keyword.'
                                : deck.is_owner
                                ? 'Click "Add Card" above or save questions from exam review sessions.'
                                : 'No cards are registered in this system deck.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCards.map((card, idx) => {
                            const isEditing = editingCardId === card.id;

                            if (isEditing) {
                                return (
                                    <div
                                        key={card.id}
                                        className="rounded-xl border border-indigo-300 dark:border-indigo-800 bg-card p-4 space-y-3 shadow-md"
                                    >
                                        <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            <span>Editing Card #{idx + 1}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleCancelEdit}
                                                className="h-6 px-2 text-[11px]"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">Front Side (Question)</Label>
                                                <Textarea
                                                    rows={3}
                                                    value={editFront}
                                                    onChange={(e) => setEditFront(e.target.value)}
                                                    className="mt-1 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">Back Side (Answer)</Label>
                                                <Textarea
                                                    rows={3}
                                                    value={editBack}
                                                    onChange={(e) => setEditBack(e.target.value)}
                                                    className="mt-1 text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-[11px] text-muted-foreground">Explanation / Note</Label>
                                            <Textarea
                                                rows={2}
                                                value={editExplanation}
                                                onChange={(e) => setEditExplanation(e.target.value)}
                                                className="mt-1 text-xs"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                className="h-8 text-xs"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                disabled={isSavingEdit}
                                                size="sm"
                                                onClick={() => handleSaveEdit(card.id)}
                                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1"
                                            >
                                                {isSavingEdit ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="size-3.5" />
                                                )}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={card.id}
                                    className="group rounded-xl border border-border bg-card p-4 hover:border-indigo-300 dark:hover:border-indigo-800/60 transition shadow-2xs space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] px-1.5 py-0 font-mono font-bold"
                                            >
                                                #{idx + 1}
                                            </Badge>
                                            {card.repetitions > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                                    <Calendar className="size-3 text-indigo-500" />
                                                    Interval: {card.interval_days}d &bull; Reps: {card.repetitions}
                                                </span>
                                            )}
                                        </div>

                                        {deck.is_owner && !deck.is_system && (
                                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStartEdit(card)}
                                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                                >
                                                    <Edit3 className="size-3.5" /> Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCard(card.id)}
                                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                                                >
                                                    <Trash2 className="size-3.5" /> Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div className="rounded-lg bg-muted/40 p-3 border border-border/60">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                                Question / Front
                                            </span>
                                            <p className="text-foreground leading-relaxed font-medium">
                                                {card.front_content}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 p-3 border border-emerald-200/60 dark:border-emerald-900/40">
                                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                                                Answer / Back
                                            </span>
                                            <p className="text-foreground leading-relaxed font-medium">
                                                {card.back_content}
                                            </p>
                                        </div>
                                    </div>

                                    {card.explanation && (
                                        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/20 rounded-md p-2 border border-border/40">
                                            <HelpCircle className="size-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                            <span>{card.explanation}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                title="Delete Flashcard?"
                message="Are you sure you want to delete this flashcard from this deck? This action cannot be undone."
                confirmLabel="Delete Card"
                variant="danger"
                onClose={() => {
                    setIsConfirmDeleteOpen(false);
                    setDeletingCardId(null);
                }}
                onConfirm={handleConfirmDeleteCard}
            />
        </>
    );
}

export function ManageCardsDialog({
    open,
    onOpenChange,
    deck,
    onCardCountChanged,
}: ManageCardsDialogProps) {
    if (!deck) {
return null;
}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
                <ManageCardsContent
                    key={deck.id}
                    deck={deck}
                    onClose={() => onOpenChange(false)}
                    onCardCountChanged={onCardCountChanged}
                />
            </DialogContent>
        </Dialog>
    );
}
