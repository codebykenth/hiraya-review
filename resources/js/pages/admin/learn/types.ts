export interface Subcategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    subcategory: Subcategory[];
}

export interface LearnModule {
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

export interface AdminLearnCreateProps {
    categories: Category[];
    initialTopic?: string;
}

export interface AdminLearnEditProps {
    module: LearnModule;
    categories: Category[];
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface LearnModuleFilters {
    search?: string;
    status?: string;
    category?: string;
    subcategory?: string;
    per_page?: number;
}

export interface AdminLearnIndexProps {
    modules: LearnModule[];
    pagination?: Pagination;
    filters?: LearnModuleFilters;
    categories: Category[];
}

export interface LearnModuleFormData {
    category_id: number | string;
    subcategory_id: number | string;
    title: string;
    topic: string;
    summary: string;
    content: string;
    estimated_minutes: number;
    is_published: boolean;
}
