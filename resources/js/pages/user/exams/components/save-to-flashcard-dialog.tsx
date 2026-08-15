import { BookmarkPlus, Brain, Check, FolderPlus, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DeckOption {
    id: number;
    title: string;
    category: string;
    is_system: boolean;
    is_owner: boolean;
}

interface QuestionData {
    id: number;
    stem: string;
    options?: string[];
    correct_option?: number;
    explanation?: string;
}

interface SaveToFlashcardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question?: QuestionData | null;
    onSaved?: (questionId: number) => void;
}

interface SaveToFlashcardFormProps {
    question: QuestionData;
    onOpenChange: (open: boolean) => void;
    onSaved?: (questionId: number) => void;
}

function SaveToFlashcardForm({
    question,
    onOpenChange,
    onSaved,
}: SaveToFlashcardFormProps) {
    const [decks, setDecks] = useState<DeckOption[]>([]);
    const [isLoadingDecks, setIsLoadingDecks] = useState(true);
    const [selectedDeckMode, setSelectedDeckMode] = useState<'default' | 'existing' | 'new'>('default');
    const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
    const [newDeckTitle, setNewDeckTitle] = useState('');

    const correctOptIdx = question.correct_option;
    const correctText =
        question.options && correctOptIdx !== undefined && question.options[correctOptIdx] !== undefined
            ? question.options[correctOptIdx]
            : 'N/A';

    const [frontContent, setFrontContent] = useState(question.stem || '');
    const [backContent, setBackContent] = useState(`Correct Answer: ${correctText}`);
    const [explanation, setExplanation] = useState(question.explanation || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAdvancedEdit, setShowAdvancedEdit] = useState(false);

    // Load available decks
    useEffect(() => {
        let isMounted = true;
        fetch('/flashcards/list', {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    const personalDecks = (data.decks || []).filter((d: DeckOption) => d.is_owner);
                    setDecks(personalDecks);

                    if (personalDecks.length > 0) {
                        setSelectedDeckId(personalDecks[0].id);
                    }

                    setIsLoadingDecks(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsLoadingDecks(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload: Record<string, unknown> = {
                question_id: question.id,
                front_content: frontContent,
                back_content: backContent,
                explanation: explanation,
            };

            if (selectedDeckMode === 'existing' && selectedDeckId) {
                payload.deck_id = selectedDeckId;
            } else if (selectedDeckMode === 'new' && newDeckTitle.trim()) {
                payload.new_deck_title = newDeckTitle.trim();
            }

            const response = await fetch('/flashcards/convert-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to save flashcard');
            }

            const result = await response.json();
            toast.success(`Saved to "${result.deck_title || 'Flashcards'}"!`, {
                description: 'You can review this card in Spaced Repetition.',
            });

            onSaved?.(question.id);
            onOpenChange(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error saving flashcard';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-5">
            <DialogHeader className="space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 p-2 border border-indigo-200 dark:border-indigo-800">
                        <Brain className="size-5" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                        Save to Study Deck
                    </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                    Create a spaced repetition flashcard from this exam question to review regularly.
                </DialogDescription>
            </DialogHeader>

            {/* Deck Destination Picker */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-4">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Target Flashcard Deck</span>
                    {isLoadingDecks && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedDeckMode('default')}
                        className={`flex flex-col items-start p-2.5 text-left rounded-lg border text-xs transition ${
                            selectedDeckMode === 'default'
                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-2xs font-semibold'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-bold">
                            <Sparkles className="size-3.5 text-indigo-500" /> Default Deck
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Missed Exam Items</span>
                    </button>

                    <button
                        type="button"
                        disabled={decks.length === 0}
                        onClick={() => setSelectedDeckMode('existing')}
                        className={`flex flex-col items-start p-2.5 text-left rounded-lg border text-xs transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            selectedDeckMode === 'existing'
                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-2xs font-semibold'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-bold">
                            <BookmarkPlus className="size-3.5 text-indigo-500" /> My Decks
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                            {decks.length > 0 ? `${decks.length} deck(s) available` : 'No personal decks'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedDeckMode('new')}
                        className={`flex flex-col items-start p-2.5 text-left rounded-lg border text-xs transition ${
                            selectedDeckMode === 'new'
                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-2xs font-semibold'
                                : 'border-border bg-card hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1 font-bold">
                            <FolderPlus className="size-3.5 text-indigo-500" /> New Deck
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">Create on the fly</span>
                    </button>
                </div>

                {selectedDeckMode === 'existing' && decks.length > 0 && (
                    <div className="pt-2">
                        <Label htmlFor="existing-deck-select" className="text-[11px] text-muted-foreground">
                            Select Personal Deck
                        </Label>
                        <select
                            id="existing-deck-select"
                            value={selectedDeckId ?? decks[0]?.id}
                            onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        >
                            {decks.map((deck) => (
                                <option key={deck.id} value={deck.id}>
                                    {deck.title} ({deck.category})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedDeckMode === 'new' && (
                    <div className="pt-2">
                        <Label htmlFor="new-deck-input" className="text-[11px] text-muted-foreground">
                            New Deck Name
                        </Label>
                        <Input
                            id="new-deck-input"
                            required
                            value={newDeckTitle}
                            onChange={(e) => setNewDeckTitle(e.target.value)}
                            placeholder="e.g. Vocabulary & Synonyms"
                            className="mt-1 h-9 text-xs"
                        />
                    </div>
                )}
            </div>

            {/* Preview / Quick Edit toggle */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Card Preview</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvancedEdit(!showAdvancedEdit)}
                        className="h-7 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                        {showAdvancedEdit ? 'Hide Editor' : 'Customize Text'}
                    </Button>
                </div>

                {!showAdvancedEdit ? (
                    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 text-xs">
                        <div>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 mb-1">
                                Front (Question)
                            </Badge>
                            <p className="text-foreground line-clamp-3 leading-relaxed font-medium">
                                {frontContent}
                            </p>
                        </div>
                        <div className="border-t border-border/60 pt-2">
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 mb-1 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            >
                                Back (Answer)
                            </Badge>
                            <p className="text-foreground font-semibold line-clamp-2">
                                {backContent}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 rounded-xl border border-border p-3.5 bg-card">
                        <div>
                            <Label className="text-[11px] text-muted-foreground">Front Side (Question / Stem)</Label>
                            <Textarea
                                value={frontContent}
                                onChange={(e) => setFrontContent(e.target.value)}
                                rows={2}
                                required
                                className="mt-1 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-[11px] text-muted-foreground">Back Side (Correct Answer)</Label>
                            <Textarea
                                value={backContent}
                                onChange={(e) => setBackContent(e.target.value)}
                                rows={2}
                                required
                                className="mt-1 text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-[11px] text-muted-foreground">Explanation / Note</Label>
                            <Textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                rows={2}
                                className="mt-1 text-xs"
                            />
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="text-xs"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="size-3.5 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Check className="size-3.5" /> Save Flashcard
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function SaveToFlashcardDialog({
    open,
    onOpenChange,
    question,
    onSaved,
}: SaveToFlashcardDialogProps) {
    if (!question) {
return null;
}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <SaveToFlashcardForm
                    key={question.id}
                    question={question}
                    onOpenChange={onOpenChange}
                    onSaved={onSaved}
                />
            </DialogContent>
        </Dialog>
    );
}
