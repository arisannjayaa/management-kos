import { Link, usePage } from '@inertiajs/react';
import dashboardController from '@/actions/App/Http/Controllers/DashboardController';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
     children,
     title,
     description
 }: AuthLayoutProps) {
    // 🌟 DINAMIS: Ambil dari shared props Laravel atau langsung dari Environment Vite ENV (.env)
    const { props } = usePage<any>();
    const appName = props?.app?.name || import.meta.env.VITE_APP_NAME || 'Kos Management';

    // Memisahkan kata pertama untuk memberikan aksen warna estetis pada logo text
    const nameParts = appName.split(' ');
    const firstWord = nameParts[0];
    const remainingWords = nameParts.slice(1).join(' ');

    return (
        <div
            className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">

            {/* 🌌 IMMERSIVE BACKGROUND PATTERN & AMBIENT GLOW */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Garis Grid Halus Kontemporer */}
                <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Pencahayaan Ambient Warna Primer Sistem */}
                <div
                    className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] bg-primary/5 rounded-full blur-[128px]" />
                <div
                    className="absolute -bottom-40 left-1/2 -translate-x-1/2 size-[400px] bg-primary/3 rounded-full blur-[96px]" />
            </div>

            {/* CONTAINER KARTU LOGIN UTAMA */}
            <div className="relative z-10 w-full max-w-md transition-all duration-300">
                <div
                    className="flex flex-col gap-7 bg-card/60 border border-border/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-foreground/[0.02]">

                    {/* AREA BRANDING & HEADER */}
                    <div className="flex flex-col items-center gap-5">
                        <Link
                            href={dashboardController.index()}
                            className="flex flex-col items-center gap-1.5 group outline-none"
                        >
                            {/* Logo Text Elegan Berpartisi */}
                            <h1 className="font-black text-2xl tracking-tight text-foreground transition-transform group-hover:scale-[1.01] active:scale-98">
                                <span className="text-primary">{firstWord}</span>
                                {remainingWords && <span
                                    className="text-muted-foreground/80 font-medium ml-1.5">{remainingWords}</span>}
                            </h1>
                            <span className="sr-only">{title}</span>
                        </Link>

                        {/* Judul Form & Deskripsi Kasual-Friendly */}
                        <div className="space-y-1 text-center max-w-xs sm:max-w-sm">
                            <h2 className="text-lg font-extrabold tracking-tight text-foreground">{title}</h2>
                            {description && (
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SLOT FORM FORMULIR (CHILDREN) */}
                    <div className="w-full">
                        {children}
                    </div>

                </div>
            </div>

        </div>
    );
}
