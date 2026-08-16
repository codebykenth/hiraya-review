import { router } from '@inertiajs/react';
import {
    Sparkles,
    Check,
    Clock,
    Zap,
    RotateCcw,
    Bookmark,
    EyeOff,
    ArrowRight,
    SlidersHorizontal,
    Search,
    CheckSquare,
    BookmarkPlus,
    Loader2,
    X,
    ListFilter,
    Plus,
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Shuffle,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ContentShieldOverlay } from '@/components/domain/content-shield-overlay';
import { CreateDrillQuestionModal } from '@/components/domain/create-drill-question-modal';
import { QuestionPreviewCard } from '@/components/domain/question-preview-card';
import type { QuestionPreviewData } from '@/components/domain/question-preview-card';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useContentShield } from '@/pages/user/exams/hooks/use-content-shield';
import type { Category, Question } from '../types';

interface CustomBuilderViewProps {
    categories: Category[];
    questions: Question[];
    wrongQuestionIds?: number[];
    seenQuestionIds?: number[];
    onLaunchCustomDrill: (
        filteredQuestions: Question[],
        isTimed: boolean,
        sessionTitle: string,
    ) => void;
}

interface SubcategoryGroup {
    subcategoryName: string;
    questions: Question[];
    totalCount: number;
    selectedCount: number;
}

interface CategoryGroup {
    categoryName: string;
    subcategories: SubcategoryGroup[];
    totalCount: number;
    selectedCount: number;
}

export function CustomBuilderView({
    categories,
    questions: initialQuestions,
    wrongQuestionIds = [],
    seenQuestionIds = [],
    onLaunchCustomDrill,
}: CustomBuilderViewProps) {
    // Mode: 'auto' (random sampling) vs 'manual' (pick specific questions)
    const [builderMode, setBuilderMode] = useState<'auto' | 'manual'>('auto');

    // User-created questions state merged purely with initial questions
    const [userCreatedQuestions, setUserCreatedQuestions] = useState<Question[]>([]);
    const allQuestions = useMemo(
        () => [...userCreatedQuestions, ...initialQuestions],
        [userCreatedQuestions, initialQuestions],
    );

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
    const [manualSubcategoryFilter, setManualSubcategoryFilter] = useState<string>('All');
    const [manualStatusFilter, setManualStatusFilter] = useState<'all' | 'mistakes' | 'unseen' | 'custom'>('all');
    const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false);

    // Accordion expand/collapse states
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});
    const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({});

    // 7. Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [savedSetName, setSavedSetName] = useState('');
    const [savedSetDescription, setSavedSetDescription] = useState('');
    const savedSetColor = 'blue';
    const [isSavingSet, setIsSavingSet] = useState(false);

    // Content Protection Shield
    const {
        isShielded,
        isResumeLocked,
        dismissShield,
        styleBlock,
        contentRef,
        wrapperProps,
    } = useContentShield({
        contentLabel: 'Custom Drill',
        onCopyAttempt: (msg) => toast.error(msg),
    });

    const wrongSet = useMemo(() => new Set(wrongQuestionIds), [wrongQuestionIds]);
    const seenSet = useMemo(() => new Set(seenQuestionIds), [seenQuestionIds]);

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
        return allQuestions.filter((q) => {
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

            if (
                language === 'Filipino' &&
                !qLang.includes('filipino') &&
                !qLang.includes('tagalog')
            ) {
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
    }, [
        allQuestions,
        selectedCategories,
        poolFilter,
        language,
        wrongSet,
        seenSet,
    ]);

    const poolSize = matchingQuestions.length;

    // Available subcategories list for filter dropdown
    const availableSubcategories = useMemo(() => {
        const set = new Set<string>();
        matchingQuestions.forEach((q) => {
            if (q.subcategory) {
                set.add(q.subcategory);
            }
        });

        return Array.from(set).sort();
    }, [matchingQuestions]);

    // Filtered matching questions in Manual Mode with Search, Subcategory, Status, and Selected Only filter
    const displayedManualQuestions = useMemo(() => {
        let result = matchingQuestions;

        // Search Query
        if (manualSearchQuery.trim()) {
            const query = manualSearchQuery.toLowerCase().trim();
            result = result.filter(
                (q) =>
                    q.stem.toLowerCase().includes(query) ||
                    (q.subcategory || '').toLowerCase().includes(query) ||
                    q.category.toLowerCase().includes(query) ||
                    (q.options || []).some((opt) => opt.toLowerCase().includes(query)),
            );
        }

        // Subcategory Filter
        if (manualSubcategoryFilter !== 'All') {
            result = result.filter((q) => q.subcategory === manualSubcategoryFilter);
        }

        // Status Filter inside Manual Picker
        if (manualStatusFilter === 'mistakes') {
            result = result.filter((q) => wrongSet.has(q.id));
        } else if (manualStatusFilter === 'unseen') {
            result = result.filter((q) => !seenSet.has(q.id));
        } else if (manualStatusFilter === 'custom') {
            result = result.filter((q) => q.isCustom);
        }

        // Show Selected Only
        if (showSelectedOnly) {
            const selectedSet = new Set(selectedManualIds);
            result = result.filter((q) => selectedSet.has(q.id));
        }

        return result;
    }, [
        matchingQuestions,
        manualSearchQuery,
        manualSubcategoryFilter,
        manualStatusFilter,
        showSelectedOnly,
        selectedManualIds,
        wrongSet,
        seenSet,
    ]);

    // Hierarchical grouping: Category -> Subcategory -> Question[]
    const hierarchicalGroups = useMemo<CategoryGroup[]>(() => {
        const selectedSet = new Set(selectedManualIds);
        const catMap = new Map<string, Map<string, Question[]>>();

        displayedManualQuestions.forEach((q) => {
            const catName = q.category || 'General Information';
            const subcatName = q.subcategory || 'General Concepts';

            if (!catMap.has(catName)) {
                catMap.set(catName, new Map());
            }

            const subMap = catMap.get(catName)!;

            if (!subMap.has(subcatName)) {
                subMap.set(subcatName, []);
            }

            subMap.get(subcatName)!.push(q);
        });

        const groups: CategoryGroup[] = [];

        catMap.forEach((subMap, categoryName) => {
            const subcategories: SubcategoryGroup[] = [];
            let catTotal = 0;
            let catSelected = 0;

            subMap.forEach((qList, subcategoryName) => {
                const totalCount = qList.length;
                const selectedCount = qList.filter((q) => selectedSet.has(q.id)).length;
                catTotal += totalCount;
                catSelected += selectedCount;

                subcategories.push({
                    subcategoryName,
                    questions: qList,
                    totalCount,
                    selectedCount,
                });
            });

            groups.push({
                categoryName,
                subcategories,
                totalCount: catTotal,
                selectedCount: catSelected,
            });
        });

        return groups;
    }, [displayedManualQuestions, selectedManualIds]);

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

            return allQuestions.filter((q) => manualSet.has(q.id));
        }

        // Auto mode default slice
        return matchingQuestions.slice(0, effectiveAutoCount);
    }, [builderMode, selectedManualIds, allQuestions, matchingQuestions, effectiveAutoCount]);

    const totalSelectedCount =
        builderMode === 'manual' ? selectedManualIds.length : effectiveAutoCount;

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

    // Subcategory bulk selection
    const selectAllInSubcategory = (subGroup: SubcategoryGroup) => {
        const ids = subGroup.questions.map((q) => q.id);
        setSelectedManualIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const clearInSubcategory = (subGroup: SubcategoryGroup) => {
        const idsToRemove = new Set(subGroup.questions.map((q) => q.id));
        setSelectedManualIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
    };

    const pickRandomInSubcategory = (subGroup: SubcategoryGroup, count: number) => {
        const pool = subGroup.questions;
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, count).map((q) => q.id);
        setSelectedManualIds((prev) => Array.from(new Set([...prev, ...picked])));
        toast.success(`Selected ${Math.min(count, pool.length)} random questions from ${subGroup.subcategoryName}`);
    };

    // Category bulk selection
    const selectAllInCategory = (catGroup: CategoryGroup) => {
        const ids: number[] = [];
        catGroup.subcategories.forEach((s) => {
            s.questions.forEach((q) => ids.push(q.id));
        });
        setSelectedManualIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const clearInCategory = (catGroup: CategoryGroup) => {
        const idsToRemove = new Set<number>();
        catGroup.subcategories.forEach((s) => {
            s.questions.forEach((q) => idsToRemove.add(q.id));
        });
        setSelectedManualIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
    };

    // Expand/collapse helpers
    const toggleCategoryCollapse = (catName: string) => {
        setCollapsedCategories((prev) => ({
            ...prev,
            [catName]: !prev[catName],
        }));
    };

    const toggleSubcategoryCollapse = (key: string) => {
        setCollapsedSubcategories((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleQuestionExpand = (qId: number) => {
        setExpandedQuestionIds((prev) => ({
            ...prev,
            [qId]: !prev[qId],
        }));
    };

    const expandAllPreviews = () => {
        const next: Record<number, boolean> = {};
        displayedManualQuestions.forEach((q) => {
            next[q.id] = true;
        });
        setExpandedQuestionIds(next);
    };

    const collapseAllPreviews = () => {
        setExpandedQuestionIds({});
    };

    // When user creates a custom question
    const handleQuestionCreated = (newQ: Question) => {
        setUserCreatedQuestions((prev) => [newQ, ...prev]);
        setSelectedManualIds((prev) => Array.from(new Set([newQ.id, ...prev])));

        // Ensure category is selected
        if (!selectedCategories.includes(newQ.category)) {
            setSelectedCategories((prev) => [...prev, newQ.category]);
        }
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

        // In auto mode, shuffle when launching
        const questionsToLaunch =
            builderMode === 'manual'
                ? activeSelectedQuestions
                : [...matchingQuestions].sort(() => 0.5 - Math.random()).slice(0, effectiveAutoCount);

        onLaunchCustomDrill(questionsToLaunch, isTimed, title);
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

    // Category breakdown for summary dock
    const selectedCategoryBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        activeSelectedQuestions.forEach((q) => {
            counts[q.category] = (counts[q.category] || 0) + 1;
        });

        return counts;
    }, [activeSelectedQuestions]);

    return (
        <div className="relative flex flex-col gap-6 pb-20">
            {/* Content Shield Style Injection */}
            <style dangerouslySetInnerHTML={{ __html: styleBlock }} />

            {/* Shield Screen Overlay if window is un-focused or screenshot shortcut detected */}
            <ContentShieldOverlay
                isShielded={isShielded}
                isResumeLocked={isResumeLocked}
                dismissShield={dismissShield}
                resumeButtonText="Resume Practice Builder"
                descriptionText="Exam content was hidden because window focus was lost or external screen tools were detected."
            />

            {/* Main Builder Container with Content Shielding */}
            <div
                ref={contentRef}
                {...wrapperProps}
                className={`flex flex-col gap-6 select-none ${
                    isShielded ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
            >
                {/* Header Description Card */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
                            <HowItWorksModal
                                title="How Custom Drill Builder Works"
                                description="Craft targeted practice sessions matched to your exact study goals:"
                                tips={[
                                    {
                                        icon: <SlidersHorizontal className="size-4" />,
                                        title: 'Target Multi-Category Combinations',
                                        text: 'Combine any subjects (e.g. Numerical + Verbal) and filter specifically for your past mistakes, unseen items, or flagged questions.',
                                    },
                                    {
                                        icon: <Sparkles className="size-4" />,
                                        title: 'Auto-Sample or Manual Curation',
                                        text: 'Use Auto-Sample to generate a randomized pool in seconds, or switch to Manual Pick to select exact questions subcategory by subcategory.',
                                    },
                                    {
                                        icon: <Plus className="size-4" />,
                                        title: 'Create Custom Questions',
                                        text: 'Add your own questions on the fly with choices, rationales, and live exam preview simulation.',
                                    },
                                    {
                                        icon: <Bookmark className="size-4" />,
                                        title: 'Save Reusable Practice Sets',
                                        text: 'Save any custom selection as a permanent Practice Set to replay, edit, or test yourself on whenever you want.',
                                    },
                                ]}
                            />
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
                                        const totalQ = allQuestions.filter(
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
                                                        {isSelected && (
                                                            <Check className="size-3 stroke-[3]" />
                                                        )}
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
                                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
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
                                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
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
                                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                            Practice only questions you haven&apos;t encountered yet.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 (Manual Mode): Hierarchical Question Picker with Filtering & Manual Add */}
                        {builderMode === 'manual' && (
                            <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                                {/* Header with Action Controls */}
                                <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                                                3
                                            </span>
                                            <h3 className="font-heading text-sm font-bold text-foreground">
                                                Curate Practice Questions ({selectedManualIds.length} Selected)
                                            </h3>
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Organized by subject and topic. Inspect choices, select subsets, or add custom study items.
                                        </p>
                                    </div>

                                    {/* Action Buttons: Add Custom Question, Select All, Clear */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="h-8 gap-1.5 border-blue-200 bg-blue-50/50 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
                                        >
                                            <Plus className="size-3.5" />
                                            <span>Add Custom Question</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={selectAllManual}
                                            className="h-8 text-xs font-bold"
                                        >
                                            Select All ({displayedManualQuestions.length})
                                        </Button>

                                        {selectedManualIds.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllManual}
                                                className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Filter Controls Toolbar */}
                                <div className="space-y-2.5 rounded-xl border border-border/80 bg-muted/20 p-3">
                                    {/* Row 1: Search bar + Subcategory Dropdown */}
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <div className="relative sm:col-span-2">
                                            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={manualSearchQuery}
                                                onChange={(e) => setManualSearchQuery(e.target.value)}
                                                placeholder="Search question stem, choices, or topic keyword..."
                                                className="h-9 pl-8 text-xs"
                                            />
                                            {manualSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setManualSearchQuery('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <select
                                                value={manualSubcategoryFilter}
                                                onChange={(e) => setManualSubcategoryFilter(e.target.value)}
                                                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="All">All Subcategories ({availableSubcategories.length})</option>
                                                {availableSubcategories.map((sub) => (
                                                    <option key={sub} value={sub}>
                                                        {sub}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 2: Status Filter Chips & View Toggles */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                        {/* Status chips */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {(
                                                [
                                                    { id: 'all', label: 'All Matching' },
                                                    { id: 'mistakes', label: 'Past Mistakes' },
                                                    { id: 'unseen', label: 'Fresh / Unseen' },
                                                    { id: 'custom', label: 'Custom Notes' },
                                                ] as const
                                            ).map((st) => (
                                                <button
                                                    key={st.id}
                                                    type="button"
                                                    onClick={() => setManualStatusFilter(st.id)}
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                                        manualStatusFilter === st.id
                                                            ? 'bg-foreground text-background shadow-2xs'
                                                            : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    {st.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* "Show Selected Only" and "Expand All Previews" */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowSelectedOnly((prev) => !prev)}
                                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                                    showSelectedOnly
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <CheckSquare className="size-3.5" />
                                                <span>Selected Only ({selectedManualIds.length})</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    Object.keys(expandedQuestionIds).length > 0
                                                        ? collapseAllPreviews
                                                        : expandAllPreviews
                                                }
                                                className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                <ChevronsUpDown className="size-3.5" />
                                                <span>
                                                    {Object.keys(expandedQuestionIds).length > 0
                                                        ? 'Collapse Previews'
                                                        : 'Expand Previews'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Hierarchical Accordion List */}
                                <div className="max-h-[550px] space-y-4 overflow-y-auto pr-1">
                                    {hierarchicalGroups.length > 0 ? (
                                        hierarchicalGroups.map((catGroup) => {
                                            const isCatCollapsed = !!collapsedCategories[catGroup.categoryName];

                                            return (
                                                <div
                                                    key={catGroup.categoryName}
                                                    className="overflow-hidden rounded-xl border border-border bg-card shadow-3xs"
                                                >
                                                    {/* Category Header */}
                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/40 px-4 py-3">
                                                        <div
                                                            onClick={() => toggleCategoryCollapse(catGroup.categoryName)}
                                                            className="flex cursor-pointer items-center gap-2.5"
                                                        >
                                                            <div className="flex size-6 items-center justify-center rounded-md bg-background text-muted-foreground shadow-2xs">
                                                                {isCatCollapsed ? (
                                                                    <ChevronDown className="size-3.5" />
                                                                ) : (
                                                                    <ChevronUp className="size-3.5" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-heading text-xs font-bold text-foreground sm:text-sm">
                                                                    {catGroup.categoryName}
                                                                </h4>
                                                                <p className="text-[10px] font-semibold text-muted-foreground">
                                                                    {catGroup.selectedCount} of {catGroup.totalCount} selected
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Category Bulk Actions */}
                                                        <div className="flex items-center gap-1.5">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => selectAllInCategory(catGroup)}
                                                                className="h-7 px-2 text-[11px] font-bold"
                                                            >
                                                                Select Category ({catGroup.totalCount})
                                                            </Button>
                                                            {catGroup.selectedCount > 0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => clearInCategory(catGroup)}
                                                                    className="h-7 px-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                                >
                                                                    Clear
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Subcategories & Questions List */}
                                                    {!isCatCollapsed && (
                                                        <div className="space-y-3 p-3">
                                                            {catGroup.subcategories.map((subGroup) => {
                                                                const subKey = `${catGroup.categoryName}-${subGroup.subcategoryName}`;
                                                                const isSubCollapsed = !!collapsedSubcategories[subKey];

                                                                return (
                                                                    <div
                                                                        key={subKey}
                                                                        className="rounded-xl border border-border/70 bg-background/60 p-3"
                                                                    >
                                                                        {/* Subcategory Header */}
                                                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                                                                            <div
                                                                                onClick={() => toggleSubcategoryCollapse(subKey)}
                                                                                className="flex cursor-pointer items-center gap-2"
                                                                            >
                                                                                <div className="text-muted-foreground">
                                                                                    {isSubCollapsed ? (
                                                                                        <ChevronDown className="size-3.5" />
                                                                                    ) : (
                                                                                        <ChevronUp className="size-3.5" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-xs font-bold text-foreground">
                                                                                    {subGroup.subcategoryName}
                                                                                </span>
                                                                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                                                    {subGroup.selectedCount} / {subGroup.totalCount}
                                                                                </span>
                                                                            </div>

                                                                            {/* Subcategory Action Tools */}
                                                                            <div className="flex items-center gap-1.5">
                                                                                {/* Random Pick Tool */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        pickRandomInSubcategory(
                                                                                            subGroup,
                                                                                            Math.min(5, subGroup.totalCount),
                                                                                        )
                                                                                    }
                                                                                    title="Pick 5 random questions from this topic"
                                                                                    className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                                                >
                                                                                    <Shuffle className="size-3" />
                                                                                    <span>Pick 5 Random</span>
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => selectAllInSubcategory(subGroup)}
                                                                                    className="rounded-lg border border-blue-200 bg-blue-50/50 px-2 py-1 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
                                                                                >
                                                                                    Select All
                                                                                </button>

                                                                                {subGroup.selectedCount > 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => clearInSubcategory(subGroup)}
                                                                                        className="rounded-lg px-2 py-1 text-[10px] font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                                                    >
                                                                                        Clear
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Questions Cards */}
                                                                        {!isSubCollapsed && (
                                                                            <div className="mt-2.5 space-y-2">
                                                                                {subGroup.questions.map((q) => {
                                                                                    const isSelected = selectedManualIds.includes(q.id);
                                                                                    const isMistake = wrongSet.has(q.id);
                                                                                    const isUnseen = !seenSet.has(q.id);

                                                                                    const cardData: QuestionPreviewData = {
                                                                                        id: q.id,
                                                                                        stem: q.stem,
                                                                                        options: q.options || [],
                                                                                        correct_option: q.correct_option,
                                                                                        explanation: q.explanation,
                                                                                        category: q.category,
                                                                                        subcategory: q.subcategory,
                                                                                        language: q.language,
                                                                                        isCustom: q.isCustom,
                                                                                        isMistake,
                                                                                        isUnseen,
                                                                                    };

                                                                                    return (
                                                                                        <QuestionPreviewCard
                                                                                            key={q.id}
                                                                                            question={cardData}
                                                                                            isSelected={isSelected}
                                                                                            onToggleSelect={toggleManualQuestion}
                                                                                            expanded={!!expandedQuestionIds[q.id]}
                                                                                            onToggleExpand={() => toggleQuestionExpand(q.id)}
                                                                                        />
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground">
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
                                                                    if (
                                                                        customCountInput === '' ||
                                                                        Number(customCountInput) <= 0
                                                                    ) {
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
                            <div className="mt-6 space-y-3 border-t border-border pt-4">
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

                {/* Sticky Bottom Dock for Quick Launch in Manual Mode */}
                {builderMode === 'manual' && selectedManualIds.length > 0 && (
                    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl rounded-2xl border border-blue-500/30 bg-card/95 p-3 shadow-xl backdrop-blur-md dark:border-blue-500/40">
                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                                    {selectedManualIds.length}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-foreground">
                                            Questions Selected
                                        </span>
                                        <button
                                            type="button"
                                            onClick={clearAllManual}
                                            className="text-[11px] font-bold text-rose-600 transition hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                        {Object.entries(selectedCategoryBreakdown).map(([cat, cnt]) => (
                                            <span key={cat} className="rounded bg-muted px-1.5 py-0.5 font-semibold">
                                                {cat}: {cnt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenSaveModal}
                                    className="h-9 text-xs font-bold"
                                >
                                    <BookmarkPlus className="mr-1.5 size-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Save Set</span>
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleStart}
                                    className="h-9 gap-1.5 bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 active:scale-95"
                                >
                                    <span>Start Custom Drill</span>
                                    <ArrowRight className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Custom Drill Question Modal */}
            <CreateDrillQuestionModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                categories={categories}
                onQuestionCreated={handleQuestionCreated}
            />

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
                                className="text-xs font-semibold"
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
                                className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border pt-2">
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
                                className="gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
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
