// resources/js/pages/Invoices/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { FileText, Calendar, Search, Loader2, RotateCcw, Trash2, Eye, Banknote, Ban, Lock, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Invoice, InvoiceStatus } from '@/types/invoice/invoice-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    initialInvoices: PaginatedResponse<Invoice>;
    showTrashed: boolean;
    canPay: boolean;
    canVoid: boolean;
    onView: (item: Invoice) => void;
    onPay: (item: Invoice) => void;
    onVoid: (item: Invoice) => void;
    onRestore: (item: Invoice) => void;
    onForceDelete: (item: Invoice) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

export function MobileList({ initialInvoices, showTrashed, canPay, canVoid, onView, onPay, onVoid, onRestore, onForceDelete, onSearch, searchValue, isPending }: Props) {
    const [list, setList] = useState<Invoice[]>(initialInvoices.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialInvoices.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<Invoice | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialInvoices.data ?? []);
        setNextUrl(initialInvoices.next_page_url ?? null);
    }, [initialInvoices]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await axios.get(nextUrl, { headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version } });
            const source = res.data?.props?.invoices ?? res.data;
            setList((prev) => [...prev, ...(source.data ?? []).filter((n: Invoice) => !prev.some((p) => p.id === n.id))]);
            setNextUrl(source.next_page_url ?? null);
        } catch {
            toast.error('Gagal memuat guliran tagihan berkelanjutan.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextUrl, isLoadingMore, version]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && nextUrl) loadMore(); }, { rootMargin: '200px' });
        if (node) observer.current.observe(node);
    }, [isLoadingMore, nextUrl, loadMore]);

    const handleActionClick = (action: 'view' | 'pay' | 'void' | 'restore' | 'forceDelete') => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            if (selected) {
                if (action === 'view') onView(selected);
                if (action === 'pay') onPay(selected);
                if (action === 'void') onVoid(selected);
                if (action === 'restore') onRestore(selected);
                if (action === 'forceDelete') onForceDelete(selected);
            }
        }, 300);
    };

    const renderBadge = (status: InvoiceStatus) => {
        const labels: Record<InvoiceStatus, string> = { paid: 'LUNAS', partially_paid: 'CICIL', unpaid: 'BELUM BAYAR', void: 'VOID' };
        const colors: Record<InvoiceStatus, string> = { paid: 'text-emerald-600 bg-emerald-50 border-emerald-200', partially_paid: 'text-amber-600 bg-amber-50 border-amber-200', unpaid: 'text-red-600 bg-red-50 border-red-200', void: 'text-slate-500 bg-slate-50 border-slate-200' };
        return <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border", colors[status])}>{labels[status]}</span>;
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
            <div className="z-10 shrink-0 space-y-4 bg-background px-4 pt-5 pb-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground">{showTrashed ? 'Nota Terhapus' : 'Daftar Tagihan'}</h1>
                    <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Pembukuan mutasi nota transaksi hunian.</p>
                </div>
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Cari nomor invoice atau penyewa..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm focus:outline-none focus:border-primary text-foreground"
                    />
                </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {isPending && list.length === 0 ? (
                    [1, 2, 3].map((n) => <div key={n} className="h-24 animate-pulse bg-muted rounded-2xl" />)
                ) : list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <div
                                key={item.id}
                                ref={idx === list.length - 1 ? lastElementRef : null}
                                onClick={() => { setSelected(item); setIsDrawerOpen(true); }}
                                className={cn("flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm active:scale-[0.98]", showTrashed && "border-red-500/10")}
                            >
                                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-primary/10 border-primary/20 text-primary', showTrashed && "text-red-500 bg-red-500/5 border-red-500/10")}>
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                    <p className={cn("text-sm font-black font-mono text-foreground tracking-tight", showTrashed && "line-through opacity-50")}>{item.invoice_number}</p>
                                    <span className="text-xs font-bold text-slate-700 truncate">{item.tenant?.name} (Kamar {item.room?.room_number})</span>
                                    <span className="text-[10px] font-bold text-foreground mt-1 font-mono bg-secondary self-start px-1.5 py-0.5 rounded">Rp {item.final_amount.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="shrink-0">{renderBadge(item.status)}</div>
                            </div>
                        ))}
                        {isLoadingMore && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <FileText className="mb-3 size-10 text-muted-foreground/30" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Arsip Tagihan Kosong</h4>
                    </div>
                )}
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    {selected && (
                        <>
                            <DrawerHeader className="shrink-0 border-b px-6 pt-5 pb-4 text-left">
                                <DrawerTitle className="text-base font-black font-mono">{selected.invoice_number}</DrawerTitle>
                                <DrawerDescription className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"><MapPin size={10}/> {selected.property?.name} • Kamar {selected.room?.room_number}</DrawerDescription>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6 space-y-3.5 text-xs font-semibold">
                                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border">
                                    <span className="text-muted-foreground">Penyewa Utama:</span>
                                    <span className="text-foreground font-bold">{selected.tenant?.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border p-3 flex flex-col gap-0.5 bg-background">
                                        <span className="text-[9px] text-muted-foreground uppercase">Total Tagihan</span>
                                        <span className="font-mono text-sm font-black">Rp {selected.final_amount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="rounded-xl border p-3 flex flex-col gap-0.5 bg-background">
                                        <span className="text-[9px] text-muted-foreground uppercase">Sisa Tunggakan</span>
                                        <span className={cn("font-mono text-sm font-black", selected.remaining_amount > 0 ? "text-amber-600" : "text-emerald-600")}>Rp {selected.remaining_amount.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t px-6 pt-4 pb-8">
                                {!showTrashed ? (
                                    <>
                                        <Button onClick={() => handleActionClick('view')} className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground"><Eye size={16} className="mr-2" /> Lihat Rincian Nota</Button>
                                        {canPay && !['paid', 'void'].includes(selected.status) && (
                                            <Button onClick={() => handleActionClick('pay')} variant="outline" className="h-12 w-full rounded-2xl border-emerald-500/20 bg-emerald-500/5 font-bold text-emerald-600"><Banknote size={16} className="mr-2" /> Catat Pembayaran Masuk</Button>
                                        )}
                                        {canVoid && selected.status !== 'void' && (
                                            <Button onClick={() => handleActionClick('void')} variant="ghost" className="h-12 w-full rounded-2xl text-red-500 hover:bg-red-50"><Ban size={16} className="mr-2" /> Batalkan Nota (VOID)</Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={() => handleActionClick('restore')} className="h-12 w-full rounded-2xl bg-emerald-600 font-bold text-white">Pulihkan Invoice</Button>
                                        <Button onClick={() => handleActionClick('forceDelete')} className="h-12 w-full rounded-2xl bg-red-600 font-bold text-white">Hapus Permanen</Button>
                                    </>
                                )}
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
