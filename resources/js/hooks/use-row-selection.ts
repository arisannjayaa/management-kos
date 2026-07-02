// resources/js/hooks/use-row-selection.ts
//
// Hook untuk mengelola state checkbox di DataTable.
// Mendukung select-one, select-all-per-page, clear, dan indeterminate.
//
// Pemakaian:
//   const selection = useRowSelection<number>();
//   <DataTable rowSelection={selection} getRowId={(emp) => emp.id} ... />

import { useCallback, useMemo, useState } from 'react';
import type { RowSelectionState } from '@/types/datatable';

export function useRowSelection<
    TId extends string | number = number,
>(): RowSelectionState<TId> {
    const [selectedIds, setSelectedIds] = useState<Set<TId>>(new Set());

    const toggle = useCallback((id: TId) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, []);

    const toggleAll = useCallback((rowIds: TId[]) => {
        setSelectedIds((prev) => {
            const allSelected = rowIds.every((id) => prev.has(id));

            if (allSelected) {
                // Deselect semua baris di halaman ini
                const next = new Set(prev);
                rowIds.forEach((id) => next.delete(id));

                return next;
            } else {
                // Select semua baris di halaman ini (tetap simpan pilihan halaman lain)
                const next = new Set(prev);
                rowIds.forEach((id) => next.add(id));

                return next;
            }
        });
    }, []);

    const clearAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const isSelected = useCallback(
        (id: TId) => selectedIds.has(id),
        [selectedIds],
    );

    // isAllSelected & isPartiallySelected dihitung saat render DataTable
    // karena butuh daftar rowIds halaman ini — jadi dikembalikan sebagai
    // fungsi di dalam state tapi dihitung ulang oleh DataTable.
    // Untuk keperluan BulkBar kita expose count saja.
    const selectedCount = selectedIds.size;

    // Placeholder — nilai sebenarnya diisi DataTable saat render
    const isAllSelected = false;
    const isPartiallySelected = false;

    return useMemo(
        () => ({
            selectedIds,
            isAllSelected,
            isPartiallySelected,
            selectedCount,
            toggle,
            toggleAll,
            clearAll,
            isSelected,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedIds, selectedCount, toggle, toggleAll, clearAll, isSelected],
    );
}
