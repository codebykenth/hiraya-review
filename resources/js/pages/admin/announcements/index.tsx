import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AnnouncementCard } from './components/announcement-card';
import { AnnouncementForm } from './components/announcement-form';
import { EmptyState } from './components/empty-state';
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
        handleUpdate,
        confirmDelete,
        handleDelete,
        toggleStatus,
        closeCreateModal,
        closeEditModal,
    } = useAnnouncementsState();

    return (
        <>
            <Head title="Announcements Management" />

            <PageContainer>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <PageHeader
                        title="Announcements"
                        description="Manage global platform notifications and alerts."
                    />
                    <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <Button
                            onClick={() => setIsSheetOpen(true)}
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

                {announcements.data.length === 0 ? (
                    <EmptyState onCreate={() => setIsSheetOpen(true)} />
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {announcements.data.map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onToggleStatus={toggleStatus}
                                onEdit={openEditModal}
                                onDelete={confirmDelete}
                            />
                        ))}
                    </div>
                )}
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
