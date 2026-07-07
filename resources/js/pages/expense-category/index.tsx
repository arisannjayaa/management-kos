import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    BulkDeleteConfirmDialog,
    BulkForceDeleteConfirmDialog,
    BulkRestoreConfirmDialog,
    DataTable,
    DataTableBulkBar,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
    DataTableTrashToggle
} from '@/components/datatable';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useBulkForceDelete } from '@/hooks/use-bulk-force-delete';
import { useBulkRestore } from '@/hooks/use-bulk-restore';
import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useModalForm } from '@/hooks/use-modal-form';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useSoftDelete } from '@/hooks/use-soft-delete';
import { MobileList } from './mobile-list';
import { createExpenseCategoryColumns, createExpenseCategoryTrashedColumns } from './columns';
import { ExpenseCategoryForm } from './form';
import type { ExpenseCategory, ExpenseCategoryFilters } from '@/types/expense/expense-category-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = { expense_categories: PaginatedResponse<ExpenseCategory>; filters: ExpenseCategoryFilters; };

export default function ExpenseCategoryIndex({ expense_categories, filters }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // 10 Hooks Wajib di Index secara Berurutan[cite: 3]
    const {
        applyFilter,
        goToPage,
        isPending,
        applySort
    } = useDatatable<ExpenseCategoryFilters>('/expense-categories', filters);

    const { search, setSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<ExpenseCategoryFilters>);
            }
        },
    );

    const modal = useModalForm<ExpenseCategory>();
    const selection = useRowSelection<number>();
    const softDelete = useSoftDelete<ExpenseCategory>({ getUrl: (i) => `/expense-categories/delete/${i.id}` });
    const bulkDelete = useBulkDelete({ url: '/expense-categories/bulk-destroy' });
    const singleRestore = useSoftDelete<ExpenseCategory>({
        getUrl: (i) => `/expense-categories/restore/${i.id}`,
        method: 'post'
    });
    const singleForceDelete = useSoftDelete<ExpenseCategory>({ getUrl: (i) => `/expense-categories/force-delete/${i.id}` });
    const bulkRestore = useBulkRestore({ url: '/expense-categories/bulk-restore' });
    const bulkForceDelete = useBulkForceDelete({ url: '/expense-categories/bulk-force-delete' });

    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;
    useEffect(() => {
        clearAllRef.current();
    }, [expense_categories.current_page, filters.search, filters.trashed]);

    const columns = useMemo(() => showTrashed
            ? createExpenseCategoryTrashedColumns({
                onRestore: (c) => singleRestore.trigger(c),
                onForceDelete: (c) => singleForceDelete.trigger(c)
            })
            : createExpenseCategoryColumns({ onEdit: (c) => modal.open(c), onDelete: (c) => softDelete.trigger(c) }),
        [showTrashed, singleRestore, singleForceDelete, softDelete, modal]);

    if (!mounted) return null;

    if (isMobile) {
        return (
            <>
                <Head title="Kategori Pengeluaran" />
                <MobileList initialCategories={expense_categories} showTrashed={showTrashed} onSearch={setSearch}
                            searchValue={search} isPending={isPending} onEdit={(c) => modal.open(c)}
                            onDelete={(c) => softDelete.trigger(c)} onRestore={(c) => singleRestore.trigger(c)}
                            onForceDelete={(c) => singleForceDelete.trigger(c)} />
                {!showTrashed && <Button onClick={() => modal.open()} size="icon"
                                         className="fixed right-5 bottom-24 size-14 rounded-full shadow-lg z-50 bg-primary"><Plus
                    size={24} /></Button>}
                <ExpenseCategoryForm open={modal.isOpen} item={modal.item ?? null} onClose={modal.close} />
                <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen}
                                     description="Hapus permanen kategori?" onConfirm={singleForceDelete.confirm} />
            </>
        );
    }

    return (
        <>
            <Head title="Kategori Pengeluaran" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Master Kategori</h1>
                    {!showTrashed &&
                        <Button onClick={() => modal.open()}><Plus size={16} className="mr-2" /> Kategori Baru</Button>}
                </div>
                <DataTableToolbar searchValue={search} onSearch={setSearch} searchPlaceholder="Cari..."
                                  onClearFilters={() => applyFilter({ search: undefined } as Partial<ExpenseCategoryFilters>)}
                                  perPage={filters.per_page ?? 10}
                                  onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<ExpenseCategoryFilters>)}
                                  rightSlot={<DataTableTrashToggle showTrashed={showTrashed}
                                                                   onChange={(show) => applyFilter({
                                                                       trashed: show ? '1' : undefined,
                                                                       search: undefined
                                                                   } as Partial<ExpenseCategoryFilters>)} />} />
                <DataTableFilterChips configs={[{
                    key: 'search',
                    value: filters.search,
                    label: `Cari: "${filters.search}"`,
                    onRemove: () => applyFilter({ search: undefined } as Partial<ExpenseCategoryFilters>)
                }]} />

                <DataTable data={expense_categories} columns={columns} getRowId={(d) => d.id} sort={filters.sort}
                           direction={filters.direction} onSort={applySort} isPending={isPending}
                           emptyText="Data kosong." rowSelection={selection} />
                <DataTablePagination meta={expense_categories} onPageChange={goToPage} />
            </div>

            <ExpenseCategoryForm open={modal.isOpen} item={modal.item ?? null} onClose={modal.close} />
            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen}
                                 description="Buang ke tong sampah?" onConfirm={softDelete.confirm} />
            <DeleteConfirmDialog open={singleRestore.open} onOpenChange={singleRestore.setOpen}
                                 description="Pulihkan data?" onConfirm={singleRestore.confirm}
                                 confirmLabel="Pulihkan" />
            <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen}
                                 description="Hapus permanen?" onConfirm={singleForceDelete.confirm} />

            <BulkDeleteConfirmDialog open={bulkDelete.open} onOpenChange={bulkDelete.setOpen}
                                     count={bulkDelete.pendingCount} isDeleting={bulkDelete.isDeleting}
                                     onConfirm={bulkDelete.confirm} onCancel={bulkDelete.cancel}
                                     entityLabel="kategori" />
            <BulkRestoreConfirmDialog open={bulkRestore.open} onOpenChange={bulkRestore.setOpen}
                                      count={bulkRestore.pendingCount} isRestoring={bulkRestore.isRestoring}
                                      onConfirm={bulkRestore.confirm} onCancel={bulkRestore.cancel}
                                      entityLabel="kategori" />
            <BulkForceDeleteConfirmDialog open={bulkForceDelete.open} onOpenChange={bulkForceDelete.setOpen}
                                          count={bulkForceDelete.pendingCount} isDeleting={bulkForceDelete.isDeleting}
                                          onConfirm={bulkForceDelete.confirm} onCancel={bulkForceDelete.cancel}
                                          entityLabel="kategori" />

            <DataTableBulkBar selectedCount={selection.selectedCount} selectedIds={Array.from(selection.selectedIds)}
                              onClear={selection.clearAll} actions={showTrashed ? [{
                label: 'Pulihkan',
                onClick: (ids) => bulkRestore.trigger(ids)
            }, {
                label: 'Hapus Permanen',
                destructive: true,
                onClick: (ids) => bulkForceDelete.trigger(ids)
            }] : [{ label: 'Buang ke Sampah', destructive: true, onClick: (ids) => bulkDelete.trigger(ids) }]} />
        </>
    );
}

ExpenseCategoryIndex.layout = {
    breadcrumbs: [{ title: 'Master Data', href: '#' }, {
        title: 'Kategori Pengeluaran',
        href: '/expense-categories'
    }]
}; // Baris paling akhir[cite: 3]
