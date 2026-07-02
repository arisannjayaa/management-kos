// resources/js/hooks/use-bulk-delete.ts
//
// Hook untuk bulk delete — mengelola dialog konfirmasi dan request DELETE ke server.
//
// Pemakaian:
//   const bulkDelete = useBulkDelete({
//       url: '/employees/bulk-destroy',
//       onSuccess: () => selection.clearAll(),
//   });
//
//   // Tampilkan tombol di BulkBar:
//   bulkDelete.trigger(Array.from(selection.selectedIds))
//
//   // Render dialog:
//   <BulkDeleteConfirmDialog {...bulkDelete} count={selection.selectedCount} />

import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

type Options = {
    /** URL endpoint DELETE — misal route('employees.bulk-destroy') */
    url: string;
    /** Dipanggil setelah delete berhasil */
    onSuccess?: () => void;
};

export function useBulkDelete({ url, onSuccess }: Options) {
    const [open, setOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState<(string | number)[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    /** Buka dialog konfirmasi dengan id yang akan dihapus */
    const trigger = useCallback((ids: (string | number)[]) => {
        if (ids.length === 0) {
            return;
        }

        setPendingIds(ids);
        setOpen(true);
    }, []);

    /** Eksekusi delete setelah user konfirmasi */
    const confirm = useCallback(() => {
        if (pendingIds.length === 0) {
            return;
        }

        setIsDeleting(true);

        router.delete(url, {
            data: { ids: pendingIds },
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setPendingIds([]);
                onSuccess?.();
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [url, pendingIds, onSuccess]);

    const cancel = useCallback(() => {
        setOpen(false);
        setPendingIds([]);
    }, []);

    return {
        open,
        setOpen,
        pendingIds,
        pendingCount: pendingIds.length,
        isDeleting,
        trigger,
        confirm,
        cancel,
    };
}
