import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Feedback } from '../types';

interface FeedbackViewModalProps {
    feedback: Feedback | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (
        id: number,
        status: string,
        currentStatus?: string,
    ) => void;
    onDelete: (id: number) => void;
}

export function FeedbackViewModal({
    feedback,
    onClose,
    onStatusChange,
    onDelete,
}: FeedbackViewModalProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400">
                        <Clock className="size-3.5" />
                        Pending
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        Resolved
                    </span>
                );
            case 'dismissed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        <XCircle className="size-3.5" />
                        Dismissed
                    </span>
                );
            default:
                return null;
        }
    };

    const getContentType = (type: string) => {
        if (type.includes('Question')) {
            return 'Question';
        }

        if (type.includes('LearnModule')) {
            return 'Module';
        }

        return 'Unknown';
    };

    if (!feedback) {
        return null;
    }

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <AlertTriangle className="size-5 text-amber-500" />
                        Flagged Report
                    </DialogTitle>
                    {getStatusBadge(feedback.status)}
                </div>
            </DialogHeader>

            <div className="mt-4 space-y-6">
                {/* Reporter Info */}
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                        <span className="block text-xs font-semibold text-muted-foreground uppercase">
                            Reported By
                        </span>
                        <span className="mt-1 block font-medium text-foreground">
                            {feedback.user.name} ({feedback.user.email})
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs font-semibold text-muted-foreground uppercase">
                            Date Submitted
                        </span>
                        <span className="mt-1 block font-medium text-foreground">
                            {new Date(feedback.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Report Details */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground">
                        Issue Category:
                    </h4>
                    <p className="mt-1 text-base text-muted-foreground">
                        {feedback.reason}
                    </p>
                </div>

                {feedback.details && (
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">
                            Additional Details:
                        </h4>
                        <div className="mt-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
                            {feedback.details}
                        </div>
                    </div>
                )}

                {/* Content Preview */}
                <div>
                    <h4 className="text-sm font-semibold text-foreground">
                        Flagged Content Preview:
                    </h4>
                    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-900/10">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                {getContentType(feedback.flaggable_type)} #
                                {feedback.flaggable_id}
                            </span>
                            {feedback.flaggable && (
                                <Link
                                    href={
                                        feedback.flaggable_type.includes(
                                            'Question',
                                        )
                                            ? `/admin/questions/${feedback.flaggable_id}`
                                            : `/admin/learn/${feedback.flaggable_id}`
                                    }
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <ExternalLink className="size-3.5" />
                                    View{' '}
                                    {getContentType(feedback.flaggable_type)}
                                </Link>
                            )}
                        </div>

                        {feedback.flaggable ? (
                            <div className="space-y-2">
                                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                                    {feedback.flaggable.question_text ||
                                        feedback.flaggable.title ||
                                        'Content text not available in preview.'}
                                </p>
                                {feedback.flaggable_type.includes('Question') &&
                                    feedback.flaggable.options && (
                                        <div className="mt-3 space-y-1">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                                Options:
                                            </p>
                                            {feedback.flaggable.options.map(
                                                (
                                                    option: string,
                                                    index: number,
                                                ) => (
                                                    <p
                                                        key={index}
                                                        className="text-xs text-slate-700 dark:text-slate-300"
                                                    >
                                                        {String.fromCharCode(
                                                            65 + index,
                                                        )}
                                                        . {option}
                                                    </p>
                                                ),
                                            )}
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <p className="text-sm text-rose-500 italic">
                                Content has already been deleted.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-6 flex sm:justify-between">
                <Button
                    variant="destructive"
                    onClick={() => onDelete(feedback.id)}
                >
                    Delete Report
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Select
                        value={feedback.status}
                        onValueChange={(value) => {
                            onStatusChange(feedback.id, value, feedback.status);
                            onClose();
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue>
                                {feedback.status.charAt(0).toUpperCase() +
                                    feedback.status.slice(1)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {feedback.status !== 'pending' && (
                                <SelectItem value="pending">Pending</SelectItem>
                            )}
                            {feedback.status !== 'resolved' && (
                                <SelectItem value="resolved">
                                    Resolved
                                </SelectItem>
                            )}
                            {feedback.status !== 'dismissed' && (
                                <SelectItem value="dismissed">
                                    Dismissed
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </DialogFooter>
        </DialogContent>
    );
}
