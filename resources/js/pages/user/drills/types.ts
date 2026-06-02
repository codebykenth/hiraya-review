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

export interface DrillsProps {
    questions: Question[];
    categories: Category[];
}
