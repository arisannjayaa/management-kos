// resources/js/components/datatable/sortable-head.tsx

import {
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronsUpDownIcon,
} from 'lucide-react';
import { TableHead } from '@/components/ui/table';

type Props = {
    field: string;
    label: string;
    sort?: string;
    direction?: string;
    /**
     * Callback saat header diklik.
     * Menerima field DAN defaultDirection agar useDatatable bisa memilih
     * arah sort yang tepat saat kolom ini pertama kali aktif.
     */
    onSort: (field: string, defaultDirection?: 'asc' | 'desc') => void;
    /** Class tambahan dari DataTable (misal alignment) */
    className?: string;
    /**
     * Arah sort default saat kolom ini pertama kali diklik.
     * @default 'asc'
     */
    defaultDirection?: 'asc' | 'desc';
};

export function SortableHead({
    field,
    label,
    sort,
    direction,
    onSort,
    className = '',
    defaultDirection = 'asc',
}: Props) {
    const isActive = sort === field;

    const icon = !isActive ? (
        <ChevronsUpDownIcon className="ml-1.5 inline size-3.5 text-slate-400" />
    ) : direction === 'asc' ? (
        <ChevronUpIcon className="ml-1.5 inline size-3.5 text-slate-700 dark:text-slate-200" />
    ) : (
        <ChevronDownIcon className="ml-1.5 inline size-3.5 text-slate-700 dark:text-slate-200" />
    );

    return (
        <TableHead
            className={[
                'cursor-pointer text-xs font-semibold tracking-wide whitespace-nowrap uppercase select-none',
                'transition-colors',
                isActive
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={() => onSort(field, defaultDirection)}
        >
            {label}
            {icon}
        </TableHead>
    );
}
