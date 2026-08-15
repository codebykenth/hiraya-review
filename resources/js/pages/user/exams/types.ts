export interface Question {
    id: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
    category: string;
    subcategory: string;
    originalOptionIndices?: number[];
    isDemographic?: boolean;
    language?: string;
}

export interface CategoryItem {
    id: number;
    name: string;
    subcategory?: { id: number; name: string }[];
}

export interface SimulationDetails {
    title: string;
    totalItems: number;
    scoredItems: number;
    timeLimit: string;
    timeLimitSecs: number;
    targetPace: string;
    allowedCategories: string[];
}

export interface CategoryScore {
    correct: number;
    total: number;
    subcats: Record<string, { correct: number; total: number }>;
}

export interface AttemptMetadata {
    track: 'Professional' | 'Subprofessional' | 'Drill';
    category_name?: string;
    correct_count?: number;
    total_questions?: number;
    skipped_count?: number;
    duration_secs?: number;
    is_timed?: boolean;
    question_times?: Record<number, number>;
    answer_changes?: Record<number, number>;
    selected_subcategories?: string[];
    language?: string;
    question_count?: number | 'all';
}

export interface SavedAttempt {
    id: number;
    category_id: number | null;
    question_ids: number[];
    answers: Record<number, number>;
    cat_scores: {
        categoryScoreMap?: Record<string, CategoryScore>;
        flagged?: Record<number, boolean>;
        metadata?: AttemptMetadata;
    };
    created_at?: string;
}

export interface RetakeSource {
    attempt_id: number;
    question_ids: number[];
    track: 'Professional' | 'Subprofessional' | 'Drill';
    mode: 'same' | 'fresh';
}

export interface AiAnalysisResult {
    status: 'no_data' | 'ready' | 'error';
    data: Record<string, unknown> | null;
}

export type ReviewStatusFilter = 'all' | 'correct' | 'incorrect' | 'flagged';
export type LiveStatusFilter = 'all' | 'unanswered' | 'answered' | 'flagged';

export interface ExamIndexProps {
    questions?: Question[];
    categories?: CategoryItem[];
    savedAttempt?: SavedAttempt | null;
    retakeSource?: RetakeSource | null;
    seenQuestionIdsByTrack?: {
        Professional: number[];
        Subprofessional: number[];
        Drill: number[];
    };
    wrongQuestionIdsByTrack?: {
        Professional: number[];
        Subprofessional: number[];
        Drill: number[];
    };
    aiAnalysis?: AiAnalysisResult;
}

export interface ExamResults {
    score: number;
    total: number;
    percentage: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    categoryScoreMap: Record<string, CategoryScore>;
    elapsedSecs: number;
    cat_scores?: SavedAttempt['cat_scores'];
}

