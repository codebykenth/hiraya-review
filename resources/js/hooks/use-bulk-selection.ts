import { useState, useCallback } from 'react';

export function useBulkSelection() {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }

            return newSet;
        });
    }, []);

    const selectAll = useCallback((ids: number[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const isSelected = useCallback(
        (id: number) => selectedIds.has(id),
        [selectedIds],
    );

    return {
        selectedIds,
        toggleSelect,
        selectAll,
        deselectAll,
        isSelected,
    };
}
