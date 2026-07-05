// resources/js/pages/Rooms/form.tsx

import { useForm } from '@inertiajs/react';
import { BedDouble, Building2, Layers, Activity } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { cn } from '@/lib/utils';
import type { Room, RoomStatus } from '@/types/room/room-type';
import roomController from '@/actions/App/Http/Controllers/RoomController';

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

type FormData = {
    property_id: string;
    room_type_id: string;
    room_number: string;
    status: RoomStatus;
};

type Props = {
    open: boolean;
    item: Room | null;
    properties: any[];
    roomTypes: any[]; // Seluruh master room types dari backend
    onClose: () => void;
};

export function RoomFormModal({ open, item, properties = [], roomTypes = [], onClose }: Props) {
    const isEdit = item !== null;
    const isMobile = useIsMobile();

    const propertiesList = Array.isArray(properties) ? properties : ((properties as any)?.data ?? []);
    const masterRoomTypes = Array.isArray(roomTypes) ? roomTypes : ((roomTypes as any)?.data ?? []);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<FormData>({
        property_id: '',
        room_type_id: '',
        room_number: '',
        status: 'available'
    });

    // Sinkronisasi otomatis pilhan dropdown tipe kamar agar hanya memunculkan anak dari properti terpilih
    const filteredRoomTypes = masterRoomTypes.filter(
        (type: any) => String(type.property_id) === String(data.property_id)
    );

    useEffect(() => {
        if (open) {
            setData({
                property_id: item?.property?.id ?? '',
                room_type_id: item?.room_type?.id ?? '',
                room_number: item?.room_number ?? '',
                status: item?.status ?? 'available'
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
            put(roomController.update(item.id).url, options);
        } else {
            post(roomController.create().url, options);
        }
    };

    const renderFormFields = () => (
        <form id="room-form" onSubmit={handleSubmit} className="space-y-4 px-1 py-2">

            {/* 1. Dropdown Gedung Properti */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel htmlFor="rm-prop" required>Lokasi Gedung Kos</FormLabel>
                <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                        id="rm-prop"
                        value={data.property_id}
                        onChange={(e) => {
                            setData((prev) => ({ ...prev, property_id: e.target.value, room_type_id: '' }));
                        }}
                        className={cn(
                            "w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none focus:border-primary appearance-none",
                            isEdit && "cursor-not-allowed opacity-60"
                        )}
                        disabled={processing || isEdit}
                    >
                        <option value="">-- Pilih Gedung Kos --</option>
                        {propertiesList.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <FormErrorMessage message={errors.property_id} />
            </div>

            {/* 2. Dropdown Kategori Tipe Kamar */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel htmlFor="rm-type" required>Klasifikasi Tipe Kamar</FormLabel>
                <div className="relative">
                    <Layers className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                        id="rm-type"
                        value={data.room_type_id}
                        onChange={(e) => setData('room_type_id', e.target.value)}
                        className={cn(
                            "w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none focus:border-primary appearance-none",
                            !data.property_id && "cursor-not-allowed opacity-50"
                        )}
                        disabled={processing || !data.property_id}
                    >
                        <option value="">-- Pilih Tipe Kamar Tarif --</option>
                        {filteredRoomTypes.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name} (Dasar: Rp {Number(t.base_price).toLocaleString('id-ID')})</option>
                        ))}
                    </select>
                </div>
                {data.property_id && filteredRoomTypes.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1">
                        *Gedung ini belum memiliki tipe kamar. Silakan buat tipe kamar terlebih dahulu.
                    </p>
                )}
                <FormErrorMessage message={errors.room_type_id} />
            </div>

            {/* Grid: Nomor Kamar & Status Awal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="rm-num" required>Nomor / Kode Kamar</FormLabel>
                    <div className="relative">
                        <BedDouble className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="rm-num"
                            value={data.room_number}
                            onChange={(e) => setData('room_number', e.target.value)}
                            placeholder="Cth: A-01, 102, B-Bawah..."
                            className="h-10.5 rounded-xl bg-card pl-10 font-bold text-foreground"
                            disabled={processing}
                        />
                    </div>
                    <FormErrorMessage message={errors.room_number} />
                </div>

                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="rm-status" required>Kondisi Awal Kamar</FormLabel>
                    <div className="relative">
                        <Activity className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                            id="rm-status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as RoomStatus)}
                            className="w-full h-10.5 rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-bold outline-none focus:border-primary appearance-none text-foreground"
                            disabled={processing}
                        >
                            <option value="available">Kosong (Ready)</option>
                            <option value="occupied">Terisi (Terhuni)</option>
                            <option value="maintenance">Perbaikan (Maintanance)</option>
                        </select>
                    </div>
                    <FormErrorMessage message={errors.status} />
                </div>
            </div>
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="h-10 rounded-xl px-4 text-[11px] font-black tracking-wider text-slate-500 uppercase">
                Batal
            </Button>
            <Button type="submit" form="room-form" size="sm" disabled={processing} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase hover:bg-primary/90">
                {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Unit'}
            </Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">{isEdit ? 'Perbarui Unit Kamar' : 'Tambah Unit Kamar'}</DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">Masukkan kode kamar fisik serta status operasionalnya.</DrawerDescription>
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
            <DialogContent className="flex max-h-[85dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md md:max-w-xl">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">{isEdit ? 'Perbarui Unit Kamar' : 'Tambah Unit Kamar'}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Petakan unit fisik kamar baru ke dalam klaster gedung kos properti Anda.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 sm:justify-end">
                    {renderFooterButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor?: string }) {
    return <Label htmlFor={htmlFor} className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500">{children}{required && <span className="text-red-500">*</span>}</Label>;
}

function FormErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 animate-in pl-0.5 text-xs font-semibold text-red-500 duration-150 fade-in-50">{message}</p>;
}
