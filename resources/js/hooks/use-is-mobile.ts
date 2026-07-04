// resources/js/hooks/use-is-mobile.ts
//
// Hook sederhana untuk deteksi apakah viewport saat ini termasuk mobile.
// Threshold default: 768px (md breakpoint Tailwind).
// SSR-safe: mengembalikan false saat window belum tersedia.

import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === 'undefined') {
return false;
}

        return window.innerWidth < breakpoint;
    });

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

        // Set nilai awal yang akurat
        setIsMobile(mql.matches);

        mql.addEventListener('change', handler);

        return () => mql.removeEventListener('change', handler);
    }, [breakpoint]);

    return isMobile;
}
