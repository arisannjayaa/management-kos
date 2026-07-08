import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Complaint } from '@/types/complaint/complaint-type';

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

type Props = { open: boolean; item: Complaint | null; onClose: () => void; };

export function ComplaintForm({ open, item, onClose }: Props) {
    const isMobile = useIsMobile();
    const isEdit = !!item;

    // Tarik identitas role akun yang login dari props global
    const { auth } = usePage<any>().props;
    const isTenant = auth?.user?.roles?.includes('tenant');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '', description: '', status: 'pending', response_notes: '', attachment: null as File | null
    });

    useEffect(() => {
        if (open && item) {
            setData({
                title: item.title,
                description: item.description,
                status: item.status,
                response_notes: item.response_notes ?? '',
                attachment: null
            });
        } else if (!open) { reset(); clearErrors(); }
    }, [open, item]);

    const handleClose = () => { if (processing) return; reset(); clearErrors(); onClose(); };
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/complaints/update/${item.id}` : '/complaints';
        post(url, { preserveScroll: true, onSuccess: handleClose });
    };

    const renderFormFields = () => (
        <form id="complaint-form" onSubmit={handleSubmit} className="space-y-4 px-1" encType="multipart/form-data">
            {/* Sisi pandang Tenant / Penyewa saat Create */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Subjek / Judul Masalah</FormLabel>
                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} disabled={processing || (isEdit && isTenant)} placeholder="Contoh: Lampu Toilet Mati" required />
                <FormErrorMessage message={errors.title} />
            </div>

            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Rincian Deskripsi Keluhan</FormLabel>
                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} disabled={processing || (isEdit && isTenant)} placeholder="Tulis rincian keluhan kamar Anda..." required />
                <FormErrorMessage message={errors.description} />
            </div>

            {!isEdit && (
                <div className="flex flex-col space-y-1.5">
                    <FormLabel>Foto Bukti Kerusakan</FormLabel>
                    <Input type="file" accept="image/*" onChange={(e) => setData('attachment', e.target.files?.[0] ?? null)} disabled={processing} />
                    <FormErrorMessage message={errors.attachment} />
                </div>
            )}

            {/* Sisi pandang Pengelola (Staff/Owner) untuk menanggapi tiket komplain */}
            {isEdit && !isTenant && (
                <div className="border-t pt-4 mt-2 space-y-4">
                    <div className="flex flex-col space-y-1.5">
                        <FormLabel required>Progress Penanganan Tiket</FormLabel>
                        <Select value={data.status} onValueChange={(v: any) => setData('status', v)} disabled={processing}>
                            <SelectTrigger><SelectValue placeholder="Ubah Status Keluhan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">PENDING (BELUM DIPROSES)</SelectItem>
                                <SelectItem value="processing">PROCESSING (SEDANG DIKERJAKAN)</SelectItem>
                                <SelectItem value="resolved">RESOLVED (MASALAH SELESAI)</SelectItem>
                                <SelectItem value="rejected">REJECTED (DIASINGKAN / TOLAK)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormErrorMessage message={errors.status} />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <FormLabel>Memo Tanggapan Pengelola</FormLabel>
                        <Textarea value={data.response_notes} onChange={(e) => setData('response_notes', e.target.value)} disabled={processing} placeholder="Tulis catatan perbaikan untuk penghuni kos..." />
                        <FormErrorMessage message={errors.response_notes} />
                    </div>
                </div>
            )}

            {isEdit && isTenant && data.response_notes && (
                <div className="p-3.5 bg-secondary rounded-2xl border text-xs">
                    <p className="font-bold text-foreground mb-1">Tanggapan Pengelola:</p>
                    <p className="text-muted-foreground italic">"{data.response_notes}"</p>
                </div>
            )}
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={processing}>Batal</Button>
            {(!isEdit || !isTenant) && (
                <Button type="submit" form="complaint-form" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Keluhan'}</Button>
            )}
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent className="rounded-t-[2.5rem]">
                    <DrawerHeader>
                        <DrawerTitle>{isEdit ? 'Detail Tiket Keluhan' : 'Buat Laporan Lapor Keluhan'}</DrawerTitle>
                        <DrawerDescription>Kelola koordinasi perbaikan fasilitas area unit kos.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 max-h-[60vh] overflow-y-auto no-scrollbar">{renderFormFields()}</div>
                    <DrawerFooter>{renderFooterButtons()}</DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="rounded-3xl max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Detail Tiket Keluhan' : 'Buat Laporan Lapor Keluhan'}</DialogTitle>
                    <DialogDescription>Kelola koordinasi perbaikan fasilitas area unit kos.</DialogDescription>
                </DialogHeader>
                {renderFormFields()}
                <DialogFooter>{renderFooterButtons()}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <Label className="flex items-center gap-1 font-bold text-xs uppercase text-slate-400 tracking-wider">{children}{required && <span className="text-red-500">*</span>}</Label>;
}
function FormErrorMessage({ message }: { message?: string }) {
    return message ? <p className="text-xs font-semibold text-red-500 mt-1">{message}</p> : null;
}
