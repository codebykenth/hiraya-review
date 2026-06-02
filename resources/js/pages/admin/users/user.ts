export interface UserItem {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'student';
    created_at: string;
    attempts_count: number;
    is_active: boolean;
    deleted_at?: string | null;
    terms_accepted_at?: string | null;
    last_login_at?: string | null;
}

export interface StatsSummary {
    total_users: number;
    total_admins: number;
    total_students: number;
    total_attempts: number;
    total_terms_accepted?: number;
}

export interface AdminUsersIndexProps {
    users: UserItem[];
    stats: StatsSummary;
}
