export interface SubcategoryItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    language: string;
    sort_order: number;
}

export interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    is_demographic: boolean;
    sort_order: number;
    subcategory?: SubcategoryItem[];
}

export interface CreateProps {
    type?: 'ai' | 'manual';
    categories?: CategoryItem[];
}

export interface QuestionItem {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    status: 'ACTIVE' | 'DRAFT';
}

export interface QuestionsIndexProps {
    questions?: QuestionItem[];
    categories?: CategoryItem[];
}
