// resources/js/pages/RoomTypes/index.tsx

import { Head, router } from '@inertiajs/react';
import { PlusIcon, Layers2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
} from '@/components/datatable';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';

import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useModalForm } from '@/hooks/use-modal-form';

import { MobileList } from '@/pages/room-type/mobile-list';
import { createRoomTypeColumns } from './columns';
import { RoomTypeFormModal } from './form';

import type { RoomType, RoomTypeFilters } from '@/types/room/room-type';
import type { PaginatedResponse } from '@/types/pagination';
import type { Property } from '@/types/property/property-type';
import roomTypeController from '@/actions/App/Http/Controllers/RoomTypeController';

type Props = {
    room_types: PaginatedResponse<RoomType>;
    filters: RoomTypeFilters;
    properties: Property[]; // Diperlukan untuk form & opsi filter gedung
};

export default function RoomTypeIndex({ room_types, filters, properties = [] }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const propertiesArray = Array.isArray(properties) ? properties : ((properties as any)?.data ?? []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<RoomTypeFilters>('/room-types', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({ search: value || undefined } as Partial<RoomTypeFilters>);
            }
        },
    );

    const modal = useModalForm<RoomType>();
    const [deleteItem, setDeleteItem] = useState<RoomType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = () => {
        if (!deleteItem) return;
        setIsDeleting(true);

        router.delete(roomTypeController.delete(deleteItem.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteItem(null);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const columns = useMemo(() => {
        return createRoomTypeColumns({
            onEdit: (rt) => modal.open(rt),
            onDelete: (rt) => setDeleteItem(rt),
        });
    }, [modal]);

    const activePropertyName = filters.property_id
        ? propertiesArray.find((p: any) => String(p.id) === String(filters.property_id))?.name
        : null;

    const propertyOptions = propertiesArray.map((p: any) => ({
        value: String(p.id),
        label: p.name,
    }));

    const filterFields = [
        {
            key: 'property_id',
            label: 'Gedung Properti',
            placeholder: 'Semua Properti',
            options: propertyOptions,
            value: filters.property_id,
            onChange: (v: string | undefined) =>
                applyFilter({ property_id: v } as Partial<RoomTypeFilters>),
        },
    ];

    // ─── RENDER MOBILE LAYOUT ───
    if (mounted && isMobile) {
        return (
            <>
                <Head title="Katalog Tipe Kamar" />
                <MobileList
                    initialRoomTypes={room_types}
                    filters={filters}
                    onAdd={() => modal.open()}
                    onEdit={(rt) => modal.open(rt)}
                    onDelete={(rt) => setDeleteItem(rt)}
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    isPending={isPending}
                />

                <RoomTypeFormModal open={modal.isOpen} item={modal.item} properties={propertiesArray} onClose={modal.close} />

                <DeleteConfirmDialog
                    open={!!deleteItem}
                    onOpenChange={(isOpen) => !isOpen && setDeleteItem(null)}
                    description={
                        <>
                            Apakah Anda benar-benar yakin ingin menghapus kategori tipe kamar{' '}
                            <span className="font-bold text-foreground">"{deleteItem?.name}"</span>?
                            Tindakan ini permanen dan dapat merusak relasi kamar fisik di bawahnya.
                        </>
                    }
                    isDeleting={isDeleting}
                    onConfirm={handleDeleteConfirm}
                />
            </>
        );
    }

    // ─── RENDER DESKTOP LAYOUT ───
    return (
        <>
            <Head title="Katalog Tipe Kamar & Tarif" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                            <Layers2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Klasifikasi Tipe & Tarif Kamar</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Total <span className="font-medium text-foreground">{room_types.total}</span> kategori harga terdaftar di sistem.
                            </p>
                        </div>
                    </div>

                    <Button onClick={() => modal.open()} className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-xl">
                        <PlusIcon className="mr-2 size-4" /> Tambah Klasifikasi Kamar
                    </Button>
                </div>

                {/* Toolbar */}
                <DataTableToolbar
                    searchValue={searchValue}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari klasifikasi tipe kamar..."
                    activeFilterCount={filters.property_id ? 1 : 0}
                    filterFields={filterFields}
                    onClearFilters={() => applyFilter({ search: undefined, property_id: undefined } as Partial<RoomTypeFilters>)}
                    perPage={filters.per_page ?? 10}
                    onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<RoomTypeFilters>)}
                />

                {/* Filter Chips */}
                <DataTableFilterChips
                    configs={[
                        {
                            key: 'search',
                            value: filters.search,
                            label: `Pencarian: "${filters.search}"`,
                            onRemove: () => applyFilter({ search: undefined } as Partial<RoomTypeFilters>),
                        },
                        {
                            key: 'property_id',
                            value: filters.property_id,
                            label: `Gedung: ${activePropertyName ?? '—'}`,
                            onRemove: () => applyFilter({ property_id: undefined } as Partial<RoomTypeFilters>),
                        },
                    ]}
                />

                {/* Grid Table */}
                <DataTable
                    data={room_types}
                    columns={columns}
                    getRowId={(d) => d.id}
                    sort={filters.sort}
                    direction={filters.direction}
                    onSort={applySort}
                    isPending={isPending}
                    emptyText="Belum ada parameter tipe kamar dikonfigurasikan."
                />
                <DataTablePagination meta={room_types} onPageChange={goToPage} />
            </div>

            <RoomTypeFormModal open={modal.isOpen} item={modal.item} properties={propertiesArray} onClose={modal.close} />

            <DeleteConfirmDialog
                open={!!deleteItem}
                onOpenChange={(isOpen) => !isOpen && setDeleteItem(null)}
                description={
                    <>
                        Menghapus spesifikasi tipe kamar{' '}
                        <span className="font-bold text-foreground">"{deleteItem?.name}"</span>
                        dapat berdampak pada status kalkulasi biaya sewa kamar. Lanjutkan?
                    </>
                }
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}

RoomTypeIndex.layout = {
    breadcrumbs: [
        { title: 'Manajemen Kamar', href: '#' },
        { title: 'Tipe & Skema Tarif', href: '/room-types' },
    ],
};
