import { Head } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
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
import { createTenantColumns, createTenantTrashedColumns } from './columns';
import { TenantFormModal } from './form';
import type { Tenant, TenantFilters } from '@/types/tenant/tenant-type';
import type { PaginatedResponse } from '@/types/pagination';
import type { ComplaintFilters } from '@/types/complaint/complaint-type';

type Props = { tenants: PaginatedResponse<Tenant>; filters: TenantFilters; };

export default function TenantIndex({ tenants, filters }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // 🌟 10 Hooks Urutan Konsisten Mutlak Sesuai Aturan Panduan Praktis §4.5[cite: 1]
    const { applyFilter, goToPage, isPending, applySort } = useDatatable<TenantFilters>('/tenants', filters);
    const { search, setSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined
                } as Partial<TenantFilters>);
            }
        }
    );
    const modal = useModalForm<Tenant>();
    const selection = useRowSelection<string>(); // Proteksi 9.5: Menggunakan tipe string terenkripsi[cite: 1]
    const softDelete = useSoftDelete<Tenant>({ getUrl: (i) => `/tenants/delete/${i.id}` });
    const bulkDelete = useBulkDelete({ url: '/tenants/bulk-destroy' });
    const singleRestore = useSoftDelete<Tenant>({ getUrl: (i) => `/tenants/restore/${i.id}`, method: 'post' });
    const singleForceDelete = useSoftDelete<Tenant>({ getUrl: (i) => `/tenants/force-delete/${i.id}` });
    const bulkRestore = useBulkRestore({ url: '/tenants/bulk-restore' });
    const bulkForceDelete = useBulkForceDelete({ url: '/tenants/bulk-force-delete' });

    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;
    useEffect(() => {
        clearAllRef.current();
    }, [tenants.current_page, filters.search, filters.trashed]);

    const columns = useMemo(() => showTrashed
            ? createTenantTrashedColumns({
                onRestore: (c) => singleRestore.trigger(c),
                onForceDelete: (c) => singleForceDelete.trigger(c)
            })
            : createTenantColumns({ onEdit: (c) => modal.open(c), onDelete: (c) => softDelete.trigger(c) }),
        [showTrashed, singleRestore, singleForceDelete, softDelete, modal]);

    const filterFields = [
        {
            key: 'status',
            label: 'Status Hunian',
            placeholder: 'Semua Status',
            options: [{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }],
            value: filters.status,
            onChange: (v: string | undefined) => applyFilter({ status: v as any } as Partial<TenantFilters>)
        }
    ];

    if (!mounted) return null;

    if (isMobile) {
        return (
            <>
                <Head title="Manajemen Penyewa" />
                <MobileList initialData={tenants} showTrashed={showTrashed} onSearch={setSearch} searchValue={search}
                            isPending={isPending} onEdit={(c) => modal.open(c)} onDelete={(c) => softDelete.trigger(c)}
                            onRestore={(c) => singleRestore.trigger(c)}
                            onForceDelete={(c) => singleForceDelete.trigger(c)} />
                {!showTrashed && <Button onClick={() => modal.open()} size="icon"
                                         className="fixed right-5 bottom-24 size-14 rounded-full shadow-lg z-50 bg-primary"><Plus
                    size={24} /></Button>}
                <TenantFormModal open={modal.isOpen} item={modal.item} onClose={modal.close} />
                <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen}
                                     description="Hapus berkas data penyewa kos secara permanen?"
                                     onConfirm={singleForceDelete.confirm} />
            </>
        );
    }

    return (
        <>
            <Head title="Berkas Data Penyewa Kos" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-2"><Users size={24}
                                                                                           className="text-primary" /> Manajemen
                            Berkas Penyewa</h1>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registrasi
                            profil tenant serta sinkronisasi hak akses akun portal mandiri.</p>
                    </div>
                    {!showTrashed &&
                        <Button onClick={() => modal.open()} className="rounded-xl font-bold"><Plus size={16}
                                                                                                    className="mr-1.5" /> Daftarkan
                            Tenant</Button>}
                </div>

                <DataTableToolbar searchValue={search} onSearch={setSearch} searchPlaceholder="Cari nama penyewa..."
                                  filterFields={filterFields}
                                  activeFilterCount={(filters.status && filters.status !== 'all' ? 1 : 0)}
                                  onClearFilters={() => applyFilter({
                                      search: undefined,
                                      status: undefined
                                  } as Partial<TenantFilters>)} perPage={filters.per_page ?? 10}
                                  onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<TenantFilters>)}
                                  rightSlot={<DataTableTrashToggle showTrashed={showTrashed}
                                                                   onChange={(show) => applyFilter({
                                                                       trashed: show ? '1' : undefined,
                                                                       search: undefined
                                                                   } as Partial<TenantFilters>)} />} />
                <DataTableFilterChips configs={[{
                    key: 'search',
                    value: filters.search,
                    label: `Nama: "${filters.search}"`,
                    onRemove: () => applyFilter({ search: undefined } as Partial<TenantFilters>)
                }]} />

                <DataTable data={tenants} columns={columns} getRowId={(d) => d.id} sort={filters.sort}
                           direction={filters.direction} onSort={applySort} isPending={isPending}
                           emptyText="Database data penyewa kosong." />
                <DataTablePagination meta={tenants} onPageChange={goToPage} />
            </div>

            <TenantFormModal open={modal.isOpen} item={modal.item} onClose={modal.close} />

            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen}
                                 description="Buang profil penyewa ke tong sampah?" onConfirm={softDelete.confirm} />
            <DeleteConfirmDialog open={singleRestore.open} onOpenChange={singleRestore.setOpen}
                                 description="Pulihkan profil data penyewa ini?" onConfirm={singleRestore.confirm}
                                 confirmLabel="Pulihkan" />
            <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen}
                                 description="Hapus permanen berkas penyewa beserta akun portal loginn-ya?"
                                 onConfirm={singleForceDelete.confirm} />

            <BulkDeleteConfirmDialog open={bulkDelete.open} onOpenChange={bulkDelete.setOpen}
                                     count={bulkDelete.pendingCount} isDeleting={bulkDelete.isDeleting}
                                     onConfirm={bulkDelete.confirm} onCancel={bulkDelete.cancel}
                                     entityLabel="profil penyewa" />
            <BulkRestoreConfirmDialog open={bulkRestore.open} onOpenChange={bulkRestore.setOpen}
                                      count={bulkRestore.pendingCount} isRestoring={bulkRestore.isRestoring}
                                      onConfirm={bulkRestore.confirm} onCancel={bulkRestore.cancel}
                                      entityLabel="profil penyewa" />
            <BulkForceDeleteConfirmDialog open={bulkForceDelete.open} onOpenChange={bulkForceDelete.setOpen}
                                          count={bulkForceDelete.pendingCount} isDeleting={bulkForceDelete.isDeleting}
                                          onConfirm={bulkForceDelete.confirm} onCancel={bulkForceDelete.cancel}
                                          entityLabel="profil penyewa" />

            <DataTableBulkBar selectedCount={selection.selectedCount} selectedIds={Array.from(selection.selectedIds)}
                              onClear={selection.clearAll} actions={showTrashed ? [{
                label: 'Pulihkan Pilihan',
                onClick: (ids) => bulkRestore.trigger(ids)
            }, {
                label: 'Hapus Selamanya',
                destructive: true,
                onClick: (ids) => bulkForceDelete.trigger(ids)
            }] : [{ label: 'Buang ke Sampah', destructive: true, onClick: (ids) => bulkDelete.trigger(ids) }]} />
        </>
    );
}

TenantIndex.layout = {
    breadcrumbs: [{ title: 'Kependudukan Kos', href: '#' }, {
        title: 'Daftar Penyewa',
        href: '/tenants'
    }]
};
