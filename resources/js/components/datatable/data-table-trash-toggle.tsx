// resources/js/components/datatable/data-table-trash-toggle.tsx
//
// Tombol toggle antara tampilan data aktif ↔ data di trash.
// Ditempatkan di toolbar, sebelah kanan filter/per-page.
//
// Pemakaian:
//   <DataTableTrashToggle
//       showTrashed={filters.trashed === '1'}
//       onChange={(v) => applyFilter({ trashed: v ? '1' : undefined })}
//   />

import { Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    /** true = sedang menampilkan data terhapus */
    showTrashed: boolean;
    onChange: (showTrashed: boolean) => void;
};

export function DataTableTrashToggle({ showTrashed, onChange }: Props) {
    return (
        <Button
            type="button"
            variant={showTrashed ? 'destructive' : 'outline'}
            size="sm"
            className={[
                'h-9 gap-2',
                showTrashed
                    ? 'border-transparent bg-red-600 text-white hover:bg-red-700'
                    : 'text-slate-600 dark:text-slate-400',
            ].join(' ')}
            onClick={() => onChange(!showTrashed)}
        >
            <Trash2Icon className="size-4" />
            {showTrashed ? 'Lihat Data Aktif' : 'Tempat Sampah'}
        </Button>
    );
}
