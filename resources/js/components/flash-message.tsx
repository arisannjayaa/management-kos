import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function FlashMessage() {
    const { flash } = usePage().props as any;

    const lastMessage = useRef('');

    useEffect(() => {
        if (flash?.success && flash.success !== lastMessage.current) {
            lastMessage.current = flash.success;
            toast.success(flash.success);
        }

        if (flash?.error && flash.error !== lastMessage.current) {
            lastMessage.current = flash.error;
            toast.error(flash.error);
        }
    }, [flash]);

    return null;
}
