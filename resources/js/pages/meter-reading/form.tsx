// resources/js/pages/MeterReadings/form.tsx

import { useForm } from '@inertiajs/react';
import { Calendar, User, Gauge, Zap } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 🌟 IMPORT KOMPONEN SELECT SHADCN UI
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

type FormData = {
    occupancy_id: string;
    charge_type_id: string;
    reading_date: string;
    previous_reading: number;
    current_reading: string;
};

type Props = {
    open: boolean;
    chargeTypes: any[];
    occupancies: any[];
    onClose: () => void;
};

export function MeterReadingFormModal({ open, chargeTypes = [], occupancies = [], onClose }: Props) {
    const isMobile = useIsMobile();
    const [prevLoading, setPrevLoading] = useState(false);
    const [previewCalc, setPreviewCalc] = useState({ usage: 0, amount: 0, unitLabel: '', unitPrice: 0 });

    const chargeTypesList = Array.isArray(chargeTypes) ? chargeTypes : (chargeTypes as any)?.data ?? [];

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<FormData>({
        occupancy_id: '',
        charge_type_id: '',
        reading_date: new Date().toISOString().split('T')[0],
        previous_reading: 0,
        current_reading: '',
    });

    console.log(occupancies)
    console.log(chargeTypesList);

    // 🌟 LOGIKA UTAMA FILTER: Cari properti gedung milik kamar ter-check-in yang sedang dipilih
    const selectedOccupancy = occupancies.find((o) => String(o.id) === String(data.occupancy_id));

    // Saring iuran bulanan hanya yang memiliki property_id yang cocok dengan kamar terpilih
    const filteredChargeTypes = chargeTypesList.filter((c: any) => {
        if (!selectedOccupancy) return false;
        return String(c.property_id) === String(selectedOccupancy.property_id);
    });

    // Dynamic Fetch: Tarik posisi stand meteran terakhir dari database
    useEffect(() => {
        if (data.occupancy_id && data.charge_type_id) {
            setPrevLoading(true);
            const selectedCharge = filteredChargeTypes.find((c: any) => String(c.id) === String(data.charge_type_id));
            const unitPrice = selectedCharge ? Number(selectedCharge.unit_price) : 0;
            const label = selectedCharge ? selectedCharge.unit_label : '';

            fetch(`/meter-readings/previous?occupancy_id=${data.occupancy_id}&charge_type_id=${data.charge_type_id}`)
                .then((res) => res.json())
                .then((resData) => {
                    const prevVal = Number(resData.previous_reading ?? 0);
                    setData('previous_reading', prevVal);
                    setPreviewCalc(prev => ({ ...prev, unitPrice, unitLabel: label }));
                })
                .catch(() => toast.error('Gagal memuat histori meteran kamar.'))
                .finally(() => setPrevLoading(false));
        } else {
            setData('previous_reading', 0);
            setPreviewCalc({ usage: 0, amount: 0, unitLabel: '', unitPrice: 0 });
        }
    }, [data.occupancy_id, data.charge_type_id]);

    // Live Calculation Tracker
    useEffect(() => {
        const curr = Number(data.current_reading);
        if (curr > data.previous_reading) {
            const usage = curr - data.previous_reading;
            const amount = usage * previewCalc.unitPrice;
            setPreviewCalc(prev => ({ ...prev, usage, amount }));
        } else {
            setPreviewCalc(prev => ({ ...prev, usage: 0, amount: 0 }));
        }
    }, [data.current_reading, data.previous_reading]);

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/meter-readings', {
            preserveScroll: true,
            onSuccess: handleClose
        });
    };

    const renderFormFields = () => (
        <form id="meter-reading-form" onSubmit={handleSubmit} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2">

            {/* Tanggal Pencatatan */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Tanggal Keliling / Pemeriksaan</FormLabel>
                <div className="relative">
                    <Calendar className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Input
                        type="date"
                        value={data.reading_date}
                        onChange={(e) => setData('reading_date', e.target.value)}
                        className="h-10.5 rounded-xl bg-card pl-10 font-medium text-sm text-foreground focus-visible:ring-primary/20"
                        disabled={processing}
                    />
                </div>
            </div>

            {/* Hubungan Okupansi Kamar (Shadcn Select) */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Unit Kamar & Penghuni Kos</FormLabel>
                <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select
                        value={data.occupancy_id}
                        onValueChange={(val) => {
                            // Reset pilihan iuran jika kamar berganti biar tidak crash
                            setData((prev) => ({ ...prev, occupancy_id: val, charge_type_id: '', current_reading: '' }));
                        }}
                        disabled={processing}
                    >
                        <SelectTrigger className="w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium text-foreground focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="-- Tentukan Nomor Kamar --" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg">
                            {/* 🌟 SINKRONISASI: Membaca struktur objek kaya bawaan dari OccupancyResource */}
                            {occupancies.map((o) => (
                                <SelectItem key={o.id} value={o.id} className="text-xs font-medium rounded-lg">
                                    Kamar {o.room?.room_number ?? '-'} — {o.tenant?.name ?? 'Tanpa Nama'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <FormErrorMessage message={errors.occupancy_id} />
            </div>

            {/* Komponen Utilitas Metered (Shadcn Select Tersaring Otomatis) */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Jenis Komponen Biaya (Metered)</FormLabel>
                <div className="relative">
                    <Gauge className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select
                        value={data.charge_type_id}
                        onValueChange={(val) => setData('charge_type_id', val)}
                        disabled={processing || !data.occupancy_id}
                    >
                        <SelectTrigger className="w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-bold text-foreground focus:ring-primary focus:border-primary">
                            <SelectValue placeholder={data.occupancy_id ? "-- Pilih Beban --" : "Tentukan Kamar Terlebih Dahulu"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg">
                            {filteredChargeTypes.length === 0 ? (
                                <div className="p-3 text-center text-xs text-muted-foreground italic">
                                    Tidak ada master beban metered di gedung ini.
                                </div>
                            ) : (
                                filteredChargeTypes.map((c:any) => (
                                    <SelectItem key={c.id} value={c.id} className="text-xs font-semibold rounded-lg">
                                        {c.name} (Rp {Number(c.unit_price).toLocaleString('id-ID')}/{c.unit_label})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <FormErrorMessage message={errors.charge_type_id} />
            </div>

            {/* Blok Parameter Stand Meteran */}
            <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-4">
                <div className="flex flex-col space-y-1.5 bg-muted/40 p-3 rounded-xl border border-border/60">
                    <FormLabel>Meteran Bulan Lalu</FormLabel>
                    <span className="text-base font-mono font-black text-slate-500 mt-1">
                        {prevLoading ? '...' : `${data.previous_reading} ${previewCalc.unitLabel}`}
                    </span>
                </div>

                <div className="flex flex-col space-y-1.5">
                    <FormLabel required>Angka Meteran Baru</FormLabel>
                    <div className="relative">
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={data.current_reading}
                            onChange={(e) => setData('current_reading', e.target.value)}
                            className="h-10.5 rounded-xl bg-card font-mono font-black text-foreground pr-12 focus-visible:ring-primary/20"
                            disabled={processing || !data.charge_type_id || prevLoading}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase font-mono">{previewCalc.unitLabel}</span>
                    </div>
                    <FormErrorMessage message={errors.current_reading} />
                </div>
            </div>

            {/* Live Kalkulator Widget Layout */}
            {previewCalc.usage > 0 && (
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-3 flex flex-col space-y-1.5 animate-in zoom-in-95 duration-150 text-xs">
                    <span className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-1"><Zap size={12}/> Estimasi Penghitung</span>
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Volume Pemakaian Bersih:</span>
                        <span className="font-bold font-mono text-foreground">{previewCalc.usage.toFixed(2)} {previewCalc.unitLabel}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-700 font-bold border-t border-blue-500/10 pt-1.5">
                        <span>Akumulasi Rupiah:</span>
                        <span className="font-black font-mono text-sm">Rp {previewCalc.amount.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            )}
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="h-10 rounded-xl px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Batal</Button>
            <Button type="submit" form="meter-reading-form" size="sm" disabled={processing || prevLoading} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black text-primary-foreground uppercase tracking-wider hover:bg-primary/90">
                {processing ? 'Menyimpan...' : 'Kunci Meteran'}
            </Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[92vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    <DrawerHeader className="px-6 pt-5 pb-2 text-left shrink-0">
                        <DrawerTitle className="text-lg font-black tracking-tight">Catat Meteran Baru</DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">Input posisi meteran riil kamar kos penyewa.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col overflow-hidden px-6">{renderFormFields()}</div>
                    <DrawerFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t px-6 pt-4 pb-8 bg-background">{renderFooterButtons()}</DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="flex max-h-[88dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">Catat Meteran Baru</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Isi stand parameter baru. Sistem otomatis menghitung beban rupiah.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t pt-4 sm:justify-end">{renderFooterButtons()}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <Label className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">{children}{required && <span className="text-red-500">*</span>}</Label>;
}

function FormErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs font-semibold text-red-500 animate-in fade-in-50">{message}</p>;
}
