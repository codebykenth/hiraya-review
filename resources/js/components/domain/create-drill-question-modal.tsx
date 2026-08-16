import {
    Plus,
    Trash2,
    Check,
    Loader2,
    BookOpen,
    Sparkles,
    Eye,
    PenLine,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { QuestionPreviewCard } from '@/components/domain/question-preview-card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Category, Question } from '@/pages/user/drills/types';

interface CreateDrillQuestionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    onQuestionCreated: (newQuestion: Question) => void;
}

export function CreateDrillQuestionModal({
    open,
    onOpenChange,
    categories,
    onQuestionCreated,
}: CreateDrillQuestionModalProps) {
    const validCategories = useMemo(
        () => categories.filter((c) => c.name.toLowerCase() !== 'demographic'),
        [categories],
    );

    const defaultSubcatId = validCategories[0]?.subcategory[0]?.id || 0;

    const [subcategoryId, setSubcategoryId] = useState<number>(0);
    const [language, setLanguage] = useState<'English' | 'Filipino'>('English');
    const [stem, setStem] = useState<string>('');
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctOption, setCorrectOption] = useState<number>(0);
    const [explanation, setExplanation] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [modalTab, setModalTab] = useState<'edit' | 'preview'>('edit');

    const effectiveSubcatId = subcategoryId || defaultSubcatId;

    // Find category and subcategory names for preview
    let selectedCategoryName = 'General Information';
    let selectedSubcategoryName = 'General Concepts';

    for (const cat of validCategories) {
        for (const sub of cat.subcategory) {
            if (sub.id === effectiveSubcatId) {
                selectedCategoryName = cat.name;
                selectedSubcategoryName = sub.name;
                break;
            }
        }
    }

    const handleOptionChange = (index: number, value: string) => {
        setOptions((prev) => {
            const next = [...prev];
            next[index] = value;

            return next;
        });
    };

    const addOption = () => {
        if (options.length < 6) {
            setOptions((prev) => [...prev, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) {
            toast.error('A question must have at least 2 options.');

            return;
        }

        setOptions((prev) => prev.filter((_, i) => i !== index));

        if (correctOption === index) {
            setCorrectOption(0);
        } else if (correctOption > index) {
            setCorrectOption((prev) => prev - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stem.trim()) {
            toast.error('Please enter the question stem.');

            return;
        }

        const trimmedOptions = options.map((opt) => opt.trim());

        if (trimmedOptions.some((opt) => !opt)) {
            toast.error('All option choices must have text.');

            return;
        }

        if (!effectiveSubcatId) {
            toast.error('Please select a topic/subcategory.');

            return;
        }

        setIsSubmitting(true);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch('/drills/custom-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    subcategory_id: effectiveSubcatId,
                    language,
                    stem: stem.trim(),
                    options: trimmedOptions,
                    correct_option: correctOption,
                    explanation: explanation.trim() || null,
                }),
            });

            const data = await res.json();

            if (res.ok && data.question) {
                toast.success('Custom question created and added to your drill pool!');
                onQuestionCreated(data.question);
                onOpenChange(false);
                // Reset form
                setStem('');
                setOptions(['', '', '', '']);
                setCorrectOption(0);
                setExplanation('');
                setModalTab('edit');
            } else {
                toast.error(data.message || 'Failed to create custom question.');
            }
        } catch {
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="font-heading text-lg font-bold text-foreground">
                                    Add Custom Practice Question
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground">
                                    Create a custom practice item with full CSE exam-standard formatting.
                                </p>
                            </div>
                        </div>

                        {/* View Switcher: Edit vs Live Exam Preview */}
                        <div className="flex rounded-xl border border-border bg-muted/40 p-1">
                            <button
                                type="button"
                                onClick={() => setModalTab('edit')}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    modalTab === 'edit'
                                        ? 'bg-card text-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <PenLine className="size-3.5" />
                                <span>Edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTab('preview')}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    modalTab === 'preview'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Eye className="size-3.5" />
                                <span>Exam Preview</span>
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {modalTab === 'edit' ? (
                        <>
                            {/* Category & Language Row */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-foreground">
                                        Target Subcategory / Topic <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={effectiveSubcatId}
                                        onChange={(e) => setSubcategoryId(Number(e.target.value))}
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                                    >
                                        {validCategories.map((cat) => (
                                            <optgroup key={cat.id} label={cat.name}>
                                                {cat.subcategory.map((sub) => (
                                                    <option key={sub.id} value={sub.id}>
                                                        {sub.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-foreground">
                                        Language
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['English', 'Filipino'] as const).map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => setLanguage(lang)}
                                                className={`rounded-xl border py-2 text-xs font-bold transition ${
                                                    language === lang
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Question Stem */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-foreground">
                                    Question Stem / Body <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={stem}
                                    onChange={(e) => setStem(e.target.value)}
                                    placeholder="Type or paste your question stem here..."
                                    className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Choices List */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-xs font-bold text-foreground">
                                        Answer Options <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                        Select circular letter for correct answer
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {options.map((opt, idx) => {
                                        const isCorrect = correctOption === idx;

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${
                                                    isCorrect
                                                        ? 'border-emerald-500/80 bg-emerald-50/40 dark:border-emerald-500/70 dark:bg-emerald-950/20'
                                                        : 'border-border bg-background'
                                                }`}
                                            >
                                                {/* Correct Radio Toggle */}
                                                <button
                                                    type="button"
                                                    onClick={() => setCorrectOption(idx)}
                                                    aria-label={`Mark Option ${optionLetters[idx]} as correct`}
                                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
                                                        isCorrect
                                                            ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 shadow-xs'
                                                            : 'border-border bg-background text-muted-foreground hover:border-emerald-500 hover:text-foreground'
                                                    }`}
                                                >
                                                    {optionLetters[idx]}
                                                </button>

                                                {/* Option Input */}
                                                <Input
                                                    required
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    placeholder={`Option ${optionLetters[idx]} choice text...`}
                                                    className="h-9 text-xs font-medium"
                                                />

                                                {/* Remove option button if > 2 */}
                                                {options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(idx)}
                                                        aria-label="Remove option"
                                                        className="shrink-0 p-1.5 text-muted-foreground/60 transition hover:text-rose-600"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {options.length < 6 && (
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 transition hover:underline dark:text-blue-400"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>Add Choice</span>
                                    </button>
                                )}
                            </div>

                            {/* Explanation / Rationale */}
                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
                                    <label className="text-xs font-bold text-foreground">
                                        Explanation / Rationale (Optional)
                                    </label>
                                </div>
                                <textarea
                                    rows={2}
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Provide study tips, step-by-step solutions, or reasoning for this question..."
                                    className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </>
                    ) : (
                        /* Exam Standard Preview Tab */
                        <div className="py-2">
                            <QuestionPreviewCard
                                question={{
                                    id: 0,
                                    stem: stem || 'Type your question stem in the edit tab to see live preview...',
                                    options: options.map(
                                        (opt, i) => opt || `Choice ${String.fromCharCode(65 + i)} text`,
                                    ),
                                    correct_option: correctOption,
                                    explanation: explanation || 'No explanation provided.',
                                    category: selectedCategoryName,
                                    subcategory: selectedSubcategoryName,
                                    language,
                                    isCustom: true,
                                }}
                                selectable={false}
                                expanded={true}
                                showStatusBadge={true}
                            />
                        </div>
                    )}

                    {/* Modal Bottom Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-1 size-3.5 animate-spin" />
                            ) : (
                                <Check className="mr-1 size-3.5" />
                            )}
                            <span>Save Question</span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
