// resources/js/pages/Invoices/details-modal.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Receipt, Calendar, User, Eye, Loader2, ArrowDownCircle } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

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

export function InvoiceDetailsModal({ open, invoiceId, onClose }: Props) {
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        if (open && invoiceId) {
            setLoading(true);
            axios.get(`/invoices/details/${invoiceId}`)
                .then((res) => {
                    if (res.data.success) {
                        setInvoiceNumber(res.data.invoice_number);
                        setItems(res.data.items ?? []);
                        setPayments(res.data.payments ?? []);
                    }
                })
                .catch(() => alert('Gagal memuat rincian data transaksi.'))
                .finally(() => setLoading(false));
        }
    }, [open, invoiceId]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin text-primary mb-2" />
                    <span className="text-xs font-bold">Menyelaraskan rincian nota finansial...</span>
                </div>
            );
        }

        return (
            <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-1 py-2 text-xs">

                {/* BLOK ITEM BREAKDOWN TAGIHAN */}
                <div className="flex flex-col space-y-2">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <FileText size={12} /> Rincian Komponen Biaya Bulan Ini
                    </h5>
                    <div className="rounded-xl border bg-muted/30 divide-y overflow-hidden">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-card">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-foreground">{item.name}</span>
                                    <span className="text-[10px] text-muted-foreground">Volume: {item.qty}x penggunaan</span>
                                </div>
                                <span className="font-mono font-bold text-foreground">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-muted/40 font-black text-foreground">
                            <span>TOTAL BRUTO</span>
                            <span className="font-mono">Rp {items.reduce((acc, curr) => acc + curr.subtotal, 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                {/* BLOK RIWAYAT KUITANSI PEMBAYARAN MASUK */}
                <div className="flex flex-col space-y-2 pt-1">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Receipt size={12} /> Sejarah Kuitansi Cicilan Pembayaran
                    </h5>
                    {payments.length === 0 ? (
                        <div className="text-center py-5 border border-dashed border-border/60 rounded-xl bg-card text-muted-foreground font-medium">
                            Belum ada dana masuk yang tercatat untuk lembar tagihan ini.
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            {payments.map((pay) => (
                                <div key={pay.id} className="border bg-card rounded-xl p-3 shadow-sm flex flex-col space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-bold text-foreground text-[11px]">{pay.payment_number}</span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                <Calendar size={10} /> {pay.payment_date}
                                            </span>
                                        </div>
                                        <span className="font-mono font-black text-emerald-600 text-[11px]">
                                            + Rp {pay.amount_paid.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-dashed border-border/60 pt-2 text-[10px] text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1">
                                            <User size={10} /> Validasi: <strong className="text-foreground">{pay.receiver_name}</strong>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase", pay.payment_method === 'transfer' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-orange-50 text-orange-600 border border-orange-100")}>
                                                {pay.payment_method}
                                            </span>
                                            {pay.proof_attachment && (
                                                <a href={pay.proof_attachment} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold flex items-center gap-0.5">
                                                    <Eye size={9} /> Struk
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {pay.notes && (
                                        <p className="text-[10px] bg-muted/40 p-2 rounded-lg italic text-slate-500 mt-1 border border-border/40">
                                            * Catatan: {pay.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
                <DrawerContent className="mx-auto flex max-h-[85vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-1 text-left">
                        <DrawerTitle className="text-base font-black font-mono tracking-tight text-foreground">{loading ? 'Memuat...' : invoiceNumber}</DrawerTitle>
                        <DrawerDescription className="text-[11px] font-medium text-muted-foreground">Rincian rupa transaksi kasir hulu hilir.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6">{renderContent()}</div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="flex max-h-[80dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md md:max-w-lg">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-lg font-black font-mono tracking-tight text-foreground">{loading ? 'Memuat Transaksi...' : invoiceNumber}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Kalkulasi rincian komponen tagihan operasional dan log kuitansi cicilan.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>
            </DialogContent>
        </Dialog>
    );
}
