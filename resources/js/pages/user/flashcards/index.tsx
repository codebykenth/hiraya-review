import { Head, router } from '@inertiajs/react';
import {
    Brain,
    Plus,
    RotateCw,
    BookOpen,
    ArrowLeft,
    HelpCircle,
    Trash2,
    PlusCircle,
    MoreVertical,
    Copy,
    RotateCcw,
    Edit3,
    Layers,
    Search,
    Flame,
    CheckCircle2,
    Sparkles,
    Zap,
    Loader2,
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EditDeckDialog } from './components/edit-deck-dialog';
import { ManageCardsDialog } from './components/manage-cards-dialog';
import type { CardItem, DeckItem } from './components/manage-cards-dialog';
import { ResetProgressDialog } from './components/reset-progress-dialog';

interface Props {
    decks: DeckItem[];
}

const getCategoryBadgeClass = (category: string) => {
    switch (category) {
        case 'General Information':
            return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
        case 'Numerical Ability':
            return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        case 'Verbal Ability':
            return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case 'Analytical Ability':
            return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        case 'Clerical Ability':
            return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        default:
            return 'bg-muted/60 text-muted-foreground border-border';
    }
};

export default function FlashcardsIndex({ decks = [] }: Props) {
    // Active Study Session State
    const [activeDeck, setActiveDeck] = useState<DeckItem | null>(null);
    const [sessionCards, setSessionCards] = useState<CardItem[]>([]);
    const [cardIdx, setCardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const [sessionMode, setSessionMode] = useState<'due' | 'all'>('due');
    const [isSessionFinished, setIsSessionFinished] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        initialTotal: 0,
        againCount: 0,
        masteredCount: 0,
    });

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Dialog Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [newDeckCategory, setNewDeckCategory] = useState('General Information');
    const [newDeckDesc, setNewDeckDesc] = useState('');
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);

    const [managedDeck, setManagedDeck] = useState<DeckItem | null>(null);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

    const [editingDeck, setEditingDeck] = useState<DeckItem | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const [resettingDeck, setResettingDeck] = useState<DeckItem | null>(null);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    // Delete Deck Confirmation State
    const [deletingDeck, setDeletingDeck] = useState<DeckItem | null>(null);
    const [isConfirmDeleteDeckOpen, setIsConfirmDeleteDeckOpen] = useState(false);

    // Quick Add Card Modal
    const [quickAddDeck, setQuickAddDeck] = useState<DeckItem | null>(null);
    const [cardFront, setCardFront] = useState('');
    const [cardBack, setCardBack] = useState('');
    const [cardExplanation, setCardExplanation] = useState('');
    const [isSavingQuickCard, setIsSavingQuickCard] = useState(false);

    // Categories list for filter tabs
    const categories = useMemo(() => {
        const set = new Set<string>();
        decks.forEach((d) => {
            if (d.category) {
                set.add(d.category);
            }
        });

        return ['all', ...Array.from(set)];
    }, [decks]);

    // Filtered decks list
    const filteredDecks = useMemo(() => {
        return decks.filter((deck) => {
            const matchesCategory =
                categoryFilter === 'all' || deck.category === categoryFilter;
            const matchesSearch =
                !searchQuery.trim() ||
                deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (deck.description &&
                    deck.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [decks, categoryFilter, searchQuery]);

    // Handle Quick Deck Creation
    const handleCreateDeck = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newDeckTitle.trim()) {
            return;
        }

        setIsCreatingDeck(true);
        router.post(
            '/flashcards/decks',
            {
                title: newDeckTitle.trim(),
                category: newDeckCategory,
                description: newDeckDesc.trim(),
            },
            {
                onSuccess: () => {
                    setShowCreateModal(false);
                    setNewDeckTitle('');
                    setNewDeckDesc('');
                    toast.success('Custom flashcard deck created!');
                },
                onError: () => {
                    toast.error('Failed to create deck.');
                },
                onFinish: () => {
                    setIsCreatingDeck(false);
                },
            }
        );
    };

    // Handle Quick Add Card to Deck
    const handleQuickAddCard = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!quickAddDeck || !cardFront.trim() || !cardBack.trim()) {
            return;
        }

        setIsSavingQuickCard(true);

        try {
            const res = await fetch(`/flashcards/decks/${quickAddDeck.id}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    front_content: cardFront.trim(),
                    back_content: cardBack.trim(),
                    explanation: cardExplanation.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to save card');
            }

            setQuickAddDeck(null);
            setCardFront('');
            setCardBack('');
            setCardExplanation('');
            toast.success('Card added to deck!');
            router.reload({ only: ['decks'] });
        } catch {
            toast.error('Failed to add card.');
        } finally {
            setIsSavingQuickCard(false);
        }
    };

    // Handle Clone Deck
    const handleCloneDeck = (deck: DeckItem) => {
        router.post(
            `/flashcards/decks/${deck.id}/clone`,
            {},
            {
                onSuccess: () => {
                    toast.success(`Cloned "${deck.title}" as a personal deck.`, {
                        description: 'You can now edit and add custom cards.',
                    });
                },
                onError: () => {
                    toast.error('Failed to clone deck.');
                },
            }
        );
    };

    // Handle Delete Deck
    const handleDeleteDeck = (deck: DeckItem) => {
        setDeletingDeck(deck);
        setIsConfirmDeleteDeckOpen(true);
    };

    const handleConfirmDeleteDeck = () => {
        if (!deletingDeck) {
            return;
        }

        router.delete(`/flashcards/decks/${deletingDeck.id}`, {
            onSuccess: () => {
                toast.success('Deck deleted.');
                setDeletingDeck(null);
                setIsConfirmDeleteDeckOpen(false);
            },
            onError: () => {
                toast.error('Failed to delete deck.');
            },
        });
    };

    // Start Flashcard Study Session (mode: 'due' or 'all')
    const startSession = async (deck: DeckItem, mode: 'due' | 'all' = 'due') => {
        setIsLoadingSession(true);
        setActiveDeck(deck);
        setSessionMode(mode);
        setIsSessionFinished(false);

        try {
            const res = await fetch(`/flashcards/decks/${deck.id}?mode=${mode}`, {
                headers: { Accept: 'application/json' },
            });
            const data = await res.json();
            const cards = data.cards || [];

            if (mode === 'due' && cards.length === 0) {
                // Deck is 100% caught up for today
                setSessionCards([]);
                setIsSessionFinished(true);
                setSessionStats({
                    initialTotal: 0,
                    againCount: 0,
                    masteredCount: 0,
                });
            } else if (cards.length === 0) {
                toast.info('This deck has no cards to study yet.');
                setActiveDeck(null);
            } else {
                setSessionCards(cards);
                setCardIdx(0);
                setIsFlipped(false);
                setSessionStats({
                    initialTotal: cards.length,
                    againCount: 0,
                    masteredCount: 0,
                });
            }
        } catch {
            toast.error('Failed to load study session.');
            setActiveDeck(null);
        } finally {
            setIsLoadingSession(false);
        }
    };

    // Rate Card (SM-2 Spaced Repetition with Anki Re-queue on "Again")
    const handleRateCard = useCallback(
        async (rating: number) => {
            const currentCard = sessionCards[cardIdx];

            if (!currentCard) {
                return;
            }

            try {
                await fetch(`/flashcards/cards/${currentCard.id}/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({ rating }),
                });
            } catch {
                /* ignore safeguard */
            }

            setIsFlipped(false);

            if (rating === 1) {
                // "Again" - Push card to the back of the queue to re-test in current session
                setSessionCards((prev) => [...prev, currentCard]);
                setSessionStats((prev) => ({
                    ...prev,
                    againCount: prev.againCount + 1,
                }));
                toast.info('Card re-queued for practice before finishing.', { duration: 2000 });
                setCardIdx((prev) => prev + 1);
            } else {
                // "Hard", "Good", or "Easy" - Graduated from session
                setSessionStats((prev) => ({
                    ...prev,
                    masteredCount: prev.masteredCount + 1,
                }));

                if (cardIdx + 1 < sessionCards.length) {
                    setCardIdx((prev) => prev + 1);
                } else {
                    setIsSessionFinished(true);
                    toast.success('Study session complete!', {
                        description: 'Great job maintaining your recall memory streak.',
                    });
                    router.reload({ only: ['decks'] });
                }
            }
        },
        [cardIdx, sessionCards]
    );

    // Keyboard Shortcuts for Study Session
    useEffect(() => {
        if (!activeDeck || sessionCards.length === 0 || isSessionFinished) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Do not trigger if typing in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                setIsFlipped((prev) => !prev);
            } else if (isFlipped) {
                if (e.key === '1') {
                    handleRateCard(1);
                }

                if (e.key === '2') {
                    handleRateCard(2);
                }

                if (e.key === '3') {
                    handleRateCard(3);
                }

                if (e.key === '4') {
                    handleRateCard(4);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeDeck, sessionCards, isFlipped, isSessionFinished, handleRateCard]);

    const activeCard = sessionCards[cardIdx];

    return (
        <PageContainer>
            <Head title="Flashcards & Spaced Repetition - Hiraya Review" />

            <div className="space-y-6">
                {/* Header Banner - Standardized with PageHeader & HowItWorksModal */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <PageHeader
                            title="Spaced Repetition Flashcards"
                            description="Retain Civil Service concepts, laws, and formulas efficiently using the SM-2 algorithm."
                        />
                        <div className="mt-1">
                            <HowItWorksModal
                                title="How Flashcards Work"
                                tips={[
                                    {
                                        icon: <Brain className="size-4" />,
                                        title: 'SM-2 Algorithm',
                                        text: 'Cards you struggle with are reviewed sooner; cards you recall easily are spaced out across increasing days to build permanent long-term memory.',
                                    },
                                    {
                                        icon: <RotateCw className="size-4" />,
                                        title: 'Active Session Re-queueing',
                                        text: 'Marking a card "Again" automatically appends it to the end of your current session so you must correctly recall it before finishing.',
                                    },
                                    {
                                        icon: <Zap className="size-4" />,
                                        title: 'Due vs Cram Mode',
                                        text: 'Click "Study Due" to review only what is scheduled for today, or choose "Practice All" to cram and review the full deck anytime.',
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    {!activeDeck && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-xs text-xs"
                            >
                                <Plus className="size-4" />
                                Create Custom Deck
                            </Button>
                        </div>
                    )}
                </div>

                {/* Active Review Session View */}
                {activeDeck && isSessionFinished ? (
                    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5 shadow-xs">
                            <div className="mx-auto size-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="size-9" />
                            </div>

                            <div className="space-y-1.5">
                                <h2 className="text-xl font-bold text-foreground">
                                    {sessionStats.initialTotal > 0
                                        ? 'Study Session Complete! 🎉'
                                        : "You're All Caught Up! 🎉"}
                                </h2>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    {sessionStats.initialTotal > 0
                                        ? `Great work! You've reviewed and reinforced all scheduled flashcards for "${activeDeck.title}".`
                                        : `No cards are currently due for "${activeDeck.title}". Your memory intervals are active.`}
                                </p>
                            </div>

                            {sessionStats.initialTotal > 0 && (
                                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/50 border border-border text-left">
                                    <div>
                                        <span className="text-[11px] text-muted-foreground block font-medium">Cards Reviewed</span>
                                        <strong className="text-lg font-bold text-foreground">{sessionStats.initialTotal}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-muted-foreground block font-medium">Mastered</span>
                                        <strong className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            {sessionStats.masteredCount}
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-muted-foreground block font-medium">Re-practiced ("Again")</span>
                                        <strong className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                            {sessionStats.againCount}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setActiveDeck(null);
                                        setIsSessionFinished(false);
                                    }}
                                    className="w-full sm:w-auto text-xs gap-1.5"
                                >
                                    <ArrowLeft className="size-3.5" /> Back to Decks
                                </Button>

                                {activeDeck.total_cards > 0 && (
                                    <Button
                                        onClick={() => startSession(activeDeck, 'all')}
                                        className="w-full sm:w-auto text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                                    >
                                        <Sparkles className="size-3.5" /> Practice All Cards ({activeDeck.total_cards})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeDeck && activeCard ? (
                    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveDeck(null)}
                                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" /> Exit Session
                            </Button>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                                    {sessionMode === 'due' ? 'Due Review' : 'Cram Mode'}
                                </span>
                                {activeDeck.is_owner && !activeDeck.is_system && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setManagedDeck(activeDeck);
                                            setIsManageDialogOpen(true);
                                        }}
                                        className="h-7 text-xs gap-1"
                                    >
                                        <Layers className="size-3.5 text-indigo-500" />
                                        Manage Cards
                                    </Button>
                                )}
                                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
                                    Card {cardIdx + 1} of {sessionCards.length}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                                style={{
                                    width: `${((cardIdx + 1) / sessionCards.length) * 100}%`,
                                }}
                            />
                        </div>

                        {/* 3D Flip Card Container */}
                        <div
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="relative min-h-[320px] w-full cursor-pointer rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md flex flex-col justify-center items-center text-center select-none group"
                        >
                            {!isFlipped ? (
                                <div className="w-full max-w-2xl space-y-4">
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
                                    >
                                        Prompt / Question
                                    </Badge>
                                    <p className="w-full text-base sm:text-xl font-semibold text-foreground leading-relaxed break-words whitespace-pre-line">
                                        {activeCard.front_content}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium pt-4 opacity-80 group-hover:opacity-100 transition">
                                        <RotateCw className="size-3.5" /> Click card or press [Space] to flip
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl space-y-4">
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] uppercase font-bold tracking-wider border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                    >
                                        Answer / Correct Recall
                                    </Badge>
                                    <p className="w-full text-base sm:text-xl font-bold text-foreground leading-relaxed break-words whitespace-pre-line">
                                        {activeCard.back_content}
                                    </p>
                                    {activeCard.explanation && (
                                        <div className="mt-4 p-3.5 bg-muted/60 rounded-xl text-xs text-muted-foreground text-left flex items-start gap-2.5 border border-border/50">
                                            <HelpCircle className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                                            <span className="leading-relaxed break-words whitespace-pre-line">{activeCard.explanation}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SM-2 Rating Controls */}
                        {isFlipped && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleRateCard(1)}
                                        className="p-3 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>🔴 Again</span>
                                            <kbd className="text-[9px] px-1 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 font-mono">1</kbd>
                                        </div>
                                        <span className="block text-[10px] opacity-75 font-normal mt-0.5">Re-queue in session</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRateCard(2)}
                                        className="p-3 text-xs font-semibold rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>🟠 Hard</span>
                                            <kbd className="text-[9px] px-1 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 font-mono">2</kbd>
                                        </div>
                                        <span className="block text-[10px] opacity-75 font-normal mt-0.5">1 day interval</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRateCard(3)}
                                        className="p-3 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>🟢 Good</span>
                                            <kbd className="text-[9px] px-1 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-mono">3</kbd>
                                        </div>
                                        <span className="block text-[10px] opacity-75 font-normal mt-0.5">Normal growth</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRateCard(4)}
                                        className="p-3 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>🔵 Easy</span>
                                            <kbd className="text-[9px] px-1 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900/60 font-mono">4</kbd>
                                        </div>
                                        <span className="block text-[10px] opacity-75 font-normal mt-0.5">Rapid interval</span>
                                    </button>
                                </div>
                                <p className="text-center text-[11px] text-muted-foreground">
                                    Tip: Press keys <kbd className="px-1 py-0.5 rounded bg-muted font-mono">1</kbd>–<kbd className="px-1 py-0.5 rounded bg-muted font-mono">4</kbd> to grade recall speed.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Decks Gallery View */
                    <div className="space-y-5">
                        {/* Filters & Search Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                                            categoryFilter === cat
                                                ? 'bg-indigo-600 text-white font-bold'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {cat === 'all' ? 'All Decks' : cat}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search study decks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs"
                                />
                            </div>
                        </div>

                        {/* Deck Cards Grid */}
                        {filteredDecks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl p-8 bg-card">
                                <BookOpen className="size-12 text-muted-foreground/40 mb-3" />
                                <h3 className="text-base font-bold text-foreground">No flashcard decks found</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                                    {searchQuery || categoryFilter !== 'all'
                                        ? 'Try clearing your search or category filter.'
                                        : 'Create your first custom deck or save questions from exam review.'}
                                </p>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-semibold"
                                >
                                    <Plus className="size-3.5" /> Create Custom Deck
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDecks.map((deck) => (
                                    <div
                                        key={deck.id}
                                        className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition flex flex-col justify-between group"
                                    >
                                        <div className="space-y-3">
                                            {/* Top Tag & Actions */}
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[11px] font-medium ${getCategoryBadgeClass(deck.category)}`}
                                                >
                                                    {deck.category}
                                                </Badge>

                                                <div className="flex items-center gap-1">
                                                    {deck.is_system && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                                                            System
                                                        </span>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="size-7 p-0 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 text-xs">
                                                            {deck.due_cards > 0 && (
                                                                <DropdownMenuItem
                                                                    onClick={() => startSession(deck, 'due')}
                                                                    className="gap-2 cursor-pointer font-bold text-indigo-600 dark:text-indigo-400"
                                                                >
                                                                    <Flame className="size-3.5 text-amber-500" />
                                                                    Study Due Cards ({deck.due_cards})
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuItem
                                                                onClick={() => startSession(deck, 'all')}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <Sparkles className="size-3.5 text-indigo-500" />
                                                                Practice All Cards ({deck.total_cards})
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setManagedDeck(deck);
                                                                    setIsManageDialogOpen(true);
                                                                }}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <Layers className="size-3.5 text-indigo-500" />
                                                                Manage Cards
                                                            </DropdownMenuItem>

                                                            {deck.is_owner && !deck.is_system && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditingDeck(deck);
                                                                        setIsEditDialogOpen(true);
                                                                    }}
                                                                    className="gap-2 cursor-pointer"
                                                                >
                                                                    <Edit3 className="size-3.5 text-blue-500" />
                                                                    Edit Deck Info
                                                                </DropdownMenuItem>
                                                            )}

                                                            <DropdownMenuItem
                                                                onClick={() => handleCloneDeck(deck)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <Copy className="size-3.5 text-emerald-500" />
                                                                Duplicate Deck
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setResettingDeck(deck);
                                                                    setIsResetDialogOpen(true);
                                                                }}
                                                                className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                                            >
                                                                <RotateCcw className="size-3.5" />
                                                                Reset Progress
                                                            </DropdownMenuItem>

                                                            {deck.is_owner && !deck.is_system && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDeleteDeck(deck)}
                                                                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                        Delete Deck
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Deck Title & Description */}
                                            <div>
                                                <h3 className="font-bold text-foreground text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                                                    {deck.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                                    {deck.description || 'Spaced repetition flashcards for exam preparation.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Footer Info & Actions */}
                                        <div className="mt-5 pt-4 border-t border-border/60 space-y-3">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span className="font-medium">
                                                    Cards: <strong className="text-foreground">{deck.total_cards}</strong>
                                                </span>
                                                {deck.due_cards > 0 ? (
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                        <Flame className="size-3.5 text-amber-500" />
                                                        Due: {deck.due_cards}
                                                    </span>
                                                ) : (
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                                                        <CheckCircle2 className="size-3.5" />
                                                        All Caught Up
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {deck.is_owner && !deck.is_system ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setQuickAddDeck(deck)}
                                                        className="flex-1 text-xs h-8 gap-1 hover:bg-muted"
                                                    >
                                                        <PlusCircle className="size-3.5 text-indigo-500" />
                                                        Add Card
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setManagedDeck(deck);
                                                            setIsManageDialogOpen(true);
                                                        }}
                                                        className="flex-1 text-xs h-8 gap-1 hover:bg-muted"
                                                    >
                                                        <Layers className="size-3.5 text-muted-foreground" />
                                                        View Cards
                                                    </Button>
                                                )}

                                                {deck.due_cards > 0 ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => startSession(deck, 'due')}
                                                        disabled={isLoadingSession}
                                                        className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                                                    >
                                                        Study ({deck.due_cards} Due)
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startSession(deck, 'all')}
                                                        disabled={deck.total_cards === 0 || isLoadingSession}
                                                        className="flex-1 text-xs h-8 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold"
                                                    >
                                                        Practice All ({deck.total_cards})
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dialog 1: Create Custom Deck Modal - Standardized Shadcn Dialog */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="size-5 text-indigo-600" /> Create Custom Deck
                        </DialogTitle>
                        <DialogDescription>
                            Create a personalized study deck to organize questions, vocabulary, and formulas.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateDeck} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-deck-title" className="text-xs font-semibold">
                                Deck Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="create-deck-title"
                                required
                                value={newDeckTitle}
                                onChange={(e) => setNewDeckTitle(e.target.value)}
                                placeholder="e.g. Constitutional Provisions & Case Scenarios"
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-deck-category" className="text-xs font-semibold">
                                Category
                            </Label>
                            <select
                                id="create-deck-category"
                                value={newDeckCategory}
                                onChange={(e) => setNewDeckCategory(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="General Information">General Information</option>
                                <option value="Numerical Ability">Numerical Ability</option>
                                <option value="Verbal Ability">Verbal Ability</option>
                                <option value="Analytical Ability">Analytical Ability</option>
                                <option value="Clerical Ability">Clerical Ability</option>
                                <option value="Exam Review">Exam Review</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="create-deck-desc" className="text-xs font-semibold">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="create-deck-desc"
                                value={newDeckDesc}
                                onChange={(e) => setNewDeckDesc(e.target.value)}
                                rows={2}
                                placeholder="Brief note about the focus or strategy of this deck"
                                className="text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreatingDeck}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                                {isCreatingDeck ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Deck'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog 2: Quick Add Card Modal - Standardized Shadcn Dialog */}
            <Dialog open={!!quickAddDeck} onOpenChange={(open) => !open && setQuickAddDeck(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PlusCircle className="size-5 text-indigo-600" />
                            Add Card to "{quickAddDeck?.title}"
                        </DialogTitle>
                        <DialogDescription>
                            Create a single flashcard prompt and answer for quick spaced repetition study.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleQuickAddCard} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="quick-card-front" className="text-xs font-semibold">
                                Front Side (Question / Concept Prompt) <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="quick-card-front"
                                required
                                value={cardFront}
                                onChange={(e) => setCardFront(e.target.value)}
                                rows={3}
                                placeholder="e.g. What is the constitutional age qualification for President?"
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="quick-card-back" className="text-xs font-semibold">
                                Back Side (Answer / Correct Recall) <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="quick-card-back"
                                required
                                value={cardBack}
                                onChange={(e) => setCardBack(e.target.value)}
                                rows={3}
                                placeholder="e.g. At least 40 years of age on the day of the election"
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="quick-card-exp" className="text-xs font-semibold">
                                Explanation / Reference (Optional)
                            </Label>
                            <Input
                                id="quick-card-exp"
                                value={cardExplanation}
                                onChange={(e) => setCardExplanation(e.target.value)}
                                placeholder="e.g. Article VII Section 2, 1987 Philippine Constitution"
                                className="text-xs"
                            />
                        </div>

                        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setQuickAddDeck(null)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSavingQuickCard}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                                {isSavingQuickCard ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Card'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog 3: Manage Cards Dialog */}
            <ManageCardsDialog
                open={isManageDialogOpen}
                onOpenChange={setIsManageDialogOpen}
                deck={managedDeck}
                onCardCountChanged={() => {
                    router.reload({ only: ['decks'] });
                }}
            />

            {/* Dialog 4: Edit Deck Dialog */}
            <EditDeckDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                deck={editingDeck}
            />

            {/* Dialog 5: Reset Progress Dialog */}
            <ResetProgressDialog
                open={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
                deck={resettingDeck}
            />

            {/* Dialog 6: Delete Deck Confirmation Modal */}
            <ConfirmModal
                isOpen={isConfirmDeleteDeckOpen}
                title="Delete Custom Deck?"
                message={`Are you sure you want to delete "${deletingDeck?.title}" and all its flashcards? This action cannot be undone.`}
                confirmLabel="Delete Deck"
                variant="danger"
                onClose={() => {
                    setIsConfirmDeleteDeckOpen(false);
                    setDeletingDeck(null);
                }}
                onConfirm={handleConfirmDeleteDeck}
            />
        </PageContainer>
    );
}

FlashcardsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Flashcards',
            href: '/flashcards',
        },
    ],
};
