export interface Question {
    id: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
    category: string;
    subcategory: string;
    language: string;
    originalOptionIndices?: number[];
    isDemographic?: boolean;
}

export interface Subcategory {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    name: string;
    subcategory: Subcategory[];
}

export interface SavedDrillSet {
    id: number;
    name: string;
    description?: string | null;
    color: string;
    questions_count: number;
    sample_categories?: string[];
    created_at?: string;
}

export interface DrillsProps {
    questions: Question[];
    categories: Category[];
    savedDrillSets?: SavedDrillSet[];
    wrongQuestionIds?: number[];
    seenQuestionIds?: number[];
}
