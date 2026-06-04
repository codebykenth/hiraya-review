import { Head, router } from '@inertiajs/react';
import { PageContainer } from '@/components/layout/page-container';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ExamDateForm } from './components/exam-date-form';
import { ExamDatesTable } from './components/exam-dates-table';
import { useExamDateForm } from './hooks/use-exam-date-form';
import type { AdminExamDatesIndexProps, ExamDate } from './types';

export default function AdminExamDatesIndex({
    examDates,
}: AdminExamDatesIndexProps) {
    const { modal, open, close, confirm } = useConfirmModal();
    const {
        editingId,
        data,
        errors,
        processing,
        setData,
        handleEdit,
        handleCancel,
        handleSubmit,
        handleDateChange,
    } = useExamDateForm();

    const handleToggleStatus = (examDate: ExamDate) => {
        const d = new Date(examDate.date);
        const localDateString =
            d.getFullYear() +
            '-' +
            String(d.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(d.getDate()).padStart(2, '0');

        router.put(
            `/admin/exam-dates/${examDate.id}`,
            {
                date: localDateString,
                description: examDate.description,
                is_active: !examDate.is_active,
            },
            { preserveScroll: true },
        );
    };

    const handleDelete = (id: number) => {
        open(
            'Delete Exam Date?',
            'Are you sure you want to delete this exam date? This cannot be undone.',
            'Delete',
            () => {
                router.delete(`/admin/exam-dates/${id}`, {
                    preserveScroll: true,
                });
            },
            'danger',
        );
    };

    return (
        <>
            <Head title="Exam Dates Management" />

            <PageContainer>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Exam Dates
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage the civil service exam dates that appear in
                            the study planner.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Form Panel */}
                    <div className="md:col-span-1">
                        <ExamDateForm
                            editingId={editingId}
                            data={data}
                            errors={errors}
                            processing={processing}
                            onDateChange={handleDateChange}
                            onDescriptionChange={(description) =>
                                setData('description', description)
                            }
                            onActiveChange={(is_active) =>
                                setData('is_active', is_active)
                            }
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </div>

                    {/* Table Panel */}
                    <div className="md:col-span-2">
                        <ExamDatesTable
                            examDates={examDates}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </PageContainer>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={modal.isOpen}
                onClose={close}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.confirmLabel}
                variant={modal.variant}
                onConfirm={confirm}
            />
        </>
    );
}
