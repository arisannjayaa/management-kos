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
    onCancel?: () => void; // Tambahan prop opsional jika butuh fungsi saat batal
};

export default function DeleteConfirmDialog({
    open,
    onOpenChange,
    title = 'Apakah Anda benar-benar yakin?', // Default value
    description,
    onConfirm,
    onCancel,
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
                    {/* Tombol Batal menjalankan onCancel (jika ada) */}
                    <AlertDialogCancel onClick={onCancel}>
                        Batal
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                        Ya, Hapus Data
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
