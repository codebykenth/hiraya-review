import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ChevronLeft, 
    Save, 
    HelpCircle, 
    CheckCircle2, 
    Sparkles, 
    BookOpen, 
    AlertCircle,
    Globe,
    Layers
} from 'lucide-react';
import { index as questionsIndex, update as questionsUpdate } from '@/routes/questions';

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

export default function QuestionEdit({ question, categories = [] }: QuestionEditProps) {
    // strict 1-liner comment: Setup static fallback tree if backend categories list is missing
    const cseCategoriesTree: Record<string, string[]> = {};
    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(sub => sub.name);
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection'
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension'
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation'
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems'
        ];
        cseCategoriesTree['Clerical Ability'] = [
            'Filing',
            'Spelling'
        ];
    }

    const [selectedCategoryName, setSelectedCategoryName] = useState(question.category || Object.keys(cseCategoriesTree)[0]);
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(question.subcategory || cseCategoriesTree[selectedCategoryName]?.[0]);

    // Main Form Setup
    const { data, setData, put, processing, errors } = useForm({
        category: selectedCategoryName,
        subcategory: selectedSubcategoryName,
        language: question.language || 'English',
        stem: question.stem || '',
        options: question.options && question.options.length > 0 
            ? [...question.options] 
            : ['', '', '', '', ''],
        correct_option: question.correct_option ?? 0,
        explanation: question.explanation || '',
        status: question.status === 'ACTIVE' ? 'active' : 'draft',
    });

    // Handle Category change to sync subcategory options
    const handleCategoryChange = (catName: string) => {
        setSelectedCategoryName(catName);
        setData(prev => ({
            ...prev,
            category: catName,
            subcategory: cseCategoriesTree[catName]?.[0] || '',
        }));
        setSelectedSubcategoryName(cseCategoriesTree[catName]?.[0] || '');
    };

    // Handle Subcategory change
    const handleSubcategoryChange = (subName: string) => {
        setSelectedSubcategoryName(subName);
        setData('subcategory', subName);
    };

    // Update individual option texts
    const handleOptionChange = (index: number, val: string) => {
        const nextOpts = [...data.options];
        nextOpts[index] = val;
        setData('options', nextOpts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(questionsUpdate(question.id).url);
    };

    const activeSubcategories = cseCategoriesTree[selectedCategoryName] || [];

    return (
        <>
            <Head title={`Edit Question #${question.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 bg-slate-50/30 dark:bg-slate-900/20">
                
                {/* Back Link */}
                <Link
                    href={questionsIndex().url}
                    className="flex w-fit items-center gap-1 text-xs font-black text-slate-855 hover:text-blue-655 dark:text-white dark:hover:text-blue-400 transition focus:outline-none"
                >
                    <ChevronLeft className="size-4" />
                    Back to Curation Manager
                </Link>

                <div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                        Edit Question Content
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Update syllabus classifications, multiple-choice distractors, correct answers, or rationales.
                    </p>
                </div>

                <div className="max-w-4xl">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-850">
                            <span className="text-xs font-black text-slate-855 dark:text-white uppercase flex items-center gap-1.5">
                                <HelpCircle className="size-4.5 text-blue-600" />
                                Edit Question Details
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Publish Status:</span>
                                <button
                                    type="button"
                                    onClick={() => setData('status', data.status === 'active' ? 'draft' : 'active')}
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase transition cursor-pointer border ${
                                        data.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                                            : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-450 dark:border-slate-800'
                                    }`}
                                >
                                    {data.status === 'active' ? 'Active' : 'Draft'}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 text-xs font-bold text-slate-750 dark:text-slate-400">
                            
                            {/* Row: Category & Subcategory Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 font-extrabold text-[10px] text-slate-400 uppercase">Target Category</label>
                                    <select
                                        value={selectedCategoryName}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                    >
                                        {Object.keys(cseCategoriesTree).map(catName => (
                                            <option key={catName} value={catName}>{catName}</option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.category}</span>}
                                </div>

                                <div>
                                    <label className="block mb-1.5 font-extrabold text-[10px] text-slate-400 uppercase">Target Subcategory</label>
                                    <select
                                        value={selectedSubcategoryName}
                                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                    >
                                        {activeSubcategories.map(subName => (
                                            <option key={subName} value={subName}>{subName}</option>
                                        ))}
                                    </select>
                                    {errors.subcategory && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.subcategory}</span>}
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block mb-1.5 font-extrabold text-[10px] text-slate-400 uppercase">Exam Language</label>
                                <select
                                    value={data.language}
                                    onChange={(e) => setData('language', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="English">English</option>
                                    <option value="Tagalog">Tagalog</option>
                                </select>
                                {errors.language && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.language}</span>}
                            </div>

                            {/* Question Stem (Text) */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block font-extrabold text-[10px] text-slate-400 uppercase">Question Stem</label>
                                    
                                    {/* Mock Formatting toolbar for premium aesthetics */}
                                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900">
                                        <span className="px-2 py-0.5 text-[9px] font-black text-slate-500 rounded transition select-none">B</span>
                                        <span className="px-2 py-0.5 text-[9px] italic text-slate-500 rounded transition select-none">I</span>
                                        <span className="px-2 py-0.5 text-[9px] text-slate-500 rounded transition select-none font-mono">List</span>
                                    </div>
                                </div>

                                <textarea
                                    value={data.stem}
                                    onChange={(e) => setData('stem', e.target.value)}
                                    rows={5}
                                    placeholder="Enter question text, scenario, logic criteria, or reading passage..."
                                    className={`w-full rounded-xl border p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white ${
                                        errors.stem ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                    required
                                />
                                {errors.stem && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.stem}</span>}
                            </div>

                            {/* Distractor Choices */}
                            <div>
                                <label className="block mb-2 font-extrabold text-[10px] text-slate-400 uppercase">
                                    Distractor Options & Correct Choice
                                </label>
                                <div className="space-y-3">
                                    {data.options.map((option, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center gap-3.5 rounded-xl border p-3 transition duration-200 ${
                                                data.correct_option === idx 
                                                    ? 'border-emerald-250 bg-emerald-50/20 dark:border-emerald-850 dark:bg-emerald-950/10' 
                                                    : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            {/* Correct Option Radio Selector */}
                                            <input
                                                type="radio"
                                                name="correct_option"
                                                checked={data.correct_option === idx}
                                                onChange={() => setData('correct_option', idx)}
                                                className="size-4.5 accent-emerald-600 cursor-pointer"
                                            />

                                            {/* Choice Letter Index */}
                                            <span className={`inline-flex size-6.5 items-center justify-center rounded-lg text-[10px] font-black shrink-0 ${
                                                data.correct_option === idx
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>

                                            {/* Option content Input */}
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)} distractor text...`}
                                                className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-450 focus:outline-none dark:text-white"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                {errors.options && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.options}</span>}
                            </div>

                            {/* Explanation */}
                            <div>
                                <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase">
                                    Cognitive Explanation & Rationale
                                </label>
                                <textarea
                                    value={data.explanation}
                                    rows={5}
                                    onChange={(e) => setData('explanation', e.target.value)}
                                    placeholder="Explain solution steps, logic chains, spelling constraints, or mental shortcuts..."
                                    className={`w-full rounded-xl border p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white ${
                                        errors.explanation ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                    required
                                />
                                {errors.explanation && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.explanation}</span>}
                            </div>

                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-end dark:border-slate-855">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition focus:outline-none cursor-pointer"
                            >
                                <Save className="size-4" />
                                Save Updates
                            </button>
                        </div>
                    </form>
                </div>

            </div>
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
