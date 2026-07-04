import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function FlashMessage() {
    const { flash } = usePage().props as any;

    // Simpan ID flash terakhir yang berhasil dirender, bukan teks pesannya
    const lastFlashId = useRef('');

    useEffect(() => {
        // Cek berdasarkan ID sukses
        if (flash?.success?.id && flash.success.id !== lastFlashId.current) {
            lastFlashId.current = flash.success.id; // Kunci ID ini agar tidak re-render ganda
            toast.success(flash.success.message); // Tampilkan teks pesannya
        }

        // Cek berdasarkan ID error
        if (flash?.error?.id && flash.error.id !== lastFlashId.current) {
            lastFlashId.current = flash.error.id;
            toast.error(flash.error.message);
        }
    }, [flash]);

    return null;
}
