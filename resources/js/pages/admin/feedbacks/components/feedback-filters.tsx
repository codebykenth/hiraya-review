import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search by user or reason..."
                    value={filters.search}
                    onChange={(e) =>
                        onFiltersChange({ ...filters, search: e.target.value })
                    }
                    className="h-9 w-[200px] pl-9 sm:w-[250px]"
                />
            </div>
            <Select
                value={filters.status}
                onValueChange={(value) =>
                    onFiltersChange({ ...filters, status: value })
                }
            >
                <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={filters.contentType}
                onValueChange={(value) =>
                    onFiltersChange({ ...filters, contentType: value })
                }
            >
                <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Question">Questions</SelectItem>
                    <SelectItem value="Module">Modules</SelectItem>
                </SelectContent>
            </Select>
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
    );
}
