// resources/js/components/datatable/data-table.tsx

import { useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef, RowSelectionState } from '@/types/datatable';
import type { PaginatedResponse } from '@/types/pagination';
import { DataTableLoadingOverlay } from './datatable-loading-overlay';
import { SortableHead } from './sortable-head';

type Props<T> = {
    /** Data paginated dari server */
    data: PaginatedResponse<T>;

    /** Definisi kolom */
    columns: ColumnDef<T>[];

    /** Fungsi untuk mengambil id unik dari setiap row */
    getRowId: (row: T) => string | number;

    /** State sort saat ini */
    sort?: string;
    direction?: string;

    /** Callback ketika header sortable diklik */
    onSort: (field: string) => void;

    /** Apakah sedang loading */
    isPending?: boolean;

    /** Teks ketika data kosong */
    emptyText?: string;

    /**
     * Row selection state dari useRowSelection().
     * Jika tidak diberikan, kolom checkbox tidak ditampilkan.
     */
    rowSelection?: RowSelectionState;
};

/**
 * DataTable — Generic table renderer dengan dukungan sorting dan row selection.
 *
 * Pemakaian tanpa selection (default):
 * ```tsx
 * <DataTable data={employees} columns={columns} getRowId={(e) => e.id}
 *   sort={filters.sort} direction={filters.direction} onSort={applySort} />
 * ```
 *
 * Pemakaian dengan bulk selection:
 * ```tsx
 * const selection = useRowSelection();
 * <DataTable ... rowSelection={selection} getRowId={(e) => e.id} />
 * ```
 */
export function DataTable<T>({
    data,
    columns,
    getRowId,
    sort,
    direction,
    onSort,
    isPending = false,
    emptyText = 'Tidak ada data yang ditemukan.',
    rowSelection,
}: Props<T>) {
    const offset = (data.current_page - 1) * data.per_page;

    // Kumpulkan semua id di halaman ini untuk keperluan "select all"
    const pageIds = useMemo(
        () => data.data.map((row) => getRowId(row)),
        [data.data, getRowId],
    );

    // Hitung isAllSelected & isPartiallySelected berdasarkan pageIds
    const isAllSelected =
        pageIds.length > 0 && pageIds.every((id) => rowSelection?.isSelected(id));
    const isPartiallySelected =
        !isAllSelected && pageIds.some((id) => rowSelection?.isSelected(id));

    const alignClass = (align?: 'left' | 'center' | 'right') => {
        if (align === 'right') return 'text-right';
        if (align === 'center') return 'text-center';
        return '';
    };

    const hasSelection = Boolean(rowSelection);
    // +1 untuk kolom checkbox jika selection aktif
    const totalCols = columns.length + (hasSelection ? 1 : 0);

    return (
        <div className="relative rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <DataTableLoadingOverlay show={isPending} />

            <Table>
                <TableHeader>
                    <TableRow className="border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                        {/* ── Kolom checkbox "select all" ── */}
                        {hasSelection && (
                            <TableHead className="w-10 pl-4">
                                <Checkbox
                                    checked={
                                        isAllSelected
                                            ? true
                                            : isPartiallySelected
                                              ? 'indeterminate'
                                              : false
                                    }
                                    onCheckedChange={() =>
                                        rowSelection!.toggleAll(pageIds)
                                    }
                                    aria-label="Pilih semua baris"
                                    className="border-slate-300 dark:border-slate-600"
                                />
                            </TableHead>
                        )}

                        {columns.map((col) =>
                            col.sortable ? (
                                <SortableHead
                                    key={col.id}
                                    field={col.id}
                                    label={col.header}
                                    sort={sort}
                                    direction={direction}
                                    defaultDirection={col.defaultSortDirection ?? 'asc'}
                                    onSort={onSort}
                                    className={[
                                        alignClass(col.align),
                                        col.headerClassName ?? '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                />
                            ) : (
                                <TableHead
                                    key={col.id}
                                    className={[
                                        'text-xs font-semibold tracking-wide text-slate-500 uppercase',
                                        alignClass(col.align),
                                        col.headerClassName ?? '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {col.header}
                                </TableHead>
                            ),
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={totalCols}
                                className="py-16 text-center text-sm text-slate-400"
                            >
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.data.map((row, index) => {
                            const rowId = getRowId(row);
                            const isChecked = rowSelection?.isSelected(rowId) ?? false;

                            return (
                                <TableRow
                                    key={rowId}
                                    data-selected={isChecked}
                                    className={[
                                        'border-slate-100 transition-colors',
                                        'hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50',
                                        isChecked
                                            ? 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-950/30 dark:hover:bg-blue-950/40'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {/* ── Checkbox per baris ── */}
                                    {hasSelection && (
                                        <TableCell className="w-10 pl-4">
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() =>
                                                    rowSelection!.toggle(rowId)
                                                }
                                                aria-label={`Pilih baris ${index + 1}`}
                                                className="border-slate-300 dark:border-slate-600"
                                            />
                                        </TableCell>
                                    )}

                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.id}
                                            className={[
                                                alignClass(col.align),
                                                col.cellClassName ?? '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        >
                                            {col.cell(row, index, offset)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
