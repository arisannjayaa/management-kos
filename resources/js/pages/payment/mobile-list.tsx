// resources/js/pages/Payments/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Receipt, Calendar, Search, Loader2, Ban, Eye, Wallet, CreditCard, User, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Payment } from '@/types/payment/payment-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    initialPayments: PaginatedResponse<Payment>;
    canDelete: boolean;
    onAnnul: (item: Payment) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

export function MobileList({ initialPayments, canDelete, onAnnul, onSearch, searchValue, isPending }: Props) {
    const [list, setList] = useState<Payment[]>(initialPayments.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialPayments.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<Payment | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialPayments.data ?? []);
        setNextUrl(initialPayments.next_page_url ?? null);
    }, [initialPayments]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await axios.get(nextUrl, { headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version } });
            const source = res.data?.props?.payments ?? res.data;
            setList((prev) => [...prev, ...(source.data ?? []).filter((n: Payment) => !prev.some((p) => p.id === n.id))]);
            setNextUrl(source.next_page_url ?? null);
        } catch {
            toast.error('Gagal memuat kelanjutan buku kuitansi.');
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

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
            <div className="z-10 shrink-0 space-y-4 bg-background px-4 pt-5 pb-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground">Buku Kuitansi</h1>
                    <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Arus kas masuk riil dari setoran penghuni kos.</p>
                </div>
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Cari kuitansi, invoice atau nama..."
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
                                className="flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm active:scale-[0.98]"
                            >
                                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-foreground bg-emerald-500/10 border-emerald-500/20')}>
                                    <Receipt size={20} className="text-emerald-600" />
                                </div>
                                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                    <p className="text-sm font-black font-mono text-foreground">{item.payment_number}</p>
                                    <span className="text-xs font-bold text-slate-700 truncate">Kamar {item.room_number} — {item.tenant_name}</span>
                                    <span className="text-xs font-black text-emerald-600 font-mono mt-0.5">+ Rp {item.amount_paid.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="shrink-0">
                                    {item.payment_method === 'transfer' ? <CreditCard size={14} className="text-blue-500" /> : <Wallet size={14} className="text-orange-500" />}
                                </div>
                            </div>
                        ))}
                        {isLoadingMore && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <Receipt className="mb-3 size-10 text-muted-foreground/30" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Kuitansi Kosong</h4>
                    </div>
                )}
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    {selected && (
                        <>
                            <DrawerHeader className="shrink-0 border-b px-6 pt-5 pb-4 text-left">
                                <DrawerTitle className="text-base font-black font-mono text-emerald-600">{selected.payment_number}</DrawerTitle>
                                <DrawerDescription className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"><MapPin size={10}/> {selected.property_name} • Kamar {selected.room_number}</DrawerDescription>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
                                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border">
                                    <span className="text-muted-foreground">Penerima Setoran:</span>
                                    <span className="text-foreground font-bold flex items-center gap-1"><User size={12}/> {selected.receiver_name}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl border bg-background">
                                    <span className="text-muted-foreground">Metode Bayar:</span>
                                    <span className="font-bold uppercase text-foreground">{selected.payment_method}</span>
                                </div>
                                {selected.notes && (
                                    <div className="p-3 bg-slate-50 border rounded-xl italic text-slate-500 text-[11px]">
                                        * Memo: {selected.notes}
                                    </div>
                                )}
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t px-6 pt-4 pb-8">
                                {selected.proof_attachment && (
                                    <Button onClick={() => window.open(selected.proof_attachment!, '_blank')} className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground"><Eye size={16} className="mr-2" /> Buka Lampiran Struk</Button>
                                )}
                                {canDelete && (
                                    <Button onClick={() => { setIsDrawerOpen(false); setTimeout(() => onAnnul(selected), 300); }} variant="ghost" className="h-12 w-full rounded-2xl text-red-500 hover:bg-red-50"><Ban size={16} className="mr-2" /> Anulir Kuitansi Ini</Button>
                                )}
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
