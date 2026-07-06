// resources/js/pages/Invoices/pay-modal.tsx

import { useForm } from '@inertiajs/react';
import { Coins, Calendar, FileUp, TextQuote, Banknote } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// 🌟 IMPORT SHADCN SELECT FOR PREMIUM UI EXPERIENCE
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') return window.matchMedia('(max-width: 640px)').matches;
        return false;
    });
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
    invoiceId: string | null;
    onClose: () => void;
};

export function RecordPaymentModal({ open, invoiceId, onClose }: Props) {
    const isMobile = useIsMobile();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount_paid: '',
        payment_date: new Date().toISOString().substring(0, 16), // datetime-local format support
        payment_method: 'cash',
        proof_attachment: null as File | null,
        notes: ''
    });

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!invoiceId) return;

        post(`/invoices/pay/${invoiceId}`, {
            preserveScroll: true,
            onSuccess: handleClose
        });
    };

    const renderFormFields = () => (
        <form id="pay-cashier-form" onSubmit={handleSubmit} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2">

            {/* Input Nominal Uang */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Jumlah Uang Yang Diterima</FormLabel>
                <div className="relative">
                    <Coins className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Input
                        type="number"
                        value={data.amount_paid}
                        onChange={(e) => setData('amount_paid', e.target.value)}
                        placeholder="Rp 0"
                        className="h-10.5 rounded-xl bg-card pl-10 font-mono font-black text-sm text-foreground focus-visible:ring-primary/20"
                        disabled={processing}
                        required
                    />
                </div>
                <FormErrorMessage message={errors.amount_paid} />
            </div>

            {/* Grid: Tanggal Setor & Metode Pembayaran (Shadcn Select Upgrade) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                    <FormLabel required>Tanggal & Jam Terima</FormLabel>
                    <div className="relative">
                        <Calendar className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                        <Input
                            type="datetime-local"
                            value={data.payment_date}
                            onChange={(e) => setData('payment_date', e.target.value)}
                            className="h-10.5 rounded-xl bg-card pl-10 text-xs font-bold focus-visible:ring-primary/20 text-foreground"
                            disabled={processing}
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                    <FormLabel required>Metode Pembayaran</FormLabel>
                    <div className="relative">
                        <Banknote className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                        <Select
                            value={data.payment_method}
                            onValueChange={(val) => {
                                setData(prev => ({
                                    ...prev,
                                    payment_method: val,
                                    proof_attachment: val === 'cash' ? null : prev.proof_attachment
                                }));
                            }}
                            disabled={processing}
                        >
                            <SelectTrigger className="w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-xs font-black text-foreground focus:ring-primary focus:border-primary">
                                <SelectValue placeholder="Pilih Metode" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-lg">
                                <SelectItem value="cash" className="text-xs font-bold rounded-lg">TUNAI / CASH</SelectItem>
                                <SelectItem value="transfer" className="text-xs font-bold rounded-lg">TRANSFER BANK</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Upload Bukti Setoran (Render jika memilih skema transfer bank) */}
            {data.payment_method === 'transfer' && (
                <div className="flex flex-col space-y-1.5 rounded-xl bg-blue-500/5 border border-blue-500/20 p-3 animate-in fade-in duration-200">
                    <FormLabel>Lampiran Struk Bukti Transfer</FormLabel>
                    <div className="relative mt-1 flex items-center justify-center border border-dashed border-blue-500/30 rounded-xl bg-background p-3 hover:bg-blue-500/5 transition-colors cursor-pointer group">
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setData('proof_attachment', e.target.files?.[0] ?? null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={processing}
                        />
                        <div className="flex flex-col items-center text-center gap-1 select-none">
                            <FileUp size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {data.proof_attachment ? (data.proof_attachment as File).name : 'Pilih Gambar Struk / File PDF'}
                            </span>
                            <span className="text-[9px] text-muted-foreground">Maksimal resolusi ukuran file 2MB</span>
                        </div>
                    </div>
                    <FormErrorMessage message={errors.proof_attachment} />
                </div>
            )}

            {/* Catatan / Keterangan Tambahan */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel>Catatan Memo Pembayaran</FormLabel>
                <div className="relative">
                    <Textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Contoh: Cicilan pertama, dititipkan ke staff sisa pelunasan minggu depan..."
                        className="rounded-xl bg-card text-xs font-medium min-h-[70px] focus-visible:ring-primary/20"
                        disabled={processing}
                        maxLength={500}
                    />
                </div>
            </div>
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="h-10 rounded-xl px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Batal
            </Button>
            <Button type="submit" form="pay-cashier-form" size="sm" disabled={processing} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black text-primary-foreground uppercase tracking-wider hover:bg-primary/90">
                {processing ? 'Menyimpan...' : 'Cetak & Sahkan Kuitansi'}
            </Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">Meja Kasir Terima Dana</DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">Setor uang sewa bulanan penambah kas masuk.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col overflow-hidden px-6">{renderFormFields()}</div>
                    <DrawerFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t px-6 pt-4 pb-8 bg-background">
                        {renderFooterButtons()}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="flex max-h-[85dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md md:max-w-lg">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">Pencatatan Uang Masuk Kasir</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Sistem akan mengalkulasi sisa tunggakan dan memperbarui status invoice secara otomatis.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t pt-4 sm:justify-end">
                    {renderFooterButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <Label className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500">{children}{required && <span className="text-red-500">*</span>}</Label>;
}

function FormErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs font-semibold text-red-500 animate-in fade-in-50">{message}</p>;
}
