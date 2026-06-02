import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { UserItem } from '@/pages/admin/users/user';

export function RoleBadge({ role }: { role: 'admin' | 'student' }) {
    if (role === 'admin') {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-indigo-700 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400">
                Admin
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
            Student
        </span>
    );
}

export function StatusBadge({ user }: { user: UserItem }) {
    const isDeleted = !!user.deleted_at;

    if (isDeleted) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-rose-700 uppercase dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                <Trash2 className="size-3" />
                Deleted
            </span>
        );
    }

    return user.is_active ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle className="size-3" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-amber-700 uppercase dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
            <XCircle className="size-3" />
            Inactive
        </span>
    );
}

export function TermsStatusBadge({
    termsAcceptedAt,
    formatDate,
}: {
    termsAcceptedAt?: string | null;
    formatDate: (date: string | null | undefined) => string;
}) {
    if (termsAcceptedAt) {
        return (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="size-3" />
                <span className="text-[9px] font-bold">
                    {formatDate(termsAcceptedAt)}
                </span>
            </div>
        );
    }

    return (
        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
            Pending
        </span>
    );
}
