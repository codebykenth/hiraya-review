import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import type { DeckItem } from './manage-cards-dialog';

interface ResetProgressDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deck: DeckItem | null;
}

export function ResetProgressDialog({ open, onOpenChange, deck }: ResetProgressDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReset = () => {
        if (!deck) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/flashcards/decks/${deck.id}/reset-progress`,
            {},
            {
                onSuccess: () => {
                    toast.success(`Progress reset for "${deck.title}".`, {
                        description: 'All cards are now queued for review.',
                    });
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error('Failed to reset progress.');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    if (!deck) {
        return null;
    }

    return (
        <ConfirmModal
            isOpen={open}
            title="Reset Deck Progress"
            variant="warning"
            confirmLabel="Reset All Progress"
            isLoading={isSubmitting}
            onClose={() => onOpenChange(false)}
            onConfirm={handleReset}
            message={`Are you sure you want to reset your spaced repetition memory score for "${deck.title}"?`}
        >
            <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1 text-left">
                <p className="font-semibold">What happens when you reset:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
                    <li>All card intervals and ease factors will be reset to initial values.</li>
                    <li>All {deck.total_cards} card{deck.total_cards === 1 ? '' : 's'} in this deck will immediately become due for review.</li>
                    <li>Your cards and custom notes will NOT be deleted.</li>
                </ul>
            </div>
        </ConfirmModal>
    );
}
