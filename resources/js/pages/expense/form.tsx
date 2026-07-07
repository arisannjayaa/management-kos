import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Expense } from '@/types/expense/expense-type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type Props = { open: boolean; item: Expense | null; properties: any[]; categories: any[]; onClose: () => void; };

export function ExpenseForm({ open, item, properties, categories, onClose }: Props) {
    const isMobile = useIsMobile();
    const isEdit = !!item;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        property_id: '',
        expense_category_id: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
        receipt_attachment: null as File | null
    });

    useEffect(() => {
        if (open && item) {
            setData({
                property_id: item.property_id,
                expense_category_id: item.expense_category_id,
                amount: String(item.amount),
                expense_date: item.expense_date,
                notes: item.notes ?? '',
                receipt_attachment: null // Reset input file saat edit
            });
        }
        else if (!open) { reset(); clearErrors(); }
    }, [open, item]);

    const handleClose = () => { if (processing) return; reset(); clearErrors(); onClose(); };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // File uploads dengan Inertia wajib via POST
        const url = isEdit ? `/expenses/update/${item.id}` : '/expenses';
        post(url, { preserveScroll: true, onSuccess: handleClose });
    };

    const renderFormFields = () => (
        <form id="expense-form" onSubmit={handleSubmit} className="space-y-4 px-1" encType="multipart/form-data">
            {!isEdit && (
                <div className="flex flex-col space-y-1.5">
                    <FormLabel required>Gedung Kos</FormLabel>
                    <Select value={data.property_id} onValueChange={(v) => setData('property_id', v)} disabled={processing}>
                        <SelectTrigger><SelectValue placeholder="Pilih Gedung" /></SelectTrigger>
                        <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormErrorMessage message={errors.property_id} />
                </div>
            )}

            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Kategori Biaya</FormLabel>
                <Select value={data.expense_category_id} onValueChange={(v) => setData('expense_category_id', v)} disabled={processing}>
                    <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormErrorMessage message={errors.expense_category_id} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                    <FormLabel required>Nominal (Rp)</FormLabel>
                    <Input type="number" min="0" value={data.amount} onChange={(e) => setData('amount', e.target.value)} disabled={processing} required />
                    <FormErrorMessage message={errors.amount} />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <FormLabel required>Tanggal</FormLabel>
                    <Input type="date" value={data.expense_date} onChange={(e) => setData('expense_date', e.target.value)} disabled={processing} required />
                    <FormErrorMessage message={errors.expense_date} />
                </div>
            </div>

            <div className="flex flex-col space-y-1.5">
                <FormLabel>Struk / Nota Fisik</FormLabel>
                <Input type="file" accept="image/*" onChange={(e) => setData('receipt_attachment', e.target.files?.[0] ?? null)} disabled={processing} />
                <FormErrorMessage message={errors.receipt_attachment} />
            </div>

            <div className="flex flex-col space-y-1.5">
                <FormLabel>Memo Transaksi</FormLabel>
                <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} disabled={processing} />
                <FormErrorMessage message={errors.notes} />
            </div>
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={processing}>Batal</Button>
            <Button type="submit" form="expense-form" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="rounded-t-[2.5rem]">
                    <DrawerHeader>
                        <DrawerTitle>{isEdit ? 'Ubah Pengeluaran' : 'Catat Pengeluaran'}</DrawerTitle>
                        <DrawerDescription>Arus kas operasional keluar.</DrawerDescription>
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
                    <DialogTitle>{isEdit ? 'Ubah Pengeluaran' : 'Catat Pengeluaran'}</DialogTitle>
                    <DialogDescription>Arus kas operasional keluar.</DialogDescription>
                </DialogHeader>
                {renderFormFields()}
                <DialogFooter>{renderFooterButtons()}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <Label className="flex items-center gap-1 font-semibold">{children}{required && <span className="text-red-500">*</span>}</Label>;
}
function FormErrorMessage({ message }: { message?: string }) {
    return message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;
}
