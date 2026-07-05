// resources/js/pages/ChargeTypes/index.tsx

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Search, Filter, Wrench, Plus, Trash2, Edit2, ShieldAlert, Layers, CheckCircle2, XCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

import type { ChargeType, BillingMethod } from '@/types/charge-type/charge-type';

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
    chargeTypes: { data: ChargeType[] };
    properties: any[];
};

export default function ChargeTypeIndex({ chargeTypes, properties = [] }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles ?? [];
    const userPermissions = auth?.user?.permissions ?? [];
    const isSuperAdmin = userRoles.includes('super_admin');
    const canCreate = isSuperAdmin || userPermissions.includes('charge_type.create');
    const canEdit = isSuperAdmin || userPermissions.includes('charge_type.edit');
    const canDelete = isSuperAdmin || userPermissions.includes('charge_type.delete');

    const propertiesList = Array.isArray(properties) ? properties : (properties as any)?.data ?? [];
    const chargeDataList = chargeTypes?.data ?? [];

    // States Filter Penyelarasan DataTable
    const [search, setSearch] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('all');

    // States Pengendali Modal CRUD
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Inertia Form Hook
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        property_id: '',
        name: '',
        billing_method: 'flat' as BillingMethod,
        default_amount: '',
        unit_label: '',
        unit_price: '',
        is_active: '1',
    });

    useEffect(() => { setMounted(true); }, []);

    const handleFilterChange = (searchKey: string, propKey: string) => {
        startTransition(() => {
            router.get('/charge-types', { search: searchKey, property_id: propKey }, { preserveState: true, replace: true });
        });
    };

    // Pemicu Buka Form Tambah Baru
    const handleCreateOpen = () => {
        if (!canCreate) return;
        setEditMode(false);
        setSelectedId(null);
        reset();
        clearErrors();
        setOpenModal(true);
    };

    // Pemicu Buka Form Edit Data Terpilih
    const handleEditOpen = (item: ChargeType) => {
        if (!canEdit) return;
        setEditMode(true);
        setSelectedId(item.id);
        clearErrors();
        setData({
            property_id: item.property_id,
            name: item.name,
            billing_method: item.billing_method,
            default_amount: String(item.default_amount ?? ''),
            unit_label: item.unit_label ?? '',
            unit_price: String(item.unit_price ?? ''),
            is_active: item.is_active ? '1' : '0',
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        if (processing) return;
        reset();
        clearErrors();
        setOpenModal(false);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: handleCloseModal };

        if (editMode && selectedId) {
            put(`/charge-types/${selectedId}`, options);
        } else {
            post('/charge-types', options);
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (!canDelete) return;
        if (confirm(`Hapus komponen master biaya "${name}"? Kamar yang terikat biaya ini akan kehilangan templat tagihannya.`)) {
            router.delete(`/charge-types/${id}`, { preserveScroll: true });
        }
    };

    const getMethodLabel = (method: BillingMethod) => {
        const labels: Record<BillingMethod, string> = {
            flat: 'Flat Tetap/Bulan',
            metered: 'Variabel (Meteran)',
            per_occupant: 'Per Kepala Penghuni',
        };
        return <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide", method === 'metered' ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200")}>{labels[method]}</span>;
    };

    if (!mounted) return null;

    // Sub-Komponen Render Isian Input Form didalam Modal/Drawer
    const renderFormFields = () => (
        <form id="charge-type-form" onSubmit={handleSubmit} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-2 text-xs">

            {/* Dropdown Pilihan Gedung */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Gedung Properti Kos</FormLabel>
                <select
                    value={data.property_id}
                    onChange={(e) => setData('property_id', e.target.value)}
                    className="w-full h-10.5 rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:border-primary text-foreground appearance-none"
                    disabled={processing || editMode}
                    required
                >
                    <option value="">-- Tentukan Lokasi Gedung --</option>
                    {propertiesList.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                {errors.property_id && <p className="text-xs font-semibold text-red-500 mt-1">{errors.property_id}</p>}
            </div>

            {/* Input Nama Komponen */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Nama Komponen Biaya</FormLabel>
                <Input
                    placeholder="Cth: Iuran Kebersihan & Sampah, Listrik Kamar"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="h-10.5 rounded-xl bg-card font-medium text-sm"
                    disabled={processing}
                    required
                />
                {errors.name && <p className="text-xs font-semibold text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Dropdown Skema Pola Hitung */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel required>Metode Perhitungan Tagihan</FormLabel>
                <select
                    value={data.billing_method}
                    onChange={(e) => setData('billing_method', e.target.value as BillingMethod)}
                    className="w-full h-10.5 rounded-xl border border-border bg-card px-3 text-sm font-black outline-none focus:border-primary text-foreground appearance-none"
                    disabled={processing}
                >
                    <option value="flat">FLAT TETAP (Sama Rata Tiap Bulan)</option>
                    <option value="metered">METERED UTILITAS (Pakai Angka Meteran)</option>
                    <option value="per_occupant">PER OKUPAN (Dikalikan Jumlah Kepala)</option>
                </select>
            </div>

            {/* FIELD KONDISIONAL: JIKA METODE FLAT ATAU PER OKUPAN */}
            {data.billing_method !== 'metered' ? (
                <div className="flex flex-col space-y-1.5 animate-in fade-in duration-200">
                    <FormLabel>Nominal Biaya Standar / Bulan</FormLabel>
                    <Input
                        type="number"
                        placeholder="Rp 0 (Bisa dikosongkan jika fleksibel)"
                        value={data.default_amount}
                        onChange={(e) => setData('default_amount', e.target.value)}
                        className="h-10.5 rounded-xl bg-card font-mono font-bold"
                        disabled={processing}
                    />
                    {errors.default_amount && <p className="text-xs font-semibold text-red-500 mt-1">{errors.default_amount}</p>}
                </div>
            ) : (
                /* FIELD KONDISIONAL: JIKA METODE METERED (LISTRIK/AIR) */
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200 rounded-xl bg-blue-500/5 border border-blue-500/20 p-3">
                    <div className="flex flex-col space-y-1.5">
                        <FormLabel required>Label Satuan</FormLabel>
                        <Input
                            placeholder="Cth: kWh, m3"
                            value={data.unit_label}
                            onChange={(e) => setData('unit_label', e.target.value)}
                            className="h-9 rounded-lg bg-background font-bold text-center"
                            disabled={processing}
                            required
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <FormLabel required>Harga / Satuan Unit</FormLabel>
                        <Input
                            type="number"
                            placeholder="Cth: 2000"
                            value={data.unit_price}
                            onChange={(e) => setData('unit_price', e.target.value)}
                            className="h-9 rounded-lg bg-background font-mono font-black"
                            disabled={processing}
                            required
                        />
                    </div>
                </div>
            )}

            {/* Pilihan Status Operasional */}
            <div className="flex flex-col space-y-1.5">
                <FormLabel>Status Komponen</FormLabel>
                <select
                    value={data.is_active}
                    onChange={(e) => setData('is_active', e.target.value)}
                    className="w-full h-10.5 rounded-xl border border-border bg-card px-3 text-xs font-bold outline-none focus:border-primary text-foreground appearance-none"
                    disabled={processing}
                >
                    <option value="1">AKTIF (Tampil di Opsi Form Kontrak)</option>
                    <option value="0">NON-AKTIF (Sembunyikan Opsi)</option>
                </select>
            </div>
        </form>
    );

    const renderFooterButtons = () => (
        <>
            <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal} className="h-10 rounded-xl px-4 text-[11px] font-black tracking-wider text-slate-500 uppercase">Batal</Button>
            <Button type="submit" form="charge-type-form" size="sm" disabled={processing} className="h-10 rounded-xl bg-primary px-5 text-[11px] font-black tracking-wider text-primary-foreground uppercase hover:bg-primary/90">
                {processing ? 'Menyimpan...' : 'Simpan Komponen'}
            </Button>
        </>
    );

    return (
        <>
            <Head title="Master Komponen Biaya Kos" />

            <div className="flex flex-col space-y-5 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">

                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
                            <Layers className="text-primary size-6 shrink-0" /> Master Komponen Biaya Kos
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Definisikan templat iuran flat bulanan maupun tarif meteran listrik/air di setiap gedung kos Anda.</p>
                    </div>
                    {canCreate && (
                        <Button onClick={handleCreateOpen} size="sm" className="h-10 rounded-xl text-xs font-black uppercase tracking-wider px-4 gap-1.5 self-start sm:self-auto bg-primary">
                            <Plus size={14} /> Tambah Master Biaya
                        </Button>
                    )}
                </div>

                {/* Filter Sidebar Top Bar Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-card p-3 rounded-2xl border border-border/60">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama jenis biaya..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); handleFilterChange(e.target.value, propertyFilter); }}
                            className="pl-10 h-10 rounded-xl bg-background border-border/80"
                        />
                    </div>
                    <select
                        value={propertyFilter}
                        onChange={(e) => { setPropertyFilter(e.target.value); handleFilterChange(search, e.target.value); }}
                        className="w-full h-10 text-xs font-bold rounded-xl border border-border bg-background px-3 outline-none focus:border-primary text-foreground appearance-none"
                    >
                        <option value="all">Semua Gedung Properti</option>
                        {propertiesList.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* TABLE VIEW DESKTOP */}
                {!isMobile ? (
                    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b select-none">
                            <tr>
                                <th className="p-4">Nama Komponen</th>
                                <th className="p-4">Gedung Properti</th>
                                <th className="p-4">Metode Hitung</th>
                                <th className="p-4 text-right">Harga Bawaan / Tarif</th>
                                <th className="p-4 center">Status</th>
                                <th className="p-4 text-right">Tindakan</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 font-medium text-slate-700 dark:text-slate-300">
                            {chargeDataList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                                        Tidak ada jenis master biaya terdaftar.
                                    </td>
                                </tr>
                            ) : (
                                chargeDataList.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-bold text-foreground text-sm">{item.name}</td>
                                        <td className="p-4 font-semibold text-slate-500">{item.property_name}</td>
                                        <td className="p-4">{getMethodLabel(item.billing_method)}</td>
                                        <td className="p-4 text-right font-mono font-bold text-foreground">
                                            {item.billing_method === 'metered'
                                                ? `Rp ${item.unit_price.toLocaleString('id-ID')} / ${item.unit_label}`
                                                : item.default_amount > 0 ? `Rp ${item.default_amount.toLocaleString('id-ID')}` : 'Fleksibel'
                                            }
                                        </td>
                                        <td className="p-4">
                                            {item.is_active
                                                ? <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={13}/> Aktif</span>
                                                : <span className="text-slate-400 font-medium flex items-center gap-1"><XCircle size={13}/> Sembunyi</span>
                                            }
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {canEdit && (
                                                    <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => handleEditOpen(item)}>
                                                        <Edit2 size={12} />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id, item.name)}>
                                                        <Trash2 size={12} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* CARD VIEW MOBILE */
                    <div className="flex flex-col space-y-3">
                        {chargeDataList.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-dashed text-xs font-bold">Katalog master biaya kosong.</div>
                        ) : (
                            chargeDataList.map((item) => (
                                <div key={item.id} className="bg-card rounded-2xl border p-4 flex flex-col space-y-3 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">{item.name}</span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5">Gedung: {item.property_name}</span>
                                        </div>
                                        {getMethodLabel(item.billing_method)}
                                    </div>
                                    <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                                        <div>
                                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Tarif Acuan</span>
                                            <span className="font-black text-foreground font-mono">
                                                {item.billing_method === 'metered'
                                                    ? `Rp ${item.unit_price.toLocaleString('id-ID')}/${item.unit_label}`
                                                    : item.default_amount > 0 ? `Rp ${item.default_amount.toLocaleString('id-ID')}` : 'Fleksibel'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {canEdit && <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold px-2.5" onClick={() => handleEditOpen(item)}>Edit</Button>}
                                            {canDelete && <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(item.id, item.name)}><Trash2 size={12}/></Button>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* JENDELA MODAL DIALOG / DRAWER CONNECTOR FORM */}
            {isMobile ? (
                <Drawer open={openModal} onOpenChange={(v) => !v && handleCloseModal()}>
                    <DrawerContent className="mx-auto flex max-h-[90vh] w-full flex-col rounded-t-[2.5rem] bg-background outline-none">
                        <DrawerHeader className="shrink-0 px-6 pt-5 pb-2 text-left">
                            <DrawerTitle className="text-base font-black tracking-tight">{editMode ? 'Ubah Komponen Biaya' : 'Tambah Master Biaya'}</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-1 flex-col overflow-hidden px-6">{renderFormFields()}</div>
                        <DrawerFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t px-6 pt-4 pb-8 bg-background">{renderFooterButtons()}</DrawerFooter>
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={openModal} onOpenChange={(v) => !v && handleCloseModal()}>
                    <DialogContent className="flex max-h-[85dvh] flex-col gap-4 overflow-hidden rounded-3xl p-6 sm:max-w-md">
                        <DialogHeader className="shrink-0">
                            <DialogTitle className="text-lg font-bold tracking-tight">{editMode ? 'Modifikasi Komponen Biaya' : 'Buat Master Komponen Biaya'}</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">Isi parameter tarif acuan. Perubahan nilai di sini tidak akan mengoreksi nominal invoice yang sudah telanjur terbit.</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-1 flex-col overflow-hidden">{renderFormFields()}</div>
                        <DialogFooter className="flex shrink-0 flex-row items-center justify-between gap-2 border-t pt-4 sm:justify-end">{renderFooterButtons()}</DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

function FormLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
    return <Label className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none dark:text-slate-500">{children}{required && <span className="text-red-500">*</span>}</Label>;
}
