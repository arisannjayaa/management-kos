// resources/js/hooks/use-bulk-restore.ts

import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

type Options = {
    url: string;
    onSuccess?: () => void;
};

export function useBulkRestore({ url, onSuccess }: Options) {
    const [open, setOpen]            = useState(false);
    const [pendingIds, setPendingIds] = useState<(string | number)[]>([]);
    const [isRestoring, setIsRestoring] = useState(false);

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
        if (ids.length === 0 || isRestoring) return;

        setIsRestoring(true);
        router.post(url, { ids }, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setPendingIds([]);
                pendingIdsRef.current = [];
                onSuccessRef.current?.();
            },
            onFinish: () => setIsRestoring(false),
        });
    }, [url, isRestoring]);

    const cancel = useCallback(() => {
        if (isRestoring) return;
        setOpen(false);
        setPendingIds([]);
        pendingIdsRef.current = [];
    }, [isRestoring]);

    return {
        open,
        setOpen,
        pendingIds,
        pendingCount: pendingIds.length,
        isRestoring,
        trigger,
        confirm,
        cancel,
    };
}
