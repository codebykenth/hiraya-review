import { Head } from '@inertiajs/react';
import { Database } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { CategoryPanel } from './components/category-panel';
import { SubcategoryPanel } from './components/subcategory-panel';
import { useSyllabusForm } from './hooks/use-syllabus-form';
import { useSyllabusModal } from './hooks/use-syllabus-modal';
import type { AdminSyllabusIndexProps } from './types';

export default function AdminSyllabusIndex({
    categories,
}: AdminSyllabusIndexProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        categories && categories.length > 0 ? categories[0].id : null,
    );

    const {
        formState,
        updateFormState,
        handleAddCategory,
        handleUpdateCategory,
        handleAddSubcategory,
        handleUpdateSubcategory,
    } = useSyllabusForm();

    const {
        modal,
        openDeleteCategory,
        openDeleteSubcategory,
        closeModal,
        confirmAction,
    } = useSyllabusModal();

    const activeCategory = categories.find((c) => c.id === selectedCategoryId);

    const handleCategoryDelete = (catId: number) => {
        openDeleteCategory(catId, selectedCategoryId);
    };

    const handleCategoryUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (formState.editingCategory !== null) {
            handleUpdateCategory(e, formState.editingCategory);
        }
    };

    const handleSubcategoryDelete = (subId: number) => {
        openDeleteSubcategory(subId);
    };

    const handleSubcategoryUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (formState.editingSubcategory !== null) {
            handleUpdateSubcategory(e, formState.editingSubcategory);
        }
    };

    const handleCategoryAddForm = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddCategory(e);
    };

    const handleSubcategoryAddForm = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddSubcategory(e, selectedCategoryId);
    };

    const handleStartEditCategory = (catId: number, name: string) => {
        updateFormState('editingCategory', catId);
        updateFormState('editCategoryName', name);
    };

    const handleStartEditSubcategory = (subId: number, name: string) => {
        updateFormState('editingSubcategory', subId);
        updateFormState('editSubcategoryName', name);
    };

    const handleCancelEdit = () => {
        updateFormState('editingCategory', null);
        updateFormState('editingSubcategory', null);
        updateFormState('editCategoryName', '');
        updateFormState('editSubcategoryName', '');
    };

    return (
        <>
            <Head title="Syllabus Scope Settings" />

            <PageContainer>
                <PageHeader
                    title="Syllabus Scope Settings"
                    description="Customize your exam blueprint and automatically tune the AI review material writer. All categories and subcategories defined here are synchronized across both the question bank and the learning modules."
                    className="mb-8 flex flex-col gap-2"
                    descriptionClassName="max-w-2xl text-sm leading-relaxed text-muted-foreground"
                />

                <div className="flex h-[650px] w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 sm:px-6 py-4.5">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
                                <Database className="size-5 text-blue-600 dark:text-blue-400 dark:text-blue-500" />
                                Dynamic Syllabus Management
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        <CategoryPanel
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            formState={formState}
                            onSelectCategory={setSelectedCategoryId}
                            onFormChange={updateFormState}
                            onSubmitCategory={handleCategoryAddForm}
                            onSubmitEdit={handleCategoryUpdate}
                            onStartEdit={handleStartEditCategory}
                            onCancelEdit={handleCancelEdit}
                            onDelete={handleCategoryDelete}
                        />

                        <SubcategoryPanel
                            activeCategory={activeCategory}
                            selectedCategoryId={selectedCategoryId}
                            formState={formState}
                            onFormChange={updateFormState}
                            onSubmitSubcategory={handleSubcategoryAddForm}
                            onSubmitEdit={handleSubcategoryUpdate}
                            onStartEdit={handleStartEditSubcategory}
                            onCancelEdit={handleCancelEdit}
                            onDelete={handleSubcategoryDelete}
                        />
                    </div>
                </div>
            </PageContainer>

            <ConfirmModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.confirmLabel}
                variant={modal.variant}
                onClose={closeModal}
                onConfirm={confirmAction}
            />
        </>
    );
}
