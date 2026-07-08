// resources/js/pages/complaint/index.tsx

import { Head, usePage } from '@inertiajs/react';
import { Plus, MessageSquare, Building, User, Calendar, Eye, Trash2, CheckCircle2, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BulkDeleteConfirmDialog, BulkForceDeleteConfirmDialog, BulkRestoreConfirmDialog, DataTableBulkBar, DataTableFilterChips, DataTablePagination, DataTableToolbar, DataTableTrashToggle } from '@/components/datatable';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useBulkForceDelete } from '@/hooks/use-bulk-force-delete';
import { useBulkRestore } from '@/hooks/use-bulk-restore';
import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useModalForm } from '@/hooks/use-modal-form';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useSoftDelete } from '@/hooks/use-soft-delete';

import { MobileList } from './mobile-list';
import { ComplaintForm } from './form';
import type { Complaint, ComplaintFilters } from '@/types/complaint/complaint-type';
import type { PaginatedResponse } from '@/types/pagination';

type Props = { complaints: PaginatedResponse<Complaint>; filters: ComplaintFilters; };

export default function ComplaintIndex({ complaints, filters }: Props) {
    const showTrashed = filters.trashed === '1';
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // 🌟 Resolusi Identitas Aktor Kos Bulat Sesuai Aturan Gaya 9.4[cite: 2]
    const { auth } = usePage<any>().props;
    const isTenant = auth?.user?.roles?.includes('tenant');
    const isStaff = auth?.user?.roles?.includes('staff');
    const isOwner = auth?.user?.roles?.includes('owner');
    const isSuperAdmin = auth?.user?.roles?.includes('super_admin');

    // Hak Akses Tombol Destruktif Sesuai Instruksi Bli Ari
    const canDelete = isOwner || isSuperAdmin || isTenant; // Staff tidak bisa delete
    const canManageTrash = isOwner || isSuperAdmin;       // Tenant & Staff tidak bisa restore / force delete

    const { applyFilter, goToPage, isPending, applySort } = useDatatable<ComplaintFilters>('/complaints', filters);
    const { search, setSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<ComplaintFilters>);
            }
        },
    );
    const modal = useModalForm<Complaint>();
    const selection = useRowSelection<string>(); // Generics tipe data string terenkripsi sesuai 9.5[cite: 2]

    const softDelete = useSoftDelete<Complaint>({ getUrl: (i) => `/complaints/delete/${i.id}` });
    const bulkDelete = useBulkDelete({ url: '/complaints/bulk-destroy' });
    const singleRestore = useSoftDelete<Complaint>({ getUrl: (i) => `/complaints/restore/${i.id}`, method: 'post' });
    const singleForceDelete = useSoftDelete<Complaint>({ getUrl: (i) => `/complaints/force-delete/${i.id}` });
    const bulkRestore = useBulkRestore({ url: '/complaints/bulk-restore' });
    const bulkForceDelete = useBulkForceDelete({ url: '/complaints/bulk-force-delete' });

    const clearAllRef = useRef(selection.clearAll);
    clearAllRef.current = selection.clearAll;
    useEffect(() => { clearAllRef.current(); }, [complaints.current_page, filters.search, filters.trashed]);

    const filterFields = [
        { key: 'status', label: 'Status Penanganan', placeholder: 'Semua Status', options: [{ value: 'pending', label: 'Belum Diproses' }, { value: 'processing', label: 'Sedang Dikerjakan' }, { value: 'resolved', label: 'Selesai' }, { value: 'rejected', label: 'Ditolak' }], value: filters.status, onChange: (v: string | undefined) => applyFilter({ status: v } as Partial<ComplaintFilters>) },
    ];

    const statusConfig = {
        pending: { label: 'Pending', icon: <HelpCircle size={14} />, className: 'bg-amber-50 text-amber-700 border-amber-200' },
        processing: { label: 'Diproses', icon: <AlertTriangle size={14} />, className: 'bg-blue-50 text-blue-700 border-blue-200' },
        resolved: { label: 'Selesai', icon: <CheckCircle2 size={14} />, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        rejected: { label: 'Ditolak', icon: <XCircle size={14} />, className: 'bg-red-50 text-red-700 border-red-200' },
    };

    const bulkActions = showTrashed
        ? [
            { label: 'Pulihkan Berkas', onClick: (ids: any[]) => bulkRestore.trigger(ids) },
            { label: 'Hapus Permanen', destructive: true as const, onClick: (ids: any[]) => bulkForceDelete.trigger(ids) },
        ]
        : [
            { label: 'Buang ke Sampah', destructive: true as const, onClick: (ids: any[]) => bulkDelete.trigger(ids) },
        ];

    if (!mounted) return null;

    if (isMobile) {
        return (
            <>
                <Head title="Pusat Keluhan Kamar" />
                <MobileList initialData={complaints} showTrashed={showTrashed} onSearch={setSearch} searchValue={search} isPending={isPending} onEdit={(c) => modal.open(c)} onDelete={(c) => softDelete.trigger(c)} onRestore={(c) => singleRestore.trigger(c)} onForceDelete={(c) => singleForceDelete.trigger(c)} />
                {!showTrashed && <Button onClick={() => modal.open()} size="icon" className="fixed right-5 bottom-24 size-14 rounded-full shadow-lg z-50 bg-primary"><Plus size={24} /></Button>}
                <ComplaintForm open={modal.isOpen} item={modal.item} onClose={modal.close} />
                <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen} description="Hapus permanen tiket komplain?" onConfirm={singleForceDelete.confirm} />
            </>
        );
    }

    return (
        <>
            <Head title="Meja Aduan Tiket Keluhan" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-2"><MessageSquare size={24} className="text-primary"/> Meja Aduan & Tiket Keluhan Kos</h1>
                        <p className="mt-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saluran mandiri pelaporan gangguan hunian unit kos.</p>
                    </div>
                    {!showTrashed && (
                        <Button onClick={() => modal.open()} className="rounded-xl font-bold px-5 py-5"><Plus size={16} className="mr-2" /> Laporkan Keluhan Kamar</Button>
                    )}
                </div>

                <DataTableToolbar
                    searchValue={search}
                    onSearch={setSearch}
                    searchPlaceholder="Cari aduan..."
                    filterFields={filterFields}
                    activeFilterCount={(filters.status ? 1 : 0)}
                    onClearFilters={() => applyFilter({ search: undefined, status: undefined } as Partial<ComplaintFilters>)}
                    perPage={filters.per_page ?? 9}
                    onPerPageChange={(v) => applyFilter({ per_page: v } as Partial<ComplaintFilters>)}
                    rightSlot={
                        /* 🌟 Sembunyikan Saklar Sampah Otomatis dari Staff & Tenant */
                        canManageTrash ? <DataTableTrashToggle showTrashed={showTrashed} onChange={(show) => applyFilter({ trashed: show ? '1' : undefined, search: undefined, status: undefined } as Partial<ComplaintFilters>)} /> : null
                    }
                />

                <DataTableFilterChips configs={[{ key: 'search', value: filters.search, label: `Subjek: "${filters.search}"`, onRemove: () => applyFilter({ search: undefined } as Partial<ComplaintFilters>) }]} />

                {isPending ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                        {[1, 2, 3].map((n) => <div key={n} className="h-48 rounded-3xl border bg-card animate-pulse" />)}
                    </div>
                ) : complaints.data && complaints.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.data.map((item) => {
                            const currentStatus = statusConfig[item.status] || statusConfig.pending;
                            const isSelected = selection.selectedIds.has(item.id);

                            return (
                                <Card key={item.id} className={`rounded-3xl border shadow-sm bg-card overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                                    <CardHeader className="p-5 pb-3 space-y-2.5">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                {/* Hanya munculkan kotak seleksi massal jika memiliki hak menghapus */}
                                                {canDelete && !showTrashed && (
                                                    <Checkbox checked={isSelected} onCheckedChange={() => selection.toggle(item.id)} className="rounded-md size-4" />
                                                )}
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${currentStatus.className}`}>
                                                    {currentStatus.icon} {currentStatus.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 font-bold">
                                                <Calendar size={11}/> {item.created_at.split(' ')[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className={`font-extrabold text-foreground text-sm line-clamp-1 ${showTrashed ? 'line-through opacity-50' : ''}`}>
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-col gap-1 mt-2 text-[11px] text-muted-foreground font-semibold">
                                                <span className="flex items-center gap-1"><Building size={11} className="text-slate-400"/> {item.property_name} — Kamar {item.room_number}</span>
                                                <span className="flex items-center gap-1"><User size={11} className="text-slate-400"/> Pelapor: {item.tenant_name}</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 pt-0 pb-3 flex-1">
                                        <p className="text-xs text-muted-foreground font-medium line-clamp-3 bg-secondary/50 p-3 rounded-2xl border border-dashed">
                                            {item.description}
                                        </p>
                                        {item.response_notes && (
                                            <div className="mt-2 p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] text-emerald-700 font-medium">
                                                <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-800 mb-0.5">Respon Pengelola:</span>
                                                <span className="italic">"{item.response_notes}"</span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="p-4 bg-secondary/30 border-t flex justify-between items-center gap-2">
                                        <div>
                                            {item.attachment && (
                                                <Button type="button" variant="ghost" size="icon" className="size-8 rounded-xl text-primary hover:bg-primary/10" onClick={() => window.open(item.attachment!, '_blank')}>
                                                    <Eye size={14} />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {!showTrashed ? (
                                                <>
                                                    <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs h-8" onClick={() => modal.open(item)}>
                                                        {!isTenant ? 'Tanggapi Tiket' : 'Lihat Detail'}
                                                    </Button>

                                                    {/* 🌟 Proteksi Sisi Klien: Sembunyikan Tombol Tong Sampah Bulat Dari Staff */}
                                                    {canDelete && (
                                                        <Button size="sm" variant="ghost" className="rounded-xl size-8 p-0 text-red-500 hover:bg-red-50" onClick={() => softDelete.trigger(item)}>
                                                            <Trash2 size={13} />
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {/* Hanya muncul jika dikelola oleh Owner / SuperAdmin */}
                                                    {canManageTrash && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs h-8 border-emerald-600 text-emerald-600 hover:bg-emerald-50" onClick={() => singleRestore.trigger(item)}>
                                                                Pulihkan
                                                            </Button>
                                                            <Button size="sm" variant="destructive" className="rounded-xl font-bold text-xs h-8 bg-red-600" onClick={() => singleForceDelete.trigger(item)}>
                                                                Hapus Permanen
                                                            </Button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-[2rem] border border-dashed text-muted-foreground font-bold uppercase text-xs tracking-wider">
                        Tidak ada laporan tiket keluhan yang terekam.
                    </div>
                )}

                <DataTablePagination meta={complaints} onPageChange={goToPage} />
            </div>

            <ComplaintForm open={modal.isOpen} item={modal.item} onClose={modal.close} />

            <DeleteConfirmDialog open={softDelete.open} onOpenChange={softDelete.setOpen} description="Buang tiket keluhan ke tong sampah sementara?" onConfirm={softDelete.confirm} />
            <DeleteConfirmDialog open={singleRestore.open} onOpenChange={singleRestore.setOpen} description="Pulihkan status tiket keluhan ini?" onConfirm={singleRestore.confirm} confirmLabel="Pulihkan" />
            <DeleteConfirmDialog open={singleForceDelete.open} onOpenChange={singleForceDelete.setOpen} description="Hapus tiket aduan secara permanen?" onConfirm={singleForceDelete.confirm} />

            <BulkDeleteConfirmDialog open={bulkDelete.open} onOpenChange={bulkDelete.setOpen} count={bulkDelete.pendingCount} isDeleting={bulkDelete.isDeleting} onConfirm={bulkDelete.confirm} onCancel={bulkDelete.cancel} entityLabel="tiket komplain" />
            <BulkRestoreConfirmDialog open={bulkRestore.open} onOpenChange={bulkRestore.setOpen} count={bulkRestore.pendingCount} isRestoring={bulkRestore.isRestoring} onConfirm={bulkRestore.confirm} onCancel={bulkRestore.cancel} entityLabel="tiket komplain" />
            <BulkForceDeleteConfirmDialog open={bulkForceDelete.open} onOpenChange={bulkForceDelete.setOpen} count={bulkForceDelete.pendingCount} isDeleting={bulkForceDelete.isDeleting} onConfirm={bulkForceDelete.confirm} onCancel={bulkForceDelete.cancel} entityLabel="tiket komplain" />

            {/* Hanya muncul jika Owner / Superadmin mencentang kotak seleksi massal sampah */}
            {canDelete && (
                <DataTableBulkBar selectedCount={selection.selectedCount} selectedIds={Array.from(selection.selectedIds)} onClear={selection.clearAll} actions={bulkActions} />
            )}
        </>
    );
}

ComplaintIndex.layout = { breadcrumbs: [{ title: 'Layanan Kamar', href: '#' }, { title: 'Tiket Keluhan', href: '/complaints' }] };
