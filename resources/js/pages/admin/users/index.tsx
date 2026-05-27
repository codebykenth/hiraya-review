import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    Shield,
    Users,
    UserPlus,
    Trash2,
    Calendar,
    Activity,
    ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { TableColumn } from '@/components/admin-table';
import { AdminTable } from '@/components/admin-table';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { Input } from '@/components/ui/input';
import { index as adminUsersIndex } from '@/routes/admin/users';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    attempts_count: number;
}

interface StatsSummary {
    total_users: number;
    total_admins: number;
    total_students: number;
    total_attempts: number;
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
    const pageSize = 10;

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
            title: 'Permanently Delete User?',
            message: `Warning: This will permanently delete the user account for "${user.name}" (${user.email}). All mock exam attempt history and statistics linked to this user will be permanently destroyed. This action cannot be undone!`,
            confirmLabel: 'Delete Account',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/admin/users/${user.id}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            String(u.id).includes(debouncedSearchTerm);

        const matchesRole =
            selectedRole === 'All Roles' ||
            (selectedRole === 'Admins' && u.role === 'admin') ||
            (selectedRole === 'Students' && u.role === 'student');

        return matchesSearch && matchesRole;
    });

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + pageSize,
    );

    const columns: TableColumn<UserItem>[] = [
        {
            header: 'User ID',
            render: (u) => (
                <span className="font-bold text-muted-foreground">#{u.id}</span>
            ),
        },
        {
            header: 'Profile Details',
            render: (u) => (
                <>
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
                </>
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
            header: 'Registration Date',
            render: (u) => (
                <div className="flex items-center gap-1 font-bold text-muted-foreground">
                    <Calendar className="size-3.5 text-muted-foreground/80" />
                    <span>{u.created_at}</span>
                </div>
            ),
        },
        {
            header: 'Mock attempts',
            render: (u) => (
                <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-blue-500" />
                    <span className="font-black text-foreground">
                        {u.attempts_count}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                        exams
                    </span>
                </div>
            ),
        },
        {
            header: 'Actions',
            className: 'w-28 text-right',
            render: (u) => (
                <div className="flex items-center justify-end gap-1.5">
                    {u.role === 'admin' ? (
                        <button
                            onClick={() => handleRoleChange(u, 'student')}
                            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-emerald-600"
                            title="Demote to Student"
                        >
                            <UserPlus className="size-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleRoleChange(u, 'admin')}
                            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-indigo-600"
                            title="Promote to Admin"
                        >
                            <Shield className="size-4" />
                        </button>
                    )}

                    <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={u.id === currentUser.id}
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Delete account"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            ),
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

                    {/* Exam Attempts */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md">
                        <div className="pointer-events-none absolute right-0 bottom-0 opacity-10">
                            <Activity className="size-24 text-blue-300 dark:text-blue-900" />
                        </div>
                        <div className="z-10 flex items-center gap-4">
                            <div className="text-blue-650 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100/30 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400">
                                <Activity className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-wider text-blue-400 uppercase">
                                    Total Attempts
                                </span>
                                <h3 className="mt-0.5 text-xl font-black text-foreground">
                                    {stats.total_attempts}
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

                        <span className="mt-1 block shrink-0 pl-1 text-right text-xs font-bold text-muted-foreground md:mt-0 md:text-left">
                            {filteredUsers.length === 0
                                ? 'No matches'
                                : `${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'}`}
                        </span>
                    </div>
                </div>

                {/* 3. MAIN USER DATATABLE */}
                <AdminTable
                    data={paginatedUsers}
                    columns={columns}
                    title="User Account Catalog"
                    legend={[
                        {
                            icon: Shield,
                            label: 'Promote to Admin',
                            variant: 'indigo',
                        },
                        {
                            icon: UserPlus,
                            label: 'Demote to Student',
                            variant: 'emerald',
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

            {/* Custom confirm/warning Dialog matching Learn Curation global visual standard */}
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
