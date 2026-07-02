// resources/js/hooks/use-datatable.ts
//
// Perubahan dari versi sebelumnya:
// - applySort sekarang menerima opsional `defaultDirection` agar kolom dengan
//   defaultSortDirection: 'desc' (misal kolom tanggal) pertama kali diklik
//   langsung sort descending, bukan ascending.

import { router } from '@inertiajs/react';
import { useCallback, useTransition } from 'react';

type BaseFilters = {
    sort?: string;
    direction?: 'asc' | 'desc';
    [key: string]: unknown;
};

export function useDatatable<T extends BaseFilters>(url: string, filters: T) {
    const [isPending, startTransition] = useTransition();

    const toPayload = (obj: object) =>
        obj as Record<string, string | number | boolean | undefined>;

    const applyFilter = useCallback(
        (newFilters: Partial<T>) => {
            startTransition(() => {
                router.get(
                    url,
                    toPayload({ ...filters, ...newFilters, page: 1 }),
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            });
        },
        [url, filters],
    );

    /**
     * Toggle sort pada field tertentu.
     *
     * @param field           Nama field backend
     * @param defaultDirection Arah sort pertama kali kolom ini diklik.
     *                         Ambil dari ColumnDef.defaultSortDirection.
     *                         Default: 'asc'
     */
    const applySort = useCallback(
        (field: string, defaultDirection: 'asc' | 'desc' = 'asc') => {
            startTransition(() => {
                // Jika kolom yang sama sudah aktif → toggle arah
                // Jika kolom baru → gunakan defaultDirection kolom tersebut
                const nextDirection =
                    filters.sort === field
                        ? filters.direction === 'asc'
                            ? 'desc'
                            : 'asc'
                        : defaultDirection;

                router.get(
                    url,
                    toPayload({
                        ...filters,
                        sort: field,
                        direction: nextDirection,
                    }),
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            });
        },
        [url, filters],
    );

    const goToPage = useCallback(
        (page: number) => {
            startTransition(() => {
                router.get(url, toPayload({ ...filters, page }), {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            });
        },
        [url, filters],
    );

    return { applyFilter, applySort, goToPage, isPending };
}
