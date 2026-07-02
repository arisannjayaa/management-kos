import { Button } from '@/components/ui/button';
import type { PaginatedResponse } from '@/types/pagination';

type Props = {
    meta: Pick<
        PaginatedResponse<unknown>,
        'current_page' | 'last_page' | 'from' | 'to' | 'total'
    >;
    onPageChange: (page: number) => void;
};

export function DataTablePagination({ meta, onPageChange }: Props) {
    if (meta.last_page <= 1) {
return null;
}

    const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1)
        .filter(
            (p) =>
                p === 1 ||
                p === meta.last_page ||
                Math.abs(p - meta.current_page) <= 1,
        )
        .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) {
acc.push('ellipsis');
}

            acc.push(p);

            return acc;
        }, []);

    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-500">
                Menampilkan{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                    {meta.from}–{meta.to}
                </span>{' '}
                dari{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                    {meta.total}
                </span>{' '}
                data
            </p>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={meta.current_page === 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                >
                    ← Prev
                </Button>

                {pages.map((p, i) =>
                    p === 'ellipsis' ? (
                        <span
                            key={`e-${i}`}
                            className="px-1 text-xs text-slate-400"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={p}
                            variant={
                                p === meta.current_page ? 'default' : 'outline'
                            }
                            size="sm"
                            className={`h-8 w-8 p-0 text-xs ${p === meta.current_page ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : ''}`}
                            onClick={() => onPageChange(p as number)}
                        >
                            {p}
                        </Button>
                    ),
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                >
                    Next →
                </Button>
            </div>
        </div>
    );
}
