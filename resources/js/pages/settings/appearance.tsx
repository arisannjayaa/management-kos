import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';

import AppearanceTabs from '@/components/appearance-tabs';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Tema & Tampilan" />

            <div className="space-y-8">
                {/* ─── HEADER SECTION MODERN ─── */}
                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-sm ring-1 ring-indigo-500/20 ring-inset">
                        <Palette size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground">
                            Tema & Tampilan
                        </h2>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                            Sesuaikan nuansa visual antarmuka agar lebih
                            personal dan nyaman di mata.
                        </p>
                    </div>
                </div>

                {/* ─── KONTEN BENTO CARD ─── */}
                <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-6 shadow-sm ring-1 ring-border/50 backdrop-blur-sm ring-inset sm:p-8">
                    {/* Komponen AppearanceTabs bawaan Anda akan dirender di sini */}
                    <AppearanceTabs />
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Tema Tampilan',
            href: editAppearance(),
        },
    ],
};
