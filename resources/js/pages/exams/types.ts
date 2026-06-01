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

export interface ExamIndexProps {
    questions?: Question[];
    categories?: CategoryItem[];
    savedAttempt?: any;
    retakeSource?: any;
    seenQuestionIdsByTrack?: {
        Professional: number[];
        Subprofessional: number[];
        Drill: number[];
    };
}

export interface ExamResults {
    score: number;
    total: number;
    percentage: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    categoryScoreMap: Record<
        string,
        {
            correct: number;
            total: number;
            subcats: Record<string, { correct: number; total: number }>;
        }
    >;
    elapsedSecs: number;
}
