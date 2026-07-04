// resources/js/pages/Properties/index.tsx

import { Head, router } from '@inertiajs/react';
import { PlusIcon, RotateCcwIcon, Trash2Icon, Building2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';

import {
    BulkDeleteConfirmDialog,
    BulkForceDeleteConfirmDialog,
    BulkRestoreConfirmDialog,
    DataTable,
    DataTableBulkBar,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
    DataTableTrashToggle,
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

import { MobileList } from '@/pages/property/mobile-list';
import { createPropertyColumns, createPropertyTrashedColumns } from './columns';
import { PropertyFormModal } from './form';

import type { Property, PropertyFilters } from '@/types/property/property-type';
import type { PaginatedResponse } from '@/types/pagination';

// ─── Options Context ─────────────────────────────────────────────────────────

const ACTIVE_STATUS_OPTIONS = [
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
];

const labelOf = (options: { value: string; label: string }[], value?: string) => {
    return options.find((opt) => opt.value === value)?.label ?? '—';
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    properties: PaginatedResponse<Property>;
    filters: PropertyFilters;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyIndex({ properties, filters }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const propertiesArray = Array.isArray(properties.data) ? properties.data : [];

    useEffect(() => {
        setMounted(true);
    }, []);

    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<PropertyFilters>('/properties', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<PropertyFilters>);
            }
        },
    );

    const handleTrashToggle = useCallback(
        (show: boolean) => {
            applyFilter({
                trashed: show ? '1' : undefined,
                search: undefined,
                is_active: undefined,
                city: undefined,
            } as Partial<PropertyFilters>);
        },
        [applyFilter],
    );

    const modal = useModalForm<Property>();

    // 🌟 SINKRONISASI SELECTION: Menggunakan jenis <number> sesuai referensi debt/index
    const selection = useRowSelection<number>();
    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;

    useEffect(() => {
        clearAllRef.current();
    }, [
        properties.current_page,
        filters.search,
        filters.trashed,
        filters.is_active,
        filters.city,
    ]);

    const softDelete = useSoftDelete<Property>({
        getUrl: (p) => `/properties/delete/${p.id}`,
        onSuccess: () => clearAllRef.current(),
    });
    const bulkDelete = useBulkDelete({
        url: '/properties/bulk-destroy',
        onSuccess: () => clearAllRef.current(),
    });
    const singleRestore = useSoftDelete<Property>({
        getUrl: (p) => `/properties/restore/${p.id}`,
        method: 'post',
    });
    const singleForceDelete = useSoftDelete<Property>({
        getUrl: (p) => `/properties/force-delete/${p.id}`,
    });
    const bulkRestore = useBulkRestore({
        url: '/properties/bulk-restore',
        onSuccess: () => clearAllRef.current(),
    });
    const bulkForceDelete = useBulkForceDelete({
        url: '/properties/bulk-force-delete',
        onSuccess: () => clearAllRef.current(),
    });

    const columns = useMemo(() => {
        return showTrashed
            ? createPropertyTrashedColumns({
                onRestore: (p) => singleRestore.trigger(p),
                onForceDelete: (p) => singleForceDelete.trigger(p),
            })
            : createPropertyColumns({
                onEdit: (p) => modal.open(p),
                onDelete: (p) => softDelete.trigger(p),
            });
    }, [showTrashed, singleRestore, singleForceDelete, softDelete, modal]);

    // 🌟 SINKRONISASI ACTIONS BAR: Menambahkan format 'as const' sesuai referensi
    const bulkBarActions = showTrashed
        ? [
            {
                label: 'Pulihkan',
                icon: <RotateCcwIcon className="size-3.5" />,
                onClick: (ids: (string | number)[]) =>
                    bulkRestore.trigger(ids),
            },
            {
                label: 'Hapus Permanen',
                icon: <Trash2Icon className="size-3.5" />,
                destructive: true as const,
                onClick: (ids: (string | number)[]) =>
                    bulkForceDelete.trigger(ids),
            },
        ]
        : [
            {
                label: 'Hapus Rekaman',
                icon: <Trash2Icon className="size-3.5" />,
                destructive: true as const,
                onClick: (ids: (string | number)[]) =>
                    bulkDelete.trigger(ids),
            },
        ];

    const filterFields = showTrashed
        ? []
        : [
            {
                key: 'is_active',
                label: 'Status Operasional',
                placeholder: 'Semua Status',
                options: ACTIVE_STATUS_OPTIONS,
                value: filters.is_active,
                onChange: (v: string | undefined) =>
                    applyFilter({ is_active: v } as Partial<PropertyFilters>),
            },
        ];

    // ─── RENDER MOBILE LAYOUT ───
    if (mounted && isMobile) {
        return (
            <>
                <Head title="Manajemen Properti Kos" />
                <MobileList
                    initialProperties={properties}
                    filters={filters}
                    showTrashed={showTrashed}
                    onAdd={() => modal.open()}
                    onEdit={(p) => modal.open(p)}
                    onDelete={(p) => softDelete.trigger(p)}
                    onRestore={(p) => singleRestore.trigger(p)}
                    onForceDelete={(p) => singleForceDelete.trigger(p)}
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    isPending={isPending}
                />

                <PropertyFormModal
                    open={modal.isOpen}
                    item={modal.item}
                    onClose={modal.close}
                />

                <DeleteConfirmDialog
                    open={softDelete.open}
                    onOpenChange={softDelete.setOpen}
                    description={
                        <>
                            Apakah Anda yakin ingin membuang properti kos{' '}
                            <span className="font-semibold text-foreground">
                                "{softDelete.item?.name}"
                            </span>{' '}
                            ke keranjang sampah?
                        </>
                    }
                    onConfirm={softDelete.confirm}
                />

                <DeleteConfirmDialog
                    open={singleRestore.open}
                    onOpenChange={singleRestore.setOpen}
                    description={
                        <>
                            Pulihkan kembali catatan administrasi properti{' '}
                            <span className="font-semibold text-foreground">
                                "{singleRestore.item?.name}"
                            </span>{' '}
                            ke daftar utama?
                        </>
                    }
                    onConfirm={singleRestore.confirm}
                    confirmLabel="Pulihkan"
                    confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
                />

                <DeleteConfirmDialog
                    open={singleForceDelete.open}
                    onOpenChange={singleForceDelete.setOpen}
                    description={
                        <>
                            <span className="font-semibold text-red-600">
                                Hapus permanen
                            </span>{' '}
                            data properti{' '}
                            <span className="font-semibold text-foreground">
                                "{singleForceDelete.item?.name}"
                            </span>
                            ? Seluruh komponen anak termasuk kamar fisik akan terhapus bersih.
                        </>
                    }
                    onConfirm={singleForceDelete.confirm}
                />
            </>
        );
    }

    // ─── RENDER DESKTOP LAYOUT ───
    return (
        <>
            <Head title="Manajemen Properti Kos" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Buku Daftar Properti Kos
                            {showTrashed && (
                                <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-sm font-medium text-red-600 dark:text-red-400">
                                    Sampah
                                </span>
                            )}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {showTrashed ? 'Menampilkan' : 'Total'}{' '}
                            <span className="font-medium text-foreground">
                                {properties.total}
                            </span>{' '}
                            catatan berjalan.
                        </p>
                    </div>

                    {!showTrashed && (
                        <Button
                            onClick={() => modal.open()}
                            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-xl"
                        >
                            <PlusIcon className="mr-2 size-4" /> Daftarkan Properti Baru
                        </Button>
                    )}
                </div>

                <DataTableToolbar
                    searchValue={searchValue}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari nama properti atau kota..."
                    activeFilterCount={filters.is_active ? 1 : 0}
                    filterFields={filterFields}
                    onClearFilters={() =>
                        applyFilter({
                            search: undefined,
                            is_active: undefined,
                        } as Partial<PropertyFilters>)
                    }
                    perPage={filters.per_page ?? 10}
                    onPerPageChange={(v) =>
                        applyFilter({ per_page: v } as Partial<PropertyFilters>)
                    }
                    rightSlot={
                        <DataTableTrashToggle
                            showTrashed={showTrashed}
                            onChange={handleTrashToggle}
                        />
                    }
                />

                <DataTableFilterChips
                    configs={[
                        {
                            key: 'search',
                            value: filters.search,
                            label: `Pencarian: "${filters.search}"`,
                            onRemove: () =>
                                applyFilter({
                                    search: undefined,
                                } as Partial<PropertyFilters>),
                        },
                        {
                            key: 'is_active',
                            value: showTrashed ? undefined : filters.is_active,
                            label: `Status: ${labelOf(ACTIVE_STATUS_OPTIONS, filters.is_active)}`,
                            onRemove: () =>
                                applyFilter({
                                    is_active: undefined,
                                } as Partial<PropertyFilters>),
                        },
                    ]}
                />

                <DataTable
                    data={properties}
                    columns={columns}
                    getRowId={(d) => d.id}
                    sort={filters.sort}
                    direction={filters.direction}
                    onSort={applySort}
                    isPending={isPending}
                    emptyText={
                        showTrashed
                            ? 'Tidak ada data properti di tempat sampah.'
                            : 'Belum ada gedung properti kos yang terdaftar.'
                    }
                    rowSelection={selection}
                />

                <DataTablePagination meta={properties} onPageChange={goToPage} />
            </div>

            <PropertyFormModal
                open={modal.isOpen}
                item={modal.item}
                onClose={modal.close}
            />

            <DeleteConfirmDialog
                open={softDelete.open}
                onOpenChange={softDelete.setOpen}
                description={
                    <>
                        Apakah Anda yakin ingin membuang properti kos{' '}
                        <span className="font-semibold text-foreground">
                            "{softDelete.item?.name}"
                        </span>{' '}
                        ke keranjang sampah?
                    </>
                }
                onConfirm={softDelete.confirm}
            />

            <DeleteConfirmDialog
                open={singleRestore.open}
                onOpenChange={singleRestore.setOpen}
                description={
                    <>
                        Pulihkan kembali catatan administrasi properti{' '}
                        <span className="font-semibold text-foreground">
                            "{singleRestore.item?.name}"
                        </span>{' '}
                        ke daftar utama?
                    </>
                }
                onConfirm={singleRestore.confirm}
                confirmLabel="Pulihkan"
                confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
            />

            <DeleteConfirmDialog
                open={singleForceDelete.open}
                onOpenChange={singleForceDelete.setOpen}
                description={
                    <>
                        <span className="font-semibold text-red-600">
                            Hapus permanen
                        </span>{' '}
                        data properti{' '}
                        <span className="font-semibold text-foreground">
                            "{singleForceDelete.item?.name}"
                        </span>
                        ? Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                onConfirm={singleForceDelete.confirm}
            />

            <BulkDeleteConfirmDialog
                open={bulkDelete.open}
                onOpenChange={bulkDelete.setOpen}
                count={bulkDelete.pendingCount}
                isDeleting={bulkDelete.isDeleting}
                onConfirm={bulkDelete.confirm}
                onCancel={bulkDelete.cancel}
                entityLabel="properti kos"
            />

            <BulkRestoreConfirmDialog
                open={bulkRestore.open}
                onOpenChange={bulkRestore.setOpen}
                count={bulkRestore.pendingCount}
                isRestoring={bulkRestore.isRestoring}
                onConfirm={bulkRestore.confirm}
                onCancel={bulkRestore.cancel}
                entityLabel="properti kos"
            />

            <BulkForceDeleteConfirmDialog
                open={bulkForceDelete.open}
                onOpenChange={bulkForceDelete.setOpen}
                count={bulkForceDelete.pendingCount}
                isDeleting={bulkForceDelete.isDeleting}
                onConfirm={bulkForceDelete.confirm}
                onCancel={bulkForceDelete.cancel}
                entityLabel="properti kos"
            />

            <DataTableBulkBar
                selectedCount={selection.selectedCount}
                selectedIds={Array.from(selection.selectedIds)}
                onClear={selection.clearAll}
                actions={bulkBarActions}
            />
        </>
    );
}

PropertyIndex.layout = {
    breadcrumbs: [{ title: 'Manajemen Properti', href: '/properties' }],
};
