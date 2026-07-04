import { useState, useEffect } from 'react';
import FlashMessage from '@/components/flash-message';
import { useMediaQuery } from '@/hooks/use-media-query';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import MobileLayout from '@/layouts/mobile-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    // Gunakan inisialisasi instan kebal SSR agar di client mobile langsung bernilai true sejak milidetik pertama
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        return false;
    });

    const isBreakpointMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        setMounted(true);
        setIsMobile(isBreakpointMobile);
    }, [isBreakpointMobile]);

    // 🌟 PERBAIKAN UTAMA: Mencegah Hydration Flash & Error
    // Saat proses rendering awal di server (SSR) atau rendering pertama di browser,
    // kembalikan wrapper netral minim HTML agar tidak merender komponen desktop secara prematur di layar HP.
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background">
                <FlashMessage />
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    // Setelah mounted selesai 100%, barulah aman melakukan percabangan layout asli
    if (isMobile) {
        return (
            <MobileLayout>
                <FlashMessage />
                {children}
            </MobileLayout>
        );
    }

    // Tampilan kokoh untuk layar Desktop
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <FlashMessage />
            {children}
        </AppLayoutTemplate>
    );
}
