export interface StudySchedule {
    id: number;
    user_id: number;
    study_date: string;
    study_time?: string;
    title: string;
    description?: string;
    subcategory_id?: number;
    is_done?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Subcategory {
    id: number;
    name: string;
    category_id: number;
}

export interface LearnModule {
    title: string;
    slug: string;
    topic: string;
    subcategory_name?: string;
    category_name?: string;
}

export interface CalendarDay {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    schedules: StudySchedule[];
}

export interface AttachedModule {
    title: string;
    slug: string;
}
