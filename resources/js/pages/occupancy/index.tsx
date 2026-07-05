// resources/js/pages/Occupancies/index.tsx

import { Head, usePage, router } from '@inertiajs/react';
import { PlusIcon, BedDouble, ShieldAlert, LogOut, Calendar } from 'lucide-react';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    DataTable,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
} from '@/components/datatable';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useModalForm } from '@/hooks/use-modal-form';
import { useSoftDelete } from '@/hooks/use-soft-delete';

import { MobileList } from '@/pages/occupancy/mobile-list';
import { createOccupancyColumns } from './columns';
import { OccupancyFormModal } from './form';

import type { Occupancy, OccupancyFilters } from '@/types/occupancy/occupancy-type';
import type { PaginatedResponse } from '@/types/pagination';

const STATUS_OPTIONS = [
    { value: 'active', label: 'Aktif Menghuni' },
    { value: 'checked_out', label: 'Sudah Keluar (History)' },
];

const labelOf = (options: { value: string; label: string }[], value?: string) => {
    return options.find((opt) => opt.value === value)?.label ?? '—';
};

type Props = {
    occupancies: PaginatedResponse<Occupancy>;
    filters: OccupancyFilters;
    properties: any[];
    tenants: any[];
};

export default function OccupancyIndex({ occupancies, filters, properties = [], tenants = [] }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];

    const isSuperAdmin = userRoles.includes('super_admin');
    const canCreate = isSuperAdmin || userPermissions.includes('occupancy.create');
    const canUpdate = isSuperAdmin || userPermissions.includes('occupancy.update');
    const canDelete = isSuperAdmin || userPermissions.includes('occupancy.delete');

    const propertiesArray = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];

    // States lokal penanganan checkout dengan penanggalan
    const [checkOutItem, setCheckOutItem] = useState<Occupancy | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<OccupancyFilters>('/occupancies', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => { if (value !== (filters.search ?? '')) applyFilter({ search: value || undefined } as Partial<OccupancyFilters>); }
    );

    const modal = useModalForm<Occupancy>();

    const softDelete = useSoftDelete<Occupancy>({
        getUrl: (oc) => `/occupancies/delete/${oc.id}`,
    });

    // Eksekusi Tembakan POST Check-Out ke backend dengan menyertakan payload end_date
    const handleCheckOutConfirm = () => {
        if (!checkOutItem) return;
        setIsCheckingOut(true);

        router.post(`/occupancies/check-out/${checkOutItem.id}`, {
            end_date: checkOutDate
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCheckOutItem(null);
                toast.success('Penyewa berhasil di-checkout. Status kamar kembali kosong!');
            },
            onFinish: () => setIsCheckingOut(false)
        });
    };

    const columns = useMemo(() => {
        return createOccupancyColumns({
            onCheckOut: (oc) => {
                setCheckOutDate(new Date().toISOString().split('T')[0]);
                setCheckOutItem(oc);
            },
            onDelete: (oc) => softDelete.trigger(oc),
            userPermissions: userPermissions
        });
    }, [softDelete, userPermissions]);

    const filterFields = [
        { key: 'property_id', label: 'Gedung Properti', placeholder: 'Semua Properti', options: propertiesArray.map((p: any) => ({ value: String(p.id), label: p.name })), value: filters.property_id, onChange: (v: string | undefined) => applyFilter({ property_id: v } as Partial<OccupancyFilters>) },
        { key: 'status', label: 'Status Kontrak', placeholder: 'Semua Status', options: STATUS_OPTIONS, value: filters.status, onChange: (v: string | undefined) => applyFilter({ status: v } as Partial<OccupancyFilters>) },
    ];

    const activePropName = filters.property_id
        ? propertiesArray.find((p: any) => String(p.id) === String(filters.property_id))?.name
        : null;

    // ─── RENDER MOBILE ───
    if (mounted && isMobile) {
        return (
            <>
                <Head title="Manajemen Kontrak Sewa" />
                <MobileList initialOccupancies={occupancies} filters={filters} onAdd={() => modal.open()} onCheckOut={(oc) => setCheckOutItem(oc)} onDelete={(oc) => softDelete.trigger(oc)} onSearch={handleSearch} searchValue={searchValue} isPending={isPending} />
                <OccupancyFormModal open={modal.isOpen} properties={propertiesArray} tenants={tenants} onClose={modal.close} />
                <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Hapus log dokumen sewa kamar ini dari database?</>} onConfirm={softDelete.confirm} />

                {/* Dialog Penanggalan Checkout Mobile */}
                <DeleteConfirmDialog open={!!checkOutItem} onOpenChange={(open) => !open && setCheckOutItem(null)} title="Konfirmasi Check-Out" confirmLabel="Selesaikan Sewa" isDeleting={isCheckingOut} onConfirm={handleCheckOutConfirm} description={
                    <div className="mt-3 text-left space-y-2">
                        <p className="text-xs text-muted-foreground">Tentukan tanggal resmi keluar untuk Kamar {checkOutItem?.room?.room_number}:</p>
                        <Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="h-10 rounded-xl" />
                    </div>
                } />
            </>
        );
    }

    // ─── RENDER DESKTOP ───
    return (
        <>
            <Head title="Buku Manajemen Okupansi" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"><BedDouble size={24} /></div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Buku Daftar Okupansi & Check-In</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">Total <span className="font-medium text-foreground">{occupancies.total}</span> transaksi kontrak terdaftar.</p>
                        </div>
                    </div>
                    {canCreate && (
                        <Button onClick={() => modal.open()} className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-xl h-11 px-5"><PlusIcon className="mr-2 size-4" /> Daftarkan Check-In Baru</Button>
                    )}
                </div>

                <DataTableToolbar searchValue={searchValue} onSearch={handleSearch} searchPlaceholder="Cari nomor kamar atau nama penyewa..." activeFilterCount={(filters.property_id ? 1 : 0) + (filters.status ? 1 : 0)} filterFields={filterFields} onClearFilters={() => applyFilter({ search: undefined, property_id: undefined, status: undefined } as Partial<OccupancyFilters>)} perPage={filters.per_page ?? 10} onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<OccupancyFilters>)} />

                <DataTableFilterChips configs={[
                    { key: 'search', value: filters.search, label: `Pencarian: "${filters.search}"`, onRemove: () => applyFilter({ search: undefined } as Partial<OccupancyFilters>) },
                    { key: 'property_id', value: filters.property_id, label: `Gedung: ${activePropName ?? '—'}`, onRemove: () => applyFilter({ property_id: undefined } as Partial<OccupancyFilters>) },
                    { key: 'status', value: filters.status, label: `Kontrak: ${labelOf(STATUS_OPTIONS, filters.status)}`, onRemove: () => applyFilter({ status: undefined } as Partial<OccupancyFilters>) },
                ]} />

                <DataTable data={occupancies} columns={columns} getRowId={(d) => d.id} sort={filters.sort} direction={filters.direction} onSort={applySort} isPending={isPending} emptyText="Belum ada parameter riwayat okupansi sewa terekam." />
                <DataTablePagination meta={occupancies} onPageChange={goToPage} />
            </div>

            <OccupancyFormModal open={modal.isOpen} properties={propertiesArray} tenants={tenants} onClose={modal.close} />

            {/* Dialog Hapus Tunggal Log Sewa */}
            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Menghapus log okupansi sewa bersifat permanen di database. Lanjutkan?</>} onConfirm={softDelete.confirm} />

            {/* Dialog Penanggalan Checkout Desktop */}
            <DeleteConfirmDialog open={!!checkOutItem} onOpenChange={(open) => !open && setCheckOutItem(null)} title="Formulir Proses Check-Out" confirmLabel="Selesaikan Sewa Kontrak" confirmClassName="bg-amber-600 text-white hover:bg-amber-700" isDeleting={isCheckingOut} onConfirm={handleCheckOutConfirm} description={
                <div className="mt-4 text-left space-y-3 border-t pt-3">
                    <div className="rounded-xl bg-slate-50 dark:bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                        <LogOut size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <div>Sistem akan otomatis merubah kondisi fisik <span className="font-bold text-foreground">Kamar {checkOutItem?.room?.room_number}</span> kembali menjadi <span className="font-bold text-emerald-600">Kosong (Ready)</span> sehingga siap dipasarkan kembali.</div>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1"><Calendar size={12} /> Tanggal Keluar Resmi</Label>
                        <Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="h-10 rounded-xl bg-background font-medium" />
                    </div>
                </div>
            } />
        </>
    );
}

OccupancyIndex.layout = { breadcrumbs: [{ title: 'Manajemen Kos', href: '#' }, { title: 'Okupansi & Check-In', href: '/occupancies' }] };
