// resources/js/pages/Properties/columns.tsx

import { Building2, MapPin, Phone, Calendar, MessageSquare } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Property } from '@/types/property/property-type';

type ActiveActions = {
    onEdit: (property: Property) => void;
    onDelete: (property: Property) => void;
};

type TrashedActions = {
    onRestore: (property: Property) => void;
    onForceDelete: (property: Property) => void;
};

const renderStatusBadge = (isActive: boolean) => {
    if (isActive) {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Aktif
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
            Nonaktif
        </span>
    );
};

export function createPropertyColumns(actions: ActiveActions): ColumnDef<Property>[] {
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
            header: 'Properti Kos',
            sortable: true,
            headerClassName: 'w-64',
            cell: (p) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <Building2 size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold tracking-tight text-foreground">
                            {p.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={11} /> {p.city}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            id: 'contact',
            header: 'Alamat & Kontak',
            headerClassName: 'w-72',
            cell: (p) => (
                <div className="flex flex-col gap-1 max-w-[260px]">
                    <span className="text-xs font-medium text-foreground line-clamp-1">
                        {p.address}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                        <Phone size={11} /> {p.phone}
                    </span>
                </div>
            ),
        },
        {
            id: 'units',
            header: 'Kapasitas',
            headerClassName: 'w-32 text-center',
            cellClassName: 'text-center',
            cell: (p) => (
                <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-sm font-bold text-foreground">
                        {p.rooms_count ?? 0}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {p.room_types_count ?? 0} Tipe Kamar
                    </span>
                </div>
            ),
        },
        {
            id: 'billing_settings',
            header: 'Aturan Billing & WA',
            headerClassName: 'w-48',
            cell: (p) => (
                <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1 font-medium text-muted-foreground">
                        <Calendar size={12} className="text-primary" /> Siklus: {p.billing_cycle_days} Hari
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            Tenggang: {p.billing_grace_period_days} H
                        </span>
                        {p.wa_reminder_enabled && (
                            <span title="WhatsApp Gateway Otomatis Aktif" className="flex items-center text-emerald-500">
                                <MessageSquare size={12} className="fill-emerald-500/10" />
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: 'is_active',
            header: 'Status',
            headerClassName: 'w-24 justify-center',
            cellClassName: 'text-center',
            sortable: true,
            cell: (p) => renderStatusBadge(p.is_active),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (p) => [
                <DataTableActions
                    key={p.id}
                    items={[
                        {
                            label: 'Ubah Properti',
                            onClick: () => actions.onEdit(p),
                        },
                        {
                            label: 'Buang ke Sampah',
                            destructive: true,
                            onClick: () => actions.onDelete(p),
                        },
                    ]}
                />
            ],
        },
    ];
}

export function createPropertyTrashedColumns(actions: TrashedActions): ColumnDef<Property>[] {
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
            header: 'Properti Terhapus',
            sortable: true,
            cell: (p) => (
                <div className="flex items-center gap-2.5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        <Building2 size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold tracking-tight text-foreground line-through">
                            {p.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {p.city}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            id: 'deleted_at',
            header: 'Dihapus Pada',
            sortable: true,
            defaultSortDirection: 'desc',
            headerClassName: 'w-48',
            cellClassName: 'text-sm text-red-500 dark:text-red-400',
            cell: (p) =>
                p.deleted_at
                    ? new Date(p.deleted_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : '—',
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (p) => [
                <DataTableActions
                    key={p.id}
                    items={[
                        {
                            label: 'Pulihkan Properti',
                            onClick: () => actions.onRestore(p),
                        },
                        {
                            label: 'Hapus Permanen',
                            destructive: true,
                            onClick: () => actions.onForceDelete(p),
                        },
                    ]}
                />
            ],
        },
    ];
}
