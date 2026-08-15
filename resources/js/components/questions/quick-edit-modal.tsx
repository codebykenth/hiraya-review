import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { QuestionItem } from '@/pages/admin/questions/types';

interface QuickEditModalProps {
    isOpen: boolean;
    question: QuestionItem | null;
    categories?: any[];
    onClose: () => void;
    onSaveSuccess: () => void;
}

export function QuickEditModal({ isOpen, question, categories, onClose, onSaveSuccess }: QuickEditModalProps) {
    const [stem, setStem] = useState('');
    const [explanation, setExplanation] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [correctOption, setCorrectOption] = useState<number>(0);
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [language, setLanguage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (question && isOpen) {
            setStem(question.stem || '');
            setExplanation(question.explanation || '');
            setCorrectOption(question.correct_option ?? 0);
            setCategory(question.category || '');
            setSubcategory(question.subcategory || '');
            setLanguage((question as any).language || 'English');
            
            // Normalize options to string array
            if (question.options && question.options.length > 0) {
                const normalizedOptions = question.options.map(opt => {
                    return typeof opt === 'string' ? opt : (opt as any).option_text || '';
                });
                
                // Ensure at least 4 options, up to 5
                while (normalizedOptions.length < 4) {
normalizedOptions.push('');
}

                if (normalizedOptions.length > 5) {
normalizedOptions.length = 5;
}
                
                setOptions(normalizedOptions);
            } else {
                setOptions(['', '', '', '', '']);
            }

            setErrors({});
        }
    }, [question, isOpen]);

    const handleOptionChange = (idx: number, val: string) => {
        const nextOpts = [...options];
        nextOpts[idx] = val;
        setOptions(nextOpts);
    };

    const handleSave = () => {
        if (!question) {
return;
}

        setIsSaving(true);
        setErrors({});

        // Use Inertia's router directly since we aren't using useForm hook here to keep it lighter
        router.put(
            `/questions/${question.id}`,
            {
                category,
                subcategory,
                language,
                stem,
                options: options.filter(o => o.trim()), // Filter out empty options to avoid validation errors if they were left blank
                correct_option: correctOption,
                explanation,
                status: question.status === 'ACTIVE' ? 'active' : 'draft',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    onSaveSuccess();
                    onClose();
                },
                onError: (errs) => {
                    setIsSaving(false);
                    setErrors(errs);
                },
            }
        );
    };

    if (!question) {
return null;
}

    const isDemographic = category === 'Demographic Profile';

    // Build categories tree dynamically with robust static CSC fallback
    const cseCategoriesTree: Record<string, string[]> = {};

    if (categories && categories.length > 0) {
        categories.forEach((cat) => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(
                (sub: any) => sub.name,
            );
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection',
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension',
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation',
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems',
        ];
        cseCategoriesTree['Clerical Ability'] = ['Filing', 'Spelling'];
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Edit Question #{question.id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {/* Category */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-extrabold text-slate-400 uppercase">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setSubcategory(''); // Reset subcategory when category changes
                                }}
                                className={`w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                                    errors.category ? 'border-red-500' : 'border-border'
                                }`}
                            >
                                <option value="" disabled>Select Category</option>
                                {Object.keys(cseCategoriesTree).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-1 block text-[10px]" />
                        </div>

                        {/* Subcategory */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-extrabold text-slate-400 uppercase">
                                Subcategory
                            </label>
                            <select
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                className={`w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                                    errors.subcategory ? 'border-red-500' : 'border-border'
                                }`}
                            >
                                <option value="" disabled>Select Subcategory</option>
                                {(cseCategoriesTree[category] || []).map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.subcategory} className="mt-1 block text-[10px]" />
                        </div>

                        {/* Language */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-extrabold text-slate-400 uppercase">
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className={`w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                                    errors.language ? 'border-red-500' : 'border-border'
                                }`}
                            >
                                <option value="English">English</option>
                                <option value="Tagalog">Tagalog</option>
                            </select>
                            <InputError message={errors.language} className="mt-1 block text-[10px]" />
                        </div>
                    </div>

                    {/* Stem */}
                    <div>
                        <label className="mb-1.5 block text-[10px] font-extrabold text-slate-400 uppercase">
                            Question Stem
                        </label>
                        <textarea
                            value={stem}
                            onChange={(e) => setStem(e.target.value)}
                            rows={4}
                            className={`w-full rounded-xl border bg-background p-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                                errors.stem ? 'border-red-500' : 'border-border'
                            }`}
                        />
                        <InputError message={errors.stem} className="mt-1 block text-[10px]" />
                    </div>

                    {/* Options */}
                    <div>
                        <label className="mb-2 block text-[10px] font-extrabold text-slate-400 uppercase">
                            {isDemographic ? 'Options' : 'Distractor Options & Correct Choice'}
                        </label>
                        <div className="space-y-3">
                            {options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3.5 rounded-xl border p-3 transition duration-200 ${
                                        !isDemographic && correctOption === idx
                                            ? 'border-emerald-250 bg-emerald-50/20 dark:border-emerald-850 dark:bg-emerald-950/10'
                                            : 'border-border'
                                    }`}
                                >
                                    {!isDemographic && (
                                        <input
                                            type="radio"
                                            name="modal_correct_option"
                                            checked={correctOption === idx}
                                            onChange={() => setCorrectOption(idx)}
                                            className="size-4.5 cursor-pointer accent-emerald-600"
                                        />
                                    )}

                                    <span
                                        className={`inline-flex size-6.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                                            !isDemographic && correctOption === idx
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </span>

                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                                        className="w-full bg-transparent text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.options} className="mt-1 block text-[10px]" />
                    </div>

                    {/* Explanation */}
                    {!isDemographic && (
                        <div>
                            <label className="mb-1 block text-[10px] font-extrabold text-slate-400 uppercase">
                                Explanation
                            </label>
                            <textarea
                                value={explanation}
                                rows={3}
                                onChange={(e) => setExplanation(e.target.value)}
                                className={`w-full rounded-xl border bg-background p-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                                    errors.explanation ? 'border-red-500' : 'border-border'
                                }`}
                            />
                            <InputError message={errors.explanation} className="mt-1 block text-[10px]" />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
