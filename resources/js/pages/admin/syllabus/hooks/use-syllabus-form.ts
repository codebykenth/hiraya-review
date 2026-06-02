import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface SyllabusFormState {
    newCategoryName: string;
    newCategoryIsDemographic: boolean;
    newSubcategoryName: string;
    editingCategory: number | null;
    editCategoryName: string;
    editingSubcategory: number | null;
    editSubcategoryName: string;
}

export function useSyllabusForm() {
    const [formState, setFormState] = useState<SyllabusFormState>({
        newCategoryName: '',
        newCategoryIsDemographic: false,
        newSubcategoryName: '',
        editingCategory: null,
        editCategoryName: '',
        editingSubcategory: null,
        editSubcategoryName: '',
    });

    const updateFormState = <K extends keyof SyllabusFormState>(
        key: K,
        value: SyllabusFormState[K],
    ) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.newCategoryName.trim()) {
            return;
        }

        router.post(
            '/questions/categories',
            {
                name: formState.newCategoryName,
                is_demographic: formState.newCategoryIsDemographic,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    updateFormState('newCategoryName', '');
                    updateFormState('newCategoryIsDemographic', false);
                },
            },
        );
    };

    const handleUpdateCategory = (e: React.FormEvent, catId: number) => {
        e.preventDefault();

        if (!formState.editCategoryName.trim()) {
            return;
        }

        router.put(
            `/questions/categories/${catId}`,
            { name: formState.editCategoryName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    updateFormState('editingCategory', null);
                    updateFormState('editCategoryName', '');
                },
            },
        );
    };

    const handleAddSubcategory = (
        e: React.FormEvent,
        selectedCategoryId: number | null,
    ) => {
        e.preventDefault();

        if (!selectedCategoryId || !formState.newSubcategoryName.trim()) {
            return;
        }

        router.post(
            '/questions/subcategories',
            {
                category_id: selectedCategoryId,
                name: formState.newSubcategoryName,
            },
            {
                preserveScroll: true,
                onSuccess: () => updateFormState('newSubcategoryName', ''),
            },
        );
    };

    const handleUpdateSubcategory = (e: React.FormEvent, subId: number) => {
        e.preventDefault();

        if (!formState.editSubcategoryName.trim()) {
            return;
        }

        router.put(
            `/questions/subcategories/${subId}`,
            { name: formState.editSubcategoryName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    updateFormState('editingSubcategory', null);
                    updateFormState('editSubcategoryName', '');
                },
            },
        );
    };

    return {
        formState,
        updateFormState,
        handleAddCategory,
        handleUpdateCategory,
        handleAddSubcategory,
        handleUpdateSubcategory,
    };
}
