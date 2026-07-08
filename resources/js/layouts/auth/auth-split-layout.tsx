import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    // 🌟 DINAMIS: Deteksi nama aplikasi otomatis dari server atau environment
    const { props } = usePage<any>();
    const appName = props?.app?.name || import.meta.env.VITE_APP_NAME || 'Kos Management';

    const nameParts = appName.split(' ');
    const firstWord = nameParts[0];
    const remainingWords = nameParts.slice(1).join(' ');

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center bg-background px-4 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden">

            {/* SISI KIRI: PREMIUM BRANDING IMMERSIVE SIDE PANEL (DESKTOP ONLY) */}
            <div className="relative hidden h-full flex-col bg-zinc-950 p-12 text-white lg:flex border-r border-border/10 select-none overflow-hidden">
                {/* Layer 1: Ambient Background Mesh */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-primary/20 z-0" />
                {/* Layer 2: Geometric Architecture Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)] z-0" />
                {/* Layer 3: Accent Glow Corner */}
                <div className="absolute -bottom-48 -left-48 size-96 bg-primary/10 rounded-full blur-[128px]" />

                {/* LOGO & BRANDING ATAS */}
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-black tracking-tight group outline-none"
                >
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm transition-transform group-hover:scale-[1.03]">
                        <AppLogoIcon className="size-5 fill-current text-primary" />
                    </div>
                    <span className="font-black text-white">
                        {firstWord}
                        {remainingWords && <span className="text-white/60 font-medium ml-1"> {remainingWords}</span>}
                    </span>
                </Link>

                {/* RUNNING HIGHLIGHT/SLOGAN PENDUKUNG (EDITORIAL FOOTER) */}
                <div className="relative z-20 mt-auto max-w-sm space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Premium Living</p>
                    <blockquote className="space-y-2">
                        <p className="text-sm font-medium leading-relaxed text-zinc-300">
                            "Efisiensi manajemen tata kelola hunian kos eksklusif dalam satu genggaman layar pintar terintegrasi."
                        </p>
                    </blockquote>
                </div>
            </div>

            {/* SISI KANAN: INTERACTIVE CONTROL CENTER FORM */}
            <div className="w-full lg:p-8 relative z-10 flex flex-col justify-center items-center">
                {/* Pattern Pendaran Halus Khusus Mobile */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] lg:hidden pointer-events-none" />

                <div className="mx-auto flex w-full flex-col justify-center space-y-7 sm:w-[360px] bg-card/40 lg:bg-transparent p-6 sm:p-8 lg:p-0 border lg:border-none border-border/50 backdrop-blur-xl lg:backdrop-blur-none rounded-[2.5rem] shadow-xl shadow-foreground/[0.01] lg:shadow-none">

                    {/* BRANDING LOGO (HANYA MUNCUL DI MOBILE SEBAGAI OVERLAY) */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden group outline-none"
                    >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10 shadow-inner">
                            <AppLogoIcon className="h-6 fill-current text-primary" />
                        </div>
                    </Link>

                    {/* JUDUL DAN DESKRIPSI FORMULIR */}
                    <div className="flex flex-col items-start gap-1.5 text-left sm:items-center sm:text-center">
                        <h2 className="text-xl font-black tracking-tight text-foreground">{title}</h2>
                        {description && (
                            <p className="text-xs font-semibold text-muted-foreground leading-relaxed text-balance">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* INJEKSI FORM (CHILDREN INPUT) */}
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </div>

        </div>
    );
}
