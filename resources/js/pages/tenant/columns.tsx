// resources/js/pages/Tenants/columns.tsx

import { User, Phone, CreditCard, Activity, Edit3, Trash2 } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Tenant } from '@/types/tenant/tenant-type';

type ActiveActions = {
    onEdit: (tenant: Tenant) => void;
    onDelete: (tenant: Tenant) => void;
    userPermissions: string[]; // 🌟 Tampung master permission user login untuk gate proteksi
};

export function createTenantColumns(actions: ActiveActions): ColumnDef<Tenant>[] {
    // Cek kapabilitas user secara realtime di baris tabel
    const canUpdate = actions.userPermissions.includes('tenant.update');
    const canDelete = actions.userPermissions.includes('tenant.delete');

    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'name',
            header: 'Nama Lengkap Penyewa',
            sortable: true,
            headerClassName: 'w-64',
            cell: (t) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <User size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold tracking-tight text-foreground">
                            {t.name}
                        </span>
                        {t.ktp_number && (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                                <CreditCard size={11} /> {t.ktp_number}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: 'phone',
            header: 'Kontak & Darurat',
            headerClassName: 'w-60',
            cell: (t) => (
                <div className="flex flex-col gap-0.5 text-xs">
                    <span className="flex items-center gap-1 font-mono font-semibold text-foreground">
                        <Phone size={12} className="text-emerald-500" /> {t.phone}
                    </span>
                    {t.emergency_contact && (
                        <span className="text-[10px] text-muted-foreground">
                            Darurat: <span className="font-mono">{t.emergency_contact}</span>
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: 'occupancies_count',
            header: 'Status Kontrak',
            headerClassName: 'w-36 text-center',
            cellClassName: 'text-center',
            cell: (t) => {
                const hasContract = (t.occupancies_count ?? 0) > 0;
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        hasContract
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-slate-500/10 text-slate-500'
                    }`}>
                        {hasContract ? 'Miliki Kontrak' : 'Belum Huni'}
                    </span>
                );
            },
        },
        {
            id: 'status',
            header: 'Status Akun',
            headerClassName: 'w-24 justify-center',
            cellClassName: 'text-center',
            sortable: true,
            cell: (t) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    t.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-600'
                }`}>
                    {t.status === 'active' ? 'Aktif' : 'Pindahan'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (t) => {
                const actionItems = [];

                // Inject menu aksi secara kondisional berdasarkan Spatie permission gate
                if (canUpdate) {
                    actionItems.push({
                        label: 'Ubah Profil',
                        icon: <Edit3 size={14} />,
                        onClick: () => actions.onEdit(t),
                    });
                }

                if (canDelete) {
                    actionItems.push({
                        label: 'Hapus Penyewa',
                        destructive: true,
                        icon: <Trash2 size={14} />,
                        onClick: () => actions.onDelete(t),
                    });
                }

                // Fallback jika user adalah staff tanpa permission edit/delete
                if (actionItems.length === 0) {
                    actionItems.push({
                        label: 'Aksi Terkunci',
                        disabled: true,
                        onClick: () => {},
                    });
                }

                return <DataTableActions items={actionItems} />;
            },
        },
    ];
}
