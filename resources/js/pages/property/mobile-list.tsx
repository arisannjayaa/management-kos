// resources/js/pages/Properties/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Building2,
    MapPin,
    Phone,
    Calendar,
    MessageSquare,
    Search,
    PlusIcon,
    Loader2,
    RotateCcw,
    Trash2,
    Edit3,
    AlertCircle,
    Layers,
    Info
} from 'lucide-react';
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
import type { Property, PropertyFilters } from '@/types/property/property-type';
import type { PaginatedResponse } from '@/types/pagination';
import { Button } from '@/components/ui/button';

type Props = {
    initialProperties: PaginatedResponse<Property>;
    filters: PropertyFilters;
    showTrashed: boolean;
    onAdd: () => void;
    onEdit: (item: Property) => void;
    onDelete: (item: Property) => void;
    onRestore: (item: Property) => void;
    onForceDelete: (item: Property) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

function PropertySkeleton() {
    return (
        <div className="flex animate-pulse items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
                <div className="h-3.5 w-32 rounded-full bg-muted" />
                <div className="h-2.5 w-20 rounded-full bg-secondary" />
            </div>
        </div>
    );
}

function PropertyCard({
                          item,
                          showTrashed,
                          onClick,
                          isLast,
                          lastRef,
                      }: {
    item: Property;
    showTrashed: boolean;
    onClick: (p: Property) => void;
    isLast: boolean;
    lastRef: any;
}) {
    return (
        <div
            onClick={() => onClick(item)}
            ref={isLast ? lastRef : null}
            className={cn(
                "group flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm transition-all active:scale-[0.98]",
                showTrashed && "border-red-500/10"
            )}
        >
            <div
                className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors',
                    showTrashed
                        ? 'bg-red-500/5 border-red-500/20 text-red-500/60'
                        : item.is_active
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-muted border-border text-muted-foreground'
                )}
            >
                <Building2 size={20} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className={cn(
                    "flex items-center gap-1.5 truncate text-base font-bold text-foreground",
                    showTrashed && "line-through text-muted-foreground opacity-70"
                )}>
                    {item.name}
                </p>

                <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin size={12} className="shrink-0" /> {item.city}
                </span>

                <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {item.rooms_count ?? 0} Kamar
                    </span>
                    {item.wa_reminder_enabled && !showTrashed && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <MessageSquare size={10} className="fill-current" /> WA Ready
                        </span>
                    )}
                </div>
            </div>

            {/* Kanan Slot: Status / Dot */}
            <div className="flex shrink-0 flex-col items-end gap-1">
                {showTrashed ? (
                    <AlertCircle size={14} className="text-red-500/60" />
                ) : (
                    <div
                        className={cn(
                            'h-2 w-2 rounded-full',
                            item.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                        )}
                    />
                )}
            </div>
        </div>
    );
}

export function MobileList({
                               initialProperties,
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
    const [list, setList] = useState<Property[]>(initialProperties.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(
        initialProperties.next_page_url ?? null,
    );
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialProperties.data ?? []);
        setNextUrl(initialProperties.next_page_url ?? null);
    }, [initialProperties]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const res = await axios.get(nextUrl, {
                headers: {
                    Accept: 'application/json',
                    'X-Inertia': 'true',
                    'X-Inertia-Version': version,
                },
            });
            const source = res.data?.props?.properties ?? res.data;
            setList((prev) => [
                ...prev,
                ...(source.data ?? []).filter(
                    (n: Property) => !prev.some((p) => p.id === n.id),
                ),
            ]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                window.location.href = nextUrl;
            } else {
                toast.error('Gagal memuat kelanjutan data properti.');
            }
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextUrl, isLoadingMore, version]);

    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoadingMore) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && nextUrl) {
                        loadMore();
                    }
                },
                { rootMargin: '200px' },
            );

            if (node) observer.current.observe(node);
        },
        [isLoadingMore, nextUrl, loadMore],
    );

    const handleActionClick = (action: 'edit' | 'delete' | 'restore' | 'forceDelete') => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            if (selectedProperty) {
                if (action === 'edit') onEdit(selectedProperty);
                if (action === 'delete') onDelete(selectedProperty);
                if (action === 'restore') onRestore(selectedProperty);
                if (action === 'forceDelete') onForceDelete(selectedProperty);
            }
        }, 300);
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
            {/* SEARCH & BANNER BAR */}
            <div className="z-10 shrink-0 space-y-4 bg-background px-4 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                            {showTrashed ? 'Gedung Terhapus' : 'Gedung Properti'}
                        </h1>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                            {showTrashed ? 'Daftar arsip lama properti kos.' : 'Manajemen daftar properti aset kos Anda.'}
                        </p>
                    </div>
                    {!showTrashed && (
                        <button
                            onClick={onAdd}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95"
                        >
                            <PlusIcon size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <div className="relative flex-1">
                    {isPending ? (
                        <Loader2 className="absolute top-1/2 left-4 -translate-y-1/2 animate-spin text-primary" size={16} />
                    ) : (
                        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={16} />
                    )}
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Cari nama properti, alamat atau kota..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* SCROLLABLE AREA */}
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {isPending && list.length === 0 ? (
                    [1, 2, 3].map((n) => <PropertySkeleton key={n} />)
                ) : list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <PropertyCard
                                key={item.id}
                                item={item}
                                showTrashed={showTrashed}
                                isLast={idx === list.length - 1}
                                lastRef={lastElementRef}
                                onClick={(p) => {
                                    setSelectedProperty(p);
                                    setIsDrawerOpen(true);
                                }}
                            />
                        ))}
                        {isLoadingMore && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <Building2 className="mb-3 size-10 text-muted-foreground/30" strokeWidth={1.5} />
                        <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            {searchValue ? 'Properti Tidak Ditemukan' : 'Belum Ada Data Properti'}
                        </h4>
                    </div>
                )}
            </div>

            {/* ── DETAIL & ACTION DRAWER ── */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] border-t border-border/80 bg-background outline-none sm:mb-4 sm:max-w-[420px] sm:rounded-[3rem] sm:border sm:border-border/60 sm:bg-card">
                    {selectedProperty && (
                        <>
                            <DrawerHeader className="shrink-0 border-b border-border/40 px-6 pt-5 pb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-2xl border",
                                        showTrashed ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/10 border-primary/20 text-primary"
                                    )}>
                                        <Building2 size={22} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <DrawerTitle className="text-lg font-black tracking-tight truncate">
                                            {selectedProperty.name}
                                        </DrawerTitle>
                                        <DrawerDescription className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                            <MapPin size={10} /> {selectedProperty.address}, {selectedProperty.city}
                                        </DrawerDescription>
                                    </div>
                                </div>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6 space-y-5">
                                {/* Info Kontak */}
                                <section className="space-y-2">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Kontak Operasional</h3>
                                    <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 border border-border/40">
                                        <Phone size={14} className="text-primary" />
                                        <span className="font-mono text-sm font-semibold">{selectedProperty.phone}</span>
                                    </div>
                                </section>

                                {/* Aturan Keuangan */}
                                <section className="space-y-2">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Konfigurasi Finansial Kos</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-border/50 bg-background p-3 flex flex-col gap-0.5">
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                                                <Calendar size={10} /> Siklus Tagihan
                                            </span>
                                            <span className="text-sm font-black">{selectedProperty.billing_cycle_days} Hari</span>
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-background p-3 flex flex-col gap-0.5">
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                                                <Info size={10} /> Masa Tenggang
                                            </span>
                                            <span className="text-sm font-black">{selectedProperty.billing_grace_period_days} Hari</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Kapasitas Unit */}
                                <section className="space-y-2">
                                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Kapasitas Gedung</h3>
                                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background p-3">
                                        <Layers size={14} className="text-primary" />
                                        <div className="text-xs font-semibold text-foreground">
                                            Menampung <span className="font-bold text-primary">{selectedProperty.rooms_count ?? 0} Kamar</span> aktif, terbagi dalam <span className="font-bold text-primary">{selectedProperty.room_types_count ?? 0} klasifikasi tipe</span>.
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t border-border/40 px-6 pt-4 pb-8">
                                {!showTrashed ? (
                                    <>
                                        <Button
                                            onClick={() => handleActionClick('edit')}
                                            className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.97]"
                                        >
                                            <Edit3 size={16} className="mr-2" />
                                            Ubah Info Properti
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleActionClick('delete')}
                                            className="h-12 w-full rounded-2xl border-red-500/20 bg-red-500/5 text-sm font-bold text-red-600 hover:bg-red-500/10 active:scale-[0.97] dark:text-red-400"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Buang ke Sampah
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => handleActionClick('restore')}
                                            className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.97]"
                                        >
                                            <RotateCcw size={16} className="mr-2" />
                                            Pulihkan Properti
                                        </Button>
                                        <Button
                                            onClick={() => handleActionClick('forceDelete')}
                                            className="h-12 w-full rounded-2xl bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.97]"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Hapus Secara Permanen
                                        </Button>
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
