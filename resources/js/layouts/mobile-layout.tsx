// resources/js/layouts/MobileLayout.tsx

import { Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    ChevronLeft,
    LayoutGrid,
    PieChart,
    LogOut,
    Building,
    BedDouble,
    Users,
    KeyRound,
    FileText,
    Banknote,
    ReceiptText,
    MessageSquareWarning,
    MessageCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    children: React.ReactNode;
}

// ─── KOMPONEN HELPER NAVICON (iOS Frosted Pill Indicator) ──────────────
function NavIcon({
                     href,
                     icon,
                     isActive,
                 }: {
    href: string;
    icon: React.ReactNode;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            className="relative flex h-full flex-1 items-center justify-center transition-all duration-300 select-none active:scale-95"
        >
            {/* Liquid Pill Indicator - Lebih subtle & frosted */}
            <div
                className={cn(
                    'cubic-bezier(0.34,1.56,0.64,1) absolute h-10 w-14 rounded-[1.15rem] transition-all duration-500',
                    isActive
                        ? 'scale-100 bg-foreground/10 opacity-100 shadow-sm dark:bg-white/10 bg-primary/10'
                        : 'scale-50 opacity-0',
                )}
            />

            {/* Ikon */}
            <div
                className={cn(
                    'relative z-10 flex transition-all duration-300',
                    isActive
                        ? 'text-foreground text-primary'
                        : 'text-muted-foreground/50 hover:text-foreground/80',
                )}
            >
                {React.isValidElement(icon)
                    ? React.cloneElement(icon as React.ReactElement<any>, {
                        strokeWidth: isActive ? 2.5 : 2,
                        size: 22,
                    })
                    : icon}
            </div>
        </Link>
    );
}

// ─── KOMPONEN HELPER MENU ITEM ───────────
function MenuItem({
                      href,
                      icon,
                      label,
                      onClick,
                      isDanger = false,
                  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isDanger?: boolean;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            method={isDanger ? 'post' : 'get'}
            as={isDanger ? 'button' : 'a'}
            className={cn(
                'group flex w-full items-center gap-3 px-4 py-2.5 transition-all duration-200 active:scale-95 active:opacity-70',
            )}
        >
            <div
                className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                    isDanger
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-foreground/5 text-muted-foreground group-hover:text-foreground',
                )}
            >
                {icon}
            </div>
            <span
                className={cn(
                    'text-[13px] font-bold tracking-tight',
                    isDanger ? 'text-red-500' : 'text-foreground',
                )}
            >
                {label}
            </span>
        </Link>
    );
}

export default function MobileLayout({ children }: Props) {
    const { url } = usePage();
    const { auth } = usePage().props as any;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getInitials = (name: string) =>
        name ? name.substring(0, 2).toUpperCase() : 'US';
    const isDashboard = url === '/dashboard';

    const getPageTitle = (currentUrl: string) => {
        if (currentUrl.startsWith('/properties')) return 'Properti';
        if (currentUrl.startsWith('/rooms')) return 'Kamar Kos';
        if (currentUrl.startsWith('/tenants')) return 'Penghuni';
        if (currentUrl.startsWith('/occupancies')) return 'Okupansi';
        if (currentUrl.startsWith('/billings')) return 'Tagihan';
        if (currentUrl.startsWith('/payments')) return 'Pembayaran';
        if (currentUrl.startsWith('/expenses')) return 'Pengeluaran';
        if (currentUrl.startsWith('/complaints')) return 'Komplain';
        if (currentUrl.startsWith('/reports')) return 'Laporan';
        if (currentUrl.startsWith('/charge-types')) return 'Jenis Biaya';
        if (currentUrl.startsWith('/users')) return 'Pengguna';
        if (currentUrl.startsWith('/roles')) return 'Hak Akses';
        if (currentUrl.startsWith('/wa-session')) return 'WA Gateway';
        if (currentUrl.startsWith('/settings')) return 'Profil Saya';

        return 'Sanjaya Kos';
    };

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-[#0a0a0a] selection:bg-primary/30 sm:p-6 md:p-10">
            {/* CONTAINER UTAMA */}
            <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-all sm:h-[95dvh] sm:max-h-[900px] sm:max-w-[420px] sm:rounded-[3rem] sm:border sm:border-border/30 sm:ring-8 sm:ring-white/5">
                {/* ── HEADER (APPLE FROSTED GLASS EFFECT) ── */}
                <header className="relative z-10 flex h-[4.5rem] shrink-0 items-center justify-between border-b border-border/10 bg-background/30 px-5 pt-3 backdrop-blur-2xl backdrop-saturate-200 transition-all duration-300">
                    {isDashboard ? (
                        <>
                            <div className="flex animate-in flex-col duration-500 fade-in slide-in-from-left-4">
                                <p className="mb-0.5 text-[9px] font-black tracking-[0.3em] text-primary uppercase">
                                    Sanjaya Kos
                                </p>
                                <h1 className="text-xl font-black tracking-tighter text-foreground">
                                    Hai,{' '}
                                    {auth.user?.name?.split(' ')[0] || 'User'}
                                </h1>
                            </div>
                            <div className="flex animate-in items-center space-x-2.5 duration-500 fade-in slide-in-from-right-4">
                                <Link
                                    href="/properties"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/30 bg-background/40 shadow-sm backdrop-blur-md transition-all hover:bg-secondary active:scale-90"
                                >
                                    <Building
                                        size={16}
                                        className="text-muted-foreground"
                                        strokeWidth={2.5}
                                    />
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-sm transition-all hover:bg-primary/20 active:scale-90"
                                >
                                    <span className="text-[11px] font-black tracking-wider text-primary">
                                        {getInitials(auth.user?.name)}
                                    </span>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex animate-in items-center gap-2 duration-300 fade-in slide-in-from-left-4">
                                <button
                                    onClick={() =>
                                        window.history.length > 1
                                            ? window.history.back()
                                            : router.visit('/dashboard')
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/30 bg-background/40 text-foreground shadow-sm backdrop-blur-md transition-all hover:bg-secondary active:scale-90"
                                >
                                    <ChevronLeft size={20} strokeWidth={2.5} />
                                </button>
                                <h2 className="pl-1.5 text-lg font-black tracking-tight text-foreground">
                                    {getPageTitle(url)}
                                </h2>
                            </div>
                            <div className="animate-in duration-300 fade-in slide-in-from-right-4">
                                <Link
                                    href="/settings"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-sm transition-all hover:bg-primary/20 active:scale-90"
                                >
                                    <span className="text-[11px] font-black tracking-wider text-primary">
                                        {getInitials(auth.user?.name)}
                                    </span>
                                </Link>
                            </div>
                        </>
                    )}
                </header>

                {/* ── MAIN CONTENT ── */}
                <main className="no-scrollbar relative flex-1 overflow-y-auto pb-32">
                    {children}
                </main>

                {/* 🌟 CINEMATIC DIMMING OVERLAY (Lebih transparan, blur lebih kuat) */}
                <div
                    className={cn(
                        'absolute inset-0 z-40 bg-black/20 backdrop-blur-[12px] transition-all duration-500 dark:bg-black/40',
                        isMenuOpen
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0',
                    )}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* 🌟 EFEK GRADASI BAWAH */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* ── SPLIT BOTTOM NAVIGATION ── */}
                <div className="pointer-events-none absolute inset-x-4 bottom-5 z-50 flex items-end gap-2.5">
                    {/* 1. Kapsul Kiri (ULTRA FROSTED) */}
                    <nav className="pointer-events-auto flex h-14 flex-1 items-center justify-around rounded-[1.75rem] border border-border/20 bg-background/25 px-1 shadow-lg backdrop-blur-2xl backdrop-saturate-[2] dark:border-white/10 dark:bg-[#121212]/30">
                        <NavIcon
                            href="/dashboard"
                            icon={<LayoutGrid />}
                            isActive={isDashboard}
                        />
                        <NavIcon
                            href="/tenants"
                            icon={<Users />}
                            isActive={url.startsWith('/tenants')}
                        />
                        <NavIcon
                            href="/billings"
                            icon={<FileText />}
                            isActive={url.startsWith('/billings')}
                        />
                        <NavIcon
                            href="/payments"
                            icon={<Banknote />}
                            isActive={url.startsWith('/payments')}
                        />
                    </nav>

                    {/* 2. Kontainer Kanan */}
                    <div className="pointer-events-auto relative flex shrink-0 flex-col items-end">
                        {/* 🌟 APPLE-STYLE CONTEXT MENU (ULTRA FROSTED) */}
                        <div
                            className={cn(
                                'cubic-bezier(0.34,1.56,0.64,1) absolute right-0 bottom-[115%] mb-2 w-[200px] origin-bottom-right flex-col overflow-hidden rounded-[1.5rem] border border-border/20 bg-background/30 shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-[2] transition-all duration-400 dark:border-white/10 dark:bg-[#121212]/30',
                                isMenuOpen
                                    ? 'visible translate-y-0 scale-100 opacity-100'
                                    : 'invisible translate-y-4 scale-75 opacity-0',
                            )}
                        >
                            {/* Header Mini */}
                            <div className="flex items-center justify-center border-b border-border/20 bg-foreground/5 px-4 py-2.5">
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase drop-shadow-sm">
                                    Menu Tambahan
                                </span>
                            </div>

                            {/* List Item Padat & Rapih */}
                            <div className="flex flex-col gap-0.5 p-1.5">
                                <MenuItem
                                    href="/rooms"
                                    icon={<BedDouble size={14} strokeWidth={2.5} />}
                                    label="Kamar Kos"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <MenuItem
                                    href="/occupancies"
                                    icon={<KeyRound size={14} strokeWidth={2.5} />}
                                    label="Okupansi"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <MenuItem
                                    href="/expenses"
                                    icon={<ReceiptText size={14} strokeWidth={2.5} />}
                                    label="Pengeluaran"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <MenuItem
                                    href="/complaints"
                                    icon={<MessageSquareWarning size={14} strokeWidth={2.5} />}
                                    label="Komplain"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <MenuItem
                                    href="/reports"
                                    icon={<PieChart size={14} strokeWidth={2.5} />}
                                    label="Laporan"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <MenuItem
                                    href="/wa-session"
                                    icon={<MessageCircle size={14} strokeWidth={2.5} />}
                                    label="WA Gateway"
                                    onClick={() => setIsMenuOpen(false)}
                                />

                                <div className="mx-2 my-1 h-[1px] bg-border/20" />

                                <MenuItem
                                    isDanger
                                    href="/logout"
                                    icon={
                                        <LogOut size={14} strokeWidth={2.5} />
                                    }
                                    label="Keluar Aplikasi"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                            </div>
                        </div>

                        {/* 🌟 TOMBOL MENU (+) */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                // KELAS DASAR: Efek kaca es diterapkan secara permanen di sini
                                'relative z-10 flex h-14 w-14 items-center justify-center rounded-[1.75rem] border shadow-lg backdrop-blur-2xl backdrop-saturate-[2] transition-all duration-500 hover:scale-105 active:scale-90',

                                isMenuOpen
                                    ? // STATE TERBUKA (X): Kaca es netral membaur dengan latar
                                    'border-border/20 bg-background/30 text-foreground'
                                    : // STATE TERTUTUP (+): Kaca es bernuansa warna Primary
                                    'border-primary/20 bg-primary/20 text-primary dark:bg-primary/15',
                            )}
                        >
                            <Plus
                                size={26}
                                strokeWidth={2.5}
                                className={cn(
                                    'transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                                    isMenuOpen ? 'rotate-[135deg]' : 'rotate-0',
                                )}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                html, body { margin: 0; height: 100%; background-color: #0F1719; }
                @supports (padding-bottom: env(safe-area-inset-bottom)) { .pb-safe { padding-bottom: env(safe-area-inset-bottom); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
