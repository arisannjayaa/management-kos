import { router, useForm, usePage } from '@inertiajs/react';
import { User, Phone, CreditCard, ShieldAlert, Mail } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import type { Tenant, TenantStatus } from '@/types/tenant/tenant-type';

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

type FormData = {
    _method?: string;
    name: string;
    email: string; // Ditambahkan untuk integrasi pembuatan User akun login
    ktp_number: string;
    phone: string;
    emergency_contact: string;
    ktp_attachment: File | null;
    status: TenantStatus;
};

type Props = { open: boolean; item: Tenant | null; onClose: () => void; };

export function TenantFormModal({ open, item, onClose }: Props) {
    const isEdit = item !== null;
    const isMobile = useIsMobile();

    const { auth } = usePage<any>().props;
    const userPermissions = auth?.user?.permissions ?? [];
    const isSuperAdmin = (auth?.user?.roles ?? []).includes('super_admin');

    const canCreate = isSuperAdmin || userPermissions.includes('tenant.create');
    const canUpdate = isSuperAdmin || userPermissions.includes('tenant.update');
    const isAuthorized = isEdit ? canUpdate : canCreate;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<FormData>({
        name: '',
        email: '',
        ktp_number: '',
        ktp_attachment: null,
        phone: '',
        emergency_contact: '',
        status: 'active'
    });

    useEffect(() => {
        if (open) {
            setData({
                name: item?.name ?? '',
                email: item?.email ?? '',
                ktp_number: item?.ktp_number ?? '',
                ktp_attachment: null,
                phone: item?.phone ?? '',
                emergency_contact: item?.emergency_contact ?? '',
                status: (item?.status as TenantStatus) ?? 'active'
            });
            clearErrors();
        }
    }, [open, item]);

    const handleClose = () => { if (processing) return; reset(); clearErrors(); onClose(); };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!isAuthorized) return;

        const options = { preserveScroll: true, onSuccess: handleClose };

        if (isEdit) {
            // Spoofing POST ke PUT untuk kompatibilitas upload file PHP Laravel
            router.post(`/tenants/update/${item.id}`, { ...data, _method: 'PUT' }, options);
        } else {
            post('/tenants', options);
        }
    };

    const renderFormFields = () => {
        if (!isAuthorized) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-red-200 bg-red-50/50 rounded-2xl my-4">
                    <ShieldAlert className="size-8 text-red-500 mb-2" />
                    <h5 className="text-sm font-bold text-red-700">Akses Operasional Ditolak</h5>
                    <p className="text-xs text-red-600/80 max-w-xs mt-1">Anda tidak memiliki kapabilitas hak akses resmi untuk memanipulasi berkas data penyewa kos.</p>
                </div>
            );
        }

        return (
            <form id="tenant-form" onSubmit={handleSubmit} className="space-y-4 px-1 py-2 no-scrollbar max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="tn-name" required>Nama Lengkap Sesuai KTP</FormLabel>
                    <div className="relative">
                        <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="tn-name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Cth: I Wayan Ari Sanjaya..." className="h-10.5 rounded-xl bg-card pl-10 font-medium" disabled={processing} required />
                    </div>
                    <FormErrorMessage message={errors.name} />
                </div>

                {/* Input Email Sinkronisasi Akun Login */}
                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="tn-email" required>Alamat Email Akun Portal</FormLabel>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="tn-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="Cth: ari@digitalspirit.my.id" className="h-10.5 rounded-xl bg-card pl-10 font-medium" disabled={processing} required />
                    </div>
                    <FormErrorMessage message={errors.email} />
                </div>

                <div className="flex flex-col space-y-1.5">
                    <FormLabel htmlFor="tn-ktp">Nomor Induk Kependudukan (KTP)</FormLabel>
                    <div className="relative">
                        <CreditCard className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="tn-ktp" value={data.ktp_number} onChange={(e) => setData('ktp_number', e.target.value)} placeholder="Cth: 5103xxxxxxxxxxxx" className="h-10.5 rounded-xl bg-card pl-10 font-mono font-semibold" disabled={processing} />
                    </div>
                    <FormErrorMessage message={errors.ktp_number} />
                </div>

                <FileUpload
                    label="Dokumen Lampiran Pendukung (Scan KTP)"
                    existingFileUrl={item?.ktp_attachment}
                    onChange={(file) => setData('ktp_attachment', file)}
                    error={errors.ktp_attachment}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="flex flex-col space-y-1.5">
                        <FormLabel htmlFor="tn-phone" required>No. WhatsApp Aktif</FormLabel>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input id="tn-phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="Cth: 081234567xxx" className="h-10.5 rounded-xl bg-card pl-10 font-mono font-bold" disabled={processing} required />
                        </div>
                        <FormErrorMessage message={errors.phone} />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <FormLabel htmlFor="tn-emg">No. Kontak Darurat (Kerabat)</FormLabel>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input id="tn-emg" value={data.emergency_contact} onChange={(e) => setData('emergency_contact', e.target.value)} placeholder="Cth: 081999xxxxxx" className="h-10.5 rounded-xl bg-card pl-10 font-mono font-semibold" disabled={processing} />
                        </div>
                        <FormErrorMessage message={errors.emergency_contact} />
                    </div>
                </div>

                {isEdit && (
                    <div className="flex flex-col space-y-1.5 border-t border-border/40 pt-3">
                        <FormLabel htmlFor="tn-status" required>Status Keanggotaan</FormLabel>
                        <select id="tn-status" value={data.status} onChange={(e) => setData('status', e.target.value as TenantStatus)} className="w-full h-10.5 rounded-xl border border-border bg-card px-3.5 text-sm font-bold outline-none text-foreground appearance-none" disabled={processing}>
                            <option value="active">Aktif (Menghuni / Terdaftar)</option>
                            <option value="inactive">Nonaktif (Sudah Keluar / Pindahan)</option>
                        </select>
                        <FormErrorMessage message={errors.status} />
                    </div>
                )}
            </form>
        );
    };

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} className="h-10 rounded-xl px-4 text-[11px] font-black tracking-wider text-slate-500 uppercase">Batal</Button>
            {isAuthorized && (
                <Button type="submit" form="tenant-form" size="sm" disabled={processing} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase">
                    {processing ? 'Menyimpan...' : isEdit ? 'Simpan Profil' : 'Daftarkan Penyewa'}
                </Button>
            )}
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none sm:max-w-[420px]">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">{isEdit ? 'Ubah Berkas Penyewa' : 'Registrasi Penyewa Baru'}</DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">Catat identitas personal penyewa untuk validasi invoice penagihan.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col overflow-hidden px-6">{renderFormFields()}</div>
                    <DrawerFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/60 bg-background px-6 pt-4 pb-8">{renderFooterButtons()}</DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="flex max-h-[85dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md md:max-w-xl">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">{isEdit ? 'Ubah Berkas Penyewa' : 'Registrasi Penyewa Baru'}</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Pastikan nomor WhatsApp yang dimasukkan aktif demi kelancaran pengiriman pesan otomatis.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 sm:justify-end">{renderFooterButtons()}</DialogFooter>
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
