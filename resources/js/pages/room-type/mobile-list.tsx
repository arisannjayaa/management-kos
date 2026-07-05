// resources/js/pages/RoomTypes/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Layers, Building2, Coins, Search, PlusIcon, Loader2, Edit3, Trash2, AlignLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { RoomType, RoomTypeFilters } from '@/types/room/room-type';
import type { PaginatedResponse } from '@/types/pagination';
import { Button } from '@/components/ui/button';

type Props = {
    initialRoomTypes: PaginatedResponse<RoomType>;
    filters: RoomTypeFilters;
    onAdd: () => void;
    onEdit: (item: RoomType) => void;
    onDelete: (item: RoomType) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export function MobileList({
                               initialRoomTypes,
                               filters,
                               onAdd,
                               onEdit,
                               onDelete,
                               onSearch,
                               searchValue,
                               isPending,
                           }: Props) {
    const [list, setList] = useState<RoomType[]>(initialRoomTypes.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialRoomTypes.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialRoomTypes.data ?? []);
        setNextUrl(initialRoomTypes.next_page_url ?? null);
    }, [initialRoomTypes]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const res = await axios.get(nextUrl, {
                headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version },
            });
            const source = res.data?.props?.room_types ?? res.data;
            setList((prev) => [
                ...prev,
                ...(source.data ?? []).filter((n: RoomType) => !prev.some((p) => p.id === n.id)),
            ]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error) {
            toast.error('Gagal memuat kelanjutan klasifikasi kamar.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextUrl, isLoadingMore, version]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting && nextUrl) loadMore(); },
            { rootMargin: '200px' }
        );
        if (node) observer.current.observe(node);
    }, [isLoadingMore, nextUrl, loadMore]);

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
            {/* TOP ACTIONS */}
            <div className="z-10 shrink-0 space-y-4 bg-background px-4 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Tipe Kamar & Tarif</h1>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Katalog pengaturan variasi harga kos.</p>
                    </div>
                    <button onClick={onAdd} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95">
                        <PlusIcon size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="relative flex-1">
                    {isPending ? <Loader2 className="absolute top-1/2 left-4 -translate-y-1/2 animate-spin text-primary" size={16} /> : <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />}
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Cari nama tipe kamar atau properti..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none animate-none"
                    />
                </div>
            </div>

            {/* SCROLLABLE LIST AREA */}
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => { setSelectedRoomType(item); setIsDrawerOpen(true); }}
                                ref={idx === list.length - 1 ? lastElementRef : null}
                                className="flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600">
                                    <Layers size={20} />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <p className="truncate text-base font-bold text-foreground">{item.name}</p>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                        <Building2 size={12} /> {item.property?.name ?? '—'}
                                    </span>
                                    <span className="text-xs font-bold text-primary mt-1">{formatIDR(item.base_price)}<span className="text-[10px] font-normal text-muted-foreground">/bln</span></span>
                                </div>
                                <div className="shrink-0 bg-secondary rounded-full px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                    {item.rooms_count ?? 0} Unit
                                </div>
                            </div>
                        ))}
                        {isLoadingMore && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <Layers className="mb-3 size-10 text-muted-foreground/30" />
                        <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Katalog Tipe Kamar Kosong</h4>
                    </div>
                )}
            </div>

            {/* DRAWER RINGKASAN DETAIL ANAK */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] sm:max-w-[420px]">
                    {selectedRoomType && (
                        <>
                            <DrawerHeader className="shrink-0 border-b border-border/40 px-6 pt-5 pb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600">
                                        <Layers size={22} />
                                    </div>
                                    <div>
                                        <DrawerTitle className="text-lg font-black tracking-tight">{selectedRoomType.name}</DrawerTitle>
                                        <DrawerDescription className="text-[11px] text-muted-foreground">{selectedRoomType.property?.name}</DrawerDescription>
                                    </div>
                                </div>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6 space-y-5">
                                {/* Harga Sewa Dasar */}
                                <section className="space-y-1.5">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1"><Coins size={10} /> Harga Sewa Utama</h3>
                                    <p className="text-xl font-black text-foreground font-mono">{formatIDR(selectedRoomType.base_price)} <span className="text-xs font-normal text-muted-foreground">/ Bulan</span></p>
                                </section>

                                {/* Deskripsi */}
                                {selectedRoomType.description && (
                                    <section className="space-y-1.5">
                                        <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1"><AlignLeft size={10} /> Fasilitas Internal</h3>
                                        <div className="rounded-xl border bg-muted/20 p-3 text-xs font-medium leading-relaxed text-foreground/80">{selectedRoomType.description}</div>
                                    </section>
                                )}

                                {/* Pilihan Berjenjang */}
                                <section className="space-y-2">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Opsi Skema Tarif Berjenjang</h3>
                                    {selectedRoomType.pricing_tiers && selectedRoomType.pricing_tiers.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {selectedRoomType.pricing_tiers.map((tier) => (
                                                <div key={tier.id} className="flex items-center justify-between p-3 rounded-xl border bg-background text-xs">
                                                    <span className="font-bold text-muted-foreground">{tier.name}</span>
                                                    <span className="font-mono font-black text-primary">{formatIDR(tier.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs italic text-muted-foreground/60 p-1">Tidak ada skema tarif alternatif tambahan.</p>
                                    )}
                                </section>
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t border-border/40 px-6 pt-4 pb-8">
                                <Button onClick={() => { setIsDrawerOpen(false); setTimeout(() => onEdit(selectedRoomType), 300); }} className="h-12 w-full rounded-2xl bg-primary text-sm font-bold active:scale-[0.97]"><Edit3 size={16} className="mr-2" />Ubah Spesifikasi</Button>
                                <Button variant="outline" onClick={() => { setIsDrawerOpen(false); setTimeout(() => onDelete(selectedRoomType), 300); }} className="h-12 w-full rounded-2xl border-red-500/20 bg-red-500/5 text-sm font-bold text-red-600 hover:bg-red-500/10 active:scale-[0.97] dark:text-red-400"><Trash2 size={16} className="mr-2" />Hapus Kategori</Button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
