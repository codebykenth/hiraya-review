import { CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate } from '@/lib/format-date';
import type { ExamDate } from '../types';

interface ExamDatesTableProps {
    examDates: ExamDate[];
    onEdit: (exam: ExamDate) => void;
    onToggleStatus: (exam: ExamDate) => void;
    onDelete: (id: number) => void;
}

export function ExamDatesTable({
    examDates,
    onEdit,
    onToggleStatus,
    onDelete,
}: ExamDatesTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Description</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
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
                                className="px-4 py-4 text-center text-muted-foreground sm:py-8"
                            >
                                No exam dates configured yet.
                            </td>
                        </tr>
                    ) : (
                        examDates.map((exam) => (
                            <tr key={exam.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 font-medium text-foreground">
                                    {formatDate(exam.date)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {exam.description}
                                </td>
                                <td className="px-4 py-3">
                                    {exam.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            <CheckCircle className="h-3 w-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                            <XCircle className="h-3 w-3" />
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <TooltipProvider delayDuration={150}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() =>
                                                            onToggleStatus(exam)
                                                        }
                                                        className={`rounded-md p-1.5 hover:bg-muted ${exam.is_active ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
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
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() =>
                                                            onEdit(exam)
                                                        }
                                                        className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Edit
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() =>
                                                            onDelete(exam.id)
                                                        }
                                                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
    );
}
