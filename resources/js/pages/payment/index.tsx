// resources/js/pages/Payments/index.tsx

import { Head, usePage } from '@inertiajs/react';
import { Ban, Receipt, SlidersHorizontal, Filter, Search } from 'lucide-react';
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

import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useSoftDelete } from '@/hooks/use-soft-delete';

import { MobileList } from './mobile-list';
import { createPaymentColumns } from './columns';
import type { Payment, PaymentFilters } from '@/types/payment/payment-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    payments: PaginatedResponse<Payment>;
    filters: PaymentFilters;
    properties: any[];
};

export default function PaymentIndex({ payments, filters, properties = [] }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const propertiesArray = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];

    useEffect(() => { setMounted(true); }, []);

    const { applyFilter, goToPage, isPending, applySort } = useDatatable<PaymentFilters>('/payments', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => { if (value !== (filters.search ?? '')) applyFilter({ search: value || undefined } as Partial<PaymentFilters>); }
    );

    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];
    const isSuperAdmin = userRoles.includes('super_admin');
    const canDelete = isSuperAdmin || userPermissions.includes('payment.delete');

    const selection = useRowSelection<number>();
    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;

    useEffect(() => { clearAllRef.current(); }, [payments.current_page, filters.search, filters.property_id, filters.payment_method]);

    const softDelete = useSoftDelete<Payment>({ getUrl: (p) => `/payments/delete/${p.id}`, onSuccess: () => clearAllRef.current() });
    const bulkDelete = useBulkDelete({ url: '/payments/bulk-destroy', onSuccess: () => clearAllRef.current() });

    const columns = useMemo(() => {
        return createPaymentColumns({
            onAnnul: (p) => softDelete.trigger(p),
            canDelete
        });
    }, [canDelete, softDelete]);

    const bulkBarActions = [
        { label: 'Anulir Kuitansi Pilihan', icon: <Ban className="size-3.5" />, destructive: true as const, onClick: (ids: (string | number)[]) => bulkDelete.trigger(ids) },
    ];

    const filterFields = [
        { key: 'property_id', label: 'Gedung Kos', placeholder: 'Semua Gedung', options: propertiesArray.map((p: any) => ({ value: String(p.id), label: p.name })), value: filters.property_id, onChange: (v: string | undefined) => applyFilter({ property_id: v } as Partial<PaymentFilters>) },
        { key: 'payment_method', label: 'Metode Bayar', placeholder: 'Semua Metode', options: [{ value: 'cash', label: 'Tunai / Cash' }, { value: 'transfer', label: 'Transfer Bank' }], value: filters.payment_method, onChange: (v: string | undefined) => applyFilter({ payment_method: v } as Partial<PaymentFilters>) },
    ];

    const activePropName = filters.property_id ? propertiesArray.find((p: any) => String(p.id) === String(filters.property_id))?.name : null;

    if (mounted && isMobile) {
        return (
            <>
                <Head title="Buku Kuitansi Kos" />
                <MobileList initialPayments={payments} canDelete={canDelete} onAnnul={(p) => softDelete.trigger(p)} onSearch={handleSearch} searchValue={searchValue} isPending={isPending} />
                <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Anulir nomor kuitansi finansial <span className="font-semibold text-foreground">"{softDelete.item?.payment_number}"</span>? Saldo invoice terikat akan otomatis disesuaikan balik.</>} onConfirm={softDelete.confirm} confirmLabel="Anulir Kuitansi" />
            </>
        );
    }

    return (
        <>
            <Head title="Buku Besar Kuitansi" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <Receipt size={24} className="text-primary"/> Buku Besar Kuitansi Pembayaran
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Menampilkan total <span className="font-medium text-foreground">{payments.total}</span> mutasi dana masuk terverifikasi.</p>
                    </div>
                </div>

                <DataTableToolbar searchValue={searchValue} onSearch={handleSearch} searchPlaceholder="Cari nomor kuitansi, invoice atau penyewa..." activeFilterCount={(filters.property_id ? 1 : 0) + (filters.payment_method ? 1 : 0)} filterFields={filterFields} onClearFilters={() => applyFilter({ search: undefined, property_id: undefined, payment_method: undefined } as Partial<PaymentFilters>)} perPage={filters.per_page ?? 10} onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<PaymentFilters>)} />

                <DataTableFilterChips configs={[
                    { key: 'search', value: filters.search, label: `Pencarian: "${filters.search}"`, onRemove: () => applyFilter({ search: undefined } as Partial<PaymentFilters>) },
                    { key: 'property_id', value: filters.property_id, label: `Gedung: ${activePropName ?? '—'}`, onRemove: () => applyFilter({ property_id: undefined } as Partial<PaymentFilters>) },
                ]} />

                <DataTable data={payments} columns={columns} getRowId={(d) => d.id} sort={filters.sort} direction={filters.direction} onSort={applySort} isPending={isPending} emptyText="Belum ada riwayat kuitansi pembayaran terkumpul." rowSelection={selection} />
                <DataTablePagination meta={payments} onPageChange={goToPage} />
            </div>

            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Anulir nomor kuitansi finansial "{softDelete.item?.payment_number}"? Saldo invoice terikat akan otomatis disesuaikan balik.</>} onConfirm={softDelete.confirm} confirmLabel="Anulir Kuitansi" />
            <BulkDeleteConfirmDialog open={bulkDelete.open} onOpenChange={bulkDelete.setOpen} count={bulkDelete.pendingCount} isDeleting={bulkDelete.isDeleting} onConfirm={bulkDelete.confirm} onCancel={bulkDelete.cancel} entityLabel="kuitansi dana masuk" />

            <DataTableBulkBar selectedCount={selection.selectedCount} selectedIds={Array.from(selection.selectedIds)} onClear={selection.clearAll} actions={bulkBarActions} />
        </>
    );
}

PaymentIndex.layout = { breadcrumbs: [{ title: 'Manajemen Keuangan', href: '#' }, { title: 'Buku Kuitansi', href: '/payments' }] };
