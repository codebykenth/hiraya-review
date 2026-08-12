export interface Metrics {
    total_questions: number;
    active_questions: number;
    draft_questions: number;
    total_categories: number;
    total_subcategories: number;
    total_examinees: number;
    total_attempts: number;
    total_mock_exams?: number;
    total_drills?: number;
    track_configs: number;
}

export interface RecentAttempt {
    id: number;
    user: {
        name: string;
        email: string;
    };
    category: string;
    percentage: number;
    created_at: string;
}

export interface CategoryStat {
    id: number;
    name: string;
    question_count: number;
}

export interface TrackItem {
    id: number;
    track: string;
    category: string;
    item_count: number;
    time_limit: string;
}

export interface AdminDashboardProps {
    metrics: Metrics;
    recentAttempts: RecentAttempt[];
    categoriesStats: CategoryStat[];
    tracks: TrackItem[];
}
