// resources/js/pages/Properties/form.tsx

import { useForm } from '@inertiajs/react';
import { Building2, MapPin, Phone, Calendar, Info, ToggleLeft } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';
import type { Property } from '@/types/property/property-type';

// ─── HOOK RESPONSIVE SCREEN ──────────────────────────────────────────────────
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

// ─── TYPES ───────────────────────────────────────────────────────────────────
type FormData = {
    name: string;
    address: string;
    city: string;
    phone: string;
    billing_cycle_days: string;
    billing_grace_period_days: string;
    wa_reminder_enabled: boolean;
    is_active: boolean;
};

type Props = {
    open: boolean;
    item: Property | null;
    onClose: () => void;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function PropertyFormModal({ open, item, onClose }: Props) {
    const isEdit = item !== null;
    const isMobile = useIsMobile();

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
        name: '',
        address: '',
        city: '',
        phone: '',
        billing_cycle_days: '30',
        billing_grace_period_days: '0',
        wa_reminder_enabled: true,
        is_active: true
    });

    useEffect(() => {
        if (open) {
            setData({
                name: item?.name ?? '',
                address: item?.address ?? '',
                city: item?.city ?? '',
                phone: item?.phone ?? '',
                billing_cycle_days: item?.billing_cycle_days?.toString() ?? '30',
                billing_grace_period_days: item?.billing_grace_period_days?.toString() ?? '0',
                wa_reminder_enabled: item?.wa_reminder_enabled ?? true,
                is_active: item?.is_active ?? true
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

        const options = {
            preserveScroll: true,
            onSuccess: handleClose
        };

        if (isEdit) {
            put(`/properties/update/${item.id}`, options);
        } else {
            post('/properties', options);
        }
    };

    // ─── RENDER FORM FIELDS INNER CONTAINER ───
    const renderFormFields = () => (
        <form
            id="property-form"
            onSubmit={handleSubmit}
            className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2"
        >
            {/* Nama Properti */}
            <div className="flex flex-col justify-start space-y-1.5">
                <FormLabel htmlFor="pr-name" required>
                    Nama Properti Kos
                </FormLabel>
                <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="pr-name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Cth: Sanjaya Kost, Kost Eksklusif Renon..."
                        className="h-10.5 rounded-xl bg-card pl-10 font-medium"
                        disabled={processing}
                    />
                </div>
                <FormErrorMessage message={errors.name} />
            </div>

            {/* Grid: Kota & Nomor Telepon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col justify-start space-y-1.5">
                    <FormLabel htmlFor="pr-city" required>
                        Kota Lokasi
                    </FormLabel>
                    <div className="relative">
                        <MapPin className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="pr-city"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Cth: Denpasar, Badung..."
                            className="h-10.5 rounded-xl bg-card pl-10 font-medium"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.city} />
                </div>

                <div className="flex flex-col justify-start space-y-1.5">
                    <FormLabel htmlFor="pr-phone" required>
                        No. Telepon / WA Konten
                    </FormLabel>
                    <div className="relative">
                        <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="pr-phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Cth: 081234567xxx"
                            className="h-10.5 rounded-xl bg-card pl-10 font-medium"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.phone} />
                </div>
            </div>

            {/* Alamat Lengkap */}
            <div className="flex flex-col justify-start space-y-1.5">
                <FormLabel htmlFor="pr-address" required>
                    Alamat Lengkap
                </FormLabel>
                <Textarea
                    id="pr-address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="Tulis alamat jalan, nomor, dan detail penunjuk arah lokasi kos..."
                    rows={2}
                    className="min-h-[70px] resize-none rounded-xl bg-card font-medium"
                    disabled={processing}
                />
                <FormErrorMessage message={errors.address} />
            </div>

            {/* Grid: Aturan Billing Keuangan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                <div className="flex flex-col justify-start space-y-1.5">
                    <FormLabel htmlFor="pr-cycle" required>
                        Siklus Penagihan (Hari)
                    </FormLabel>
                    <div className="relative">
                        <Calendar className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="pr-cycle"
                            type="number"
                            value={data.billing_cycle_days}
                            onChange={(e) => setData('billing_cycle_days', e.target.value)}
                            className="h-10.5 rounded-xl bg-card pl-10 font-mono font-bold"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.billing_cycle_days} />
                </div>

                <div className="flex flex-col justify-start space-y-1.5">
                    <FormLabel htmlFor="pr-grace" required>
                        Masa Tenggang Bayar (Hari)
                    </FormLabel>
                    <div className="relative">
                        <Info className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="pr-grace"
                            type="number"
                            value={data.billing_grace_period_days}
                            onChange={(e) => setData('billing_grace_period_days', e.target.value)}
                            className="h-10.5 rounded-xl bg-card pl-10 font-mono font-bold"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.billing_grace_period_days} />
                </div>
            </div>

            {/* Opsi Switch Keaktifan & Notifikasi Gateway */}
            <div className="space-y-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3.5 mt-2">
                <label className={cn(
                    "flex cursor-pointer select-none items-center space-x-3 rounded-xl border bg-background p-3 transition-colors",
                    data.wa_reminder_enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60"
                )}>
                    <Checkbox
                        checked={data.wa_reminder_enabled}
                        onCheckedChange={(checked) => setData('wa_reminder_enabled', checked as boolean)}
                        disabled={processing}
                        className="h-4 w-4 rounded-sm border-primary/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground">Aktifkan Otomatis WhatsApp Reminder</span>
                        <span className="text-[10px] text-muted-foreground leading-none">Kirim tagihan invoice berkala langsung ke WA penyewa.</span>
                    </div>
                </label>

                {isEdit && (
                    <label className={cn(
                        "flex cursor-pointer select-none items-center space-x-3 rounded-xl border bg-background p-3 transition-colors",
                        data.is_active ? "border-primary/30 bg-primary/5" : "border-border/60"
                    )}>
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                            disabled={processing}
                            className="h-4 w-4 rounded-sm border-primary/50 data-[state=checked]:bg-primary"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-foreground">Status Operasional Properti Aktif</span>
                            <span className="text-[10px] text-muted-foreground leading-none">Nonaktifkan jika gedung sedang renovasi total atau tidak beroperasi.</span>
                        </div>
                    </label>
                )}
            </div>
        </form>
    );

    // ─── BOTTOM NAVIGATION FOOTER SLOT ───
    const renderFooterButtons = () => (
        <>
            <div className="flex gap-2">
                <Button
                    key="btn-cancel"
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-10 rounded-xl px-4 text-[11px] font-black tracking-wider text-slate-500 uppercase"
                >
                    Batal
                </Button>
            </div>

            <div className="flex gap-2">
                <Button
                    key="btn-submit"
                    type="submit"
                    form="property-form"
                    size="sm"
                    disabled={processing}
                    className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase hover:bg-primary/90"
                >
                    {processing
                        ? 'Menyimpan...'
                        : isEdit
                            ? 'Simpan Perubahan'
                            : 'Daftarkan Properti'}
                </Button>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[92vh] w-full flex-col rounded-t-[2.5rem] border-t border-border/80 bg-background outline-none sm:mb-4 sm:max-w-[420px] sm:rounded-[3rem] sm:border sm:border-border/60 sm:bg-card">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">
                            {isEdit ? 'Perbarui Properti' : 'Daftar Properti Baru'}
                        </DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">
                            Lengkapi data rincian profil properti kos Sanjaya Anda.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-1 flex-col overflow-hidden px-6">
                        {renderFormFields()}
                    </div>

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
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {isEdit ? 'Perbarui Properti' : 'Daftar Properti Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Lengkapi parameter penagihan penempatan operasional gedung kos baru.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {renderFormFields()}
                </div>

                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 sm:justify-end">
                    {renderFooterButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── COMPONENT PRESENTATIONAL HELPERS ────────────────────────────────────────
function FormLabel({ children, htmlFor, required = false }: {
    children: React.ReactNode;
    htmlFor?: string;
    required?: boolean;
}) {
    return (
        <Label
            htmlFor={htmlFor}
            className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500"
        >
            {children}
            {required && <span className="font-bold text-red-500">*</span>}
        </Label>
    );
}

function FormErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1 animate-in pl-0.5 text-xs font-semibold text-red-500 duration-150 fade-in-50">
            {message}
        </p>
    );
}
