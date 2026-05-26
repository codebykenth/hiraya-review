import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Search, 
    Shield, 
    Users, 
    UserPlus, 
    Trash2, 
    ShieldAlert, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    ChevronDown,
    Activity,
    Calendar,
    HelpCircle,
    CheckCircle2
} from 'lucide-react';
import { 
    index as adminUsersIndex,
    update as adminUsersUpdate,
    destroy as adminUsersDestroy
} from '@/routes/admin/users';
import { ConfirmModal } from '@/components/confirm-modal';
import { AdminTable, TableColumn } from '@/components/admin-table';

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

export default function AdminUsersIndex({ users = [], stats }: AdminUsersIndexProps) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Reset pagination when searching or filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedRole]);

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

    const handleRoleChange = (user: UserItem, targetRole: 'admin' | 'student') => {
        // Prevent demoting self
        if (user.id === currentUser.id && targetRole !== 'admin') {
            setConfirmModal({
                isOpen: true,
                title: 'Cannot Change Own Role',
                message: 'You cannot demote yourself from administrative status. This is to ensure you maintain access to this dashboard.',
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
                router.put(`/admin/users/${user.id}`, {
                    role: targetRole
                }, {
                    preserveScroll: true
                });
            }
        });
    };

    const handleDeleteUser = (user: UserItem) => {
        // Prevent deleting self
        if (user.id === currentUser.id) {
            setConfirmModal({
                isOpen: true,
                title: 'Cannot Delete Own Account',
                message: 'You cannot delete the active administrator account you are currently logged into.',
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
                    preserveScroll: true
                });
            }
        });
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch = 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(u.id).includes(searchTerm);

        const matchesRole = 
            selectedRole === 'All Roles' || 
            (selectedRole === 'Admins' && u.role === 'admin') || 
            (selectedRole === 'Students' && u.role === 'student');

        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    const columns: TableColumn<UserItem>[] = [
        {
            header: 'User ID',
            render: (u) => <span className="font-bold text-slate-550">#{u.id}</span>
        },
        {
            header: 'Profile Details',
            render: (u) => (
                <>
                    <span className="block text-xs font-black text-slate-855 dark:text-white leading-snug">
                        {u.name}
                        {u.id === currentUser.id && (
                            <span className="ml-1.5 rounded-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[8.5px] px-1 font-extrabold uppercase select-none">You</span>
                        )}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold text-slate-400 leading-normal">{u.email}</span>
                </>
            )
        },
        {
            header: 'Role Status',
            render: (u) => u.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30 border border-indigo-100 uppercase tracking-wide">
                    Admin
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 border border-emerald-100 uppercase tracking-wide">
                    Student
                </span>
            )
        },
        {
            header: 'Registration Date',
            render: (u) => (
                <div className="flex items-center gap-1 text-slate-500 font-bold">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span>{u.created_at}</span>
                </div>
            )
        },
        {
            header: 'Mock attempts',
            render: (u) => (
                <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-blue-500" />
                    <span className="text-slate-800 font-black dark:text-white">{u.attempts_count}</span>
                    <span className="text-[10px] text-slate-400 font-medium">exams</span>
                </div>
            )
        },
        {
            header: 'Actions',
            className: 'w-28 text-right',
            render: (u) => (
                <div className="flex items-center justify-end gap-1.5">
                    {u.role === 'admin' ? (
                        <button
                            onClick={() => handleRoleChange(u, 'student')}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-emerald-650 dark:hover:bg-slate-900 transition cursor-pointer"
                            title="Demote to Student"
                        >
                            <UserPlus className="size-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleRoleChange(u, 'admin')}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-650 dark:hover:bg-slate-900 transition cursor-pointer"
                            title="Promote to Admin"
                        >
                            <Shield className="size-4" />
                        </button>
                    )}
                    
                    <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={u.id === currentUser.id}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-red-655 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete account"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/30 p-6">
                
                {/* 1. METRICS DASHBOARD CARDS */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Registered */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-850 dark:bg-slate-950">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Users className="size-24 text-slate-300 dark:text-slate-800" />
                        </div>
                        <div className="flex gap-4 items-center z-10">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-650 dark:bg-slate-900 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Users</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total_users}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Admin */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-indigo-50 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-850 dark:bg-slate-950">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Shield className="size-24 text-indigo-300 dark:text-indigo-900" />
                        </div>
                        <div className="flex gap-4 items-center z-10">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/30">
                                <Shield className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Admin</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total_admins}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Students */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-emerald-50 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-850 dark:bg-slate-950">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <UserPlus className="size-24 text-emerald-300 dark:text-emerald-900" />
                        </div>
                        <div className="flex gap-4 items-center z-10">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/30">
                                <UserPlus className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Students</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total_students}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Exam Attempts */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-blue-50 bg-white p-5 shadow-xs hover:shadow-md transition dark:border-slate-850 dark:bg-slate-950">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Activity className="size-24 text-blue-300 dark:text-blue-900" />
                        </div>
                        <div className="flex gap-4 items-center z-10">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/30">
                                <Activity className="size-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Total Attempts</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total_attempts}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SEARCH & FILTER PANEL */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-slate-150 bg-white p-4 shadow-3xs dark:border-slate-850 dark:bg-slate-950">
                    <div className="flex flex-1 items-center gap-2 w-full md:max-w-2xl">
                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users by name, email, or ID..."
                                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-855 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:w-auto md:gap-2.5">
                        <div className="relative min-w-0 md:min-w-[145px]">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                                <option value="All Roles">All Roles</option>
                                <option value="Admins">Administrators</option>
                                <option value="Students">Students</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                        </div>

                        <span className="text-xs font-bold text-slate-550 shrink-0 pl-1 text-right md:text-left block mt-1 md:mt-0 dark:text-slate-400">
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
                        { icon: Shield, label: 'Promote to Admin', variant: 'indigo' },
                        { icon: UserPlus, label: 'Demote to Student', variant: 'emerald' },
                        { icon: Trash2, label: 'Delete Account', variant: 'rose' }
                    ]}
                    emptyState={{
                        icon: Users,
                        title: 'No Users Found',
                        description: "We couldn't find any registered accounts matching your active search parameter filters."
                    }}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Custom confirm/warning Dialog matching Learn Curation global visual standard */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
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
