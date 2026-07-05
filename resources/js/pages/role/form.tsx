// resources/js/pages/Roles/form.tsx

import { useForm } from '@inertiajs/react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
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

import { cn } from '@/lib/utils';
import type { Role, Permission } from '@/types/role/role-type';
import { router } from '@inertiajs/react';
import roleController from '@/actions/App/Http/Controllers/RoleController'; // Bisa diganti dengan route helper Ziggy jika digunakan

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
    permissions: string[]; // Kita kirim array of string (nama permission)
};

type Props = {
    open: boolean;
    item: Role | null;
    availablePermissions: Permission[];
    onClose: () => void;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function RoleFormModal({
                                  open,
                                  item,
                                  availablePermissions = [],
                                  onClose
                              }: Props) {
    const isEdit = item !== null;
    const isMobile = useIsMobile();

    // Proteksi UI
    const isSuperAdmin = item?.name === 'super_admin';
    const isOwner = item?.name === 'owner';

    const permissionsList = Array.isArray(availablePermissions)
        ? availablePermissions
        : ((availablePermissions as any)?.data ?? []);

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
        permissions: []
    });

    useEffect(() => {
        if (open) {
            setData({
                name: item?.name ?? '',
                // Ekstrak nama-nama permission dari objek relasi Role
                permissions: item?.permissions ? item.permissions.map((p) => p.name) : []
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

        // Ganti dengan helper Rute Anda (misal Ziggy: route('roles.update', item.id))
        if (isEdit) {
            put(roleController.update(item.id).url, options);
        } else {
            post(roleController.create().url, options);
        }
    };

    const togglePermission = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter((p) => p !== permissionName));
        }
    };

    // ─── RENDER FORM FIELDS INNER CONTAINER ───
    const renderFormFields = () => (
        <form
            id="role-form"
            onSubmit={handleSubmit}
            className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-1 py-4"
        >
            {/* Input Nama Role */}
            <div className="flex flex-col justify-start space-y-1.5">
                <FormLabel htmlFor="rl-name" required>
                    Nama Hak Akses (Role)
                </FormLabel>
                <div className="relative">
                    <ShieldCheck
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="rl-name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Cth: Staff Teknisi, Admin Finance..."
                        className={cn(
                            'h-10.5 rounded-xl bg-card pl-10 font-medium',
                            (isSuperAdmin || isOwner) && 'cursor-not-allowed opacity-50'
                        )}
                        disabled={processing || isSuperAdmin || isOwner}
                    />
                </div>
                {/* Info Text untuk Role Sistem */}
                {(isSuperAdmin || isOwner) && (
                    <p className="text-[10px] text-orange-500 font-semibold mt-1">
                        *Nama role sistem inti tidak dapat diubah.
                    </p>
                )}
                <FormErrorMessage message={errors.name} />
            </div>

            {/* Checklist Permissions */}
            <div className="flex flex-col justify-start space-y-3 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                    <FormLabel required>Daftar Kapabilitas (Permissions)</FormLabel>
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {data.permissions.length} Dipilih
                    </span>
                </div>

                {isSuperAdmin ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                        <ShieldAlert className="mx-auto mb-2 size-6 text-red-500" />
                        <p className="text-xs font-bold text-red-600 dark:text-red-400">
                            Akses Super Admin Terkunci
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-red-500/80">
                            Role ini memiliki akses absolut ke seluruh sistem dan tidak dapat dimodifikasi secara
                            manual.
                        </p>
                    </div>
                ) : (
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl border border-border/50 bg-muted/20 p-3">
                        {permissionsList.map((perm: any) => {
                            const isChecked = data.permissions.includes(perm.name);
                            return (
                                <label
                                    key={perm.name}
                                    className={cn(
                                        'flex cursor-pointer select-none items-center space-x-3 rounded-lg border p-2.5 transition-colors',
                                        isChecked
                                            ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                                            : 'border-border/50 bg-background hover:bg-muted/50',
                                        processing && 'cursor-wait opacity-50'
                                    )}
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            togglePermission(perm.name, checked as boolean)
                                        }
                                        disabled={processing}
                                        className="h-4 w-4 rounded-sm border-primary/50 text-primary data-[state=checked]:bg-primary"
                                    />
                                    <span
                                        className="text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {perm.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
                <FormErrorMessage message={errors.permissions as string} />
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
                {!isSuperAdmin && (
                    <Button
                        key="btn-submit"
                        type="submit"
                        form="role-form"
                        size="sm"
                        disabled={processing}
                        className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase hover:bg-primary/90"
                    >
                        {processing
                            ? 'Menyimpan...'
                            : isEdit
                                ? 'Simpan Perubahan'
                                : 'Buat Role Baru'}
                    </Button>
                )}
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
                <DrawerContent
                    className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] border-t border-border/80 bg-background outline-none sm:mb-4 sm:max-w-[420px] sm:rounded-[3rem] sm:border sm:border-border/60 sm:bg-card">
                    <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                        <DrawerTitle className="text-lg font-black tracking-tight">
                            {isEdit ? 'Perbarui Hak Akses' : 'Buat Hak Akses Baru'}
                        </DrawerTitle>
                        <DrawerDescription className="text-xs font-medium text-muted-foreground">
                            Atur izin tindakan apa saja yang dapat dilakukan oleh Role ini.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-1 flex-col overflow-hidden px-6">
                        {renderFormFields()}
                    </div>

                    <DrawerFooter
                        className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/60 bg-background px-6 pt-4 pb-8">
                        {renderFooterButtons()}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent
                className="flex max-h-[88dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md md:max-w-xl">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {isEdit ? 'Perbarui Hak Akses' : 'Buat Hak Akses Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Atur izin tindakan apa saja yang dapat dilakukan oleh Role ini di dalam sistem.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {renderFormFields()}
                </div>

                <DialogFooter
                    className="flex shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 pt-4 sm:justify-end">
                    {renderFooterButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── COMPONENT PRESENTATIONAL HELPERS ────────────────────────────────────────
function FormLabel({
                       children,
                       htmlFor,
                       required = false
                   }: {
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
