// resources/js/pages/Invoices/index.tsx

import { Head, router, usePage } from '@inertiajs/react';
import { Ban, Coins, RotateCcwIcon, Trash2Icon } from 'lucide-react';
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
import DeleteConfirmDialog from '@/components/delete-confirm-dialog'; // 🌟 SUDAH TERIMPOR AMAN

import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useBulkForceDelete } from '@/hooks/use-bulk-force-delete';
import { useBulkRestore } from '@/hooks/use-bulk-restore';
import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useSoftDelete } from '@/hooks/use-soft-delete';

import { MobileList } from './mobile-list';
import { createInvoiceColumns, createInvoiceTrashedColumns } from './columns';
import { InvoiceDetailsModal } from './detail-modal';
import { RecordPaymentModal } from './pay-modal';

import type { Invoice, InvoiceFilters } from '@/types/invoice/invoice-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    invoices: PaginatedResponse<Invoice>;
    filters: InvoiceFilters;
    properties: any[];
};

export default function InvoiceIndex({ invoices, filters, properties = [] }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    const propertiesArray = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];

    useEffect(() => { setMounted(true); }, []);

    const { applyFilter, goToPage, isPending, applySort } = useDatatable<InvoiceFilters>('/invoices', filters);

    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => { if (value !== (filters.search ?? '')) applyFilter({ search: value || undefined } as Partial<InvoiceFilters>); }
    );

    const handleTrashToggle = useCallback((show: boolean) => {
        applyFilter({ trashed: show ? '1' : undefined, search: undefined, property_id: undefined, status: undefined } as Partial<InvoiceFilters>);
    }, [applyFilter]);

    // Otoritas Spatie Hak Akses Frontend Bypass Role
    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];

    const isSuperAdmin = userRoles.includes('super_admin');
    const isOwner = userRoles.includes('owner');
    const isStaff = userRoles.includes('staff');

    // 🌟 PERBAIKAN: Jika dia super_admin, owner, atau staff, otomatis tombol "Bayar" MENYEMBUL KELUAR!
    const canPay = isSuperAdmin || isOwner || isStaff || userPermissions.includes('invoice.pay');
    const canVoid = isSuperAdmin || isOwner || userPermissions.includes('invoice.void');

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [openPay, setOpenPay] = useState(false);

    // 🌟 STATE BARU: Pengendali jendela konfirmasi VOID kustom
    const [openVoid, setOpenVoid] = useState(false);
    const [voidInvoice, setVoidInvoice] = useState<Invoice | null>(null);

    const selection = useRowSelection<number>();
    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;

    useEffect(() => { clearAllRef.current(); }, [invoices.current_page, filters.search, filters.trashed, filters.property_id, filters.status]);

    const softDelete = useSoftDelete<Invoice>({ getUrl: (inv) => `/invoices/delete/${inv.id}`, onSuccess: () => clearAllRef.current() });
    const bulkDelete = useBulkDelete({ url: '/invoices/bulk-destroy', onSuccess: () => clearAllRef.current() });
    const singleRestore = useSoftDelete<Invoice>({ getUrl: (inv) => `/invoices/restore/${inv.id}`, method: 'post' });
    const singleForceDelete = useSoftDelete<Invoice>({ getUrl: (inv) => `/invoices/force-delete/${inv.id}` });
    const bulkRestore = useBulkRestore({ url: '/invoices/bulk-restore', onSuccess: () => clearAllRef.current() });
    const bulkForceDelete = useBulkForceDelete({ url: '/invoices/bulk-force-delete', onSuccess: () => clearAllRef.current() });

    // 🌟 REVISI LOGIKA: Mengalihkan dari confirm native ke pemicu state dialog komponen
    const handleVoidWithComponent = (inv: Invoice) => {
        if (!canVoid) return;
        setVoidInvoice(inv);
        setOpenVoid(true);
    };

    const columns = useMemo(() => {
        return showTrashed
            ? createInvoiceTrashedColumns({ onRestore: (inv) => singleRestore.trigger(inv), onForceDelete: (inv) => singleForceDelete.trigger(inv) })
    : createInvoiceColumns({
            onView: (inv) => { setSelectedId(inv.id); setOpenDetails(true); },
        onPay: (inv) => { setSelectedId(inv.id); setOpenPay(true); },
        onVoid: (inv) => handleVoidWithComponent(inv), // Menggunakan komponen baru
            canPay, canVoid
    });
    }, [showTrashed, singleRestore, singleForceDelete, canPay, canVoid]);

    const bulkBarActions = showTrashed
        ? [
            { label: 'Pulihkan', icon: <RotateCcwIcon className="size-3.5" />, onClick: (ids: (string | number)[]) => bulkRestore.trigger(ids) },
    { label: 'Hapus Permanen', icon: <Trash2Icon className="size-3.5" />, destructive: true as const, onClick: (ids: (string | number)[]) => bulkForceDelete.trigger(ids) },
]
: [
        { label: 'Buang Log Tagihan', icon: <Trash2Icon className="size-3.5" />, destructive: true as const, onClick: (ids: (string | number)[]) => bulkDelete.trigger(ids) },
];

    const filterFields = showTrashed ? [] : [
    { key: 'property_id', label: 'Gedung Kos', placeholder: 'Semua Gedung', options: propertiesArray.map((p: any) => ({ value: String(p.id), label: p.name })), value: filters.property_id, onChange: (v: string | undefined) => applyFilter({ property_id: v } as Partial<InvoiceFilters>) },
    { key: 'status', label: 'Status Nota', placeholder: 'Semua Status', options: [{ value: 'unpaid', label: 'Belum Bayar' }, { value: 'partially_paid', label: 'Dicicil' }, { value: 'paid', label: 'Lunas' }, { value: 'void', label: 'Batal (Void)' }], value: filters.status, onChange: (v: string | undefined) => applyFilter({ status: v } as Partial<InvoiceFilters>) },
];

    const activePropName = filters.property_id ? propertiesArray.find((p: any) => String(p.id) === String(filters.property_id))?.name : null;

    if (mounted && isMobile) {
        return (
            <>
                <Head title="Kasir & Tagihan" />
                <MobileList initialInvoices={invoices} showTrashed={showTrashed} canPay={canPay} canVoid={canVoid} onView={(inv) => { setSelectedId(inv.id); setOpenDetails(true); }} onPay={(inv) => { setSelectedId(inv.id); setOpenPay(true); }} onVoid={(inv) => handleVoidWithComponent(inv)} onRestore={(inv) => singleRestore.trigger(inv)} onForceDelete={(inv) => singleForceDelete.trigger(inv)} onSearch={handleSearch} searchValue={searchValue} isPending={isPending} />
                <InvoiceDetailsModal open={openDetails} invoiceId={selectedId} onClose={() => { setOpenDetails(false); setSelectedId(null); }} />
                <RecordPaymentModal open={openPay} invoiceId={selectedId} onClose={() => { setOpenPay(false); setSelectedId(null); }} />

                {/* 🌟 DIALOG VOID PRESENTATIONAL FOR MOBILE */}
                <DeleteConfirmDialog
                    open={openVoid}
                    onOpenChange={openVoid ? setOpenVoid : () => { setOpenVoid(false); setVoidInvoice(null); }}
                    description={
                        <>
                            Apakah Anda yakin ingin membatalkan (VOID) nota tagihan{' '}
                            <span className="font-semibold text-foreground">
                                "{voidInvoice?.invoice_number}"
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </>
                    }
                    confirmLabel="Batalkan (Void)"
                    onConfirm={() => {
                        if (voidInvoice) {
                            router.post(`/invoices/void/${voidInvoice.id}`, {}, {
                                preserveScroll: true,
                                onSuccess: () => { setOpenVoid(false); setVoidInvoice(null); }
                            });
                        }
                    }}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Buku Kasir & Tagihan" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <Coins size={24} className="text-primary"/> Buku Kasir & Manajemen Tagihan
                            {showTrashed && <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">Sampah</span>}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Menampilkan <span className="font-medium text-foreground">{invoices.total}</span> dokumen keuangan aktif.</p>
                    </div>
                </div>

                <DataTableToolbar searchValue={searchValue} onSearch={handleSearch} searchPlaceholder="Cari nomor invoice atau penyewa..." activeFilterCount={(filters.property_id ? 1 : 0) + (filters.status ? 1 : 0)} filterFields={filterFields} onClearFilters={() => applyFilter({ search: undefined, property_id: undefined, status: undefined } as Partial<InvoiceFilters>)} perPage={filters.per_page ?? 10} onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<InvoiceFilters>)} rightSlot={<DataTableTrashToggle showTrashed={showTrashed} onChange={handleTrashToggle} />} />

                <DataTableFilterChips configs={[
                { key: 'search', value: filters.search, label: `Pencarian: "${filters.search}"`, onRemove: () => applyFilter({ search: undefined } as Partial<InvoiceFilters>) },
                { key: 'property_id', value: filters.property_id, label: `Gedung: ${activePropName ?? '—'}`, onRemove: () => applyFilter({ property_id: undefined } as Partial<InvoiceFilters>) },
                    ]} />

                <DataTable data={invoices} columns={columns} getRowId={(d) => d.id} sort={filters.sort} direction={filters.direction} onSort={applySort} isPending={isPending} emptyText={showTrashed ? 'Tidak ada arsip invoice di tempat sampah.' : 'Belum ada lembar tagihan diterbitkan.'} rowSelection={selection} />
                <DataTablePagination meta={invoices} onPageChange={goToPage} />
            </div>

            <InvoiceDetailsModal open={openDetails} invoiceId={selectedId} onClose={() => { setOpenDetails(false); setSelectedId(null); }} />
            <RecordPaymentModal open={openPay} invoiceId={selectedId} onClose={() => { setOpenPay(false); setSelectedId(null); }} />

            {/* 🌟 1. DIALOG INTERAKTIF UNTUK PROSES VOID INVOICE */}
            <DeleteConfirmDialog
                open={openVoid}
                onOpenChange={(v) => { if(!v) { setOpenVoid(false); setVoidInvoice(null); } }}
                description={
                    <>
                        Apakah Anda yakin ingin membatalkan (VOID) nota tagihan{' '}
                        <span className="font-semibold text-foreground">
                            "{voidInvoice?.invoice_number}"
                        </span>
                        ? Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                confirmLabel="Batalkan (Void)"
                onConfirm={() => {
                    if (voidInvoice) {
                        router.post(`/invoices/void/${voidInvoice.id}`, {}, {
                            preserveScroll: true,
                            onSuccess: () => { setOpenVoid(false); setVoidInvoice(null); }
                        });
                    }
                }}
            />

            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description={<>Buang lembar tagihan "{softDelete.item?.invoice_number}" ke tempat sampah?</>} onConfirm={softDelete.confirm} />
            <DeleteConfirmDialog open={singleRestore.open} onOpenChange={singleRestore.setOpen} description={<>Pulihkan nota tagihan "{singleRestore.item?.invoice_number}"?</>} onConfirm={singleRestore.confirm} confirmLabel="Pulihkan" confirmClassName="bg-emerald-600 text-white" />
            <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen} description={<>Hapus permanen nota "{singleForceDelete.item?.invoice_number}" dari database?</>} onConfirm={singleForceDelete.confirm} />

            <BulkDeleteConfirmDialog open={bulkDelete.open} onOpenChange={bulkDelete.setOpen} count={bulkDelete.pendingCount} isDeleting={bulkDelete.isDeleting} onConfirm={bulkDelete.confirm} onCancel={bulkDelete.cancel} entityLabel="dokumen invoice" />
            <BulkRestoreConfirmDialog open={bulkRestore.open} onOpenChange={bulkRestore.setOpen} count={bulkRestore.pendingCount} isRestoring={bulkRestore.isRestoring} onConfirm={bulkRestore.confirm} onCancel={bulkRestore.cancel} entityLabel="dokumen invoice" />
            <BulkForceDeleteConfirmDialog open={bulkForceDelete.open} onOpenChange={bulkForceDelete.setOpen} count={bulkForceDelete.pendingCount} isDeleting={bulkForceDelete.isDeleting} onConfirm={bulkForceDelete.confirm} onCancel={bulkForceDelete.cancel} entityLabel="dokumen invoice" />

            <DataTableBulkBar selectedCount={selection.selectedCount} selectedIds={Array.from(selection.selectedIds)} onClear={selection.clearAll} actions={bulkBarActions} />
        </>
    );
}

InvoiceIndex.layout = { breadcrumbs: [{ title: 'Manajemen Keuangan', href: '#' }, { title: 'Kasir & Tagihan', href: '/invoices' }] };
