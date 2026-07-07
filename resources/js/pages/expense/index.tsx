import { Head, usePage } from '@inertiajs/react';
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
import { createExpenseColumns, createExpenseTrashedColumns } from './columns';
import { ExpenseForm } from './form';
import type { Expense, ExpenseFilters } from '@/types/expense/expense-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = { expenses: PaginatedResponse<Expense>; filters: ExpenseFilters; properties: any; categories: any; };

export default function ExpenseIndex({ expenses, filters, properties, categories }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const propertiesArray = properties?.data ?? properties ?? [];
    const categoriesArray = categories?.data ?? categories ?? [];

    const { applyFilter, goToPage, isPending, applySort } = useDatatable<ExpenseFilters>('/expenses', filters);
    const { search, setSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<ExpenseFilters>);
            }
        },
    );
    const modal = useModalForm<Expense>();
    const selection = useRowSelection<number>();
    const softDelete = useSoftDelete<Expense>({ getUrl: (i) => `/expenses/delete/${i.id}` });
    const bulkDelete = useBulkDelete({ url: '/expenses/bulk-destroy' });
    const singleRestore = useSoftDelete<Expense>({ getUrl: (i) => `/expenses/restore/${i.id}`, method: 'post' });
    const singleForceDelete = useSoftDelete<Expense>({ getUrl: (i) => `/expenses/force-delete/${i.id}` });
    const bulkRestore = useBulkRestore({ url: '/expenses/bulk-restore' });
    const bulkForceDelete = useBulkForceDelete({ url: '/expenses/bulk-force-delete' });

    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;
    useEffect(() => {
        clearAllRef.current();
    }, [expenses.current_page, filters.search, filters.trashed]);

    const columns = useMemo(() => showTrashed
            ? createExpenseTrashedColumns({
                onRestore: (c) => singleRestore.trigger(c),
                onForceDelete: (c) => singleForceDelete.trigger(c)
            })
            : createExpenseColumns({ onEdit: (c) => modal.open(c), onDelete: (c) => softDelete.trigger(c) }),
        [showTrashed, singleRestore, singleForceDelete, softDelete, modal]);

    const filterFields = [
        {
            key: 'property_id',
            label: 'Gedung Kos',
            placeholder: 'Pilih Gedung',
            options: propertiesArray.map((p: any) => ({ value: String(p.id), label: p.name })),
            value: filters.property_id,
            onChange: (v: string | undefined) => applyFilter({ property_id: v } as Partial<ExpenseFilters>)
        },
        {
            key: 'expense_category_id',
            label: 'Kategori Biaya',
            placeholder: 'Pilih Kategori',
            options: categoriesArray.map((c: any) => ({ value: String(c.id), label: c.name })),
            value: filters.expense_category_id,
            onChange: (v: string | undefined) => applyFilter({ expense_category_id: v } as Partial<ExpenseFilters>)
        }
    ];

    if (!mounted) return null;

    if (isMobile) {
        return (
            <>
                <Head title="Pengeluaran" />
                <MobileList initialData={expenses} showTrashed={showTrashed} onSearch={setSearch} searchValue={search}
                            isPending={isPending} onEdit={(c) => modal.open(c)} onDelete={(c) => softDelete.trigger(c)}
                            onRestore={(c) => singleRestore.trigger(c)}
                            onForceDelete={(c) => singleForceDelete.trigger(c)} />
                {!showTrashed && <Button onClick={() => modal.open()} size="icon"
                                         className="fixed right-5 bottom-24 size-14 rounded-full shadow-lg z-50 bg-primary"><Plus
                    size={24} /></Button>}
                <ExpenseForm open={modal.isOpen} item={modal.item} properties={propertiesArray}
                             categories={categoriesArray} onClose={modal.close} />
                <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen}
                                     description="Hapus permanen?" onConfirm={singleForceDelete.confirm} />
            </>
        );
    }

    return (
        <>
            <Head title="Pengeluaran Kos" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Buku Pengeluaran</h1>
                    {!showTrashed &&
                        <Button onClick={() => modal.open()}><Plus size={16} className="mr-2" /> Catat Biaya</Button>}
                </div>
                <DataTableToolbar searchValue={search} onSearch={setSearch} searchPlaceholder="Cari keterangan..."
                                  filterFields={filterFields}
                                  activeFilterCount={(filters.property_id ? 1 : 0) + (filters.expense_category_id ? 1 : 0)}
                                  onClearFilters={() => applyFilter({
                                      search: undefined,
                                      property_id: undefined,
                                      expense_category_id: undefined
                                  } as Partial<ExpenseFilters>)} perPage={filters.per_page ?? 10}
                                  onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<ExpenseFilters>)}
                                  rightSlot={<DataTableTrashToggle showTrashed={showTrashed}
                                                                   onChange={(show) => applyFilter({
                                                                       trashed: show ? '1' : undefined,
                                                                       search: undefined
                                                                   } as Partial<ExpenseFilters>)} />} />
                <DataTableFilterChips configs={[{
                    key: 'search',
                    value: filters.search,
                    label: `Cari: "${filters.search}"`,
                    onRemove: () => applyFilter({ search: undefined } as Partial<ExpenseFilters>)
                }]} />

                <DataTable data={expenses} columns={columns} getRowId={(d) => d.id} sort={filters.sort}
                           direction={filters.direction} onSort={applySort} isPending={isPending}
                           emptyText="Data kosong." rowSelection={selection} />
                <DataTablePagination meta={expenses} onPageChange={goToPage} />
            </div>

            <ExpenseForm open={modal.isOpen} item={modal.item} properties={propertiesArray} categories={categoriesArray}
                         onClose={modal.close} />
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
                                     entityLabel="pengeluaran" />
            <BulkRestoreConfirmDialog open={bulkRestore.open} onOpenChange={bulkRestore.setOpen}
                                      count={bulkRestore.pendingCount} isRestoring={bulkRestore.isRestoring}
                                      onConfirm={bulkRestore.confirm} onCancel={bulkRestore.cancel}
                                      entityLabel="pengeluaran" />
            <BulkForceDeleteConfirmDialog open={bulkForceDelete.open} onOpenChange={bulkForceDelete.setOpen}
                                          count={bulkForceDelete.pendingCount} isDeleting={bulkForceDelete.isDeleting}
                                          onConfirm={bulkForceDelete.confirm} onCancel={bulkForceDelete.cancel}
                                          entityLabel="pengeluaran" />

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

ExpenseIndex.layout = {
    breadcrumbs: [{ title: 'Manajemen Keuangan', href: '#' }, {
        title: 'Buku Pengeluaran',
        href: '/expenses'
    }]
};
