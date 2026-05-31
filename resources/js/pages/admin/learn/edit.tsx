import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { CurationEditShell } from '@/components/curation-edit-shell';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import {
    index as adminLearnIndex,
    update as adminLearnUpdate,
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

export default function AdminLearnEdit({
    module,
    categories,
}: AdminLearnEditProps) {
    const initialCategory = categories.find((c) => c.id === module.category_id);
    const [selectedCategoryName, setSelectedCategoryName] = useState(
        initialCategory?.name || categories[0]?.name || '',
    );

    const initialCategoryObject = categories.find(
        (c) => c.name === selectedCategoryName,
    );
    const initialSubcategory = initialCategoryObject?.subcategory.find(
        (s) => s.id === module.subcategory_id,
    );
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(
        initialSubcategory?.name ||
            initialCategoryObject?.subcategory[0]?.name ||
            '',
    );

    // Main Form Setup
    const { data, setData, put, processing, errors } = useForm({
        category_id: module.category_id || categories[0]?.id || '',
        subcategory_id:
            module.subcategory_id || categories[0]?.subcategory[0]?.id || '',
        title: module.title,
        topic: module.topic,
        summary: module.summary,
        content: module.content,
        estimated_minutes: module.estimated_minutes,
        is_published: module.is_published,
    });

    const handleCategoryChange = (catName: string) => {
        setSelectedCategoryName(catName);
        const cat = categories.find((c) => c.name === catName);

        if (cat) {
            setData((prev) => ({
                ...prev,
                category_id: cat.id,
                subcategory_id: cat.subcategory[0]?.id || '',
            }));
            setSelectedSubcategoryName(cat.subcategory[0]?.name || '');
        }
    };

    const handleSubcategoryChange = (subName: string) => {
        setSelectedSubcategoryName(subName);
        const cat = categories.find((c) => c.name === selectedCategoryName);

        if (cat) {
            const sub = cat.subcategory.find((s) => s.name === subName);

            if (sub) {
                setData('subcategory_id', sub.id);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(adminLearnUpdate(module.id).url);
    };

    const activeSubcategories =
        categories.find((c) => c.name === selectedCategoryName)?.subcategory ||
        [];

    return (
        <>
            <Head title="Edit Learning Module" />

            <CurationEditShell
                title="Edit Study Module"
                description="Update the lesson title, syllabus categorization, preview summaries, or core Markdown content material."
                backUrl={adminLearnIndex().url}
                backLabel="Back to Module Management"
                headerTitle="Edit Module Details"
                headerIcon={BookOpen}
                statusLabel="Publish Status"
                statusValue={data.is_published}
                onStatusToggle={() =>
                    setData('is_published', !data.is_published)
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
                        options={categories.map((c) => ({
                            value: c.name,
                            label: c.name,
                        }))}
                    />

                    <SelectField
                        label="Target Subcategory"
                        value={selectedSubcategoryName}
                        onValueChange={handleSubcategoryChange}
                        options={activeSubcategories.map((s) => ({
                            value: s.name,
                            label: s.name,
                        }))}
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                        Lesson Title
                    </label>
                    <Input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    {errors.title && (
                        <span className="text-red-650 mt-1 block text-[10px] font-medium">
                            {errors.title}
                        </span>
                    )}
                </div>

                {/* Row: Topic & Est Minutes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                            Focus Topic
                        </label>
                        <Input
                            type="text"
                            value={data.topic}
                            onChange={(e) => setData('topic', e.target.value)}
                        />
                        {errors.topic && (
                            <span className="text-red-650 mt-1 block text-[10px] font-medium">
                                {errors.topic}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                            Estimated minutes read
                        </label>
                        <div className="relative">
                            <Clock className="text-slate-450 absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
                            <Input
                                type="number"
                                min={1}
                                max={120}
                                value={data.estimated_minutes}
                                onChange={(e) =>
                                    setData(
                                        'estimated_minutes',
                                        parseInt(e.target.value, 10) || 5,
                                    )
                                }
                                className="pl-10"
                            />
                        </div>
                        {errors.estimated_minutes && (
                            <span className="text-red-650 mt-1 block text-[10px] font-medium">
                                {errors.estimated_minutes}
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                        Short preview summary
                    </label>
                    <textarea
                        value={data.summary}
                        rows={2}
                        onChange={(e) => setData('summary', e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted p-3 text-xs font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                    />
                    {errors.summary && (
                        <span className="mt-1 block text-[10px] font-medium text-red-600">
                            {errors.summary}
                        </span>
                    )}
                </div>

                {/* Lesson Material Markdown Content */}
                <div>
                    <label className="mb-1 block text-[10px] font-extrabold text-muted-foreground uppercase">
                        Lesson Material (Markdown Content)
                    </label>
                    <textarea
                        value={data.content}
                        rows={14}
                        onChange={(e) => setData('content', e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted p-3 font-mono text-xs leading-relaxed font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                    />
                    {errors.content && (
                        <span className="mt-1 block text-[10px] font-medium text-red-600">
                            {errors.content}
                        </span>
                    )}
                </div>
            </CurationEditShell>
        </>
    );
}

AdminLearnEdit.layout = {
    breadcrumbs: [
        {
            title: 'Module Management',
            href: adminLearnIndex().url,
        },
        {
            title: 'Edit Module',
            href: '',
        },
    ],
};
