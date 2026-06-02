export interface CategoryScore {
    name: string;
    correct: number;
    total: number;
    percentage: number;
}

export interface Attempt {
    id: number;
    category_id: number | null;
    date: string;
    time: string;
    track: string;
    category: string;
    score: number;
    correct: number;
    total: number;
    category_scores?: CategoryScore[];
    status: string;
    duration: string;
    created_at: string;
    selected_subcategories?: string[];
    language?: 'English' | 'Filipino' | 'Both';
    question_count?: number | 'all';
    is_timed?: boolean;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface Filters {
    search: string;
    track: string;
    date: string;
}

export interface HistoryPageProps {
    attempts: Attempt[];
    pagination: Pagination;
    filters: Filters;
}
