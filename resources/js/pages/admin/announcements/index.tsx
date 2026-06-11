import { Head, router } from '@inertiajs/react';
import {
    Plus,
    Megaphone,
    Calendar,
    Pencil,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Info,
} from 'lucide-react';
import type { TableColumn } from '@/components/domain/admin-table';
import { AdminTable } from '@/components/domain/admin-table';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AnnouncementForm } from './components/announcement-form';
import { useAnnouncementsState } from './hooks/use-announcements-state';

interface Announcement {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}

interface AnnouncementsProps {
    announcements: {
        data: Announcement[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

export default function AnnouncementsIndex({
    announcements,
}: AnnouncementsProps) {
    const {
        isSheetOpen,
        setIsSheetOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        deleteModal,
        setDeleteModal,
        data,
        setData,
        processing,
        errors,
        handleCreate,
        openEditModal,
        openCreateModal,
        handleUpdate,
        confirmDelete,
        handleDelete,
        toggleStatus,
        closeCreateModal,
        closeEditModal,
    } = useAnnouncementsState();

    const columns: TableColumn<Announcement>[] = [
        {
            header: 'Announcement',
            className: 'w-[45%]',
            render: (ann) => (
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                        {ann.type === 'warning' && (
                            <AlertCircle className="size-5 text-amber-500" />
                        )}
                        {ann.type === 'success' && (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                        )}
                        {ann.type === 'info' && (
                            <Info className="size-5 text-blue-500" />
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {ann.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 pr-4 text-xs text-slate-500 dark:text-slate-400">
                            {ann.message}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            className: 'w-[15%]',
            render: (ann) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={ann.is_active}
                        onCheckedChange={() =>
                            toggleStatus(ann.id, ann.is_active, ann)
                        }
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {ann.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Type',
            className: 'w-[15%]',
            render: (ann) => (
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    {ann.type}
                </span>
            ),
        },
        {
            header: 'Date Created',
            className: 'w-[15%]',
            render: (ann) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="size-3.5" />
                    {new Date(ann.created_at).toLocaleDateString()}
                </div>
            ),
        },
        {
            header: 'Action',
            className: 'text-right w-[10%]',
            render: (ann) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => openEditModal(ann)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => confirmDelete(ann.id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Announcements Management" />

            <PageContainer>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <PageHeader
                        title="Announcements"
                        description="Manage global platform notifications and alerts."
                    />
                    <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <Button
                            onClick={openCreateModal}
                            className="w-full shrink-0 shadow-lg shadow-blue-500/20 sm:w-auto"
                        >
                            <Plus className="mr-2 size-4" />
                            Create Announcement
                        </Button>
                        <DialogContent>
                            <AnnouncementForm
                                data={data}
                                errors={errors}
                                processing={processing}
                                isEdit={false}
                                setData={setData}
                                onSubmit={handleCreate}
                                onCancel={closeCreateModal}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <AdminTable
                    data={announcements.data}
                    columns={columns}
                    emptyState={{
                        icon: Megaphone,
                        title: 'No Announcements Yet',
                        description:
                            'Create an announcement to communicate with your users and provide them with important updates.',
                        action: (
                            <Button
                                onClick={openCreateModal}
                                className="shadow-lg shadow-blue-500/20"
                            >
                                <Plus className="mr-2 size-4" />
                                Create Announcement
                            </Button>
                        ),
                    }}
                    totalItems={announcements.total}
                    pageSize={announcements.per_page || 10}
                    currentPage={announcements.current_page}
                    onPageChange={(page) =>
                        router.get(`/admin/announcements?page=${page}`)
                    }
                />
            </PageContainer>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Announcement"
                message="Are you sure you want to delete this announcement? It will be permanently removed from all user dashboards."
                confirmLabel="Delete"
                variant="danger"
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
            />

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <AnnouncementForm
                        data={data}
                        errors={errors}
                        processing={processing}
                        isEdit={true}
                        setData={setData}
                        onSubmit={handleUpdate}
                        onCancel={closeEditModal}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
