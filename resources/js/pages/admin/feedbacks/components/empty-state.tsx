import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export function EmptyState({
    hasActiveFilters,
    onClearFilters,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Filter className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
                {hasActiveFilters ? 'No matching reports' : 'Inbox Zero!'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {hasActiveFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : 'No flagged content or pending reports. Everything looks great!'}
            </p>
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={onClearFilters}
                >
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
