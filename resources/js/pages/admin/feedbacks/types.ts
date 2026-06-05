interface User {
    id: number;
    name: string;
    email: string;
}

interface Flaggable {
    id: number;
    question_text?: string;
    title?: string;
    options?: string[];
}

interface Feedback {
    id: number;
    user_id: number;
    flaggable_id: number;
    flaggable_type: string;
    reason: string;
    details: string | null;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    user: User;
    flaggable: Flaggable | null;
}

interface FeedbacksProps {
    feedbacks: {
        data: Feedback[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export type { User, Flaggable, Feedback, FeedbacksProps };
