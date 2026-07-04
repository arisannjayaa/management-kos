// resources/js/pages/RoomTypes/form.tsx

import { useForm } from '@inertiajs/react';
import { Layers, Building2, Coins, Plus, Trash2, AlignLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';
import type { RoomType } from '@/types/room/room-type';
import roomTypeController from '@/actions/App/Http/Controllers/RoomTypeController';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(max-width: 640px)').matches;
        }
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

type TierInput = {
    name: string;
    price: string;
};

type FormData = {
    property_id: string;
    name: string;
    description: string;
    base_price: string;
    pricing_tiers: TierInput[];
};

type Props = {
    open: boolean;
    item: RoomType | null;
    properties: any[]; // Master properti dari backend
    onClose: () => void;
};

export function RoomTypeFormModal({ open, item, properties = [], onClose }: Props) {
    const isEdit = item !== null;
    const isMobile = useIsMobile();
    const propertiesList = Array.isArray(properties) ? properties : ((properties as any)?.data ?? []);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors
    } = useForm<FormData>({
        property_id: '',
        name: '',
        description: '',
        base_price: '',
        pricing_tiers: []
    });

    useEffect(() => {
        if (open) {
            setData({
                property_id: item?.property_id ?? '',
                name: item?.name ?? '',
                description: item?.description ?? '',
                base_price: item?.base_price?.toString() ?? '',
                pricing_tiers: item?.pricing_tiers
                    ? item.pricing_tiers.map(t => ({ name: t.name, price: t.price.toString() }))
                    : []
            });
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
        const options = { preserveScroll: true, onSuccess: handleClose };

        if (isEdit) {
            put(roomTypeController.update(item.id).url, options);
        } else {
            post(roomTypeController.create().url, options);
        }
    };

    // Handler Baris Dinamis Pricing Tier
    const addPricingTier = () => {
        setData('pricing_tiers', [...data.pricing_tiers, { name: '', price: '' }]);
    };

    const removePricingTier = (index: number) => {
        setData('pricing_tiers', data.pricing_tiers.filter((_, i) => i !== index));
    };

    const updatePricingTier = (index: number, field: keyof TierInput, value: string) => {
        const updated = [...data.pricing_tiers];
        updated[index][field] = value;
        setData('pricing_tiers', updated);
    };

    const renderFormFields = () => (
        <form id="room-type-form" onSubmit={handleSubmit} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2">

            {/* Pilihan Gedung Properti (Hanya bisa saat Create) */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel htmlFor="rt-prop" required>Penempatan Gedung Properti</FormLabel>
                <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                        id="rt-prop"
                        value={data.property_id}
                        onChange={(e) => setData('property_id', e.target.value)}
                        className={cn(
                            "w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none focus:border-primary appearance-none",
                            isEdit && "cursor-not-allowed opacity-60"
                        )}
                        disabled={processing || isEdit}
                    >
                        <option value="">-- Pilih Lokasi Properti Kos --</option>
                        {propertiesList.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                        ))}
                    </select>
                </div>
                <FormErrorMessage message={errors.property_id} />
            </div>

            {/* Grid: Nama Tipe & Harga Dasar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="rt-name" required>Nama Kategori / Tipe Kamar</FormLabel>
                    <div className="relative">
                        <Layers className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="rt-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Cth: Deluxe Premium, Standard..."
                            className="h-10.5 rounded-xl bg-card pl-10 font-medium"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.name} />
                </div>

                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="rt-price" required>Harga Sewa Dasar (Bulanan)</FormLabel>
                    <div className="relative">
                        <Coins className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="rt-price"
                            type="number"
                            value={data.base_price}
                            onChange={(e) => setData('base_price', e.target.value)}
                            placeholder="Rp 0"
                            className="h-10.5 rounded-xl bg-card pl-10 font-mono font-bold text-foreground"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.base_price} />
                </div>
            </div>

            {/* Keterangan Deskripsi */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel htmlFor="rt-desc">Deskripsi Fasilitas</FormLabel>
                <div className="relative">
                    <AlignLeft className="pointer-events-none absolute top-3 left-3.5 size-4 text-muted-foreground" />
                    <Textarea
                        id="rt-desc"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Tulis fasilitas internal tipe kamar ini (Cth: AC, Kamar Mandi Dalam, Kasur King Size, Water Heater)..."
                        rows={2}
                        className="min-h-[60px] resize-none rounded-xl bg-card pl-10 font-medium"
                        disabled={processing}
                    />
                </div>
                <FormErrorMessage message={errors.description} />
            </div>

            {/* AREA INPUT DINAMIS: PRICING TIERS */}
            <div className="border-t border-border/40 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <FormLabel>Opsi Pilihan Tarif Alternatif / Berjenjang</FormLabel>
                        <span className="text-[10px] text-muted-foreground lowercase leading-none mt-0.5">Misal: opsi tarif harian, mingguan atau kapasitas 2 orang.</span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPricingTier}
                        className="h-8 rounded-lg border-primary/30 text-xs font-bold text-primary hover:bg-primary/5"
                    >
                        <Plus size={14} className="mr-1" /> Tambah Opsi
                    </Button>
                </div>

                {data.pricing_tiers.length > 0 ? (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar rounded-xl border border-border/40 bg-muted/20 p-2">
                        {data.pricing_tiers.map((tier, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border/50 animate-in fade-in duration-200">
                                <Input
                                    value={tier.name}
                                    onChange={(e) => updatePricingTier(idx, 'name', e.target.value)}
                                    placeholder="Nama Opsi (Cth: Pasutri / Harian)"
                                    className="h-9 rounded-md text-xs font-semibold"
                                    disabled={processing}
                                />
                                <Input
                                    type="number"
                                    value={tier.price}
                                    onChange={(e) => updatePricingTier(idx, 'price', e.target.value)}
                                    placeholder="Nominal Tarif (Rp)"
                                    className="h-9 rounded-md font-mono font-bold text-xs w-36 shrink-0 text-right"
                                    disabled={processing}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePricingTier(idx)}
                                    className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0 rounded-md"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border/80 p-4 text-center text-[11px] font-medium text-muted-foreground/60 italic">
                        Belum ada opsi tarif berjenjang dilampirkan.
                    </div>
                )}
            </div>
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="h-10 rounded-xl px-4 text-[11px] font-black tracking-wider text-slate-500 uppercase">
                Batal
            </Button>
            <Button type="submit" form="room-type-form" size="sm" disabled={processing} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase hover:bg-primary/90">
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Spesifikasi' : 'Simpan Kategori'}
            </Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[92vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">{isEdit ? 'Ubah Klasifikasi Kamar' : 'Buat Klasifikasi Baru'}</DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">Definisikan tipe kamar beserta rincian variasi tarif.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col overflow-hidden px-6">{renderFormFields()}</div>
                    <DrawerFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/60 bg-background px-6 pt-4 pb-8">
                        {renderFooterButtons()}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="flex max-h-[88dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md md:max-w-xl">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">{isEdit ? 'Ubah Klasifikasi Kamar' : 'Buat Klasifikasi Baru'}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Tentukan klaster spesifikasi harga dasar dan skema harga alternatif per kategori.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 sm:justify-end">
                    {renderFooterButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, htmlFor, required = false }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
    return (
        <Label htmlFor={htmlFor} className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500">
            {children}
            {required && <span className="font-bold text-red-500">*</span>}
        </Label>
    );
}

function FormErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 animate-in pl-0.5 text-xs font-semibold text-red-500 duration-150 fade-in-50">{message}</p>;
}
