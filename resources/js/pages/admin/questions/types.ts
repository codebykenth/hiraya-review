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

export interface QuestionOption {
    id?: number;
    option_text: string;
    is_correct: boolean;
}

export interface QuestionItem {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    status: 'ACTIVE' | 'DRAFT';
    explanation?: string;
    correct_option?: number;
    updated_at?: string;
    options?: QuestionOption[];
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface QuestionFilters {
    search?: string;
    status?: string;
    category?: string;
    subcategory?: string;
    language?: string;
    per_page?: number;
}

export interface QuestionsIndexProps {
    questions?: QuestionItem[];
    pagination?: Pagination;
    filters?: QuestionFilters;
    categories?: CategoryItem[];
}
