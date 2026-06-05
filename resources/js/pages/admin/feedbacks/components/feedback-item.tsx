import {
    AlertTriangle,
    UserCircle,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Feedback } from '../types';

interface FeedbackItemProps {
    feedback: Feedback;
    onStatusChange: (id: number, status: string) => void;
    onView: (feedback: Feedback) => void;
}

export function FeedbackItem({
    feedback,
    onStatusChange,
    onView,
}: FeedbackItemProps) {
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

    return (
        <div className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
                <div
                    className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full ${feedback.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                >
                    <AlertTriangle className="size-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                            {feedback.reason}
                        </h4>
                        {getStatusBadge(feedback.status)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <UserCircle className="size-4" />
                            {feedback.user.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                                {getContentType(feedback.flaggable_type)}
                            </span>
                            ID: {feedback.flaggable_id}
                        </span>
                        <span>
                            {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    {feedback.details && (
                        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                            "{feedback.details}"
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:shrink-0">
                <div className="w-[140px]">
                    <Select
                        value={feedback.status}
                        onValueChange={(val) =>
                            onStatusChange(feedback.id, val)
                        }
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => onView(feedback)}
                >
                    <Eye className="mr-2 size-4" />
                    View
                </Button>
            </div>
        </div>
    );
}
