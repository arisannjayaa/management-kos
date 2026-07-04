import { Link } from '@inertiajs/react';
import { User, ShieldCheck, Paintbrush } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

// 🌟 TAMBAHAN: Memasukkan ikon Lucide untuk mempermanis UI
const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil Akun',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Tampilan',
        href: editAppearance(),
        icon: Paintbrush,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20 lg:pb-0">
            {/* 🌟 HEADER STICKY & GLASSMORPHISM (Khusus Mobile) */}
            <header className="sticky top-0 z-40 bg-background/80 px-4 pt-6 pb-2 backdrop-blur-xl lg:static lg:bg-transparent lg:px-8 lg:pt-10 lg:pb-6">
                <Heading
                    title="Pengaturan"
                    description="Kelola preferensi profil, keamanan, dan tema aplikasi Anda."
                />

                {/* ─── NAVIGASI MOBILE: Horizontal Snapping Pills ─── */}
                <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-3 lg:hidden">
                    {sidebarNavItems.map((item, index) => {
                        const isActive = isCurrentOrParentUrl(item.href);
                        return (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-black tracking-widest uppercase shadow-sm transition-all active:scale-95',
                                    isActive
                                        ? 'bg-foreground text-background' // Kontras tinggi saat aktif
                                        : 'border border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/80',
                                )}
                            >
                                {item.icon && <item.icon size={14} strokeWidth={isActive ? 2.5 : 2} />}
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Garis pemisah halus di bawah sticky header mobile */}
                <div className="absolute right-0 bottom-0 left-0 h-[1px] bg-border/40 lg:hidden" />
            </header>

            <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className="mx-auto flex w-full max-w-6xl flex-col lg:flex-row lg:gap-12">
                    {/* ─── NAVIGASI DESKTOP: Sidebar Konvensional ─── */}
                    <aside className="hidden w-56 shrink-0 lg:block">
                        <nav className="flex flex-col space-y-2" aria-label="Settings">
                            {sidebarNavItems.map((item, index) => {
                                const isActive = isCurrentOrParentUrl(item.href);
                                return (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'w-full justify-start rounded-xl py-6 font-bold transition-all',
                                            isActive
                                                ? 'bg-secondary text-foreground shadow-sm ring-1 ring-border/50 ring-inset'
                                                : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                                        )}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && (
                                                <item.icon className="mr-3 h-5 w-5 opacity-80" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* ─── AREA KONTEN UTAMA ─── */}
                    <main className="flex-1">
                        {/* Animasi masuk dari bawah secara halus */}
                        <section className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}
