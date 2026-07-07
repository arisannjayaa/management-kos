import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ExpenseCategory } from '@/types/expense/expense-category-type';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const media = window.matchMedia('(max-width: 640px)');
        setIsMobile(media.matches);
        const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);
    return isMobile;
}

type Props = {
    open: boolean;
    item?: ExpenseCategory | null; // Tambahkan tanda tanya (?) agar menerima undefined
    onClose: () => void;
};

export function ExpenseCategoryForm({ open, item, onClose }: Props) {
    const isMobile = useIsMobile();
    const isEdit = !!item;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '', description: ''
    });

    useEffect(() => {
        if (open && item) setData({ name: item.name, description: item.description ?? '' });
        else if (!open) {
            reset();
            clearErrors();
        }
    }, [open, item]);

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        onClose();
    };
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) put(`/expense-categories/update/${item.id}`, { preserveScroll: true, onSuccess: handleClose }); // put() dengan URL update[cite: 3]
        else post('/expense-categories', { preserveScroll: true, onSuccess: handleClose });
    };

    const renderFormFields = () => (
        <form id="expense-category-form" onSubmit={handleSubmit} className="space-y-4 px-1">
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Nama Kategori</FormLabel>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} disabled={processing}
                       required />
                <FormErrorMessage message={errors.name} />
            </div>
            <div className="flex flex-col space-y-1.5">
                <FormLabel>Deskripsi</FormLabel>
                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                          disabled={processing} />
                <FormErrorMessage message={errors.description} />
            </div>
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={processing}>Batal</Button>
            <Button type="submit" form="expense-category-form"
                    disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="rounded-t-[2.5rem]">
                    <DrawerHeader>
                        <DrawerTitle>{isEdit ? 'Ubah Kategori' : 'Kategori Baru'}</DrawerTitle>
                        <DrawerDescription>Isi detail master data kategori pengeluaran.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">{renderFormFields()}</div>
                    <DrawerFooter>{renderFooterButtons()}</DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Ubah Kategori' : 'Kategori Baru'}</DialogTitle>
                    <DialogDescription>Isi detail master data kategori pengeluaran.</DialogDescription>
                </DialogHeader>
                {renderFormFields()}
                <DialogFooter>{renderFooterButtons()}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <Label className="flex items-center gap-1 font-semibold">{children}{required &&
        <span className="text-red-500">*</span>}</Label>;
}

function FormErrorMessage({ message }: { message?: string }) {
    return message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;
}
