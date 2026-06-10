import { Search, X, ChevronDown, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FeedbackFiltersProps {
    filters: {
        status: string;
        contentType: string;
        search: string;
    };
    onFiltersChange: (filters: any) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

export function FeedbackFilters({
    filters,
    onFiltersChange,
    onClearFilters,
    hasActiveFilters,
}: FeedbackFiltersProps) {
    return (
        <div className="shadow-3xs rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search bar */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    className="relative max-w-2xl flex-1"
                >
                    <Input
                        type="text"
                        value={filters.search}
                        onChange={(e) =>
                            onFiltersChange({
                                ...filters,
                                search: e.target.value,
                            })
                        }
                        placeholder="Search by user or reason..."
                        className="pl-9"
                    />
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </form>

                {/* Select Filters Row */}
                <div className="flex w-full items-center gap-3 sm:w-auto">
                    {/* Status Select */}
                    <div className="relative flex-1 shrink-0 sm:flex-initial">
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,
                                    status: e.target.value,
                                })
                            }
                            className="w-full appearance-none rounded-lg border border-border bg-white py-2 pr-10 pl-9 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none sm:w-auto dark:bg-slate-900"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                        <Clock className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Content Type Select */}
                    <div className="relative flex-1 shrink-0 sm:flex-initial">
                        <select
                            value={filters.contentType}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,
                                    contentType: e.target.value,
                                })
                            }
                            className="w-full appearance-none rounded-lg border border-border bg-white py-2 pr-10 pl-9 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none sm:w-auto dark:bg-slate-900"
                        >
                            <option value="all">All Types</option>
                            <option value="Question">Questions</option>
                            <option value="Module">Modules</option>
                        </select>
                        <FileText className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Clear Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-9"
                        >
                            <X className="mr-2 size-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
