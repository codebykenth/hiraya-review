export interface LearnModule {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string;
    estimated_minutes: number;
    category: string;
    subcategory: string;
    is_completed?: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    subcategory: { id: number; name: string; slug: string }[];
}

export interface LearnIndexProps {
    modules: LearnModule[];
    categories: Category[];
}

export interface LearnShowProps {
    module: {
        id: number;
        title: string;
        slug: string;
        topic: string;
        summary: string;
        content: string;
        estimated_minutes: number;
        is_published: boolean;
        category: string;
        subcategory: string;
        creator_name: string;
        updated_at: string;
        is_completed?: boolean;
    };
    recommended: {
        title: string;
        slug: string;
        estimated_minutes: number;
    }[];
}
