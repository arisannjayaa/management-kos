// resources/js/components/datatable/bulk-delete-confirm-dialog.tsx
//
// Dialog konfirmasi untuk bulk delete.
// Terima props dari useBulkDelete() hook.
//
// Pemakaian:
// ```tsx
// const bulkDelete = useBulkDelete({ url: route('employees.bulk-destroy'), onSuccess: selection.clearAll });
//
// <BulkDeleteConfirmDialog
//   open={bulkDelete.open}
//   onOpenChange={bulkDelete.setOpen}
//   count={bulkDelete.pendingCount}
//   isDeleting={bulkDelete.isDeleting}
//   onConfirm={bulkDelete.confirm}
//   onCancel={bulkDelete.cancel}
//   entityLabel="karyawan"   // opsional, default "data"
// />
// ```

import { Loader2Icon } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Jumlah item yang akan dihapus */
    count: number;
    /** Apakah sedang proses delete */
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    /**
     * Label entitas dalam bahasa Indonesia — muncul di pesan konfirmasi.
     * Contoh: "karyawan", "barang", "transaksi"
     * @default 'data'
     */
    entityLabel?: string;
};

export function BulkDeleteConfirmDialog({
    open,
    onOpenChange,
    count,
    isDeleting,
    onConfirm,
    onCancel,
    entityLabel = 'data',
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Hapus {count} {entityLabel}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda akan menghapus{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {count} {entityLabel}
                        </span>{' '}
                        sekaligus. Tindakan ini tidak dapat dibatalkan dan data
                        akan hilang secara permanen dari sistem.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2Icon className="mr-2 size-4 animate-spin" />
                                Menghapus...
                            </>
                        ) : (
                            `Hapus ${count} ${entityLabel}`
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
