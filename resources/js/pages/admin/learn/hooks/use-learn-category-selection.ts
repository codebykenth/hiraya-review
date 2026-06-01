import { useState } from 'react';
import type { Category } from '../types';

interface UseLearnCategorySelectionProps {
    categories: Category[];
    initialCategoryId?: number | null;
    initialSubcategoryId?: number | null;
    setData: any;
}

export function useLearnCategorySelection({
    categories,
    initialCategoryId,
    initialSubcategoryId,
    setData,
}: UseLearnCategorySelectionProps) {
    const initialCategory = categories.find((c) => c.id === initialCategoryId);
    const [selectedCategoryName, setSelectedCategoryName] = useState(
        initialCategory?.name || categories[0]?.name || '',
    );

    const initialCategoryObject = categories.find(
        (c) => c.name === selectedCategoryName,
    );
    const initialSubcategory = initialCategoryObject?.subcategory.find(
        (s) => s.id === initialSubcategoryId,
    );
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(
        initialSubcategory?.name ||
            initialCategoryObject?.subcategory[0]?.name ||
            '',
    );

    const handleCategoryChange = (catName: string) => {
        setSelectedCategoryName(catName);
        const cat = categories.find((c) => c.name === catName);

        if (cat) {
            setData((prev: any) => ({
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
        const sub = cat?.subcategory.find((s) => s.name === subName);

        if (sub) {
            setData('subcategory_id', sub.id);
        }
    };

    const activeSubcategories =
        categories.find((c) => c.name === selectedCategoryName)?.subcategory ||
        [];

    return {
        selectedCategoryName,
        selectedSubcategoryName,
        activeSubcategories,
        handleCategoryChange,
        handleSubcategoryChange,
    };
}
