// resources/js/pages/Tenants/index.tsx

import { Head, usePage, router } from '@inertiajs/react';
import { PlusIcon, Trash2Icon, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';

import {
    BulkDeleteConfirmDialog,
    DataTable,
    DataTableBulkBar,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
} from '@/components/datatable';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';

import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useModalForm } from '@/hooks/use-modal-form';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useSoftDelete } from '@/hooks/use-soft-delete';

import { MobileList } from '@/pages/tenant/mobile-list';
import { createTenantColumns } from './columns';
import { TenantFormModal } from './form';

import type { Tenant, TenantFilters } from '@/types/tenant/tenant-type';
import type { PaginatedResponse } from '@/types/pagination';

const TENANT_STATUS_OPTIONS = [
    { value: 'active', label: 'Aktif Menghuni' },
    { value: 'inactive', label: 'Pindahan / Keluar' },
];

const labelOf = (options: { value: string; label: string }[], value?: string) => {
    return options.find((opt) => opt.value === value)?.label ?? '—';
};

type Props = {
    tenants: PaginatedResponse<Tenant>;
    filters: TenantFilters;
};

export default function TenantIndex({ tenants, filters }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    // 🌟 AMBIL PERMISSION DARI GLOBAL SHARED PROPS INERTIA
    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];

    // Bypass otomatis jika dia super_admin
    const isSuperAdmin = userRoles.includes('super_admin');

    const canCreate = isSuperAdmin || userPermissions.includes('tenant.create');
    const canDelete = isSuperAdmin || userPermissions.includes('tenant.delete');

    useEffect(() => {
        setMounted(true);
    }, []);

    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<TenantFilters>('/tenants', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({ search: value || undefined } as Partial<TenantFilters>);
            }
        },
    );

    const modal = useModalForm<Tenant>();

    // 🌟 Sinkronisasi Selection Bertipe <number> Agar Checkbox Internal Aktif Sempurna
    const selection = useRowSelection<number>();
    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;

    useEffect(() => {
        clearAllRef.current();
    }, [tenants.current_page, filters.search, filters.status]);

    // Hooks Pemicu Tunggal & Massal
    const softDelete = useSoftDelete<Tenant>({
        getUrl: (t) => `/tenants/delete/${t.id}`,
        onSuccess: () => clearAllRef.current(),
    });
    const bulkDelete = useBulkDelete({
        url: '/tenants/bulk-destroy',
        onSuccess: () => clearAllRef.current(),
    });

    // Operasikan columns dengan melemparkan permission untuk menyaring tombol aksi di sel tabel
    const columns = useMemo(() => {
        return createTenantColumns({
            onEdit: (t) => modal.open(t),
            onDelete: (t) => softDelete.trigger(t),
            userPermissions: userPermissions, // 🌟 Oper untuk proteksi aksi baris tabel
        });
    }, [softDelete, modal, userPermissions]);

    const bulkBarActions = canDelete
        ? [
            {
                label: 'Hapus Rekaman Massal',
                icon: <Trash2Icon className="size-3.5" />,
                destructive: true as const,
                onClick: (ids: (string | number)[]) => bulkDelete.trigger(ids),
            },
        ]
        : [];

    const filterFields = [
        {
            key: 'status',
            label: 'Status Hunian',
            placeholder: 'Semua Status',
            options: TENANT_STATUS_OPTIONS,
            value: filters.status,
            onChange: (v: string | undefined) =>
                applyFilter({ status: v } as Partial<TenantFilters>),
        },
    ];

    // ─── RENDER MOBILE LAYOUT ───
    if (mounted && isMobile) {
        return (
            <>
                <Head title="Buku Manajemen Penyewa" />
                <MobileList
                    initialTenants={tenants}
                    filters={filters}
                    onAdd={() => modal.open()}
                    onEdit={(t) => modal.open(t)}
                    onDelete={(t) => softDelete.trigger(t)}
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    isPending={isPending}
                />

                <TenantFormModal open={modal.isOpen} item={modal.item} onClose={modal.close} />

                <DeleteConfirmDialog
                    open={softDelete.open}
                    onOpenChange={softDelete.setOpen}
                    description={
                        <>
                            Apakah Anda yakin membuang profil penyewa{' '}
                            <span className="font-bold">"{softDelete.item?.name}"</span>?
                            Kontrak sewa aktif milik yang bersangkutan (jika ada) akan ikut terhenti.
                        </>
                    }
                    onConfirm={softDelete.confirm}
                />
            </>
        );
    }

    // ─── RENDER DESKTOP LAYOUT ───
    return (
        <>
            <Head title="Buku Manajemen Penyewa" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Manajemen Data Penyewa (Tenant)
                            </h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Total <span className="font-medium text-foreground">{tenants.total}</span> penyewa terdaftar di bawah pengawasan Anda.
                            </p>
                        </div>
                    </div>

                    {/* 🌟 PROTEKSI TOMBOL REGISTRASI DESKTOP */}
                    {canCreate && (
                        <Button
                            onClick={() => modal.open()}
                            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-xl h-11 px-5"
                        >
                            <PlusIcon className="mr-2 size-4" /> Registrasi Penyewa Baru
                        </Button>
                    )}
                </div>

                {/* Toolbar */}
                <DataTableToolbar
                    searchValue={searchValue}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari nama penyewa, nomor WhatsApp, atau nomor KTP..."
                    activeFilterCount={filters.status ? 1 : 0}
                    filterFields={filterFields}
                    onClearFilters={() => applyFilter({ search: undefined, status: undefined } as Partial<TenantFilters>)}
                    perPage={filters.per_page ?? 10}
                    onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<TenantFilters>)}
                />

                {/* Filter Chips */}
                <DataTableFilterChips
                    configs={[
                        {
                            key: 'search',
                            value: filters.search,
                            label: `Pencarian: "${filters.search}"`,
                            onRemove: () => applyFilter({ search: undefined } as Partial<TenantFilters>),
                        },
                        {
                            key: 'status',
                            value: filters.status,
                            label: `Status Hunian: ${labelOf(TENANT_STATUS_OPTIONS, filters.status)}`,
                            onRemove: () => applyFilter({ status: undefined } as Partial<TenantFilters>),
                        },
                    ]}
                />

                {/* Grid Main DataTable */}
                <DataTable
                    data={tenants}
                    columns={columns}
                    getRowId={(d) => d.id}
                    sort={filters.sort}
                    direction={filters.direction}
                    onSort={applySort}
                    isPending={isPending}
                    emptyText="Belum ada data penyewa terdaftar yang sesuai kriteria penapisan."
                    rowSelection={canDelete ? selection : undefined} // 🌟 HANYA AKTIFKAN CHECKBOX JIKA USER PUNYA IZIN DELETION MASSAL
                />

                <DataTablePagination meta={tenants} onPageChange={goToPage} />
            </div>

            <TenantFormModal open={modal.isOpen} item={modal.item} onClose={modal.close} />

            {/* Dialog Hapus Tunggal */}
            <DeleteConfirmDialog
                open={softDelete.open}
                onOpenChange={softDelete.setOpen}
                description={
                    <>
                        Apakah Anda benar-benar yakin ingin menghapus arsip penyewa{' '}
                        <span className="font-bold text-foreground">"{softDelete.item?.name}"</span>?
                        Tindakan ini akan memindahkan data ke area pembuangan sementara.
                    </>
                }
                onConfirm={softDelete.confirm}
            />

            {/* Dialog Hapus Massal */}
            <BulkDeleteConfirmDialog
                open={bulkDelete.open}
                onOpenChange={bulkDelete.setOpen}
                count={bulkDelete.pendingCount}
                isDeleting={bulkDelete.isDeleting}
                onConfirm={bulkDelete.confirm}
                onCancel={bulkDelete.cancel}
                entityLabel="data profil penyewa"
            />

            {/* Floating Bulk Actions Bar */}
            {canDelete && (
                <DataTableBulkBar
                    selectedCount={selection.selectedCount}
                    selectedIds={Array.from(selection.selectedIds)}
                    onClear={selection.clearAll}
                    actions={bulkBarActions}
                />
            )}
        </>
    );
}

TenantIndex.layout = {
    breadcrumbs: [
        { title: 'Manajemen Kos', href: '#' },
        { title: 'Buku Penyewa', href: '/tenants' },
    ],
};
