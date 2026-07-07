import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Search, Loader2, Edit, Trash2, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import type { ExpenseCategory } from '@/types/expense/expense-category-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    initialCategories: PaginatedResponse<ExpenseCategory>;
    showTrashed: boolean;
    onEdit: (item: ExpenseCategory) => void;
    onDelete: (item: ExpenseCategory) => void;
    onRestore: (item: ExpenseCategory) => void;
    onForceDelete: (item: ExpenseCategory) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

export function MobileList({ initialCategories, showTrashed, onEdit, onDelete, onRestore, onForceDelete, onSearch, searchValue, isPending }: Props) {
    const [list, setList] = useState<ExpenseCategory[]>(initialCategories.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialCategories.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<ExpenseCategory | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialCategories.data ?? []);
        setNextUrl(initialCategories.next_page_url ?? null);
    }, [initialCategories]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const res = await axios.get(nextUrl, { headers: { Accept: 'application/json', 'X-Inertia': 'true', 'X-Inertia-Version': version } });
            const source = res.data?.props?.expense_categories ?? res.data;
            setList((prev) => [...prev, ...(source.data ?? []).filter((n: ExpenseCategory) => !prev.some((p) => p.id === n.id))]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error: any) {
            if (error.response?.status === 409) window.location.href = nextUrl; // Tangani 409[cite: 3]
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
        }, 300); // 300ms Drawer animation[cite: 3]
    };

    return (
        <div className="flex flex-1 flex-col bg-background">
            <div className="sticky top-0 z-10 space-y-4 bg-background px-4 pt-5 pb-3">
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input type="text" value={searchValue} onChange={(e) => onSearch(e.target.value)} placeholder="Cari kategori..." className="w-full rounded-2xl border bg-secondary py-3 pl-10" />
                </div>
            </div>
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-10">
                {isPending && list.length === 0 ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : list.length > 0 ? (
                    list.map((item, idx) => (
                        <div key={item.id} ref={idx === list.length - 1 ? lastElementRef : null} onClick={() => { setSelected(item); setIsDrawerOpen(true); }} className="rounded-xl border bg-card p-4">
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-xs text-muted-foreground">Data kosong.</p>
                )}
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader><DrawerTitle>{selected?.name}</DrawerTitle></DrawerHeader>
                    <DrawerFooter>
                        {!showTrashed ? (
                            <>
                                <Button onClick={() => handleActionClick('edit')}><Edit size={16} className="mr-2"/> Edit</Button>
                                <Button variant="destructive" onClick={() => handleActionClick('delete')}><Trash2 size={16} className="mr-2"/> Hapus</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => handleActionClick('restore')}><RotateCcw size={16} className="mr-2"/> Pulihkan</Button>
                                <Button variant="destructive" onClick={() => handleActionClick('forceDelete')}><Trash2 size={16} className="mr-2"/> Hapus Permanen</Button>
                            </>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
