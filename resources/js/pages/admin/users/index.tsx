import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    ChevronDown,
    Filter,
    Eye,
    EyeOff,
    CheckSquare,
    CheckCircle,
    XCircle,
    Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminTable } from '@/components/admin-table';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { UserItem, AdminUsersIndexProps } from '@/pages/admin/users/user';
import { index as adminUsersIndex } from '@/routes/admin/users';
import type { FilterState } from './components/advanced-filters';
import { AdvancedFilters } from './components/advanced-filters';
import { UserDetailModal } from './components/user-detail-modal';
import { UsersStatsGrid } from './components/users-stats-grid';
import { getUsersTableColumns } from './components/users-table-columns';
import { useUserFilters } from './hooks/use-user-filters';

const pageSize = 10;

export default function AdminUsersIndex({
    users = [],
    stats,
}: AdminUsersIndexProps) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const { modal, open, close, confirm } = useConfirmModal();
    const { selectedIds, toggleSelect, deselectAll } = useBulkSelection();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeletedUsers, setShowDeletedUsers] = useState(false);
    const [selectedUserModal, setSelectedUserModal] = useState<UserItem | null>(
        null,
    );
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

    const filteredUsers = useUserFilters({
        users,
        searchTerm: debouncedSearchTerm,
        selectedRole,
        showDeletedUsers,
        filters,
    });

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + pageSize,
    );

    const handleRoleChange = (
        user: UserItem,
        targetRole: 'admin' | 'student',
    ) => {
        if (user.id === currentUser.id && targetRole !== 'admin') {
            open(
                'Cannot Change Own Role',
                'You cannot demote yourself from administrative status. This is to ensure you maintain access to this dashboard.',
                'Understood',
                () => {},
                'info',
            );

            return;
        }

        open(
            `Promote to ${targetRole === 'admin' ? 'Administrator' : 'Student'}?`,
            `Are you sure you want to change "${user.name}"'s role to ${targetRole === 'admin' ? 'Administrator' : 'Student'}?`,
            'Confirm Role Update',
            () => {
                router.put(
                    `/admin/users/${user.id}`,
                    { role: targetRole },
                    { preserveScroll: true },
                );
            },
            targetRole === 'admin' ? 'success' : 'danger',
        );
    };

    const handleDeleteUser = (user: UserItem) => {
        if (user.id === currentUser.id) {
            open(
                'Cannot Delete Own Account',
                'You cannot delete the active administrator account you are currently logged into.',
                'Understood',
                () => {},
                'info',
            );

            return;
        }

        open(
            'Delete User Account?',
            `This will soft-delete the account for "${user.name}" (${user.email}). The account data will be preserved but hidden from the system.`,
            'Delete Account',
            () => {
                router.delete(`/admin/users/${user.id}`, {
                    preserveScroll: true,
                });
            },
            'danger',
        );
    };

    const handleBulkDelete = () => {
        const count = selectedIds.size;
        open(
            'Bulk Delete Users?',
            `This will soft-delete ${count} user account${count !== 1 ? 's' : ''}. The account data will be preserved but hidden from the system.`,
            'Delete Accounts',
            async () => {
                setBulkActionLoading(true);

                try {
                    await Promise.all(
                        Array.from(selectedIds).map((userId) =>
                            router.delete(`/admin/users/${userId}`, {
                                preserveScroll: true,
                            }),
                        ),
                    );
                    deselectAll();
                } finally {
                    setBulkActionLoading(false);
                }
            },
            'danger',
        );
    };

    const handleToggleStatus = (user: UserItem) => {
        const newStatus = !user.is_active;
        const action = newStatus ? 'activate' : 'deactivate';

        open(
            `${newStatus ? 'Activate' : 'Deactivate'} User?`,
            `Are you sure you want to ${action} "${user.name}"'s account? They will ${newStatus ? 'be able to' : 'not be able to'} access the platform.`,
            `${newStatus ? 'Activate' : 'Deactivate'} Account`,
            () => {
                router.put(
                    `/admin/users/${user.id}`,
                    { is_active: newStatus },
                    { preserveScroll: true },
                );
            },
            newStatus ? 'success' : 'danger',
        );
    };

    const handleBulkToggleStatus = (activate: boolean) => {
        const count = selectedIds.size;
        const action = activate ? 'activate' : 'deactivate';

        open(
            `Bulk ${activate ? 'Activate' : 'Deactivate'} Users?`,
            `This will ${action} ${count} user account${count !== 1 ? 's' : ''}.`,
            `${activate ? 'Activate' : 'Deactivate'} Accounts`,
            async () => {
                setBulkActionLoading(true);

                try {
                    await Promise.all(
                        Array.from(selectedIds).map((userId) =>
                            router.put(
                                `/admin/users/${userId}`,
                                { is_active: activate },
                                { preserveScroll: true },
                            ),
                        ),
                    );
                    deselectAll();
                } finally {
                    setBulkActionLoading(false);
                }
            },
            'success',
        );
    };

    const handleRestore = (user: UserItem) => {
        open(
            'Restore User Account?',
            `Restore ${user.name}'s account?`,
            'Restore',
            () => {
                router.post(
                    `/admin/users/${user.id}/restore`,
                    {},
                    { preserveScroll: true },
                );
            },
            'success',
        );
    };

    const handleForceDelete = (user: UserItem) => {
        open(
            'Permanently Delete Account?',
            'This will permanently delete this account. Cannot be undone!',
            'Delete',
            () => {
                router.post(
                    `/admin/users/${user.id}/force-delete`,
                    {},
                    { preserveScroll: true },
                );
            },
            'danger',
        );
    };

    const columns = getUsersTableColumns({
        currentUserId: currentUser.id,
        onRoleChange: handleRoleChange,
        onStatusToggle: handleToggleStatus,
        onDelete: handleDeleteUser,
        onRestore: handleRestore,
        onForceDelete: handleForceDelete,
        onSelectUser: setSelectedUserModal,
        selectedUserIds: selectedIds,
        onToggleSelect: toggleSelect,
    });

    return (
        <>
            <Head title="Users" />

            <PageContainer>
                {/* Stats Grid */}
                <UsersStatsGrid stats={stats} />

                {/* Search & Filter Panel */}
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
                        <div className="relative min-w-0 md:min-w-36.25">
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

                {/* Bulk Actions Panel */}
                {selectedIds.size > 0 && (
                    <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/30 dark:bg-blue-950/20">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="size-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {selectedIds.size} user
                                {selectedIds.size !== 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deselectAll()}
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

                {/* User Table */}
                <AdminTable
                    data={paginatedUsers}
                    columns={columns}
                    title="User Account Catalog"
                    legend={[]}
                    emptyState={{
                        icon: Trash2,
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

            {/* Modals */}
            <UserDetailModal
                isOpen={!!selectedUserModal}
                user={selectedUserModal || undefined}
                currentUserId={currentUser.id}
                onClose={() => setSelectedUserModal(null)}
            />

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
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.confirmLabel}
                variant={modal.variant}
                onClose={close}
                onConfirm={confirm}
            />
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: adminUsersIndex().url,
        },
    ],
};
