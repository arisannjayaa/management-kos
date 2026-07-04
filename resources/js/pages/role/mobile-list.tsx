// resources/js/pages/Roles/mobile-list.tsx

import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Key,
    Lock,
    Search,
    ShieldAlert,
    ShieldCheck,
    PlusIcon,
    Loader2,
    CheckCircle2,
    Shield,
    Trash2,
    Edit3,
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
import type { Role, RoleFilters } from '@/types/role/role-type';
import type { PaginatedResponse } from '@/types/pagination';
import { Button } from '@/components/ui/button';

type Props = {
    initialRoles: PaginatedResponse<Role>;
    filters: RoleFilters;
    onAdd: () => void;
    onEdit: (item: Role) => void;
    onDelete: (item: Role) => void;
    onSearch: (value: string) => void;
    searchValue: string;
    isPending: boolean;
};

// Helper Format & Ikon (Sama seperti di columns.tsx)
const formatRoleName = (name: string) => {
    return name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const renderRoleIcon = (roleName: string) => {
    switch (roleName) {
        case 'super_admin':
            return <ShieldAlert size={20} className="text-red-500" />;
        case 'owner':
            return <ShieldCheck size={20} className="text-primary" />;
        case 'staff':
            return <Key size={20} className="text-amber-500" />;
        default:
            return <Lock size={20} className="text-muted-foreground" />;
    }
};

const getRoleColor = (roleName: string) => {
    switch (roleName) {
        case 'super_admin':
            return 'bg-red-500/10 border-red-500/20';
        case 'owner':
            return 'bg-primary/10 border-primary/20';
        case 'staff':
            return 'bg-amber-500/10 border-amber-500/20';
        default:
            return 'bg-muted/50 border-border/50';
    }
};

function RoleSkeleton() {
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

function RoleCard({
                      item,
                      onClick,
                      isLast,
                      lastRef,
                  }: {
    item: Role;
    onClick: (r: Role) => void;
    isLast: boolean;
    lastRef: any;
}) {
    const isSystemRole = item.name === 'super_admin' || item.name === 'owner';
    const permCount = item.permissions?.length ?? 0;

    return (
        <div
            onClick={() => onClick(item)}
            ref={isLast ? lastRef : null}
            className="group flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-border bg-card p-4 shadow-sm transition-all active:scale-[0.98]"
        >
            <div
                className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                    getRoleColor(item.name)
                )}
            >
                {renderRoleIcon(item.name)}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="flex items-center gap-1.5 truncate text-base font-bold text-foreground">
                    {formatRoleName(item.name)}
                </p>

                {isSystemRole ? (
                    <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-primary uppercase">
                        <Shield size={10} /> Sistem Inti
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        Memiliki {permCount} kapabilitas
                    </span>
                )}
            </div>

            {/* Indikator Panah untuk tap */}
            <div className="flex shrink-0 items-center justify-center text-muted-foreground/30 group-active:text-primary/60 transition-colors">
                <div className="h-2 w-2 rounded-full bg-current" />
            </div>
        </div>
    );
}

export function MobileList({
                               initialRoles,
                               filters,
                               onAdd,
                               onEdit,
                               onDelete,
                               onSearch,
                               searchValue,
                               isPending,
                           }: Props) {
    const [list, setList] = useState<Role[]>(initialRoles.data ?? []);
    const [nextUrl, setNextUrl] = useState<string | null>(
        initialRoles.next_page_url ?? null,
    );
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // State untuk Laci Detail & Aksi
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const { version } = usePage();

    useEffect(() => {
        setList(initialRoles.data ?? []);
        setNextUrl(initialRoles.next_page_url ?? null);
    }, [initialRoles]);

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
            const source = res.data?.props?.roles ?? res.data;
            setList((prev) => [
                ...prev,
                ...(source.data ?? []).filter(
                    (n: Role) => !prev.some((p) => p.id === n.id),
                ),
            ]);
            setNextUrl(source.next_page_url ?? null);
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                window.location.href = nextUrl;
            } else {
                toast.error('Gagal memuat kelanjutan data.');
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

    const handleActionClick = (action: 'edit' | 'delete') => {
        setIsDrawerOpen(false);
        // Beri sedikit jeda animasi drawer menutup sebelum memanggil aksi
        setTimeout(() => {
            if (selectedRole) {
                if (action === 'edit') onEdit(selectedRole);
                if (action === 'delete') onDelete(selectedRole);
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
                            Hak Akses (Roles)
                        </h1>
                        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                            Manajemen tingkat akses dan izin pengguna.
                        </p>
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                        <PlusIcon size={20} strokeWidth={2.5} />
                    </button>
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
                        placeholder="Cari nama role atau kapabilitas..."
                        className="w-full rounded-2xl border border-border bg-secondary py-3.5 pr-4 pl-10 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* SCROLLABLE AREA */}
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-10">
                {isPending && list.length === 0 ? (
                    [1, 2, 3].map((n) => <RoleSkeleton key={n} />)
                ) : list.length > 0 ? (
                    <>
                        {list.map((item, idx) => (
                            <RoleCard
                                key={item.id}
                                item={item}
                                isLast={idx === list.length - 1}
                                lastRef={lastElementRef}
                                onClick={(r) => {
                                    setSelectedRole(r);
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
                        <Lock className="mb-3 size-10 text-muted-foreground/30" strokeWidth={1.5} />
                        <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            {searchValue ? 'Role Tidak Ditemukan' : 'Belum Ada Data Role'}
                        </h4>
                    </div>
                )}
            </div>

            {/* ── DETAIL & ACTION DRAWER ── */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] border-t border-border/80 bg-background outline-none sm:mb-4 sm:max-w-[420px] sm:rounded-[3rem] sm:border sm:border-border/60 sm:bg-card">
                    {selectedRole && (
                        <>
                            <DrawerHeader className="shrink-0 border-b border-border/40 px-6 pt-5 pb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border", getRoleColor(selectedRole.name))}>
                                        {renderRoleIcon(selectedRole.name)}
                                    </div>
                                    <div>
                                        <DrawerTitle className="text-lg font-black tracking-tight">
                                            {formatRoleName(selectedRole.name)}
                                        </DrawerTitle>
                                        <DrawerDescription className="text-[11px] font-medium text-muted-foreground">
                                            {selectedRole.name === 'super_admin'
                                                ? 'Akses Absolut (Sistem Inti)'
                                                : `Memiliki ${selectedRole.permissions?.length || 0} izin kapabilitas`}
                                        </DrawerDescription>
                                    </div>
                                </div>
                            </DrawerHeader>

                            <div className="no-scrollbar flex-1 overflow-y-auto p-6">
                                <h3 className="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    Rincian Kapabilitas
                                </h3>

                                {selectedRole.name === 'super_admin' ? (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                                        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-red-500" />
                                        <p className="text-xs font-medium leading-relaxed text-red-600/90 dark:text-red-400/90">
                                            Role ini memberikan hak akses penuh ke seluruh fitur dan pengaturan aplikasi (Bypass System). Tidak dapat dimodifikasi.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                                            selectedRole.permissions.map((perm) => (
                                                <span
                                                    key={perm.id}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground"
                                                >
                                                    <CheckCircle2 size={12} className="text-primary" />
                                                    {perm.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs italic text-muted-foreground">Tidak ada hak akses yang diberikan.</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t border-border/40 px-6 pt-4 pb-8">
                                {selectedRole.name !== 'super_admin' && (
                                    <Button
                                        onClick={() => handleActionClick('edit')}
                                        className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-95"
                                    >
                                        <Edit3 size={16} className="mr-2" />
                                        Ubah Hak Akses
                                    </Button>
                                )}

                                {selectedRole.name !== 'super_admin' && selectedRole.name !== 'owner' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleActionClick('delete')}
                                        className="h-12 w-full rounded-2xl border-red-500/20 bg-red-500/5 text-sm font-bold text-red-600 hover:bg-red-500/10 active:scale-95 dark:text-red-400"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Hapus Role
                                    </Button>
                                )}

                                {(selectedRole.name === 'super_admin' || selectedRole.name === 'owner') && (
                                    <p className="text-center text-[10px] font-semibold text-muted-foreground/60 italic">
                                        Aksi penghapusan dikunci untuk Role Sistem Inti.
                                    </p>
                                )}
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
