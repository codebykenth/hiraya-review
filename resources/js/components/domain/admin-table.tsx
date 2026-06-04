import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generatePaginationLinks } from '@/lib/utils';

export interface TableColumn<T> {
    header: string;
    className?: string;
    render: (item: T) => React.ReactNode;
}

export interface LegendItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    variant: 'amber' | 'blue' | 'rose' | 'emerald' | 'indigo' | 'slate';
}

export interface AdminTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    emptyState: {
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        description: string;
        action?: React.ReactNode;
    };
    pageSize?: number;
    currentPage?: number;
    totalItems?: number;
    title?: string;
    legend?: LegendItem[];
    onPageChange?: (page: number) => void;

    // Bulk actions
    selectedIds?: number[];
    onSelectAll?: (checked: boolean, allIds: number[]) => void;
    onSelectOne?: (id: number, checked: boolean) => void;
    bulkActionRender?: (selectedIds: number[]) => React.ReactNode;
    getItemId?: (item: T) => number;
}

export function AdminTable<T>({
    data = [],
    columns = [],
    emptyState,
    pageSize = 10,
    currentPage = 1,
    totalItems = 0,
    title,
    legend,
    onPageChange,
    selectedIds = [],
    onSelectAll,
    onSelectOne,
    bulkActionRender,
    getItemId,
}: AdminTableProps<T>) {
    const tableRef = React.useRef<HTMLDivElement>(null);
    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
            setTimeout(() => {
                if (tableRef.current) {
                    tableRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            }, 50);
        }
    };

    return (
        <div
            ref={tableRef}
            className="scroll-m-24 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-900 dark:bg-slate-950"
        >
            {/* Card Header with Title and Action Legend Key matching attempt history style */}
            {(title || (legend && legend.length > 0)) && (
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/20 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-900 dark:bg-slate-900/10">
                    {title && (
                        <span className="font-heading text-sm font-extrabold text-slate-800 dark:text-slate-200">
                            {title}
                        </span>
                    )}

                    {legend && legend.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-extrabold tracking-wider uppercase">
                            <span className="text-slate-400/80">Legend:</span>
                            {legend.map((item, idx) => {
                                let badgeClass = '';
                                let iconWrapperClass = '';

                                switch (item.variant) {
                                    case 'amber':
                                        badgeClass =
                                            'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20 text-amber-800 dark:text-amber-300';
                                        iconWrapperClass =
                                            'border-amber-250 bg-amber-100 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400';
                                        break;
                                    case 'blue':
                                        badgeClass =
                                            'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20 text-blue-800 dark:text-blue-300';
                                        iconWrapperClass =
                                            'border-blue-250 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400';
                                        break;
                                    case 'rose':
                                        badgeClass =
                                            'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20 text-rose-800 dark:text-rose-300';
                                        iconWrapperClass =
                                            'border-rose-250 bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400';
                                        break;
                                    case 'emerald':
                                        badgeClass =
                                            'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-300';
                                        iconWrapperClass =
                                            'border-emerald-250 bg-emerald-100 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400';
                                        break;
                                    case 'indigo':
                                        badgeClass =
                                            'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/20 text-indigo-800 dark:text-indigo-300';
                                        iconWrapperClass =
                                            'border-indigo-250 bg-indigo-100 text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400';
                                        break;
                                    default:
                                        badgeClass =
                                            'bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/40 text-slate-700 dark:text-slate-300';
                                        iconWrapperClass =
                                            'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400';
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${badgeClass}`}
                                    >
                                        <span
                                            className={`flex size-5.5 items-center justify-center rounded-md border ${iconWrapperClass}`}
                                        >
                                            {React.createElement(item.icon, {
                                                className: 'size-3',
                                            })}
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {bulkActionRender &&
                selectedIds.length > 0 &&
                bulkActionRender(selectedIds)}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:border-slate-900 dark:bg-slate-900/40">
                            {getItemId && (
                                <th className="w-12 px-6 py-4">
                                    <Checkbox
                                        checked={
                                            data.length > 0 &&
                                            selectedIds.length > 0 &&
                                            data.every((item) =>
                                                selectedIds.includes(
                                                    getItemId(item),
                                                ),
                                            )
                                        }
                                        onCheckedChange={(checked) =>
                                            onSelectAll?.(
                                                !!checked,
                                                data.map(getItemId),
                                            )
                                        }
                                        aria-label="Select all"
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700 dark:divide-slate-900 dark:text-slate-300">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length + (getItemId ? 1 : 0)
                                    }
                                    className="px-6 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="shadow-3xs mb-4 flex size-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                                            {React.createElement(
                                                emptyState.icon,
                                                {
                                                    className:
                                                        'size-6 text-slate-400',
                                                },
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                            {emptyState.title}
                                        </h3>
                                        <p className="text-slate-550 mt-1 max-w-2xl text-xs leading-relaxed dark:text-slate-400">
                                            {emptyState.description}
                                        </p>
                                        {emptyState.action && (
                                            <div className="mt-5">
                                                {emptyState.action}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIdx) => {
                                const id = getItemId ? getItemId(item) : null;
                                const isSelected =
                                    id !== null
                                        ? selectedIds.includes(id)
                                        : false;

                                return (
                                    <tr
                                        key={id !== null ? id : rowIdx}
                                        className={`transition hover:bg-slate-50/40 dark:hover:bg-slate-900/10 ${isSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                                    >
                                        {getItemId && id !== null && (
                                            <td className="px-6 py-4.5">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        onSelectOne?.(
                                                            id,
                                                            !!checked,
                                                        )
                                                    }
                                                    aria-label={`Select row ${id}`}
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={`px-6 py-4.5 ${col.className || ''}`}
                                            >
                                                {col.render(item)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalItems > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/20 px-6 py-4 sm:flex-row dark:border-slate-900/60 dark:bg-slate-900/10">
                    <span className="text-slate-555 text-xs font-bold dark:text-slate-400">
                        Showing{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {(currentPage - 1) * pageSize + 1}
                        </strong>{' '}
                        to{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {Math.min(currentPage * pageSize, totalItems)}
                        </strong>{' '}
                        of{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {totalItems}
                        </strong>{' '}
                        results
                    </span>

                    {totalPages > 1 && onPageChange && (
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                className="shadow-3xs dark:text-slate-350 h-8 cursor-pointer px-3 text-xs font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                Previous
                            </Button>

                            {generatePaginationLinks(
                                currentPage,
                                totalPages,
                            ).map((item, idx) => {
                                if (item === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="px-1 text-slate-400 dark:text-slate-500"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const pageNum = item as number;
                                const isActive = pageNum === currentPage;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={
                                            isActive ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(pageNum)
                                        }
                                        className={`size-8 cursor-pointer p-0 text-xs font-black transition focus:outline-none ${
                                            isActive
                                                ? 'shadow-3xs bg-blue-600 text-white hover:bg-blue-700'
                                                : 'dark:text-slate-350 border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                className="shadow-3xs dark:text-slate-350 h-8 cursor-pointer px-3 text-xs font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
