// resources/js/pages/Rooms/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { BedDouble, Building2, Layers, Search, PlusIcon, Loader2, Edit3, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { Room, RoomFilters } from '@/types/room/room-type';
import type { PaginatedResponse } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { renderStatusBadge } from './columns';

type Props = {
    initialRooms: PaginatedResponse<Room>;
    filters: RoomFilters;
    showTrashed: boolean;
    onAdd: () => void;
    onEdit: (item: Room) => void;
    onDelete: (item: Room) => void;
    onRestore: (item: Room) => void;
    onForceDelete: (item: Room) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

export function MobileList({
                               initialRooms,
                               filters,
                               showTrashed,
                               onAdd,
                               onEdit,
                               onDelete,
                               onRestore,
                               onForceDelete,
                               onSearch,
                               searchValue,
                               isPending,
                           }: Props) {
    const [list, setList] = useState<Room[]>(initialRooms.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialRooms.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialRooms.data ?? []);
        setNextUrl(initialRooms.next_page_url ?? null);
    }, [initialRooms]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const res = await axios.get(nextUrl, {
                headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version },
            });
            const source = res.data?.props?.rooms ?? res.data;
            setList((prev) => [
                ...prev,
                ...(source.data ?? []).filter((n: Room) => !prev.some((p) => p.id === n.id)),
            ]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error) {
            toast.error('Gagal memuat kelanjutan unit kamar.');
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

    const handleActionClick = (action: 'edit' | 'delete' | 'restore' | 'forceDelete') => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            if (selectedRoom) {
                if (action === 'edit') onEdit(selectedRoom);
                if (action === 'delete') onDelete(selectedRoom);
                if (action === 'restore') onRestore(selectedRoom);
                if (action === 'forceDelete') onForceDelete(selectedRoom);
            }
        }, 300);
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
            <div className="z-10 shrink-0 space-y-4 bg-background px-4 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">{showTrashed ? 'Kamar Terhapus' : 'Unit Kamar Fisik'}</h1>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Kelola pemetaan kamar aktif Anda.</p>
                    </div>
                    {!showTrashed && (
                        <button onClick={onAdd} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95">
                            <PlusIcon size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <div className="relative flex-1">
                    {isPending ? <Loader2 className="absolute top-1/2 left-4 -translate-y-1/2 animate-spin text-primary" size={16} /> : <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />}
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Cari nomor kamar atau nama kos..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm focus:focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => { setSelectedRoom(item); setIsDrawerOpen(true); }}
                                ref={idx === list.length - 1 ? lastElementRef : null}
                                className="flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-primary/5 text-primary", showTrashed && "text-red-500 border-red-200 bg-red-50/50")}>
                                    <BedDouble size={20} />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <p className={cn("text-base font-bold text-foreground truncate", showTrashed && "line-through text-muted-foreground")}>Kamar {item.room_number}</p>
                                    <span className="text-xs text-muted-foreground truncate flex items-center gap-1"><Building2 size={11} /> {item.property?.name}</span>
                                </div>
                                <div className="shrink-0">{!showTrashed && renderStatusBadge(item.status)}</div>
                            </div>
                        ))}
                        {isLoadingMore && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <BedDouble className="mb-3 size-10 text-muted-foreground/30" />
                        <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Data Unit Kosong</h4>
                    </div>
                )}
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] sm:max-w-[420px]">
                    {selectedRoom && (
                        <>
                            <DrawerHeader className="shrink-0 border-b border-border/40 px-6 pt-5 pb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-primary/10 text-primary"><BedDouble size={22} /></div>
                                    <div>
                                        <DrawerTitle className="text-lg font-black tracking-tight">Kamar {selectedRoom.room_number}</DrawerTitle>
                                        <DrawerDescription className="text-[11px] text-muted-foreground">{selectedRoom.property?.name}</DrawerDescription>
                                    </div>
                                </div>
                            </DrawerHeader>

                            <div className="p-6 space-y-4 text-xs font-medium">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Klasifikasi Tipe</span>
                                    <span className="font-bold text-foreground flex items-center gap-1"><Layers size={12} className="text-amber-500" /> {selectedRoom.room_type?.name}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Tarif Sewa Pokok</span>
                                    <span className="font-mono font-bold text-foreground">Rp {Number(selectedRoom.room_type?.base_price ?? 0).toLocaleString('id-ID')}/bln</span>
                                </div>
                                {!showTrashed && (
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-muted-foreground">Kondisi Saat Ini</span>
                                        {renderStatusBadge(selectedRoom.status)}
                                    </div>
                                )}
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t border-border/40 px-6 pt-4 pb-8">
                                {!showTrashed ? (
                                    <>
                                        <Button onClick={() => handleActionClick('edit')} className="h-12 w-full rounded-2xl bg-primary text-sm font-bold active:scale-[0.97]"><Edit3 size={16} className="mr-2" />Ubah Kamar</Button>
                                        <Button variant="outline" onClick={() => handleActionClick('delete')} className="h-12 w-full rounded-2xl border-red-500/20 bg-red-500/5 text-sm font-bold text-red-600 hover:bg-red-500/10 active:scale-[0.97] dark:text-red-400"><Trash2 size={16} className="mr-2" />Hapus Unit</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={() => handleActionClick('restore')} className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 active:scale-[0.97]">Pulihkan Unit</Button>
                                        <Button onClick={() => handleActionClick('forceDelete')} className="h-12 w-full rounded-2xl bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-600/20 active:scale-[0.97]">Hapus Permanen</Button>
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
