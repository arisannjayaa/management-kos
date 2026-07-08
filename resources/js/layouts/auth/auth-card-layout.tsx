import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
   children,
   title,
   description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    // 🌟 DINAMIS: Tarik nama aplikasi agar selaras dengan tema branding induk
    const { props } = usePage<any>();
    const appName = props?.app?.name || import.meta.env.VITE_APP_NAME || 'Kos Management';

    const nameParts = appName.split(' ');
    const firstWord = nameParts[0];
    const remainingWords = nameParts.slice(1).join(' ');

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4 sm:p-6 md:p-10 overflow-hidden">

            {/* ✨ IMMERSIVE AMBIENT LUMINANCE & OVERLAY BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-primary/4 rounded-full blur-[140px]" />
            </div>

            {/* CARD MAIN ENVELOPE CONTAINER */}
            <div className="relative z-10 flex w-full max-w-md flex-col gap-6 transition-all duration-300">

                {/* BRANDING ATAS: GABUNGAN LOGO ICON + TEXT */}
                <Link
                    href={home()}
                    className="flex items-center gap-2.5 self-center font-bold tracking-tight group outline-none"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/10 transition-transform group-hover:scale-102">
                        <AppLogoIcon className="size-5 fill-current text-primary" />
                    </div>
                    <span className="text-base font-black text-foreground">
                        {firstWord}
                        {remainingWords && <span className="text-muted-foreground/70 font-medium ml-1"> {remainingWords}</span>}
                    </span>
                </Link>

                {/* CONTAINER CARD MODERN ELEGAN */}
                <div className="flex flex-col gap-6">
                    <Card className="rounded-[2.5rem] border border-border/60 bg-card/60 backdrop-blur-xl shadow-xl shadow-foreground/[0.01]">
                        <CardHeader className="px-8 sm:px-10 pt-8 pb-2 text-center space-y-1.5">
                            <CardTitle className="text-lg font-black tracking-tight text-foreground">{title}</CardTitle>
                            {description && (
                                <CardDescription className="text-xs font-medium text-muted-foreground leading-relaxed text-balance">
                                    {description}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="px-8 sm:px-10 py-6">
                            {children}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
