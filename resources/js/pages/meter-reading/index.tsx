// resources/js/pages/MeterReadings/index.tsx

import { Head, router } from '@inertiajs/react';
import { PlusIcon, RotateCcwIcon, Trash2Icon, Gauge } from 'lucide-react';
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

import { MobileList } from './mobile-list';
import { createMeterReadingColumns, createMeterReadingTrashedColumns } from './columns';
import { MeterReadingFormModal } from './form';

import type { MeterReading, MeterReadingFilters } from '@/types/meter-reading/meter-reading-type';
import type { PaginatedResponse } from '@/types/pagination';
import chargeMeterReadingController from '@/actions/App/Http/Controllers/ChargeMeterReadingController';

type Props = {
    meterReadings: PaginatedResponse<MeterReading>;
    filters: MeterReadingFilters;
    properties: any[];
    chargeTypes: any[];
    occupancies: any[];
};

export default function MeterReadingIndex({ meterReadings, filters, properties = [], chargeTypes = [], occupancies = [] }: Props) {
    const showTrashed = filters.trashed === '1'; //[cite: 3]
    const isMobile = useIsMobile(); //[cite: 3]
    const [mounted, setMounted] = useState(false); //[cite: 3]

    const propertiesArray = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];
    const occupanciesArray = Array.isArray(occupancies) ? occupancies : (occupancies as any)?.data ?? [];
    const chargeTypesArray = Array.isArray(chargeTypes) ? chargeTypes : (chargeTypes as any)?.data ?? [];

    useEffect(() => {
        setMounted(true); //[cite: 3]
    }, []);

    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<MeterReadingFilters>('/meter-readings', filters); //[cite: 3]

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<MeterReadingFilters>);
            }
        },
    ); //[cite: 3]

    const handleTrashToggle = useCallback(
        (show: boolean) => {
            applyFilter({
                trashed: show ? '1' : undefined,
                search: undefined,
                property_id: undefined,
                charge_type_id: undefined,
            } as Partial<MeterReadingFilters>);
        },
        [applyFilter],
    ); //[cite: 3]

    const [formOpen, setFormOpen] = useState(false);

    // 🌟 SINKRONISASI SELECTION: Wajib menggunakan jenis <number> sesuai standar referensi agar Checkbox dirender otomatis[cite: 3]
    const selection = useRowSelection<number>();
    const clearAllRef = useRef(selection.clearAll); //[cite: 3]
    clearAllRef.current = selection.clearAll; //[cite: 3]

    useEffect(() => {
        clearAllRef.current();
    }, [
        meterReadings.current_page,
        filters.search,
        filters.trashed,
        filters.property_id,
        filters.charge_type_id,
    ]); //[cite: 3]

    const softDelete = useSoftDelete<MeterReading>({
        getUrl: (m) => chargeMeterReadingController.destroy(m.id).url,
        onSuccess: () => clearAllRef.current(),
    }); //[cite: 3]
    const bulkDelete = useBulkDelete({
        url: chargeMeterReadingController.bulkDestroy().url,
        onSuccess: () => clearAllRef.current(),
    }); //[cite: 3]
    const singleRestore = useSoftDelete<MeterReading>({
        getUrl: (m) => chargeMeterReadingController.restore(m.id).url,
        method: 'post',
    }); //[cite: 3]
    const singleForceDelete = useSoftDelete<MeterReading>({
        getUrl: (m) => chargeMeterReadingController.forceDelete(m.id).url,
    }); //[cite: 3]
    const bulkRestore = useBulkRestore({
        url: chargeMeterReadingController.bulkRestore().url,
        onSuccess: () => clearAllRef.current(),
    }); //[cite: 3]
    const bulkForceDelete = useBulkForceDelete({
        url: chargeMeterReadingController.bulkForceDelete().url,
        onSuccess: () => clearAllRef.current(),
    }); //[cite: 3]

    const columns = useMemo(() => {
        return showTrashed
            ? createMeterReadingTrashedColumns({
                onRestore: (m) => singleRestore.trigger(m),
                onForceDelete: (m) => singleForceDelete.trigger(m),
            })
            : createMeterReadingColumns({
                onDelete: (m) => softDelete.trigger(m),
            });
    }, [showTrashed, singleRestore, singleForceDelete, softDelete]); //[cite: 3]

    // 🌟 SINKRONISASI ACTIONS BAR: Menyelaraskan signature data array string/number & penegas format 'as const'[cite: 3]
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
                label: 'Anulir Rekaman',
                icon: <Trash2Icon className="size-3.5" />,
                destructive: true as const,
                onClick: (ids: (string | number)[]) =>
                    bulkDelete.trigger(ids),
            },
        ]; //[cite: 3]

    const filterFields = showTrashed
        ? []
        : [
            {
                key: 'property_id',
                label: 'Gedung Kos',
                placeholder: 'Semua Gedung',
                options: propertiesArray.map((p: any) => ({ value: String(p.id), label: p.name })),
                value: filters.property_id,
                onChange: (v: string | undefined) =>
                    applyFilter({ property_id: v } as Partial<MeterReadingFilters>),
            },
            {
                key: 'charge_type_id',
                label: 'Jenis Beban',
                placeholder: 'Semua Utilitas',
                options: chargeTypesArray.map((c: any) => ({ value: String(c.id), label: c.name })),
                value: filters.charge_type_id,
                onChange: (v: string | undefined) =>
                    applyFilter({ charge_type_id: v } as Partial<MeterReadingFilters>),
            },
        ]; //[cite: 3]

    const activePropName = filters.property_id
        ? propertiesArray.find((p: any) => String(p.id) === String(filters.property_id))?.name
        : null; //[cite: 3]

    if (mounted && isMobile) {
        return (
            <>
                <Head title="Meteran Utilitas Kos" />
                <MobileList
                    initialReadings={meterReadings}
                    showTrashed={showTrashed}
                    onAdd={() => setFormOpen(true)}
                    onDelete={(m) => softDelete.trigger(m)}
                    onRestore={(m) => singleRestore.trigger(m)}
                    onForceDelete={(m) => singleForceDelete.trigger(m)}
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    isPending={isPending}
                />
                <MeterReadingFormModal
                    open={formOpen}
                    chargeTypes={chargeTypesArray}
                    occupancies={occupanciesArray}
                    onClose={() => setFormOpen(false)}
                />
                <DeleteConfirmDialog
                    open={softDelete.open}
                    onOpenChange={softDelete.setOpen}
                    description={
                        <>
                            Anulir log pencatatan meteran kamar{' '}
                            <span className="font-semibold text-foreground">
                                "{softDelete.item?.room_number}"
                            </span>
                            ?
                        </>
                    }
                    onConfirm={softDelete.confirm}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Buku Meteran Utilitas" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <Gauge size={24} className="text-primary"/> Buku Meteran Utilitas Kamar
                            {showTrashed && (
                                <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-sm font-medium text-red-600">
                                    Sampah
                                </span>
                            )}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {showTrashed ? 'Menampilkan' : 'Total'}{' '}
                            <span className="font-medium text-foreground">
                                {meterReadings.total}
                            </span>{' '}
                            arsip pencatatan.
                        </p>
                    </div>
                    {!showTrashed && (
                        <Button
                            onClick={() => setFormOpen(true)}
                            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-xl"
                        >
                            <PlusIcon className="mr-2 size-4" /> Catat Meteran Baru
                        </Button>
                    )}
                </div>

                <DataTableToolbar
                    searchValue={searchValue}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari nomor kamar atau penyewa..."
                    activeFilterCount={(filters.property_id ? 1 : 0) + (filters.charge_type_id ? 1 : 0)}
                    filterFields={filterFields}
                    onClearFilters={() =>
                        applyFilter({
                            search: undefined,
                            property_id: undefined,
                            charge_type_id: undefined,
                        } as Partial<MeterReadingFilters>)
                    }
                    perPage={filters.per_page ?? 10}
                    onPerPageChange={(v) =>
                        applyFilter({ per_page: v } as Partial<MeterReadingFilters>)
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
                                } as Partial<MeterReadingFilters>),
                        },
                        {
                            key: 'property_id',
                            value: filters.property_id,
                            label: `Gedung: ${activePropName ?? '—'}`,
                            onRemove: () =>
                                applyFilter({
                                    property_id: undefined,
                                } as Partial<MeterReadingFilters>),
                        },
                    ]}
                />

                <DataTable
                    data={meterReadings}
                    columns={columns}
                    getRowId={(d) => d.id}
                    sort={filters.sort}
                    direction={filters.direction}
                    onSort={applySort}
                    isPending={isPending}
                    emptyText={
                        showTrashed
                            ? 'Tidak ada log meteran di tempat sampah.'
                            : 'Belum ada log stand meteran terekam.'
                    }
                    rowSelection={selection} // 🌟 PASOKAN AKTRIS UTAMA: Sekarang checkbox otomatis menyembul keluar[cite: 3]
                />

                <DataTablePagination meta={meterReadings} onPageChange={goToPage} />
            </div>

            <MeterReadingFormModal
                open={formOpen}
                chargeTypes={chargeTypesArray}
                occupancies={occupanciesArray}
                onClose={() => setFormOpen(false)}
            />

            <DeleteConfirmDialog
                open={softDelete.open}
                onOpenChange={softDelete.setOpen}
                description={
                    <>
                        Buang riwayat meteran kamar{' '}
                        <span className="font-semibold text-foreground">
                            "{softDelete.item?.room_number}"
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
                        Pulihkan log meteran kamar{' '}
                        <span className="font-semibold text-foreground">
                            "{singleRestore.item?.room_number}"
                        </span>
                        ?
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
                        Hapus permanen log pemakaian kamar{' '}
                        <span className="font-semibold text-foreground">
                            "{singleForceDelete.item?.room_number}"
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
                entityLabel="log meteran"
            />

            <BulkRestoreConfirmDialog
                open={bulkRestore.open}
                onOpenChange={bulkRestore.setOpen}
                count={bulkRestore.pendingCount}
                isRestoring={bulkRestore.isRestoring}
                onConfirm={bulkRestore.confirm}
                onCancel={bulkRestore.cancel}
                entityLabel="log meteran"
            />

            <BulkForceDeleteConfirmDialog
                open={bulkForceDelete.open}
                onOpenChange={bulkForceDelete.setOpen}
                count={bulkForceDelete.pendingCount}
                isDeleting={bulkForceDelete.isDeleting}
                onConfirm={bulkForceDelete.confirm}
                onCancel={bulkForceDelete.cancel}
                entityLabel="log meteran"
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

MeterReadingIndex.layout = { breadcrumbs: [{ title: 'Manajemen Kos', href: '#' }, { title: 'Meteran Utilitas', href: '/meter-readings' }] };
