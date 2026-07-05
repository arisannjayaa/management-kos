// resources/js/pages/Tenants/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { User, Phone, CreditCard, Search, PlusIcon, Loader2, Edit3, Trash2, ShieldAlert } from 'lucide-react';
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
import type { Tenant, TenantFilters } from '@/types/tenant/tenant-type';
import type { PaginatedResponse } from '@/types/pagination';
import { Button } from '@/components/ui/button';

type Props = {
    initialTenants: PaginatedResponse<Tenant>;
    filters: TenantFilters;
    onAdd: () => void;
    onEdit: (item: Tenant) => void;
    onDelete: (item: Tenant) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

function TenantSkeleton() {
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

export function MobileList({
                               initialTenants,
                               filters,
                               onAdd,
                               onEdit,
                               onDelete,
                               onSearch,
                               searchValue,
                               isPending,
                           }: Props) {
    const [list, setList] = useState<Tenant[]>(initialTenants.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(initialTenants.next_page_url ?? null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    // 🌟 PROTEKSI VIEW MOBILE: Ambil data hak akses pengguna saat ini
    const { auth, version } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];

    const isSuperAdmin = userRoles.includes('super_admin');
    const canCreate = isSuperAdmin || userPermissions.includes('tenant.create');
    const canUpdate = isSuperAdmin || userPermissions.includes('tenant.update');
    const canDelete = isSuperAdmin || userPermissions.includes('tenant.delete');

    useEffect(() => {
        setList(initialTenants.data ?? []);
        setNextUrl(initialTenants.next_page_url ?? null);
    }, [initialTenants]);

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
            const source = res.data?.props?.tenants ?? res.data;
            setList((prev) => [
                ...prev,
                ...(source.data ?? []).filter((n: Tenant) => !prev.some((p) => p.id === n.id)),
            ]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error) {
            toast.error('Gagal memuat kelanjutan data penyewa.');
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

    const handleActionClick = (action: 'edit' | 'delete') => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            if (selectedTenant) {
                if (action === 'edit') onEdit(selectedTenant);
                if (action === 'delete') onDelete(selectedTenant);
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
                            Data Penyewa (Tenant)
                        </h1>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                            Daftar biodata penghuni kos terdaftar.
                        </p>
                    </div>
                    {/* 🌟 PROTEKSI TOMBOL TAMBAH */}
                    {canCreate && (
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
                        placeholder="Cari nama penyewa atau nomor HP..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* SCROLLABLE CARD AREA */}
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {isPending && list.length === 0 ? (
                    [1, 2, 3].map((n) => <TenantSkeleton key={n} />)
                ) : list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSelectedTenant(item);
                                    setIsDrawerOpen(true);
                                }}
                                ref={idx === list.length - 1 ? lastElementRef : null}
                                className="flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-primary/5 text-primary">
                                    <User size={20} />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <p className="truncate text-base font-bold text-foreground">{item.name}</p>
                                    <span className="text-xs font-mono font-medium text-muted-foreground">{item.phone}</span>
                                </div>
                                <div className="shrink-0">
                                    <span className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                        item.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                    )}>
                                        {item.status === 'active' ? 'Aktif' : 'Keluar'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoadingMore && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <User className="mb-3 size-10 text-muted-foreground/30" />
                        <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Penyewa Tidak Ditemukan
                        </h4>
                    </div>
                )}
            </div>

            {/* ── DETAIL & ACTION DRAWER ── */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] border-t border-border/80 bg-background outline-none sm:max-w-[420px]">
                    {selectedTenant && (
                        <>
                            <DrawerHeader className="shrink-0 border-b border-border/40 px-6 pt-5 pb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-primary/10 text-primary">
                                        <User size={22} />
                                    </div>
                                    <div>
                                        <DrawerTitle className="text-lg font-black tracking-tight">
                                            {selectedTenant.name}
                                        </DrawerTitle>
                                        <DrawerDescription className="text-[11px] font-medium text-muted-foreground">
                                            Status Akun: {selectedTenant.status === 'active' ? 'Aktif Menghuni' : 'Mantan Penghuni'}
                                        </DrawerDescription>
                                    </div>
                                </div>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-1"><CreditCard size={12} /> No. KTP</span>
                                    <span className="font-mono text-foreground">{selectedTenant.ktp_number ?? '—'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-1"><Phone size={12} /> WhatsApp Utama</span>
                                    <span className="font-mono text-foreground">{selectedTenant.phone}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Kontak Darurat</span>
                                    <span className="font-mono text-foreground">{selectedTenant.emergency_contact ?? '—'}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">Total Riwayat Sewa</span>
                                    <span className="text-primary font-bold">{selectedTenant.occupancies_count ?? 0} Kali Kontrak</span>
                                </div>
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t border-border/40 px-6 pt-4 pb-8">
                                {/* 🌟 PROTEKSI TOMBOL AKSI OPERASIONAL DRAWER */}
                                {canUpdate && (
                                    <Button
                                        onClick={() => handleActionClick('edit')}
                                        className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
                                    >
                                        <Edit3 size={16} className="mr-2" />
                                        Ubah Profil Penyewa
                                    </Button>
                                )}

                                {canDelete && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleActionClick('delete')}
                                        className="h-12 w-full rounded-2xl border-red-500/20 bg-red-50/50 text-sm font-bold text-red-600 hover:bg-red-100/40"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Hapus dari Sistem
                                    </Button>
                                )}

                                {!canUpdate && !canDelete && (
                                    <div className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-muted/40 text-muted-foreground border">
                                        <ShieldAlert size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Aksi Operasional Terkunci</span>
                                    </div>
                                )}
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
