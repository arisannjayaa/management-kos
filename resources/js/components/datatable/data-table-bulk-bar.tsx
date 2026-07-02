// resources/js/components/datatable/data-table-bulk-bar.tsx
//
// Floating bar yang muncul dari bawah ketika ada baris yang dipilih.
// Berisi info jumlah pilihan + tombol aksi bulk (hapus, ekspor, dsb.).
//
// Pemakaian:
// ```tsx
// <DataTableBulkBar
//   selectedCount={selection.selectedCount}
//   onClear={selection.clearAll}
//   actions={[
//     {
//       label: 'Hapus',
//       icon: <Trash2Icon className="size-4" />,
//       destructive: true,
//       onClick: (ids) => bulkDelete.trigger(ids),
//     },
//   ]}
//   selectedIds={Array.from(selection.selectedIds)}
// />
// ```

import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { BulkAction } from '@/types/datatable';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
    /** Jumlah baris yang terpilih */
    selectedCount: number;

    /** Array id yang terpilih — diteruskan ke setiap action.onClick */
    selectedIds: (string | number)[];

    /** Daftar aksi yang tersedia */
    actions: BulkAction[];

    /** Callback ketika user menekan tombol × (clear selection) */
    onClear: () => void;
};

/**
 * DataTableBulkBar
 *
 * Catatan animasi:
 * Komponen ini menggunakan framer-motion untuk animasi slide-up.
 * Jika project Anda belum menginstall framer-motion, hapus <motion.div>
 * dan ganti dengan <div> biasa — bar tetap berfungsi tanpa animasi.
 *
 * Install: `npm install framer-motion`
 */
export function DataTableBulkBar({
    selectedCount,
    selectedIds,
    actions,
    onClear,
}: Props) {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    key="bulk-bar"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
                >
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/60">
                        {/* Jumlah pilihan */}
                        <span className="min-w-max text-sm font-medium text-slate-700 dark:text-slate-300">
                            <span className="mr-1 inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                                {selectedCount}
                            </span>
                            {selectedCount === 1 ? 'baris' : 'baris'} dipilih
                        </span>

                        <Separator
                            orientation="vertical"
                            className="h-5 bg-slate-200 dark:bg-slate-700"
                        />

                        {/* Aksi */}
                        <div className="flex items-center gap-1.5">
                            {actions.map((action, i) => (
                                <Button
                                    key={i}
                                    size="sm"
                                    variant={action.destructive ? 'destructive' : 'outline'}
                                    disabled={action.disabled}
                                    className={[
                                        'h-8 gap-1.5 text-xs font-medium',
                                        action.destructive
                                            ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={() => action.onClick(selectedIds)}
                                >
                                    {action.icon}
                                    {action.label}
                                </Button>
                            ))}
                        </div>

                        <Separator
                            orientation="vertical"
                            className="h-5 bg-slate-200 dark:bg-slate-700"
                        />

                        {/* Clear */}
                        <button
                            type="button"
                            onClick={onClear}
                            aria-label="Batalkan pilihan"
                            className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            <XIcon className="size-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
