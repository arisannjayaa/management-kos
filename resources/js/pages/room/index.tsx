// resources/js/pages/Rooms/index.tsx

import { Head, router } from '@inertiajs/react';
import { PlusIcon, RotateCcwIcon, Trash2Icon, BedDouble } from 'lucide-react';
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

import { MobileList } from '@/pages/room/mobile-list';
import { createRoomColumns, createRoomTrashedColumns } from './columns';
import { RoomFormModal } from './form';

import type { Room, RoomFilters } from '@/types/room/room-type';
import type { PaginatedResponse } from '@/types/pagination';

const STATUS_OPTIONS = [
    { value: 'available', label: 'Kosong (Ready)' },
    { value: 'occupied', label: 'Terisi' },
    { value: 'maintenance', label: 'Perbaikan' },
];

type Props = {
    rooms: PaginatedResponse<Room>;
    filters: RoomFilters;
    properties: any[];
    room_types: any[];
};

export default function RoomIndex({ rooms, filters, properties = [], room_types = [] }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const propertiesArray = Array.isArray(properties) ? properties : ((properties as any)?.data ?? []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<RoomFilters>('/rooms', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({ search: value || undefined } as Partial<RoomFilters>);
            }
        }
    );

    const handleTrashToggle = useCallback(
        (show: boolean) => {
            applyFilter({
                trashed: show ? '1' : undefined,
                search: undefined,
                status: undefined,
                property_id: undefined,
                room_type_id: undefined
            } as Partial<RoomFilters>);
        },
        [applyFilter]
    );

    const modal = useModalForm<Room>();

    // 🌟 SINKRONISASI SELECTION: Menggunakan <number> untuk mengaktifkan checkbox internal tabel
    const selection = useRowSelection<number>();
    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;

    useEffect(() => {
        clearAllRef.current();
    }, [
        rooms.current_page,
        filters.search,
        filters.trashed,
        filters.status,
        filters.property_id
    ]);

    const softDelete = useSoftDelete<Room>({
        getUrl: (r) => `/rooms/delete/${r.id}`,
        onSuccess: () => clearAllRef.current()
    });
    const bulkDelete = useBulkDelete({
        url: '/rooms/bulk-destroy',
        onSuccess: () => clearAllRef.current()
    });
    const singleRestore = useSoftDelete<Room>({
        getUrl: (r) => `/rooms/restore/${r.id}`,
        method: 'post'
    });
    const singleForceDelete = useSoftDelete<Room>({
        getUrl: (r) => `/rooms/force-delete/${r.id}`
    });
    const bulkRestore = useBulkRestore({
        url: '/rooms/bulk-restore',
        onSuccess: () => clearAllRef.current()
    });
    const bulkForceDelete = useBulkForceDelete({
        url: '/rooms/bulk-force-delete',
        onSuccess: () => clearAllRef.current()
    });

    const columns = useMemo(() => {
        return showTrashed
            ? createRoomTrashedColumns({
                onRestore: (r) => singleRestore.trigger(r),
                onForceDelete: (r) => singleForceDelete.trigger(r)
            })
            : createRoomColumns({
                onEdit: (r) => modal.open(r),
                onDelete: (r) => softDelete.trigger(r)
            });
    }, [showTrashed, singleRestore, singleForceDelete, softDelete, modal]);

    // 🌟 SINKRONISASI ACTIONS BAR
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
                key: 'property_id',
                label: 'Gedung Kos',
                placeholder: 'Semua Gedung',
                options: propertiesArray.map((p: any) => ({ value: String(p.id), label: p.name })),
                value: filters.property_id,
                onChange: (v: string | undefined) => applyFilter({ property_id: v, room_type_id: undefined } as Partial<RoomFilters>)
            },
            {
                key: 'status',
                label: 'Status Hunian',
                placeholder: 'Semua Status',
                options: STATUS_OPTIONS,
                value: filters.status,
                onChange: (v: string | undefined) => applyFilter({ status: v } as Partial<RoomFilters>)
            },
        ];

    // ─── RENDER MOBILE LAYOUT ───
    if (mounted && isMobile) {
        return (
            <>
                <Head title="Manajemen Unit Kamar" />
                <MobileList
                    initialRooms={rooms}
                    filters={filters}
                    showTrashed={showTrashed}
                    onAdd={() => modal.open()}
                    onEdit={(r) => modal.open(r)}
                    onDelete={(r) => softDelete.trigger(r)}
                    onRestore={(r) => singleRestore.trigger(r)}
                    onForceDelete={(r) => singleForceDelete.trigger(r)}
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    isPending={isPending}
                />
                <RoomFormModal open={modal.isOpen} item={modal.item} properties={propertiesArray} roomTypes={room_types} onClose={modal.close} />
                <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Buang Kamar <span className="font-bold">"{softDelete.item?.room_number}"</span> ke sampah?</>} onConfirm={softDelete.confirm} />
            </>
        );
    }

    // ─── RENDER DESKTOP LAYOUT ───
    return (
        <>
            <Head title="Manajemen Unit Kamar" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Buku Pemetaan Kamar Fisik
                            {showTrashed && <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600">Sampah</span>}
                        </h1>
                        <p className="text-sm text-muted-foreground">Total <span className="font-medium text-foreground">{rooms.total}</span> catatan berjalan.</p>
                    </div>
                    {!showTrashed && <Button onClick={() => modal.open()} className="bg-primary text-primary-foreground rounded-xl"><PlusIcon className="mr-2 size-4" /> Tambah Unit Kamar</Button>}
                </div>

                <DataTableToolbar searchValue={searchValue} onSearch={handleSearch} searchPlaceholder="Cari kode/nomor kamar..." activeFilterCount={(filters.property_id ? 1 : 0) + (filters.status ? 1 : 0)} filterFields={filterFields} onClearFilters={() => applyFilter({ search: undefined, property_id: undefined, status: undefined } as Partial<RoomFilters>)} perPage={filters.per_page ?? 10} onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<RoomFilters>)} rightSlot={<DataTableTrashToggle showTrashed={showTrashed} onChange={handleTrashToggle} />} />

                <DataTable data={rooms} columns={columns} getRowId={(d) => d.id} sort={filters.sort} direction={filters.direction} onSort={applySort} isPending={isPending} emptyText="Tidak ada rekaman kamar ditemukan." rowSelection={selection} />
                <DataTablePagination meta={rooms} onPageChange={goToPage} />
            </div>

            <RoomFormModal open={modal.isOpen} item={modal.item} properties={propertiesArray} roomTypes={room_types} onClose={modal.close} />

            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Apakah Anda yakin ingin membuang kamar <span className="font-bold">"{softDelete.item?.room_number}"</span> ke keranjang sampah?</>} onConfirm={softDelete.confirm} />
            <DeleteConfirmDialog open={singleRestore.open} onOpenChange={singleRestore.setOpen} description={<>Pulihkan kembali unit kamar <span className="font-bold">"{singleRestore.item?.room_number}"</span>?</>} onConfirm={singleRestore.confirm} confirmLabel="Pulihkan" confirmClassName="bg-emerald-600 text-white hover:bg-emerald-700" />
            <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen} description={<>Hapus permanen unit kamar <span className="font-bold">"{singleForceDelete.item?.room_number}"</span>? Tindakan ini tidak dapat dibatalkan.</>} onConfirm={singleForceDelete.confirm} />

            <BulkDeleteConfirmDialog open={bulkDelete.open} onOpenChange={bulkDelete.setOpen} count={bulkDelete.pendingCount} isDeleting={bulkDelete.isDeleting} onConfirm={bulkDelete.confirm} onCancel={bulkDelete.cancel} entityLabel="unit kamar" />
            <BulkRestoreConfirmDialog open={bulkRestore.open} onOpenChange={bulkRestore.setOpen} count={bulkRestore.pendingCount} isRestoring={bulkRestore.isRestoring} onConfirm={bulkRestore.confirm} onCancel={bulkRestore.cancel} entityLabel="unit kamar" />
            <BulkForceDeleteConfirmDialog open={bulkForceDelete.open} onOpenChange={bulkForceDelete.setOpen} count={bulkForceDelete.pendingCount} isDeleting={bulkForceDelete.isDeleting} onConfirm={bulkForceDelete.confirm} onCancel={bulkForceDelete.cancel} entityLabel="unit kamar" />

            <DataTableBulkBar
                selectedCount={selection.selectedCount}
                selectedIds={Array.from(selection.selectedIds)}
                onClear={selection.clearAll}
                actions={bulkBarActions}
            />
        </>
    );
}

RoomIndex.layout = { breadcrumbs: [{ title: 'Manajemen Kamar', href: '#' }, { title: 'Buku Pemetaan Kamar', href: '/rooms' }] };
