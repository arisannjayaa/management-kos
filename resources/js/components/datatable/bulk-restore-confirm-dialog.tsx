// resources/js/components/datatable/bulk-restore-confirm-dialog.tsx
//
// Dialog konfirmasi untuk bulk restore.
// Terima props dari useBulkRestore() hook.
//
// Pemakaian:
//   <BulkRestoreConfirmDialog
//       open={bulkRestore.open}
//       onOpenChange={bulkRestore.setOpen}
//       count={bulkRestore.pendingCount}
//       isRestoring={bulkRestore.isRestoring}
//       onConfirm={bulkRestore.confirm}
//       onCancel={bulkRestore.cancel}
//       entityLabel="divisi"
//   />

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
    count: number;
    isRestoring: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    /** @default 'data' */
    entityLabel?: string;
};

export function BulkRestoreConfirmDialog({
    open,
    onOpenChange,
    count,
    isRestoring,
    onConfirm,
    onCancel,
    entityLabel = 'data',
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Pulihkan {count} {entityLabel}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda akan memulihkan{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {count} {entityLabel}
                        </span>{' '}
                        dari tempat sampah. Data akan aktif kembali dan bisa
                        digunakan seperti semula.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onCancel}
                        disabled={isRestoring}
                    >
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isRestoring}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600"
                    >
                        {isRestoring ? (
                            <>
                                <Loader2Icon className="mr-2 size-4 animate-spin" />
                                Memulihkan...
                            </>
                        ) : (
                            `Pulihkan ${count} ${entityLabel}`
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
