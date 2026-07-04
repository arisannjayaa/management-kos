// resources/js/components/datatable/bulk-force-delete-confirm-dialog.tsx
//
// Dialog konfirmasi hapus permanen (force delete) dari trash.
// Warning lebih keras dari soft delete biasa.

import { Loader2Icon, TriangleAlertIcon } from 'lucide-react';
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
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    /** @default 'data' */
    entityLabel?: string;
};

export function BulkForceDeleteConfirmDialog({
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
                    <AlertDialogTitle className="flex items-center gap-2">
                        <TriangleAlertIcon className="size-5 text-red-500" />
                        Hapus Permanen {count} {entityLabel}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                            Tindakan ini tidak dapat dibatalkan.
                        </span>{' '}
                        Anda akan menghapus{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {count} {entityLabel}
                        </span>{' '}
                        secara permanen dari database. Data tidak bisa
                        dipulihkan kembali setelah ini.
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
                            `Hapus Permanen ${count} ${entityLabel}`
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
