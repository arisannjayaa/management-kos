// hooks/use-delete-confirmation.ts
import { router } from '@inertiajs/react';
import { useState } from 'react';

export function useDeleteConfirmation<T>() {
    const [item, setItem] = useState<T | null>(null);
    const [open, setOpen] = useState(false);

    const confirm = (data: T) => {
        setItem(data);
        setOpen(true);
    };

    const destroy = (
        url: string,
        options?: {
            onSuccess?: () => void;
        },
    ) => {
        router.delete(url, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setItem(null);

                options?.onSuccess?.();
            },
        });
    };

    return {
        item,
        open,
        setOpen,
        confirm,
        destroy,
    };
}
