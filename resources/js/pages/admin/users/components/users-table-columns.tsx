import {
    Activity,
    Lock,
    Unlock,
    Trash2,
    CheckCircle,
    XCircle,
    RotateCcw,
} from 'lucide-react';
import type { TableColumn } from '@/components/domain/admin-table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate } from '@/lib/format-date';
import type { UserItem } from '@/pages/admin/users/user';
import { RoleBadge, StatusBadge, TermsStatusBadge } from './user-badges';

interface UsersTableColumnsProps {
    currentUserId: number;
    onRoleChange: (user: UserItem, role: 'admin' | 'student') => void;
    onStatusToggle: (user: UserItem) => void;
    onDelete: (user: UserItem) => void;
    onRestore: (user: UserItem) => void;
    onForceDelete: (user: UserItem) => void;
    onSelectUser: (user: UserItem) => void;
    selectedUserIds: Set<number>;
    onToggleSelect: (userId: number) => void;
}

export function getUsersTableColumns({
    currentUserId,
    onRoleChange,
    onStatusToggle,
    onDelete,
    onRestore,
    onForceDelete,
    onSelectUser,
    selectedUserIds,
    onToggleSelect,
}: UsersTableColumnsProps): TableColumn<UserItem>[] {
    return [
        {
            header: '',
            className: 'w-10',
            render: (u) => (
                <input
                    type="checkbox"
                    checked={selectedUserIds.has(u.id)}
                    onChange={() => onToggleSelect(u.id)}
                    className="size-4 cursor-pointer rounded border-border"
                />
            ),
        },
        {
            header: 'User ID',
            render: (u) => (
                <span className="font-bold text-muted-foreground">#{u.id}</span>
            ),
        },
        {
            header: 'Profile Details',
            render: (u) => (
                <button
                    onClick={() => onSelectUser(u)}
                    className="cursor-pointer text-left hover:underline"
                >
                    <span className="block text-xs leading-snug font-black text-foreground">
                        {u.name}
                        {u.id === currentUserId && (
                            <span className="ml-1.5 rounded-sm bg-blue-100 px-1 text-[8.5px] font-extrabold text-blue-700 uppercase select-none dark:bg-blue-900/30 dark:text-blue-400">
                                You
                            </span>
                        )}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-normal font-bold text-muted-foreground">
                        {u.email}
                    </span>
                </button>
            ),
        },
        {
            header: 'Role Status',
            render: (u) => <RoleBadge role={u.role} />,
        },
        {
            header: 'Status',
            render: (u) => <StatusBadge user={u} />,
        },
        {
            header: 'Terms Status',
            render: (u) => (
                <TermsStatusBadge
                    termsAcceptedAt={u.terms_accepted_at}
                    formatDate={formatDate}
                />
            ),
        },
        {
            header: 'Last Login',
            render: (u) => (
                <span className="text-[9px] font-bold text-muted-foreground">
                    {formatDate(u.last_login_at)}
                </span>
            ),
        },
        {
            header: 'Mock Attempts',
            render: (u) => (
                <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-blue-500" />
                    <span className="font-black text-foreground">
                        {u.attempts_count}
                    </span>
                </div>
            ),
        },
        {
            header: 'Actions',
            className: 'w-32 text-right',
            render: (u) => {
                const isDeleted = !!u.deleted_at;

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <TooltipProvider delayDuration={150}>
                            {isDeleted ? (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onRestore(u)}
                                                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-emerald-600"
                                            >
                                                <RotateCcw className="size-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Restore account
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onForceDelete(u)}
                                                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Permanently delete
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    {u.role === 'admin' ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() =>
                                                        onRoleChange(
                                                            u,
                                                            'student',
                                                        )
                                                    }
                                                    disabled={
                                                        u.id === currentUserId
                                                    }
                                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Unlock className="size-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Demote to Student
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() =>
                                                        onRoleChange(u, 'admin')
                                                    }
                                                    disabled={
                                                        u.id === currentUserId
                                                    }
                                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Lock className="size-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Promote to Admin
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    onStatusToggle(u)
                                                }
                                                disabled={
                                                    u.id === currentUserId
                                                }
                                                className={`cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 ${
                                                    u.is_active
                                                        ? 'hover:text-amber-600'
                                                        : 'hover:text-emerald-600'
                                                }`}
                                            >
                                                {u.is_active ? (
                                                    <XCircle className="size-4" />
                                                ) : (
                                                    <CheckCircle className="size-4" />
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {u.is_active
                                                ? 'Deactivate account'
                                                : 'Activate account'}
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onDelete(u)}
                                                disabled={
                                                    u.id === currentUserId
                                                }
                                                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Delete account
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];
}
