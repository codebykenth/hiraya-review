import { Search, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PricingPlan } from '@/pages/user/billing/types';
import type { PaymentFilters as FiltersType } from '../types';

interface PaymentFiltersProps {
    filters: FiltersType;
    plans: PricingPlan[];
    onFilterChange: (key: keyof FiltersType, value: string) => void;
    onReset: () => void;
}

export function PaymentFilters({
    filters,
    plans,
    onFilterChange,
    onReset,
}: PaymentFiltersProps) {
    const hasActiveFilters =
        filters.search !== '' ||
        filters.status !== 'all' ||
        filters.plan !== 'all';

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search by ref, email, or student name..."
                    value={filters.search}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                    className="pl-9 h-9 text-xs"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={filters.status}
                    onValueChange={(val) => onFilterChange('status', val)}
                >
                    <SelectTrigger className="h-9 w-32 text-xs">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.plan}
                    onValueChange={(val) => onFilterChange('plan', val)}
                >
                    <SelectTrigger className="h-9 w-36 text-xs">
                        <SelectValue placeholder="All Plans" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        {plans.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-9 text-xs gap-1 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-3.5" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
