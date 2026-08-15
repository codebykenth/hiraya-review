import { router } from '@inertiajs/react';
import {
    Sparkles,
    Check,
    Clock,
    Zap,
    RotateCcw,
    Bookmark,
    EyeOff,
    Filter,
    ArrowRight,
    HelpCircle,
    SlidersHorizontal,
    Search,
    CheckSquare,
    Square,
    Save,
    BookmarkPlus,
    Loader2,
    X,
    ListFilter,
    Layers,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Category, Question } from '../types';

interface CustomBuilderViewProps {
    categories: Category[];
    questions: Question[];
    wrongQuestionIds?: number[];
    seenQuestionIds?: number[];
    onLaunchCustomDrill: (filteredQuestions: Question[], isTimed: boolean, sessionTitle: string) => void;
}

export function CustomBuilderView({
    categories,
    questions,
    wrongQuestionIds = [],
    seenQuestionIds = [],
    onLaunchCustomDrill,
}: CustomBuilderViewProps) {
    // Mode: 'auto' (random sampling) vs 'manual' (pick specific questions)
    const [builderMode, setBuilderMode] = useState<'auto' | 'manual'>('auto');

    // 1. Categories selected (Multi-select)
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
        categories
            .filter((c) => c.name.toLowerCase() !== 'demographic')
            .map((c) => c.name),
    );

    // 2. Pool Filter Mode
    const [poolFilter, setPoolFilter] = useState<'all' | 'mistakes' | 'unseen'>('all');

    // 3. Question Count ('all' or number) for Auto Mode
    const [questionCount, setQuestionCount] = useState<number | 'all'>(15);
    const [isCustomCount, setIsCustomCount] = useState<boolean>(false);
    const [customCountInput, setCustomCountInput] = useState<string>('');

    // 4. Timer Mode
    const [isTimed, setIsTimed] = useState<boolean>(true);

    // 5. Language
    const [language, setLanguage] = useState<'Both' | 'English' | 'Filipino'>('Both');

    // 6. Manual Selection State
    const [selectedManualIds, setSelectedManualIds] = useState<number[]>([]);
    const [manualSearchQuery, setManualSearchQuery] = useState<string>('');

    // 7. Save as Drill Set Modal State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [savedSetName, setSavedSetName] = useState('');
    const [savedSetDescription, setSavedSetDescription] = useState('');
    const [savedSetColor, setSavedSetColor] = useState('blue');
    const [isSavingSet, setIsSavingSet] = useState(false);

    // Toggle category
    const toggleCategory = (catName: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(catName)) {
                if (prev.length === 1) {
return prev;
} // Keep at least one

                return prev.filter((c) => c !== catName);
            }

            return [...prev, catName];
        });
    };

    const selectAllCategories = () => {
        setSelectedCategories(
            categories
                .filter((c) => c.name.toLowerCase() !== 'demographic')
                .map((c) => c.name),
        );
    };

    // Calculate Available Pool matching settings
    const matchingQuestions = useMemo(() => {
        const wrongSet = new Set(wrongQuestionIds);
        const seenSet = new Set(seenQuestionIds);

        return questions.filter((q) => {
            // Category match
            const matchesCat = selectedCategories.some(
                (c) =>
                    q.category.toLowerCase().includes(c.toLowerCase()) ||
                    c.toLowerCase().includes(q.category.toLowerCase()),
            );

            if (!matchesCat) {
return false;
}

            // Language match
            const qLang = (q.language || '').toLowerCase();

            if (language === 'English' && qLang.includes('filipino')) {
return false;
}

            if (language === 'Filipino' && !qLang.includes('filipino') && !qLang.includes('tagalog')) {
return false;
}

            // Pool Filter match
            if (poolFilter === 'mistakes') {
                return wrongSet.has(q.id);
            }

            if (poolFilter === 'unseen') {
                return !seenSet.has(q.id);
            }

            return true;
        });
    }, [questions, selectedCategories, poolFilter, language, wrongQuestionIds, seenQuestionIds]);

    const poolSize = matchingQuestions.length;

    // Filtered matching questions in Manual Mode with Search Query
    const displayedManualQuestions = useMemo(() => {
        if (!manualSearchQuery.trim()) {
return matchingQuestions;
}

        const query = manualSearchQuery.toLowerCase().trim();

        return matchingQuestions.filter(
            (q) =>
                q.stem.toLowerCase().includes(query) ||
                (q.subcategory || '').toLowerCase().includes(query) ||
                q.category.toLowerCase().includes(query),
        );
    }, [matchingQuestions, manualSearchQuery]);

    // Dynamic question count choices for Auto Mode
    const dynamicCountOptions = useMemo(() => {
        if (poolSize === 0) {
return [];
}

        const options: (number | 'all')[] = [];

        if (poolSize <= 8) {
            if (poolSize > 3) {
options.push(3);
}
        } else if (poolSize <= 15) {
            options.push(5);

            if (poolSize > 10) {
options.push(10);
}
        } else if (poolSize <= 30) {
            options.push(10);

            if (poolSize > 20) {
options.push(20);
}
        } else {
            options.push(10, 15, 20, 30);
        }

        options.push('all');

        return options;
    }, [poolSize]);

    const effectiveAutoCount = useMemo(() => {
        if (poolSize === 0) {
return 0;
}

        if (questionCount === 'all') {
return poolSize;
}

        if (typeof questionCount === 'number') {
            if (questionCount <= 0) {
return Math.min(10, poolSize);
}

            return Math.min(questionCount, poolSize);
        }

        return Math.min(10, poolSize);
    }, [questionCount, poolSize]);

    // Active questions for session / save
    const activeSelectedQuestions = useMemo(() => {
        if (builderMode === 'manual') {
            const manualSet = new Set(selectedManualIds);

            return matchingQuestions.filter((q) => manualSet.has(q.id));
        }

        // Auto mode
        const shuffled = [...matchingQuestions].sort(() => 0.5 - Math.random());

        return shuffled.slice(0, effectiveAutoCount);
    }, [builderMode, selectedManualIds, matchingQuestions, effectiveAutoCount]);

    const totalSelectedCount = builderMode === 'manual' ? selectedManualIds.length : effectiveAutoCount;

    // Manual Selection Toggle
    const toggleManualQuestion = (id: number) => {
        setSelectedManualIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    const selectAllManual = () => {
        const ids = displayedManualQuestions.map((q) => q.id);
        setSelectedManualIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const clearAllManual = () => {
        setSelectedManualIds([]);
    };

    // Start Drill
    const handleStart = () => {
        if (activeSelectedQuestions.length === 0) {
return;
}

        let title = 'Custom Multi-Topic Drill';

        if (builderMode === 'manual') {
            title = 'Curated Practice Drill';
        } else if (poolFilter === 'mistakes') {
            title = 'Past Mistakes Drill';
        } else if (poolFilter === 'unseen') {
            title = 'Unseen Questions Drill';
        }

        onLaunchCustomDrill(activeSelectedQuestions, isTimed, title);
    };

    // Save as Practice Set
    const handleOpenSaveModal = () => {
        if (totalSelectedCount === 0) {
            toast.error('Select at least one question to save a practice set.');

            return;
        }

        const catSummary = selectedCategories.slice(0, 2).join(' & ');
        setSavedSetName(`Custom Drill - ${catSummary || 'Practice Set'}`);
        setSavedSetDescription(`Curated practice set containing ${totalSelectedCount} items.`);
        setIsSaveModalOpen(true);
    };

    const handleSavePracticeSet = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!savedSetName.trim()) {
return;
}

        setIsSavingSet(true);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const questionIds = activeSelectedQuestions.map((q) => q.id);

            const res = await fetch('/drills/saved-sets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: savedSetName.trim(),
                    description: savedSetDescription.trim() || null,
                    color: savedSetColor,
                    question_ids: questionIds,
                }),
            });

            if (res.ok) {
                toast.success('Practice set saved! Accessible anytime in the Saved Sets tab.');
                setIsSaveModalOpen(false);
                router.reload();
            } else {
                toast.error('Failed to save practice set.');
            }
        } catch {
            toast.error('Error saving practice set.');
        } finally {
            setIsSavingSet(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Description Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <SlidersHorizontal className="size-5" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                                Custom Drill Builder
                            </h2>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Create a custom practice session or pick specific questions to practice and save to your sets.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                            <Zap className="size-3.5 fill-current" />
                            {matchingQuestions.length} Matching Pool
                        </span>
                    </div>
                </div>
            </div>

            {/* Builder Configuration Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Columns: Config Matrix & Question Selection */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Mode Selector Tab */}
                    <div className="flex rounded-2xl border border-border bg-card p-1.5 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setBuilderMode('auto')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                                builderMode === 'auto'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Sparkles className="size-4" />
                            <span>Auto-Sample (Quick Drill)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBuilderMode('manual')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                                builderMode === 'manual'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <ListFilter className="size-4" />
                            <span>Manual Pick ({selectedManualIds.length})</span>
                        </button>
                    </div>

                    {/* Step 1: Select Focus Topics */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                                    1
                                </span>
                                <h3 className="font-heading text-sm font-bold text-foreground">
                                    Select Categories to Include
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={selectAllCategories}
                                className="text-xs font-bold text-blue-600 transition hover:underline dark:text-blue-400"
                            >
                                Select All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {categories
                                .filter((c) => c.name.toLowerCase() !== 'demographic')
                                .map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.name);
                                    const totalQ = questions.filter(
                                        (q) =>
                                            q.category.toLowerCase().includes(cat.name.toLowerCase()) ||
                                            cat.name.toLowerCase().includes(q.category.toLowerCase()),
                                    ).length;

                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.name)}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500/80 dark:bg-blue-950/20'
                                                    : 'border-border bg-background hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`flex size-4 items-center justify-center rounded-md border transition ${
                                                        isSelected
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-muted-foreground/30 bg-background'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="size-3 stroke-[3]" />}
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-muted-foreground">
                                                {totalQ} Qs
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Step 2: Pool Filter Mode */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                                2
                            </span>
                            <h3 className="font-heading text-sm font-bold text-foreground">
                                Question Pool Targeting
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {/* Option A: All Pool */}
                            <div
                                onClick={() => setPoolFilter('all')}
                                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 transition-all ${
                                    poolFilter === 'all'
                                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/30 dark:border-blue-500/80 dark:bg-blue-950/20'
                                        : 'border-border bg-background hover:bg-muted/40'
                                }`}
                            >
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
                                        {poolFilter === 'all' && (
                                            <span className="size-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        All Questions
                                    </h4>
                                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                        Draw from all available questions in the selected categories.
                                    </p>
                                </div>
                            </div>

                            {/* Option B: Mistakes Only */}
                            <div
                                onClick={() => setPoolFilter('mistakes')}
                                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 transition-all ${
                                    poolFilter === 'mistakes'
                                        ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500/30 dark:border-rose-500/80 dark:bg-rose-950/20'
                                        : 'border-border bg-background hover:bg-muted/40'
                                }`}
                            >
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <RotateCcw className="size-4 text-rose-600 dark:text-rose-400" />
                                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                            {wrongQuestionIds.length} Mistakes
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        Past Mistakes Only
                                    </h4>
                                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                        Target questions you previously failed in past exams or drills.
                                    </p>
                                </div>
                            </div>

                            {/* Option C: Unseen Only */}
                            <div
                                onClick={() => setPoolFilter('unseen')}
                                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 transition-all ${
                                    poolFilter === 'unseen'
                                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30 dark:border-emerald-500/80 dark:bg-emerald-950/20'
                                        : 'border-border bg-background hover:bg-muted/40'
                                }`}
                            >
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <EyeOff className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        {poolFilter === 'unseen' && (
                                            <span className="size-2 rounded-full bg-emerald-600" />
                                        )}
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">
                                        Fresh / Unseen Only
                                    </h4>
                                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                        Practice only questions you haven&apos;t encountered yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 (Manual Mode): Interactive Question Picker */}
                    {builderMode === 'manual' && (
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                <div>
                                    <h3 className="font-heading text-sm font-bold text-foreground">
                                        Select Questions ({selectedManualIds.length} Selected)
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Choose individual questions to assemble your custom drill session.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllManual}
                                        className="text-xs h-8"
                                    >
                                        Select All ({displayedManualQuestions.length})
                                    </Button>
                                    {selectedManualIds.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAllManual}
                                            className="text-xs h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Search bar inside pool */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={manualSearchQuery}
                                    onChange={(e) => setManualSearchQuery(e.target.value)}
                                    placeholder="Search matching questions by keyword..."
                                    className="pl-8 text-xs"
                                />
                            </div>

                            {/* Questions list with checkboxes */}
                            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                                {displayedManualQuestions.length > 0 ? (
                                    displayedManualQuestions.map((q, idx) => {
                                        const isChecked = selectedManualIds.includes(q.id);

                                        return (
                                            <div
                                                key={q.id}
                                                onClick={() => toggleManualQuestion(q.id)}
                                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                                    isChecked
                                                        ? 'border-blue-500 bg-blue-50/40 dark:border-blue-500/80 dark:bg-blue-950/20'
                                                        : 'border-border bg-background hover:bg-muted/40'
                                                }`}
                                            >
                                                <div className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400">
                                                    {isChecked ? (
                                                        <CheckSquare className="size-4 fill-blue-600 text-white dark:fill-blue-500" />
                                                    ) : (
                                                        <Square className="size-4 text-muted-foreground/40" />
                                                    )}
                                                </div>
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
                                        );
                                    })
                                ) : (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No questions match your search or filter settings.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right 1 Column: Session Parameters & Launch CTA */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                                {builderMode === 'manual' ? '4' : '3'}
                            </span>
                            <h3 className="font-heading text-sm font-bold text-foreground">
                                Session Settings
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {/* Question Count for Auto Mode */}
                            {builderMode === 'auto' && (
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="block text-xs font-bold text-foreground">
                                            Number of Questions
                                        </label>
                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                            {poolSize > 0 ? `${poolSize} Available` : 'None Available'}
                                        </span>
                                    </div>

                                    {dynamicCountOptions.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                {dynamicCountOptions.map((cnt) => {
                                                    const isSelected =
                                                        !isCustomCount &&
                                                        (cnt === 'all'
                                                            ? questionCount === 'all' || effectiveAutoCount === poolSize
                                                            : questionCount === cnt);

                                                    return (
                                                        <button
                                                            key={String(cnt)}
                                                            type="button"
                                                            onClick={() => {
                                                                setIsCustomCount(false);
                                                                setQuestionCount(cnt);
                                                                setCustomCountInput('');
                                                            }}
                                                            className={`flex-1 min-w-[54px] rounded-lg py-2 text-xs font-black transition ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                                    : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            {cnt === 'all' ? `All (${poolSize})` : `${cnt} Qs`}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom number input */}
                                            <div
                                                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-1.5 transition ${
                                                    isCustomCount
                                                        ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30 dark:bg-blue-950/20'
                                                        : 'border-border bg-background hover:border-blue-500/40'
                                                }`}
                                            >
                                                <span className="shrink-0 text-xs font-bold text-muted-foreground">
                                                    Custom Amount:
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={poolSize}
                                                        value={
                                                            isCustomCount
                                                                ? customCountInput
                                                                : typeof questionCount === 'number' &&
                                                                  !dynamicCountOptions.includes(questionCount)
                                                                ? String(questionCount)
                                                                : ''
                                                        }
                                                        placeholder={`1 - ${poolSize}`}
                                                        onFocus={() => {
                                                            setIsCustomCount(true);

                                                            if (typeof questionCount === 'number' && questionCount > 0) {
                                                                setCustomCountInput(String(questionCount));
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            setIsCustomCount(true);
                                                            setCustomCountInput(raw);

                                                            if (raw === '') {
                                                                setQuestionCount(0);
                                                            } else {
                                                                const parsed = parseInt(raw, 10);

                                                                if (!isNaN(parsed) && parsed > 0) {
                                                                    const clamped = Math.min(poolSize, parsed);
                                                                    setQuestionCount(clamped);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (isCustomCount) {
                                                                if (customCountInput === '' || Number(customCountInput) <= 0) {
                                                                    const fallback = Math.min(10, poolSize);
                                                                    setQuestionCount(fallback);
                                                                    setCustomCountInput(String(fallback));
                                                                } else if (Number(customCountInput) > poolSize) {
                                                                    setQuestionCount(poolSize);
                                                                    setCustomCountInput(String(poolSize));
                                                                }
                                                            }
                                                        }}
                                                        className="w-16 [appearance:textfield] bg-transparent text-right text-xs font-black text-foreground focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    />
                                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                                        / {poolSize}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-border p-2 text-center text-xs text-muted-foreground">
                                            No questions match current filters
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timer Mode */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-foreground">
                                    Practice Mode
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div
                                        onClick={() => setIsTimed(true)}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition ${
                                            isTimed
                                                ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500/80 dark:bg-blue-950/20'
                                                : 'border-border bg-background text-muted-foreground'
                                        }`}
                                    >
                                        <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Timed</p>
                                            <p className="text-[10px] text-muted-foreground">Paced speed</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setIsTimed(false)}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition ${
                                            !isTimed
                                                ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500/80 dark:bg-blue-950/20'
                                                : 'border-border bg-background text-muted-foreground'
                                        }`}
                                    >
                                        <Zap className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Untimed</p>
                                            <p className="text-[10px] text-muted-foreground">Self-paced</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-foreground">
                                    Language Filter
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {(['Both', 'English', 'Filipino'] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setLanguage(lang)}
                                            className={`rounded-lg py-1.5 text-xs font-bold transition ${
                                                language === lang
                                                    ? 'bg-foreground text-background font-black'
                                                    : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary & Launch & Save Buttons */}
                        <div className="mt-6 border-t border-border pt-4 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground">
                                    {builderMode === 'manual' ? 'Manually Picked:' : 'Questions in Session:'}
                                </span>
                                <span className="font-black text-foreground">
                                    {totalSelectedCount} of {poolSize} available
                                </span>
                            </div>

                            <button
                                type="button"
                                disabled={totalSelectedCount === 0}
                                onClick={handleStart}
                                className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>Start Custom Drill ({totalSelectedCount})</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </button>

                            <button
                                type="button"
                                disabled={totalSelectedCount === 0}
                                onClick={handleOpenSaveModal}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <BookmarkPlus className="size-4 text-blue-600 dark:text-blue-400" />
                                <span>Save Selection as Practice Set</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save as Practice Set Modal */}
            <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Bookmark className="size-4" />
                            </div>
                            <div>
                                <DialogTitle className="font-heading text-base font-bold text-foreground">
                                    Save as Practice Set
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground">
                                    Save {totalSelectedCount} questions into a reusable set in your practice hub.
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSavePracticeSet} className="space-y-4 pt-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-foreground">
                                Practice Set Name
                            </label>
                            <Input
                                required
                                value={savedSetName}
                                onChange={(e) => setSavedSetName(e.target.value)}
                                placeholder="e.g. Challenging Math Word Problems"
                                className="text-xs"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-foreground">
                                Description (Optional)
                            </label>
                            <textarea
                                rows={2}
                                value={savedSetDescription}
                                onChange={(e) => setSavedSetDescription(e.target.value)}
                                placeholder="Brief note about the focus of this set..."
                                className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSaveModalOpen(false)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSavingSet || !savedSetName.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                            >
                                {isSavingSet && <Loader2 className="size-3.5 animate-spin" />}
                                <span>Save Practice Set</span>
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
