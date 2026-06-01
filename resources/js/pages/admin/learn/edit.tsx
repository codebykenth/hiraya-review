import { Head, useForm } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import React from 'react';
import { CurationEditShell } from '@/components/curation-edit-shell';
import { SelectField } from '@/components/ui/select';
import {
    index as adminLearnIndex,
    update as adminLearnUpdate,
} from '@/routes/admin/learn';
import { LearnModuleFields } from './components/learn-module-fields';
import { useLearnCategorySelection } from './hooks/use-learn-category-selection';
import type { AdminLearnEditProps } from './types';

export default function AdminLearnEdit({
    module,
    categories,
}: AdminLearnEditProps) {
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

    const {
        selectedCategoryName,
        selectedSubcategoryName,
        activeSubcategories,
        handleCategoryChange,
        handleSubcategoryChange,
    } = useLearnCategorySelection({
        categories,
        initialCategoryId: module.category_id,
        initialSubcategoryId: module.subcategory_id,
        setData,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(adminLearnUpdate(module.id).url);
    };

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

                <LearnModuleFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    labelSize="compact"
                    mutedTextareas
                />
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
