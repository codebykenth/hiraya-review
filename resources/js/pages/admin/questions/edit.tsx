import { Head, useForm } from '@inertiajs/react';
import { HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import { CurationEditShell } from '@/components/domain/curation-edit-shell';
import InputError from '@/components/shared/input-error';
import { SelectField } from '@/components/ui/select';
import {
    index as questionsIndex,
    update as questionsUpdate,
} from '@/routes/questions';

interface Subcategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    subcategory: Subcategory[];
}

interface QuestionItem {
    id: number;
    category_id?: number | null;
    subcategory_id?: number | null;
    stem: string;
    category: string;
    subcategory: string;
    options: string[];
    correct_option: number;
    explanation: string;
    language: string;
    status: string;
}

interface QuestionEditProps {
    question: QuestionItem;
    categories: Category[];
}

export default function QuestionEdit({
    question,
    categories = [],
}: QuestionEditProps) {
    const cseCategoriesTree: Record<string, string[]> = {};

    if (categories && categories.length > 0) {
        categories.forEach((cat) => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(
                (sub) => sub.name,
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

    const [selectedCategoryName, setSelectedCategoryName] = useState(
        question.category || Object.keys(cseCategoriesTree)[0],
    );
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(
        question.subcategory || cseCategoriesTree[selectedCategoryName]?.[0],
    );
    const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const page = params.get('page') || '1';
    const backUrl = `${questionsIndex().url}?page=${page}`;
    // Main Form Setup
    const { data, setData, put, processing, errors, transform } = useForm({
        category: selectedCategoryName,
        subcategory: selectedSubcategoryName,
        language: question.language || 'English',
        stem: question.stem || '',
        options:
            question.options && question.options.length > 0
                ? [...question.options]
                : ['', '', '', '', ''],
        correct_option: question.correct_option ?? 0,
        explanation: question.explanation || '',
        status: question.status === 'ACTIVE' ? 'active' : 'draft',
    });

    const handleCategoryChange = (catName: string) => {
        setSelectedCategoryName(catName);
        setData((prev) => ({
            ...prev,
            category: catName,
            subcategory: cseCategoriesTree[catName]?.[0] || '',
        }));
        setSelectedSubcategoryName(cseCategoriesTree[catName]?.[0] || '');
    };

    const handleSubcategoryChange = (subName: string) => {
        setSelectedSubcategoryName(subName);
        setData('subcategory', subName);
    };

    const handleOptionChange = (index: number, val: string) => {
        const nextOpts = [...data.options];
        nextOpts[index] = val;
        setData('options', nextOpts);
    };

    const isDemographic = (() => {
        const cat = categories.find((c) => c.name === data.category);

        return (
            cat?.subcategory?.some(
                (s) =>
                    s.name === data.subcategory &&
                    cat?.name === 'Demographic Profile',
            ) ||
            data.category === 'Demographic Profile' ||
            (cat as any)?.is_demographic
        );
    })();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isDemographic && data.options.filter((o) => o.trim()).length < 2) {
            return;
        }

        if (!isDemographic && data.options.some((o) => !o.trim())) {
            return;
        }

        put(questionsUpdate(question.id).url);
    };

    transform((data) => ({
        ...data,
        options: isDemographic
            ? data.options.filter((opt) => opt.trim() !== '')
            : data.options,
    }));

    const activeSubcategories = cseCategoriesTree[selectedCategoryName] || [];

    return (
        <>
            <Head title={`Edit Question #${question.id}`} />

            <CurationEditShell
                title="Edit Question Content"
                description="Update syllabus classifications, multiple-choice distractors, correct answers, or rationales."
                backUrl={backUrl}
                backLabel="Back to Question Management"
                headerTitle="Edit Question Details"
                headerIcon={HelpCircle}
                statusLabel="Publish Status"
                statusValue={data.status === 'active'}
                onStatusToggle={() =>
                    setData(
                        'status',
                        data.status === 'active' ? 'draft' : 'active',
                    )
                }
                onSaveSubmit={handleSubmit}
                isSaving={processing}
            >
                {/* Row: Category & Subcategory Selection */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Target Category"
                        value={selectedCategoryName}
                        onValueChange={handleCategoryChange}
                        options={Object.keys(cseCategoriesTree)}
                    />
                    <InputError
                        message={errors.category}
                        className="mt-1 block text-[10px] font-medium"
                    />

                    <SelectField
                        label="Target Subcategory"
                        value={selectedSubcategoryName}
                        onValueChange={handleSubcategoryChange}
                        options={activeSubcategories}
                    />
                    <InputError
                        message={errors.subcategory}
                        className="mt-1 block text-[10px] font-medium"
                    />
                </div>

                {/* Language */}
                <SelectField
                    label="Exam Language"
                    value={data.language}
                    onValueChange={(val) => setData('language', val)}
                    options={['English', 'Tagalog']}
                />
                <InputError
                    message={errors.language}
                    className="mt-1 block text-[10px] font-medium"
                />

                {/* Question Stem (Text) */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                            Question Stem
                        </label>

                        {/* Mock Formatting toolbar for premium aesthetics */}
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
                            <span className="rounded px-2 py-0.5 text-[9px] font-black text-slate-500 transition select-none">
                                B
                            </span>
                            <span className="rounded px-2 py-0.5 text-[9px] text-slate-500 italic transition select-none">
                                I
                            </span>
                            <span className="rounded px-2 py-0.5 font-mono text-[9px] text-slate-500 transition select-none">
                                List
                            </span>
                        </div>
                    </div>

                    <textarea
                        value={data.stem}
                        onChange={(e) => setData('stem', e.target.value)}
                        rows={5}
                        placeholder="Enter question text, scenario, logic criteria, or reading passage..."
                        className={`w-full rounded-xl border bg-background p-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                            errors.stem ? 'border-red-500' : 'border-border'
                        }`}
                        required
                    />
                    <InputError
                        message={errors.stem}
                        className="mt-1 block text-[10px] font-medium"
                    />
                </div>

                {/* Distractor Choices */}
                <div>
                    <label className="mb-2 block text-[10px] font-extrabold text-slate-400 uppercase">
                        {isDemographic
                            ? 'Options'
                            : 'Distractor Options & Correct Choice'}
                    </label>
                    <div className="space-y-3">
                        {data.options.map((option, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3.5 rounded-xl border p-3 transition duration-200 ${
                                    !isDemographic &&
                                    data.correct_option === idx
                                        ? 'border-emerald-250 dark:border-emerald-850 bg-emerald-50/20 dark:bg-emerald-950/10'
                                        : 'border-border'
                                }`}
                            >
                                {!isDemographic && (
                                    <input
                                        type="radio"
                                        name="correct_option"
                                        checked={data.correct_option === idx}
                                        onChange={() =>
                                            setData('correct_option', idx)
                                        }
                                        className="size-4.5 cursor-pointer accent-emerald-600"
                                    />
                                )}

                                <span
                                    className={`inline-flex size-6.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                                        !isDemographic &&
                                        data.correct_option === idx
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {String.fromCharCode(65 + idx)}
                                </span>

                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                        handleOptionChange(idx, e.target.value)
                                    }
                                    placeholder={`Option ${String.fromCharCode(65 + idx)} distractor text...`}
                                    className="w-full bg-transparent text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    required={!isDemographic || idx < 2}
                                />
                            </div>
                        ))}
                    </div>
                    <InputError
                        message={errors.options}
                        className="mt-1 block text-[10px] font-medium"
                    />
                </div>

                {/* Explanation */}
                {!isDemographic && (
                    <div>
                        <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                            Cognitive Explanation & Rationale
                        </label>
                        <textarea
                            value={data.explanation}
                            rows={5}
                            onChange={(e) =>
                                setData('explanation', e.target.value)
                            }
                            placeholder="Explain solution steps, logic chains, spelling constraints, or mental shortcuts..."
                            className={`w-full rounded-xl border bg-background p-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none ${
                                errors.explanation
                                    ? 'border-red-500'
                                    : 'border-border'
                            }`}
                            required
                        />
                        <InputError
                            message={errors.explanation}
                            className="mt-1 block text-[10px] font-medium"
                        />
                    </div>
                )}
            </CurationEditShell>
        </>
    );
}

QuestionEdit.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Edit Question',
            href: '',
        },
    ],
};
