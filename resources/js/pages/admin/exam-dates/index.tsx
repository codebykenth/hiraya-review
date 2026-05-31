import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExamDate {
    id: number;
    date: string;
    description: string;
    is_active: boolean;
}

interface Props {
    examDates: ExamDate[];
}

export default function AdminExamDatesIndex({ examDates }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'danger' as 'danger' | 'success',
        onConfirm: () => {},
    });

    const { data, setData, post, put, reset, clearErrors, errors, processing } =
        useForm({
            date: '',
            description: '',
            is_active: true,
        });

    const handleEdit = (examDate: ExamDate) => {
        setEditingId(examDate.id);

        const d = new Date(examDate.date);
        const localDateString = !isNaN(d.getTime())
            ? d.getFullYear() +
              '-' +
              String(d.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(d.getDate()).padStart(2, '0')
            : examDate.date;

        setData({
            date: localDateString,
            description: examDate.description,
            is_active: examDate.is_active,
        });
        clearErrors();
    };

    const handleCancel = () => {
        setEditingId(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/admin/exam-dates/${editingId}`, {
                onSuccess: () => handleCancel(),
            });
        } else {
            post('/admin/exam-dates', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Exam Date?',
            message:
                'Are you sure you want to delete this exam date? This cannot be undone.',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/admin/exam-dates/${id}`, {
                    preserveScroll: true,
                });
            },
        });
    };

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
                    <div className="md:col-span-1">
                        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                {editingId ? 'Edit Exam Date' : 'Add Exam Date'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            const d = new Date(newDate);
                                            let newDesc = data.description;

                                            if (!isNaN(d.getTime())) {
                                                const month = d.toLocaleString(
                                                    'en-US',
                                                    {
                                                        month: 'long',
                                                        timeZone: 'UTC',
                                                    },
                                                );
                                                const year = d.getUTCFullYear();
                                                newDesc = `${month} ${year} Exam`;
                                            }

                                            setData({
                                                ...data,
                                                date: newDate,
                                                description: newDesc,
                                            });
                                        }}
                                        className="w-full"
                                        required
                                    />
                                    {errors.date && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.date}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Description
                                    </label>
                                    <Input
                                        type="text"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., August 2026 Exam"
                                        className="w-full"
                                        required
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Active
                                    </label>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {editingId ? 'Update Date' : 'Add Date'}
                                    </Button>
                                    {editingId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {examDates.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No exam dates configured yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        examDates.map((exam) => (
                                            <tr
                                                key={exam.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    {new Date(
                                                        exam.date,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {exam.description}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {exam.is_active ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase">
                                                            <CheckCircle className="h-3 w-3" />{' '}
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold text-slate-600 uppercase">
                                                            <XCircle className="h-3 w-3" />{' '}
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider
                                                            delayDuration={150}
                                                        >
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            handleToggleStatus(
                                                                                exam,
                                                                            )
                                                                        }
                                                                        className={`rounded-md p-1.5 hover:bg-muted ${exam.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
                                                                    >
                                                                        {exam.is_active ? (
                                                                            <XCircle className="h-4 w-4" />
                                                                        ) : (
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {exam.is_active
                                                                        ? 'Deactivate'
                                                                        : 'Activate'}
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                exam,
                                                                            )
                                                                        }
                                                                        className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Edit
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                exam.id,
                                                                            )
                                                                        }
                                                                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Delete
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </PageContainer>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, isOpen: false })
                }
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onConfirm={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                }}
            />
        </>
    );
}
