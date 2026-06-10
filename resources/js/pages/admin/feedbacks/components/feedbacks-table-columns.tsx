import { Eye, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import type { TableColumn } from '@/components/domain/admin-table';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Feedback } from '../types';

interface FeedbacksTableColumnsProps {
    onStatusChange: (
        id: number,
        status: string,
        currentStatus?: string,
    ) => void;
    onView: (feedback: Feedback) => void;
}

export function getFeedbacksTableColumns({
    onStatusChange,
    onView,
}: FeedbacksTableColumnsProps): TableColumn<Feedback>[] {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400">
                        <Clock className="size-3" />
                        Pending
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Resolved
                    </span>
                );
            case 'dismissed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        <XCircle className="size-3" />
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

    const getContentLink = (feedback: Feedback) => {
        if (feedback.flaggable_type.includes('Question')) {
            return `/admin/questions/${feedback.flaggable_id}`;
        }

        if (feedback.flaggable_type.includes('LearnModule')) {
            return `/admin/learn/${feedback.flaggable_id}/edit`;
        }

        return null;
    };

    return [
        {
            header: 'ID',
            className: 'w-16',
            render: (f) => (
                <span className="font-bold text-muted-foreground">#{f.id}</span>
            ),
        },
        {
            header: 'Report Details',
            render: (f) => (
                <div>
                    <span className="block text-xs leading-snug font-black text-foreground">
                        {f.reason}
                    </span>
                    {f.details && (
                        <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                            "{f.details}"
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: 'Content Link',
            className: 'w-32',
            render: (f) => {
                const link = getContentLink(f);

                if (!link) {
                    return null;
                }

                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    <ExternalLink className="size-3" />
                                    View {getContentType(f.flaggable_type)}
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>
                                Open {getContentType(f.flaggable_type)} in new
                                tab
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            header: 'Content Type',
            className: 'w-24',
            render: (f) => (
                <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary uppercase">
                    {getContentType(f.flaggable_type)}
                </span>
            ),
        },
        {
            header: 'Status',
            className: 'w-28',
            render: (f) => getStatusBadge(f.status),
        },
        {
            header: 'Reported By',
            className: 'w-32',
            render: (f) => (
                <span className="text-[10px] font-bold text-muted-foreground">
                    {f.user.name}
                </span>
            ),
        },
        {
            header: 'Date',
            className: 'w-28',
            render: (f) => (
                <span className="text-[10px] font-bold text-muted-foreground">
                    {new Date(f.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            header: 'Actions',
            className: 'w-40 text-right',
            render: (f) => {
                return (
                    <div className="flex items-center justify-end gap-6">
                        <TooltipProvider delayDuration={150}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-10">
                                        <Select
                                            value={f.status}
                                            onValueChange={(val) =>
                                                onStatusChange(
                                                    f.id,
                                                    val,
                                                    f.status,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="group h-7 w-fit px-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <SelectValue>
                                                    {f.status === 'pending' && (
                                                        <Clock className="size-3.5 text-amber-600 group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300" />
                                                    )}
                                                    {f.status ===
                                                        'resolved' && (
                                                        <CheckCircle2 className="size-3.5 text-emerald-600 group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300" />
                                                    )}
                                                    {f.status ===
                                                        'dismissed' && (
                                                        <XCircle className="size-3.5 text-slate-600 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-300" />
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="w-fit">
                                                <SelectItem
                                                    value="pending"
                                                    className="group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-3.5 text-amber-600 group-focus:text-white dark:text-amber-400 dark:group-focus:text-white" />
                                                        <span>Pending</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value="resolved"
                                                    className="group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="size-3.5 text-emerald-600 group-focus:text-white dark:text-emerald-400 dark:group-focus:text-white" />
                                                        <span>Resolved</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem
                                                    value="dismissed"
                                                    className="group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="size-3.5 text-slate-600 group-focus:text-white dark:text-slate-400 dark:group-focus:text-white" />
                                                        <span>Dismissed</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Change status</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={150}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 border-blue-200 bg-blue-50 px-2 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                        onClick={() => onView(f)}
                                    >
                                        <Eye className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];
}
