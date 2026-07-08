import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Search, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import type { Complaint } from '@/types/complaint/complaint-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    initialData: PaginatedResponse<Complaint>;
    showTrashed: boolean;
    onEdit: (item: Complaint) => void;
    onDelete: (item: Complaint) => void;
    onRestore: (item: Complaint) => void;
    onForceDelete: (item: Complaint) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

export function MobileList({ initialData, showTrashed, onEdit, onDelete, onRestore, onForceDelete, onSearch, searchValue, isPending }: Props) {
    const [list, setList] = useState<Complaint[]>(initialData.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialData.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<Complaint | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialData.data ?? []);
        setNextUrl(initialData.next_page_url ?? null);
    }, [initialData]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await axios.get(nextUrl, { headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version } });
            const source = res.data?.props?.complaints ?? res.data;
            setList((prev) => [...prev, ...(source.data ?? []).filter((n: Complaint) => !prev.some((p) => p.id === n.id))]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error: any) {
            if (error.response?.status === 409) window.location.href = nextUrl;
        } finally { setIsLoadingMore(false); }
    }, [nextUrl, isLoadingMore, version]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && nextUrl) loadMore(); }, { rootMargin: '200px' });
        if (node) observer.current.observe(node);
    }, [isLoadingMore, nextUrl, loadMore]);

    const handleActionClick = (action: 'edit' | 'delete' | 'restore' | 'forceDelete') => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            if (selected) {
                if (action === 'edit') onEdit(selected);
                if (action === 'delete') onDelete(selected);
                if (action === 'restore') onRestore(selected);
                if (action === 'forceDelete') onForceDelete(selected);
            }
        }, 300); // Penundaan 300ms kelancaran animasi drawer sesuai instruksi
    };

    return (
        <div className="flex flex-1 flex-col bg-background">
            <div className="sticky top-0 z-10 space-y-4 bg-background px-4 pt-5 pb-3">
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input type="text" value={searchValue} onChange={(e) => onSearch(e.target.value)} placeholder="Cari tiket keluhan..." className="w-full rounded-2xl border bg-secondary py-3.5 pl-10 text-sm" />
                </div>
            </div>
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-10">
                {isPending && list.length === 0 ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                ) : list.length > 0 ? (
                    list.map((item, idx) => (
                        <div key={item.id} ref={idx === list.length - 1 ? lastElementRef : null} onClick={() => { setSelected(item); setIsDrawerOpen(true); }} className="rounded-2xl border bg-card p-4 shadow-sm active:scale-98 transition-transform cursor-pointer">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5"><MessageSquare size={14} className="text-primary"/> {item.title}</h4>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.property_name} — Unit: {item.room_number}</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full bg-secondary text-muted-foreground">{item.status}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-14 opacity-40 flex flex-col items-center"><AlertCircle size={32}/><p className="text-xs font-bold mt-2">Belum Ada Tiket Keluhan Masuk</p></div>
                )}
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="rounded-t-[2.5rem]">
                    <DrawerHeader><DrawerTitle className="font-mono font-bold text-base text-center">{selected?.title}</DrawerTitle></DrawerHeader>
                    <div className="px-6 text-xs text-muted-foreground pb-4">{selected?.description}</div>
                    <DrawerFooter className="px-6 pb-8 space-y-1.5">
                        {selected?.attachment && <Button variant="outline" onClick={() => window.open(selected.attachment!, '_blank')}>Buka Lampiran Foto</Button>}
                        {!showTrashed ? (
                            <>
                                <Button onClick={() => handleActionClick('edit')}>Lihat / Tanggapi</Button>
                                <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100" onClick={() => handleActionClick('delete')}>Buang ke Sampah</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => handleActionClick('restore')}>Pulihkan Laporan</Button>
                                <Button variant="destructive" onClick={() => handleActionClick('forceDelete')}>Hapus Permanen</Button>
                            </>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
