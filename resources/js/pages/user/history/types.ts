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
    wrong: number;
    total: number;
    category_scores?: CategoryScore[];
    status: string;
    duration: string;
    duration_secs?: number;
    avg_time_per_q?: number;
    created_at: string;
    selected_subcategories?: string[];
    language?: 'English' | 'Filipino' | 'Both';
    question_count?: number | 'all';
    is_timed?: boolean;
}

export interface HistoryStats {
    total_attempts: number;
    total_exams: number;
    total_drills: number;
    avg_score: number;
    exam_avg_score?: number;
    drill_avg_score?: number;
    pass_rate: number;
    total_duration: string;
    exam_duration?: string;
    drill_duration?: string;
    streak: number;
    trend: number;
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
    per_page?: number;
}

export interface HistoryPageProps {
    attempts: Attempt[];
    stats: HistoryStats;
    pagination: Pagination;
    filters: Filters;
}
