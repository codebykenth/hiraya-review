import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, Save, BookOpen, Clock, Tag } from 'lucide-react';
import { 
    index as adminLearnIndex,
    update as adminLearnUpdate
} from '@/routes/admin/learn';

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

interface LearnModule {
    id: number;
    category_id: number | null;
    subcategory_id: number | null;
    title: string;
    topic: string;
    summary: string;
    content: string;
    estimated_minutes: number;
    is_published: boolean;
}

interface AdminLearnEditProps {
    module: LearnModule;
    categories: Category[];
}

export default function AdminLearnEdit({ module, categories }: AdminLearnEditProps) {
    const initialCategory = categories.find(c => c.id === module.category_id);
    const [selectedCategoryName, setSelectedCategoryName] = useState(initialCategory?.name || categories[0]?.name || '');
    
    const initialCategoryObject = categories.find(c => c.name === selectedCategoryName);
    const initialSubcategory = initialCategoryObject?.subcategory.find(s => s.id === module.subcategory_id);
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(initialSubcategory?.name || initialCategoryObject?.subcategory[0]?.name || '');

    // Main Form Setup
    const { data, setData, put, processing, errors } = useForm({
        category_id: module.category_id || categories[0]?.id || '',
        subcategory_id: module.subcategory_id || categories[0]?.subcategory[0]?.id || '',
        title: module.title,
        topic: module.topic,
        summary: module.summary,
        content: module.content,
        estimated_minutes: module.estimated_minutes,
        is_published: module.is_published,
    });

    const handleCategoryChange = (catName: string) => {
        setSelectedCategoryName(catName);
        const cat = categories.find(c => c.name === catName);
        if (cat) {
            setData(prev => ({
                ...prev,
                category_id: cat.id,
                subcategory_id: cat.subcategory[0]?.id || '',
            }));
            setSelectedSubcategoryName(cat.subcategory[0]?.name || '');
        }
    };

    const handleSubcategoryChange = (subName: string) => {
        setSelectedSubcategoryName(subName);
        const cat = categories.find(c => c.name === selectedCategoryName);
        if (cat) {
            const sub = cat.subcategory.find(s => s.name === subName);
            if (sub) {
                setData('subcategory_id', sub.id);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(adminLearnUpdate(module.id).url);
    };

    const activeSubcategories = categories.find(c => c.name === selectedCategoryName)?.subcategory || [];

    return (
        <>
            <Head title="Edit Learning Module" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 bg-slate-50/30 dark:bg-slate-900/20">
                
                {/* Back Link */}
                <Link
                    href={adminLearnIndex().url}
                    className="flex w-fit items-center gap-1 text-xs font-black text-slate-855 hover:text-blue-650 dark:text-white dark:hover:text-blue-400 transition focus:outline-none"
                >
                    <ChevronLeft className="size-4" />
                    Back to Manager
                </Link>

                <div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                        Edit Study Module
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Update the lesson title, syllabus categorization, preview summaries, or core Markdown content material.
                    </p>
                </div>

                <div className="max-w-4xl">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-slate-150 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
                            <span className="text-xs font-black text-slate-855 dark:text-white uppercase flex items-center gap-1.5">
                                <BookOpen className="size-4.5 text-blue-600" />
                                Edit Module Details
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Publish status:</span>
                                <button
                                    type="button"
                                    onClick={() => setData('is_published', !data.is_published)}
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase transition cursor-pointer border ${
                                        data.is_published 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                                            : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-450 dark:border-slate-800'
                                    }`}
                                >
                                    {data.is_published ? 'Published' : 'Draft'}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 text-xs font-bold text-slate-750 dark:text-slate-400">
                            
                            {/* Row: Category & Subcategory Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 font-extrabold text-[10px] text-slate-400 uppercase">Target Category</label>
                                    <select
                                        value={selectedCategoryName}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1.5 font-extrabold text-[10px] text-slate-400 uppercase">Target Subcategory</label>
                                    <select
                                        value={selectedSubcategoryName}
                                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                    >
                                        {activeSubcategories.map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase">Lesson Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.title && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.title}</span>}
                            </div>

                            {/* Row: Topic & Est Minutes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase">Focus Topic</label>
                                    <input
                                        type="text"
                                        value={data.topic}
                                        onChange={e => setData('topic', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                    />
                                    {errors.topic && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.topic}</span>}
                                </div>
                                
                                <div>
                                    <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase">Estimated minutes read</label>
                                    <div className="relative">
                                        <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={1}
                                            max={120}
                                            value={data.estimated_minutes}
                                            onChange={e => setData('estimated_minutes', parseInt(e.target.value, 10) || 5)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 py-3 pl-10 pr-4 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                        />
                                    </div>
                                    {errors.estimated_minutes && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.estimated_minutes}</span>}
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase">Short preview summary</label>
                                <textarea
                                    value={data.summary}
                                    rows={2}
                                    onChange={e => setData('summary', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.summary && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.summary}</span>}
                            </div>

                            {/* Lesson Material Markdown Content */}
                            <div>
                                <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase">Lesson Material (Markdown Content)</label>
                                <textarea
                                    value={data.content}
                                    rows={14}
                                    onChange={e => setData('content', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold font-mono leading-relaxed focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.content && <span className="mt-1 block text-[10px] text-red-650 font-medium">{errors.content}</span>}
                            </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-end dark:border-slate-855">
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

// Register layout configuration
AdminLearnEdit.layout = {
    breadcrumbs: [
        {
            title: 'Learn Management',
            href: adminLearnIndex().url,
        },
        {
            title: 'Edit Module',
            href: '',
        },
    ],
};
