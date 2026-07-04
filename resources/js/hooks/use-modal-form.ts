// resources/js/hooks/use-modal-form.ts
//
// Hook reusable untuk mengelola state modal form create/edit.
//
// Pola:
//   - open()         → buka modal untuk CREATE (item = null)
//   - open(item)     → buka modal untuk EDIT (item = data yang diedit)
//   - close()        → tutup modal, reset item
//   - isEdit         → true jika sedang edit
//
// Pemakaian:
//   const modal = useModalForm<Division>();
//
//   // Buka create
//   modal.open()
//
//   // Buka edit
//   modal.open(division)
//
//   // Di JSX:
//   <FormModal
//     open={modal.isOpen}
//     item={modal.item}       // null = create, ada isi = edit
//     onClose={modal.close}
//   />

import { useCallback, useState } from 'react';

export type ModalFormState<T> = {
    /** Apakah modal sedang terbuka */
    isOpen: boolean;
    /** null = mode create, ada isi = mode edit */
    item: T | null;
    /** true jika item !== null */
    isEdit: boolean;
    /** Buka modal. Tanpa argumen = create, dengan argumen = edit */
    open: (item?: T) => void;
    /** Tutup modal dan reset item */
    close: () => void;
};

export function useModalForm<T>(): ModalFormState<T> {
    const [isOpen, setIsOpen] = useState(false);
    const [item, setItem] = useState<T | null>(null);

    const open = useCallback((data?: T) => {
        setItem(data ?? null);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        // Tunda reset item agar animasi close tidak glitch
        setTimeout(() => setItem(null), 200);
    }, []);

    return {
        isOpen,
        item,
        isEdit: item !== null,
        open,
        close,
    };
}
