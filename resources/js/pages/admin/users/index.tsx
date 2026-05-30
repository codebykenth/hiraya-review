import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    Shield,
    Users,
    UserPlus,
    Trash2,
    Activity,
    ChevronDown,
    Filter,
    RotateCcw,
    CheckCircle,
    XCircle,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    CheckSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdvancedFilters } from '@/components/admin/advanced-filters';
import type { FilterState } from '@/components/admin/advanced-filters';
import { UserDetailModal } from '@/components/admin/user-detail-modal';
import type { TableColumn } from '@/components/admin-table';
import { AdminTable } from '@/components/admin-table';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index as adminUsersIndex } from '@/routes/admin/users';

interface UserItem {
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

interface StatsSummary {
    total_users: number;
    total_admins: number;
    total_students: number;
    total_attempts: number;
    terms_accepted_count?: number;
}

interface AdminUsersIndexProps {
    users: UserItem[];
    stats: StatsSummary;
}

export default function AdminUsersIndex({
    users = [],
    stats,
}: AdminUsersIndexProps) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeletedUsers, setShowDeletedUsers] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
        new Set(),
    );
    const [selectedUserModal, setSelectedUserModal] = useState<UserItem | null>(
        null,
    );
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const pageSize = 10;

    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        termsAcceptance: 'all',
        role: 'all',
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Custom confirm/warning modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'success',
        onConfirm: () => {},
    });

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) {
            return 'Never';
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Never';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleRoleChange = (
        user: UserItem,
        targetRole: 'admin' | 'student',
    ) => {
        // Prevent demoting self
        if (user.id === currentUser.id && targetRole !== 'admin') {
            setConfirmModal({
                isOpen: true,
                title: 'Cannot Change Own Role',
                message:
                    'You cannot demote yourself from administrative status. This is to ensure you maintain access to this dashboard.',
                confirmLabel: 'Understood',
                variant: 'info',
                onConfirm: () => {},
            });

            return;
        }

        setConfirmModal({
            isOpen: true,
            title: `Promote to ${targetRole === 'admin' ? 'Administrator' : 'Student'}?`,
            message: `Are you sure you want to change "${user.name}"'s role to ${targetRole === 'admin' ? 'Administrator' : 'Student'}?`,
            confirmLabel: 'Confirm Role Update',
            variant: targetRole === 'admin' ? 'success' : 'danger',
            onConfirm: () => {
                router.put(
                    `/admin/users/${user.id}`,
                    {
                        role: targetRole,
                    },
                    {
                        preserveScroll: true,
                    },
                );
            },
        });
    };

    const handleDeleteUser = (user: UserItem) => {
        // Prevent deleting self
        if (user.id === currentUser.id) {
            setConfirmModal({
                isOpen: true,
                title: 'Cannot Delete Own Account',
                message:
                    'You cannot delete the active administrator account you are currently logged into.',
                confirmLabel: 'Understood',
                variant: 'info',
                onConfirm: () => {},
            });

            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Delete User Account?',
            message: `This will soft-delete the account for "${user.name}" (${user.email}). The account data will be preserved but hidden from the system.`,
            confirmLabel: 'Delete Account',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/admin/users/${user.id}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    const handleBulkDelete = () => {
        const count = selectedUserIds.size;
        setConfirmModal({
            isOpen: true,
            title: 'Bulk Delete Users?',
            message: `This will soft-delete ${count} user account${count !== 1 ? 's' : ''}. The account data will be preserved but hidden from the system.`,
            confirmLabel: 'Delete Accounts',
            variant: 'danger',
            onConfirm: async () => {
                setBulkActionLoading(true);

                try {
                    await Promise.all(
                        Array.from(selectedUserIds).map((userId) =>
                            router.delete(`/admin/users/${userId}`, {
                                preserveScroll: true,
                            }),
                        ),
                    );
                    setSelectedUserIds(new Set());
                } finally {
                    setBulkActionLoading(false);
                }
            },
        });
    };

    const handleToggleStatus = (user: UserItem) => {
        const newStatus = !user.is_active;
        const action = newStatus ? 'activate' : 'deactivate';

        setConfirmModal({
            isOpen: true,
            title: `${newStatus ? 'Activate' : 'Deactivate'} User?`,
            message: `Are you sure you want to ${action} "${user.name}"'s account? They will ${newStatus ? 'be able to' : 'not be able to'} access the platform.`,
            confirmLabel: `${newStatus ? 'Activate' : 'Deactivate'} Account`,
            variant: newStatus ? 'success' : 'danger',
            onConfirm: () => {
                router.put(
                    `/admin/users/${user.id}`,
                    { is_active: newStatus },
                    { preserveScroll: true },
                );
            },
        });
    };

    const handleBulkToggleStatus = (activate: boolean) => {
        const count = selectedUserIds.size;
        const action = activate ? 'activate' : 'deactivate';
        setConfirmModal({
            isOpen: true,
            title: `Bulk ${activate ? 'Activate' : 'Deactivate'} Users?`,
            message: `This will ${action} ${count} user account${count !== 1 ? 's' : ''}.`,
            confirmLabel: `${activate ? 'Activate' : 'Deactivate'} Accounts`,
            variant: 'success',
            onConfirm: async () => {
                setBulkActionLoading(true);

                try {
                    await Promise.all(
                        Array.from(selectedUserIds).map((userId) =>
                            router.put(
                                `/admin/users/${userId}`,
                                { is_active: activate },
                                { preserveScroll: true },
                            ),
                        ),
                    );
                    setSelectedUserIds(new Set());
                } finally {
                    setBulkActionLoading(false);
                }
            },
        });
    };

    const toggleSelectUser = (userId: number) => {
        const newSelected = new Set(selectedUserIds);

        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }

        setSelectedUserIds(newSelected);
    };

    // Filter users
    const filteredUsers = users.filter((u) => {
        // Apply search filter
        const matchesSearch =
            u.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            String(u.id).includes(debouncedSearchTerm);

        // Apply role filter
        const matchesRole =
            selectedRole === 'All Roles' ||
            (selectedRole === 'Admins' && u.role === 'admin') ||
            (selectedRole === 'Students' && u.role === 'student');

        // Apply deleted filter
        const isDeleted = !!u.deleted_at;
        const matchesDeletedFilter = showDeletedUsers === isDeleted;

        // Apply advanced filters
        let matchesAdvancedFilters = true;

        if (filters.status !== 'all') {
            if (filters.status === 'deleted') {
                matchesAdvancedFilters = isDeleted;
            } else if (filters.status === 'active') {
                matchesAdvancedFilters = !isDeleted && u.is_active;
            } else if (filters.status === 'inactive') {
                matchesAdvancedFilters = !isDeleted && !u.is_active;
            }
        }

        if (filters.termsAcceptance !== 'all') {
            const hasAcceptedTerms = !!u.terms_accepted_at;

            if (filters.termsAcceptance === 'accepted') {
                matchesAdvancedFilters =
                    matchesAdvancedFilters && hasAcceptedTerms;
            } else if (filters.termsAcceptance === 'pending') {
                matchesAdvancedFilters =
                    matchesAdvancedFilters && !hasAcceptedTerms;
            }
        }

        if (filters.role !== 'all') {
            matchesAdvancedFilters =
                matchesAdvancedFilters &&
                ((filters.role === 'admin' && u.role === 'admin') ||
                    (filters.role === 'student' && u.role === 'student'));
        }

        if (filters.registrationDateFrom) {
            const from = new Date(filters.registrationDateFrom);
            const created = new Date(u.created_at);
            matchesAdvancedFilters = matchesAdvancedFilters && created >= from;
        }

        if (filters.registrationDateTo) {
            const to = new Date(filters.registrationDateTo);
            to.setHours(23, 59, 59, 999);
            const created = new Date(u.created_at);
            matchesAdvancedFilters = matchesAdvancedFilters && created <= to;
        }

        if (filters.lastLoginFrom && u.last_login_at) {
            const from = new Date(filters.lastLoginFrom);
            const lastLogin = new Date(u.last_login_at);
            matchesAdvancedFilters =
                matchesAdvancedFilters && lastLogin >= from;
        }

        if (filters.lastLoginTo && u.last_login_at) {
            const to = new Date(filters.lastLoginTo);
            to.setHours(23, 59, 59, 999);
            const lastLogin = new Date(u.last_login_at);
            matchesAdvancedFilters = matchesAdvancedFilters && lastLogin <= to;
        }

        if (
            filters.attemptsMin !== undefined &&
            u.attempts_count < filters.attemptsMin
        ) {
            matchesAdvancedFilters = false;
        }

        if (
            filters.attemptsMax !== undefined &&
            u.attempts_count > filters.attemptsMax
        ) {
            matchesAdvancedFilters = false;
        }

        return (
            matchesSearch &&
            matchesRole &&
            matchesDeletedFilter &&
            matchesAdvancedFilters
        );
    });

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + pageSize,
    );

    const complianceRate =
        stats.total_users > 0
            ? Math.round(
                  ((stats.terms_accepted_count || 0) / stats.total_users) * 100,
              )
            : 0;

    const columns: TableColumn<UserItem>[] = [
        {
            header: '',
            className: 'w-10',
            render: (u) => (
                <input
                    type="checkbox"
                    checked={selectedUserIds.has(u.id)}
                    onChange={() => toggleSelectUser(u.id)}
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
                    onClick={() => setSelectedUserModal(u)}
                    className="cursor-pointer text-left hover:underline"
                >
                    <span className="block text-xs leading-snug font-black text-foreground">
                        {u.name}
                        {u.id === currentUser.id && (
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
            render: (u) =>
                u.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-indigo-700 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400">
                        Admin
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                        Student
                    </span>
                ),
        },
        {
            header: 'Status',
            render: (u) => {
                const isDeleted = !!u.deleted_at;

                if (isDeleted) {
                    return (
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-rose-700 uppercase dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                            <Trash2 className="size-3" />
                            Deleted
                        </span>
                    );
                }

                return u.is_active ? (
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
            },
        },
        {
            header: 'Terms Status',
            render: (u) =>
                u.terms_accepted_at ? (
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="size-3" />
                        <span className="text-[9px] font-bold">
                            {formatDate(u.terms_accepted_at)}
                        </span>
                    </div>
                ) : (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                        Pending
                    </span>
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
                        {isDeleted ? (
                            <>
                                <button
                                    onClick={() => {
                                        setConfirmModal({
                                            isOpen: true,
                                            title: 'Restore User Account?',
                                            message: `Restore ${u.name}'s account?`,
                                            confirmLabel: 'Restore',
                                            variant: 'success',
                                            onConfirm: () => {
                                                router.post(
                                                    `/admin/users/${u.id}/restore`,
                                                    {},
                                                    { preserveScroll: true },
                                                );
                                            },
                                        });
                                    }}
                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-emerald-600"
                                    title="Restore account"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setConfirmModal({
                                            isOpen: true,
                                            title: 'Permanently Delete Account?',
                                            message:
                                                'This will permanently delete this account. Cannot be undone!',
                                            confirmLabel: 'Delete',
                                            variant: 'danger',
                                            onConfirm: () => {
                                                router.post(
                                                    `/admin/users/${u.id}/force-delete`,
                                                    {},
                                                    { preserveScroll: true },
                                                );
                                            },
                                        });
                                    }}
                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600"
                                    title="Permanently delete"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                {u.role === 'admin' ? (
                                    <button
                                        onClick={() =>
                                            handleRoleChange(u, 'student')
                                        }
                                        disabled={u.id === currentUser.id}
                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-30"
                                        title="Demote to Student"
                                    >
                                        <Unlock className="size-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleRoleChange(u, 'admin')
                                        }
                                        disabled={u.id === currentUser.id}
                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                                        title="Promote to Admin"
                                    >
                                        <Lock className="size-4" />
                                    </button>
                                )}

                                <button
                                    onClick={() => handleToggleStatus(u)}
                                    disabled={u.id === currentUser.id}
                                    className={`cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 ${
                                        u.is_active
                                            ? 'hover:text-amber-600'
                                            : 'hover:text-emerald-600'
                                    }`}
                                    title={
                                        u.is_active
                                            ? 'Deactivate account'
                                            : 'Activate account'
                                    }
                                >
                                    {u.is_active ? (
                                        <XCircle className="size-4" />
                                    ) : (
                                        <CheckCircle className="size-4" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={u.id === currentUser.id}
                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                    title="Delete account"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="User Management" />

            <PageContainer>
                {/* 1. METRICS DASHBOARD CARDS */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Registered */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
                        <div className="pointer-events-none absolute right-0 bottom-0 opacity-10">
                            <Users className="size-24 text-slate-300 dark:text-slate-800" />
                        </div>
                        <div className="z-10 flex items-center gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                    Total Users
                                </span>
                                <h3 className="mt-0.5 text-xl font-black text-foreground">
                                    {stats.total_users}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Admin */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
                        <div className="pointer-events-none absolute right-0 bottom-0 opacity-10">
                            <Shield className="size-24 text-indigo-300 dark:text-indigo-900" />
                        </div>
                        <div className="z-10 flex items-center gap-4">
                            <div className="text-indigo-650 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100/30 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400">
                                <Shield className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-wider text-indigo-400 uppercase">
                                    Admin
                                </span>
                                <h3 className="mt-0.5 text-xl font-black text-foreground">
                                    {stats.total_admins}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Students */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
                        <div className="pointer-events-none absolute right-0 bottom-0 opacity-10">
                            <UserPlus className="size-24 text-emerald-300 dark:text-emerald-900" />
                        </div>
                        <div className="z-10 flex items-center gap-4">
                            <div className="text-emerald-650 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100/30 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <UserPlus className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase">
                                    Students
                                </span>
                                <h3 className="mt-0.5 text-xl font-black text-foreground">
                                    {stats.total_students}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Rate */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
                        <div className="pointer-events-none absolute right-0 bottom-0 opacity-10">
                            <CheckCircle className="size-24 text-blue-300 dark:text-blue-900" />
                        </div>
                        <div className="z-10 flex items-center gap-4">
                            <div className="text-blue-650 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100/30 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400">
                                <CheckCircle className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-wider text-blue-400 uppercase">
                                    Compliance Rate
                                </span>
                                <h3 className="mt-0.5 text-xl font-black text-foreground">
                                    {complianceRate}%
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SEARCH & FILTER PANEL */}
                <div className="shadow-3xs flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full flex-1 items-center gap-2 md:max-w-2xl">
                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search users by name, email, or ID..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-2.5">
                        <div className="relative min-w-0 md:min-w-[145px]">
                            <select
                                value={selectedRole}
                                onChange={(e) => {
                                    setSelectedRole(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option value="All Roles">All Roles</option>
                                <option value="Admins">Administrators</option>
                                <option value="Students">Students</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-slate-500" />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFiltersModal(true)}
                            className="gap-1.5"
                        >
                            <Filter className="size-3.5" />
                            Filters
                        </Button>

                        <Button
                            variant={showDeletedUsers ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setShowDeletedUsers(!showDeletedUsers);
                                setCurrentPage(1);
                            }}
                            className="gap-1.5"
                        >
                            {showDeletedUsers ? (
                                <>
                                    <Eye className="size-3.5" />
                                    Show Active
                                </>
                            ) : (
                                <>
                                    <EyeOff className="size-3.5" />
                                    Show Deleted
                                </>
                            )}
                        </Button>

                        <span className="mt-1 block shrink-0 pl-1 text-right text-xs font-bold text-muted-foreground md:mt-0 md:text-left">
                            {filteredUsers.length === 0
                                ? 'No matches'
                                : `${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'}`}
                        </span>
                    </div>
                </div>

                {/* 2.5. BULK ACTIONS PANEL */}
                {selectedUserIds.size > 0 && (
                    <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/30 dark:bg-blue-950/20">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="size-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {selectedUserIds.size} user
                                {selectedUserIds.size !== 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserIds(new Set())}
                                className="text-xs"
                            >
                                Deselect All
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleBulkToggleStatus(true)}
                                disabled={bulkActionLoading}
                                className="gap-1.5 text-xs"
                            >
                                <CheckCircle className="size-3" />
                                Activate
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleBulkToggleStatus(false)}
                                disabled={bulkActionLoading}
                                className="gap-1.5 text-xs"
                            >
                                <XCircle className="size-3" />
                                Deactivate
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={bulkActionLoading}
                                className="gap-1.5 text-xs"
                            >
                                <Trash2 className="size-3" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                )}

                {/* 3. MAIN USER DATATABLE */}
                <AdminTable
                    data={paginatedUsers}
                    columns={columns}
                    title="User Account Catalog"
                    legend={[
                        {
                            icon: Lock,
                            label: 'Promote to Admin',
                            variant: 'indigo',
                        },
                        {
                            icon: Unlock,
                            label: 'Demote to Student',
                            variant: 'emerald',
                        },
                        {
                            icon: CheckCircle,
                            label: 'Activate/Deactivate User',
                            variant: 'amber',
                        },
                        {
                            icon: Trash2,
                            label: 'Delete Account',
                            variant: 'rose',
                        },
                    ]}
                    emptyState={{
                        icon: Users,
                        title: 'No Users Found',
                        description:
                            "We couldn't find any registered accounts matching your active search parameter filters.",
                    }}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    onPageChange={setCurrentPage}
                />
            </PageContainer>

            {/* User Detail Modal */}
            <UserDetailModal
                isOpen={!!selectedUserModal}
                user={selectedUserModal || undefined}
                currentUserId={currentUser.id}
                onClose={() => setSelectedUserModal(null)}
            />

            {/* Advanced Filters Modal */}
            <AdvancedFilters
                isOpen={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                }}
                currentFilters={filters}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={confirmModal.onConfirm}
            />
        </>
    );
}

// Breadcrumb navigation configuration using Laravel Wayfinder route urls
AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: adminUsersIndex().url,
        },
    ],
};
