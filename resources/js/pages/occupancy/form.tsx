// resources/js/pages/Occupancies/form.tsx

import { useForm, usePage } from '@inertiajs/react';
import { BedDouble, Building2, Layers, User, Calendar, Coins, ShieldAlert, Plus, Trash2, Receipt } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { cn } from '@/lib/utils';
import type { Occupancy } from '@/types/occupancy/occupancy-type';

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

type ChargeInput = {
    charge_type_id: string;
    amount: string; // Keep as string for input handle, casted on backend request rules
};

type FormData = {
    property_id: string;
    room_id: string;
    room_type_id: string;
    tenant_id: string;
    room_type_pricing_tier_id: string;
    start_date: string;
    billing_day: string;
    price: string;
    deposit_amount: string;
    charges: ChargeInput[]; // 🌟 SUNTIKAN STRUKTUR PAYLOAD BIAYA TAMBAHAN
};

type Props = {
    open: boolean;
    properties: any[];
    tenants: any[];
    chargeTypes: any[]; // 🌟 TERIMA DATA DROPDOWN DARI CONTROLLER INDEX
    onClose: () => void;
};

export function OccupancyFormModal({ open, properties = [], tenants = [], chargeTypes = [], onClose }: Props) {
    const isMobile = useIsMobile();

    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];

    const canCreate = userRoles.includes('super_admin') || userPermissions.includes('occupancy.create');

    const propertiesList = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];
    const tenantsList = Array.isArray(tenants) ? tenants : (tenants as any)?.data ?? [];
    const chargeTypesList = Array.isArray(chargeTypes) ? chargeTypes : (chargeTypes as any)?.data ?? [];

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<FormData>({
        property_id: '',
        room_id: '',
        room_type_id: '',
        tenant_id: '',
        room_type_pricing_tier_id: '',
        start_date: new Date().toISOString().split('T')[0],
        billing_day: '',
        price: '',
        deposit_amount: '',
        charges: [] // 🌟 INITIAL STATE ARRAY KOSONG
    });

    const filteredChargeTypes = chargeTypesList.filter(
        (c: any) => String(c.property_id) === String(data.property_id)
    );

    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [availableTypes, setAvailableTypes] = useState<any[]>([]);
    const [availableTiers, setAvailableTiers] = useState<any[]>([]);

    const handlePropertyChange = (propertyId: string) => {
        if (!propertyId) {
            setAvailableRooms([]);
            setAvailableTypes([]);
            setAvailableTiers([]);
            setData({
                ...data,
                property_id: '',
                room_id: '',
                room_type_id: '',
                room_type_pricing_tier_id: '',
                price: '',
                charges: []
            });
            return;
        }

        const selectedProp = propertiesList.find((p: any) => String(p.id) === String(propertyId));
        const readyRooms = selectedProp ? (selectedProp.rooms ?? []).filter((r: any) => r.status === 'available') : [];
        const rTypes = selectedProp ? (selectedProp.room_types ?? []) : [];

        setAvailableRooms(readyRooms);
        setAvailableTypes(rTypes);
        setAvailableTiers([]);

        setData({
            ...data,
            property_id: propertyId,
            room_id: '',
            room_type_id: '',
            room_type_pricing_tier_id: '',
            price: '',
            charges: []
        });
    };

    const handleRoomChange = (roomId: string) => {
        if (!roomId) {
            setAvailableTiers([]);
            setData({
                ...data,
                room_id: '',
                room_type_id: '',
                room_type_pricing_tier_id: '',
                price: ''
            });
            return;
        }

        const roomObj = availableRooms.find((r: any) => String(r.id) === String(roomId));
        const rType = roomObj?.room_type;

        setAvailableTiers(rType?.pricing_tiers ?? []);

        setData({
            ...data,
            room_id: roomId,
            room_type_id: rType?.id ?? '',
            room_type_pricing_tier_id: '',
            price: rType ? String(rType.base_price ?? '') : ''
        });
    };

    const handleTierChange = (tierId: string) => {
        if (!tierId) {
            const currentType = availableTypes.find((t: any) => String(t.id) === String(data.room_type_id));
            setData({
                ...data,
                room_type_pricing_tier_id: '',
                price: String(currentType?.base_price ?? '')
            });
            return;
        }

        const tierObj = availableTiers.find((t: any) => String(t.id) === String(tierId));
        if (tierObj) {
            setData({
                ...data,
                room_type_pricing_tier_id: tierId,
                price: String(tierObj.price)
            });
        }
    };

    const handleDateChange = (dateStr: string) => {
        if (!dateStr) return;
        const dayNum = new Date(dateStr).getDate();
        setData({
            ...data,
            start_date: dateStr,
            billing_day: String(dayNum)
        });
    };

    // 🌟 KUMPULAN LOGIKA OPERASI DYNAMIC REPEATER CHARGES 🌟
    const addChargeRow = () => {
        setData('charges', [...data.charges, { charge_type_id: '', amount: '' }]);
    };

    const removeChargeRow = (indexToRemove: number) => {
        setData('charges', data.charges.filter((_, idx) => idx !== indexToRemove));
    };

    const handleChargeRowChange = (index: number, key: keyof ChargeInput, value: string) => {
        const updatedCharges = data.charges.map((charge, idx) => {
            if (idx === index) {
                // Auto pre-fill nominal bawaan master seandainya tipe biaya diubah
                if (key === 'charge_type_id') {
                    const masterObj = chargeTypesList.find((c: any) => String(c.id) === String(value));
                    return {
                        ...charge,
                        charge_type_id: value,
                        amount: masterObj ? String(masterObj.base_price ?? '') : ''
                    };
                }
                return { ...charge, [key]: value };
            }
            return charge;
        });
        setData('charges', updatedCharges);
    };

    useEffect(() => {
        if (open && data.start_date) {
            const dayNum = new Date(data.start_date).getDate();
            setData({
                ...data,
                billing_day: String(dayNum)
            });
        }
    }, [open]);

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setAvailableRooms([]);
        setAvailableTypes([]);
        setAvailableTiers([]);
        onClose();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!canCreate) return;
        post('/occupancies', { preserveScroll: true, onSuccess: handleClose });
    };

    const renderFormFields = () => {
        if (!canCreate) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-red-200 bg-red-50/50 rounded-2xl my-4">
                    <ShieldAlert className="size-8 text-red-500 mb-2" />
                    <h5 className="text-sm font-bold text-red-700">Akses Ditolak</h5>
                    <p className="text-xs text-red-600/80 max-w-xs mt-1">Akun Anda tidak dibekali hak otoritas menerbitkan log check-in hunian baru.</p>
                </div>
            );
        }

        return (
            <form id="occupancy-form" onSubmit={handleSubmit} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2">

                {/* Pilihan Gedung */}
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="oc-prop" required>Pilih Gedung Properti</FormLabel>
                    <div className="relative">
                        <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            id="oc-prop"
                            value={data.property_id}
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none focus:border-primary appearance-none text-foreground"
                            disabled={processing}
                        >
                            <option value="">-- Pilih Lokasi Gedung --</option>
                            {propertiesList.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                            ))}
                        </select>
                    </div>
                    <FormErrorMessage message={errors.property_id} />
                </div>

                {/* Dropdown Kamar Fisik Kosong */}
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="oc-room" required>Kamar Fisik Tersedia (Ready)</FormLabel>
                    <div className="relative">
                        <BedDouble className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            id="oc-room"
                            value={data.room_id}
                            onChange={(e) => handleRoomChange(e.target.value)}
                            className={cn(
                                "w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none focus:border-primary appearance-none text-foreground",
                                !data.property_id && "cursor-not-allowed opacity-50"
                            )}
                            disabled={processing || !data.property_id}
                        >
                            <option value="">-- {data.property_id ? 'Pilih Nomor Kamar' : 'Tentukan Gedung Terlebih Dahulu'} --</option>
                            {availableRooms.map((r: any) => (
                                <option key={r.id} value={r.id}>Kamar {r.room_number} ({r.room_type?.name ?? 'Tanpa Kategori'})</option>
                            ))}
                        </select>
                    </div>
                    {data.property_id && availableRooms.length === 0 && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">* Seluruh kamar di gedung ini terisi penuh atau sedang dalam masa perbaikan.</p>
                    )}
                    <FormErrorMessage message={errors.room_id} />
                </div>

                {/* Dropdown Penyewa (Tenant) */}
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="oc-tenant" required>Pilih Identitas Profil Penyewa</FormLabel>
                    <div className="relative">
                        <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            id="oc-tenant"
                            value={data.tenant_id}
                            onChange={(e) => setData('tenant_id', e.target.value)}
                            className="w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none focus:border-primary appearance-none text-foreground"
                            disabled={processing}
                        >
                            <option value="">-- Pilih Nama Penyewa --</option>
                            {tenantsList.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>
                            ))}
                        </select>
                    </div>
                    <FormErrorMessage message={errors.tenant_id} />
                </div>

                {/* Dropdown Opsi Skema Tarif Berjenjang */}
                {availableTiers.length > 0 && (
                    <div className="flex flex-col space-y-1.5 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 animate-in fade-in duration-200">
                        <FormLabel htmlFor="oc-tier">Variasi Opsi Skema Tarif Kamar</FormLabel>
                        <div className="relative mt-1">
                            <Layers className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-amber-600" />
                            <select
                                id="oc-tier"
                                value={data.room_type_pricing_tier_id}
                                onChange={(e) => handleTierChange(e.target.value)}
                                className="w-full h-9 rounded-lg border border-amber-500/30 bg-background pl-10 pr-4 text-xs font-bold outline-none focus:border-amber-500 appearance-none text-amber-800 dark:text-amber-300"
                            >
                                <option value="">Menggunakan Harga Pokok Utama</option>
                                {availableTiers.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name} (Rp {Number(t.price).toLocaleString('id-ID')})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Grid: Tanggal Masuk & Hari Siklus Tagihan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <FormLabel htmlFor="oc-date" required>Tanggal Check-In (Mulai Huni)</FormLabel>
                        <div className="relative">
                            <Calendar className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="oc-date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="h-10.5 rounded-xl bg-card pl-10 font-medium"
                                disabled={processing}
                            />
                        </div>
                        <FormErrorMessage message={errors.start_date} />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <FormLabel htmlFor="oc-bday" required>Hari Siklus Tagihan Rutin</FormLabel>
                        <Input
                            id="oc-bday"
                            type="number"
                            min="1"
                            max="31"
                            value={data.billing_day}
                            onChange={(e) => setData('billing_day', e.target.value)}
                            placeholder="Cth: 5"
                            className="h-10.5 rounded-xl bg-card font-bold font-mono"
                            disabled={processing}
                        />
                        <FormErrorMessage message={errors.billing_day} />
                    </div>
                </div>

                {/* Grid: Harga Deal & Nominal Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <FormLabel htmlFor="oc-price" required>Harga Deal Kontrak / Bulan</FormLabel>
                        <div className="relative">
                            <Coins className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="oc-price"
                                type="number"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="Rp 0"
                                className="h-10.5 rounded-xl bg-card pl-10 font-mono font-black text-foreground"
                                disabled={processing}
                            />
                        </div>
                        <FormErrorMessage message={errors.price} />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <FormLabel htmlFor="oc-dep">Uang Jaminan Kontrak (Deposit)</FormLabel>
                        <div className="relative">
                            <Coins className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="oc-dep"
                                type="number"
                                value={data.deposit_amount}
                                onChange={(e) => setData('deposit_amount', e.target.value)}
                                placeholder="Rp 0 (Opsional)"
                                className="h-10.5 rounded-xl bg-card pl-10 font-mono font-bold text-foreground"
                                disabled={processing}
                            />
                        </div>
                        <FormErrorMessage message={errors.deposit_amount} />
                    </div>
                </div>

                {/* 🌟 BARU: DYNAMIC REPEATER FIELD UNTUK BIAYA TAMBAHAN KOS 🌟 */}
                <div className="flex flex-col space-y-2 border-t border-dashed pt-4">
                    <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-1 text-slate-500">
                            <Receipt size={12} /> Paket Paket Biaya Tambahan Bulanan (Opsional)
                        </FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addChargeRow}
                            className="h-7 rounded-lg text-[10px] font-black uppercase tracking-wider px-2 gap-1 border-primary/40 text-primary hover:bg-primary/5"
                            disabled={processing}
                        >
                            <Plus size={11} /> Tambah Biaya
                        </Button>
                    </div>

                    {data.charges.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground font-medium italic bg-muted/20 p-3 rounded-xl border border-dashed text-center select-none">
                            Kamar ini hanya dikenakan biaya sewa pokok tanpa iuran langganan tambahan.
                        </p>
                    ) : (
                        <div className="flex flex-col space-y-2.5">
                            {data.charges.map((charge, index) => (
                                <div key={index} className="flex items-start gap-2 bg-muted/40 p-2.5 rounded-xl border border-border/60 animate-in fade-in zoom-in-95 duration-150">
                                    {/* Dropdown Tipe Biaya Master */}
                                    <div className="flex-1 flex flex-col space-y-1">
                                        <select
                                            value={charge.charge_type_id}
                                            onChange={(e) => handleChargeRowChange(index, 'charge_type_id', e.target.value)}
                                            className="w-full h-9 text-xs font-bold rounded-lg border border-border bg-background px-2.5 outline-none focus:border-primary text-foreground appearance-none"
                                            disabled={processing}
                                            required
                                        >
                                            <option value="">-- Jenis Beban --</option>
                                            {/* 🌟 SEKARANG MENGGUNAKAN ARRAY YANG SUDAH DISARING */}
                                            {filteredChargeTypes.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors[`charges.${index}.charge_type_id` as any] && (
                                            <p className="text-[9px] font-semibold text-red-500">{errors[`charges.${index}.charge_type_id` as any]}</p>
                                        )}
                                    </div>

                                    {/* Input Nominal Kustom */}
                                    <div className="w-32 flex flex-col space-y-1">
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={charge.amount}
                                                onChange={(e) => handleChargeRowChange(index, 'amount', e.target.value)}
                                                placeholder="Harga Pokok"
                                                className="h-9 rounded-lg bg-background text-xs font-bold font-mono pr-1.5"
                                                disabled={processing}
                                            />
                                        </div>
                                        {errors[`charges.${index}.amount` as any] && (
                                            <p className="text-[9px] font-semibold text-red-500">{errors[`charges.${index}.amount` as any]}</p>
                                        )}
                                    </div>

                                    {/* Hapus Baris */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeChargeRow(index)}
                                        className="size-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                                        disabled={processing}
                                    >
                                        <Trash2 size={13} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </form>
        );
    };

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="h-10 rounded-xl px-4 text-[11px] font-black tracking-wider text-slate-500 uppercase">
                Batal
            </Button>
            {canCreate && (
                <Button type="submit" form="occupancy-form" size="sm" disabled={processing} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase hover:bg-primary/90">
                    {processing ? 'Memproses...' : 'Eksekusi Check-In'}
                </Button>
            )}
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[92vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">Pendaftaran Check-In</DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">Kunci ikatan sewa unit kamar fisik dengan biodata tenant.</DrawerDescription>
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
                    <DialogTitle className="text-xl font-bold tracking-tight">Pendaftaran Check-In Penyewa</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Sistem akan otomatis mengubah status unit kamar fisik dari Kosong menjadi Terisi.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 sm:justify-end">
                    {renderFooterButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false, htmlFor, className }: { children: React.ReactNode; required?: boolean; htmlFor?: string; className?: string }) {
    return <Label htmlFor={htmlFor} className={cn("flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500", className)}>{children}{required && <span className="text-red-500">*</span>}</Label>;
}

function FormErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 animate-in pl-0.5 text-xs font-semibold text-red-500 duration-150 fade-in-50">{message}</p>;
}
