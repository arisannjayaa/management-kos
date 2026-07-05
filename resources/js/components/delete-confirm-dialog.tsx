// resources/js/components/delete-confirm-dialog.tsx

import React from 'react';
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
    title?: string;
    description: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    /**
     * Label tombol konfirmasi.
     * @default 'Ya, Hapus Data'
     */
    confirmLabel?: string;
    /**
     * Class tambahan untuk tombol konfirmasi.
     * Gunakan ini untuk mengubah warna tombol, misal untuk restore (hijau).
     * @default 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
     */
    confirmClassName?: string;
    isDeleting?: boolean;
};

export default function DeleteConfirmDialog({
    open,
    onOpenChange,
    title = 'Apakah Anda benar-benar yakin?',
    description,
    onConfirm,
    onCancel,
    confirmLabel = 'Ya, Hapus Data',
    confirmClassName = 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
    isDeleting = false,
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Mencegah dialog tertutup otomatis jika perlu
                            onConfirm();
                        }}
                        className={confirmClassName}
                        disabled={isDeleting} // Tombol disable saat loading
                    >
                        {isDeleting ? 'Memproses...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
