// resources/js/pages/MeterReadings/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Gauge,
    Calendar,
    Zap,
    Droplet,
    PlusIcon,
    Loader2,
    Trash2,
    Lock,
    Unlock,
    AlertCircle,
    Search
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { MeterReading } from '@/types/meter-reading/meter-reading-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    initialReadings: PaginatedResponse<MeterReading>;
    showTrashed: boolean;
    onAdd: () => void;
    onDelete: (item: MeterReading) => void;
    onRestore: (item: MeterReading) => void;
    onForceDelete: (item: MeterReading) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

function ReadingCard({ item, showTrashed, onClick, isLast, lastRef }: { item: MeterReading; showTrashed: boolean; onClick: (m: MeterReading) => void; isLast: boolean; lastRef: any }) {
    return (
        <div
            onClick={() => onClick(item)}
            ref={isLast ? lastRef : null}
            className={cn(
                "group flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm transition-all active:scale-[0.98]",
                showTrashed && "border-red-500/10"
            )}
        >
            <div className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-foreground',
                showTrashed ? 'bg-red-500/5 border-red-500/20 text-red-500/60' : 'bg-primary/10 border-primary/20'
            )}>
                {item.charge_type_name.toLowerCase().includes('listrik') ? <Zap size={20} className="text-amber-500" /> : <Droplet size={20} className="text-blue-500" />}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className={cn("text-base font-bold text-foreground truncate", showTrashed && "line-through opacity-60")}>Kamar {item.room_number}</p>
                <span className="text-xs text-muted-foreground truncate">{item.tenant_name} • {item.charge_type_name}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded bg-blue-500/5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-600">
                        +{item.usage} {item.unit_label}
                    </span>
                    <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-black text-foreground">
                        Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end">
                {showTrashed ? <AlertCircle size={14} className="text-red-500/60" /> : item.is_locked ? <Lock size={12} className="text-red-500"/> : <Unlock size={12} className="text-emerald-500"/>}
            </div>
        </div>
    );
}

export function MobileList({ initialReadings, showTrashed, onAdd, onDelete, onRestore, onForceDelete, onSearch, searchValue, isPending }: Props) {
    const [list, setList] = useState<MeterReading[]>(initialReadings.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialReadings.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<MeterReading | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialReadings.data ?? []);
        setNextUrl(initialReadings.next_page_url ?? null);
    }, [initialReadings]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await axios.get(nextUrl, { headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version } });
            const source = res.data?.props?.meterReadings ?? res.data;
            setList((prev) => [...prev, ...(source.data ?? []).filter((n: MeterReading) => !prev.some((p) => p.id === n.id))]);
            setNextUrl(source.next_page_url ?? null);
        } catch {
            toast.error('Gagal memuat kelanjutan berkas meteran.');
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

    const handleAction = (action: 'delete' | 'restore' | 'forceDelete') => {
        setDrawerOpen(false);
        setTimeout(() => {
            if (selected) {
                if (action === 'delete') onDelete(selected);
                if (action === 'restore') onRestore(selected);
                if (action === 'forceDelete') onForceDelete(selected);
            }
        }, 300);
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
            <div className="z-10 shrink-0 space-y-4 bg-background px-4 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">{showTrashed ? 'Meteran Terhapus' : 'Meteran Utilitas'}</h1>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Log parameter variabel beban tagihan hunian.</p>
                    </div>
                    {!showTrashed && (
                        <button onClick={onAdd} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg active:scale-95">
                            <PlusIcon size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Cari nomor kamar atau nama penyewa..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {isPending && list.length === 0 ? (
                    [1, 2, 3].map((n) => <div key={n} className="h-20 animate-pulse bg-muted rounded-2xl" />)
                ) : list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <ReadingCard key={item.id} item={item} showTrashed={showTrashed} isLast={idx === list.length - 1} lastRef={lastElementRef} onClick={(m) => { setSelected(m); setDrawerOpen(true); }} />
                        ))}
                        {isLoadingMore && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <Gauge className="mb-3 size-10 text-muted-foreground/30" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">Data Meteran Kosong</h4>
                    </div>
                )}
            </div>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    {selected && (
                        <>
                            <DrawerHeader className="shrink-0 border-b px-6 pt-5 pb-4 text-left">
                                <DrawerTitle className="text-lg font-black tracking-tight">Kamar {selected.room_number}</DrawerTitle>
                                <DrawerDescription className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"><Calendar size={10}/> Tanggal Rekam: {selected.reading_date}</DrawerDescription>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
                                <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl border">
                                    <div><span className="text-[9px] text-slate-400 block uppercase">Meteran Lalu</span><span className="font-mono text-sm">{selected.previous_reading}</span></div>
                                    <div><span className="text-[9px] text-slate-400 block uppercase">Meteran Baru</span><span className="font-mono text-sm">{selected.current_reading}</span></div>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl border bg-background">
                                    <span className="text-muted-foreground">Rupiah Beban Pemakaian:</span>
                                    <span className="font-mono font-black text-sm text-foreground">Rp {selected.amount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t px-6 pt-4 pb-8">
                                {!showTrashed ? (
                                    !selected.is_locked ? (
                                        <Button variant="outline" onClick={() => handleAction('delete')} className="h-12 w-full rounded-2xl border-red-500/20 bg-red-500/5 text-sm font-bold text-red-600"><Trash2 size={16} className="mr-2" /> Anulir Catatan</Button>
                                    ) : (
                                        <div className="text-center p-3 text-xs text-muted-foreground font-bold bg-slate-100 rounded-xl flex items-center justify-center gap-1"><Lock size={12}/> Data Terkunci Dalam Invoice Resmi</div>
                                    )
                                ) : (
                                    <>
                                        <Button onClick={() => handleAction('restore')} className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white">Pulihkan Catatan</Button>
                                        <Button onClick={() => handleAction('forceDelete')} className="h-12 w-full rounded-2xl bg-red-600 text-sm font-bold text-white">Hapus Permanen</Button>
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
