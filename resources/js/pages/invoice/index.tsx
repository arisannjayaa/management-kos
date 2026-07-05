// resources/js/pages/Invoices/index.tsx

import { Head, router, usePage } from '@inertiajs/react';
import { Search, Filter, SlidersHorizontal, FileText, Coins, Eye, RefreshCw, Ban } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Invoice, InvoiceStatus } from '@/types/invoice/invoice-type';
// Note: Kita akan merakit DetailsModal dan PayModal sesaat lagi
import { InvoiceDetailsModal } from './detail-modal';
import { RecordPaymentModal } from './pay-modal';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') return window.matchMedia('(max-width: 640px)').matches;
        return false;
    });
    useEffect(() => {
        const media = window.matchMedia('(max-width: 640px)');
        setIsMobile(media.matches);
        const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);
    return isMobile;
}

type Props = {
    invoices: {
        data: Invoice[];
        links?: any[];
        meta?: any;
    };
    properties: any[];
};

export default function InvoiceIndex({ invoices, properties = [] }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Otoritas Spatie Hak Akses Frontend Bypass Super Admin
    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];
    const isSuperAdmin = userRoles.includes('super_admin');
    const canPay = isSuperAdmin || userPermissions.includes('invoice.pay');
    const canVoid = isSuperAdmin || userPermissions.includes('invoice.void');

    const propertiesList = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];
    const invoiceDataList = invoices?.data ?? [];

    // States Lokal untuk Pemicu Operasi Jendela Modal
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [propertyFilter, setPropertyFilter] = useState('all');

    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [openPay, setOpenPay] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Jalur Sinkronisasi Filter ke Backend via Inertia Router
    const handleFilterChange = (searchKey: string, statusKey: string, propKey: string) => {
        startTransition(() => {
            router.get(
                '/invoices',
                { search: searchKey, status: statusKey, property_id: propKey },
                { preserveState: true, replace: true }
            );
        });
    };

    const handleVoid = (id: string, invoiceNum: string) => {
        if (!canVoid) return;
        if (confirm(`Apakah Anda yakin ingin membatalkan (VOID) tagihan ${invoiceNum}? Tindakan ini tidak dapat dibatalkan.`)) {
            router.post(`/invoices/void/${id}`, {}, { preserveScroll: true });
        }
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        const styles: Record<InvoiceStatus, string> = {
            paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            partially_paid: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            unpaid: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
            void: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
        };
        const labels: Record<InvoiceStatus, string> = {
            paid: 'LUNAS',
            partially_paid: 'DICICIL',
            unpaid: 'BELUM BAYAR',
            void: 'BATAL (VOID)',
        };
        return <span className={cn("px-2.5 py-1 text-[10px] font-black border tracking-wider rounded-lg uppercase", styles[status])}>{labels[status]}</span>;
    };

    if (!mounted) return null;

    return (
        <>
            <Head title="Meja Kasir Finansial" />

            <div className="flex flex-col space-y-5 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                            <Coins className="text-primary size-6 shrink-0" /> Pembukuan Kasir & Tagihan
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Pantau sirkulasi omset uang masuk, tagihan aktif, dan pencatatan kuitansi penyewa kos.</p>
                    </div>
                </div>

                {/* Filter & Bar Pencarian */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-card p-3 rounded-2xl border border-border/60">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari No. Invoice atau nama tenant..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange(e.target.value, statusFilter, propertyFilter);
                            }}
                            className="pl-10 h-10 rounded-xl bg-background border-border/80"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-slate-400 shrink-0 ml-1" />
                        <select
                            value={propertyFilter}
                            onChange={(e) => {
                                setPropertyFilter(e.target.value);
                                handleFilterChange(search, statusFilter, e.target.value);
                            }}
                            className="w-full h-10 text-xs font-bold rounded-xl border border-border bg-background px-3 outline-none focus:border-primary text-foreground appearance-none"
                        >
                            <option value="all">Semua Gedung Kos</option>
                            {propertiesList.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-slate-400 shrink-0 ml-1" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                handleFilterChange(search, e.target.value, propertyFilter);
                            }}
                            className="w-full h-10 text-xs font-bold rounded-xl border border-border bg-background px-3 outline-none focus:border-primary text-foreground appearance-none"
                        >
                            <option value="all">Semua Status Pembayaran</option>
                            <option value="unpaid">Belum Bayar (Unpaid)</option>
                            <option value="partially_paid">Dicicil (Partially Paid)</option>
                            <option value="paid">Lunas (Paid)</option>
                            <option value="void">Batal (Void)</option>
                        </select>
                    </div>
                </div>

                {/* RENDER VIEW DESKTOP TABLE */}
                {!isMobile ? (
                    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b select-none">
                                <tr>
                                    <th className="p-4">No. Invoice</th>
                                    <th className="p-4">Gedung / Kamar</th>
                                    <th className="p-4">Nama Penyewa</th>
                                    <th className="p-4">Jatuh Tempo</th>
                                    <th className="p-4 text-right">Total Tagihan</th>
                                    <th className="p-4 text-right">Sudah Dibayar</th>
                                    <th className="p-4 center">Status</th>
                                    <th className="p-4 text-right">Aksi Cepat</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 font-medium text-slate-700 dark:text-slate-300">
                                {invoiceDataList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-muted-foreground font-semibold">
                                            <FileText className="size-8 mx-auto text-slate-300 mb-2" />
                                            Tidak ada rekapan data tagihan yang cocok dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    invoiceDataList.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-mono font-bold text-foreground">{inv.invoice_number}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-foreground">{inv.property?.name}</div>
                                                <div className="text-[10px] text-muted-foreground">Kamar Nomor {inv.room?.room_number}</div>
                                            </td>
                                            <td className="p-4 font-bold text-foreground">{inv.tenant?.name}</td>
                                            <td className="p-4 font-semibold text-slate-500">{inv.due_date}</td>
                                            <td className="p-4 text-right font-bold text-foreground">Rp {inv.final_amount.toLocaleString('id-ID')}</td>
                                            <td className="p-4 text-right font-semibold text-emerald-600">Rp {inv.paid_amount.toLocaleString('id-ID')}</td>
                                            <td className="p-4">{getStatusBadge(inv.status)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button type="button" variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => { setSelectedInvoiceId(inv.id); setOpenDetails(true); }}>
                                                        <Eye size={13} />
                                                    </Button>
                                                    {canPay && !['paid', 'void'].includes(inv.status) && (
                                                        <Button type="button" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider px-3 bg-primary" onClick={() => { setSelectedInvoiceId(inv.id); setOpenPay(true); }}>
                                                            Bayar
                                                        </Button>
                                                    )}
                                                    {canVoid && inv.status !== 'void' && (
                                                        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg text-red-500 hover:bg-red-50" onClick={() => handleVoid(inv.id, inv.invoice_number)}>
                                                            <Ban size={13} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* RENDER VIEW MOBILE CARD LIST */
                    <div className="flex flex-col space-y-3">
                        {invoiceDataList.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-dashed">
                                <FileText className="size-7 mx-auto text-slate-300 mb-1" />
                                <span className="text-xs font-bold">Data tagihan kos kosong.</span>
                            </div>
                        ) : (
                            invoiceDataList.map((inv) => (
                                <div key={inv.id} className="bg-card rounded-2xl border p-4 flex flex-col space-y-3 shadow-sm" onClick={() => { setSelectedInvoiceId(inv.id); setOpenDetails(true); }}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-black text-xs text-foreground">{inv.invoice_number}</span>
                                            <span className="text-[11px] font-bold text-slate-800 mt-0.5">{inv.tenant?.name}</span>
                                        </div>
                                        {getStatusBadge(inv.status)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t border-b border-border/40 py-2 text-[11px]">
                                        <div>
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Unit Hunian</span>
                                            <span className="font-bold text-foreground">{inv.property?.name} (Kamar {inv.room?.room_number})</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Jatuh Tempo</span>
                                            <span className="font-semibold text-slate-600">{inv.due_date}</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Total Tagihan</span>
                                            <span className="font-black text-foreground text-xs">Rp {inv.final_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Sisa Tunggakan</span>
                                            <span className={cn("font-bold text-xs", inv.remaining_amount > 0 ? "text-amber-600" : "text-emerald-600")}>
                                                Rp {inv.remaining_amount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Mobile Quick Action Buttons */}
                                    <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                        {canPay && !['paid', 'void'].includes(inv.status) && (
                                            <Button type="button" size="sm" className="w-full h-9 rounded-xl text-xs font-black uppercase tracking-wider bg-primary" onClick={() => { setSelectedInvoiceId(inv.id); setOpenPay(true); }}>
                                                Catat Pembayaran Masuk
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Jendela Modal Render Connector */}
            <InvoiceDetailsModal open={openDetails} invoiceId={selectedInvoiceId} onClose={() => { setOpenDetails(false); setSelectedInvoiceId(null); }} />
            <RecordPaymentModal open={openPay} invoiceId={selectedInvoiceId} onClose={() => { setOpenPay(false); setSelectedInvoiceId(null); }} />
        </>
    );
}
