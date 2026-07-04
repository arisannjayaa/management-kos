// resources/js/hooks/use-bulk-force-delete.ts

import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

type Options = {
    url: string;
    onSuccess?: () => void;
};

export function useBulkForceDelete({ url, onSuccess }: Options) {
    const [open, setOpen]            = useState(false);
    const [pendingIds, setPendingIds] = useState<(string | number)[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Simpan ids di ref agar confirm() tidak bergantung pada state setter trick
    const pendingIdsRef = useRef<(string | number)[]>([]);
    const onSuccessRef  = useRef(onSuccess);
    onSuccessRef.current = onSuccess;

    const trigger = useCallback((ids: (string | number)[]) => {
        if (ids.length === 0) return;
        pendingIdsRef.current = ids;
        setPendingIds(ids);
        setOpen(true);
    }, []);

    const confirm = useCallback(() => {
        const ids = pendingIdsRef.current;
        // Guard: jangan jalankan dua kali
        if (ids.length === 0 || isDeleting) return;

        setIsDeleting(true);
        router.delete(url, {
            data: { ids },
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setPendingIds([]);
                pendingIdsRef.current = [];
                onSuccessRef.current?.();
            },
            onFinish: () => setIsDeleting(false),
        });
    }, [url, isDeleting]);

    const cancel = useCallback(() => {
        if (isDeleting) return;
        setOpen(false);
        setPendingIds([]);
        pendingIdsRef.current = [];
    }, [isDeleting]);

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
