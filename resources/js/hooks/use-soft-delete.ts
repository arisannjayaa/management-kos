// resources/js/hooks/use-soft-delete.ts

import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

type Method = 'delete' | 'post' | 'put' | 'patch';

type Options<T> = {
    getUrl: (item: T) => string;
    /**
     * HTTP method yang dipakai.
     * - 'delete' → soft delete & force delete
     * - 'post'   → restore (route pakai POST)
     * @default 'delete'
     */
    method?: Method;
    onSuccess?: () => void;
};

export function useSoftDelete<T>({
    getUrl,
    method = 'delete',
    onSuccess,
}: Options<T>) {
    const [open, setOpen]         = useState(false);
    const [item, setItem]         = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const itemRef      = useRef<T | null>(null);
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;

    const trigger = useCallback((data: T) => {
        itemRef.current = data;
        setItem(data);
        setOpen(true);
    }, []);

    const confirm = useCallback(() => {
        // Baca dari ref — tidak bergantung pada state setter trick
        // sehingga tidak ada double-call di StrictMode
        const current = itemRef.current;
        if (!current || isLoading) return;

        setIsLoading(true);

        const url = getUrl(current);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setItem(null);
                itemRef.current = null;
                onSuccessRef.current?.();
            },
            onFinish: () => setIsLoading(false),
        };

        // Pilih method sesuai konfigurasi
        if (method === 'post') {
            router.post(url, {}, options);
        } else if (method === 'put') {
            router.put(url, {}, options);
        } else if (method === 'patch') {
            router.patch(url, {}, options);
        } else {
            router.delete(url, options);
        }
    }, [getUrl, method, isLoading]);

    const cancel = useCallback(() => {
        if (isLoading) return;
        setOpen(false);
        setItem(null);
        itemRef.current = null;
    }, [isLoading]);

    return { open, setOpen, item, isLoading, trigger, confirm, cancel };
}
