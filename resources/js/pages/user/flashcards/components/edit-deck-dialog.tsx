import { router } from '@inertiajs/react';
import { Edit3, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import type { DeckItem } from './manage-cards-dialog';

interface EditDeckDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deck: DeckItem | null;
}

interface EditDeckFormProps {
    deck: DeckItem;
    onOpenChange: (open: boolean) => void;
}

function EditDeckForm({ deck, onOpenChange }: EditDeckFormProps) {
    const [title, setTitle] = useState(deck.title);
    const [category, setCategory] = useState(deck.category || 'General Information');
    const [description, setDescription] = useState(deck.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
return;
}

        setIsSubmitting(true);
        router.put(
            `/flashcards/decks/${deck.id}`,
            {
                title: title.trim(),
                category: category,
                description: description.trim(),
            },
            {
                onSuccess: () => {
                    toast.success('Deck details updated.');
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error('Failed to update deck.');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                        <Edit3 className="size-5" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                        Edit Deck
                    </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                    Update the title, category, or notes for this custom flashcard deck.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
                <div>
                    <Label htmlFor="edit-deck-title" className="text-xs font-semibold text-muted-foreground">
                        Deck Title
                    </Label>
                    <Input
                        id="edit-deck-title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 text-xs"
                    />
                </div>

                <div>
                    <Label htmlFor="edit-deck-category" className="text-xs font-semibold text-muted-foreground">
                        Category
                    </Label>
                    <select
                        id="edit-deck-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="General Information">General Information</option>
                        <option value="Numerical Ability">Numerical Ability</option>
                        <option value="Verbal Ability">Verbal Ability</option>
                        <option value="Analytical Ability">Analytical Ability</option>
                        <option value="Clerical Ability">Clerical Ability</option>
                        <option value="Exam Review">Exam Review</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="edit-deck-desc" className="text-xs font-semibold text-muted-foreground">
                        Description (Optional)
                    </Label>
                    <Textarea
                        id="edit-deck-desc"
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 text-xs"
                    />
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
                    {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    Save Changes
                </Button>
            </DialogFooter>
        </form>
    );
}

export function EditDeckDialog({ open, onOpenChange, deck }: EditDeckDialogProps) {
    if (!deck) {
return null;
}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <EditDeckForm key={deck.id} deck={deck} onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
}
