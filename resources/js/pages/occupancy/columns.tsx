// resources/js/pages/Occupancies/columns.tsx

import { BedDouble, User, Calendar, Coins, CheckCircle, LogOut, Trash2 } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Occupancy } from '@/types/occupancy/occupancy-type';

type ActiveActions = {
    onCheckOut: (occupancy: Occupancy) => void;
    onDelete: (occupancy: Occupancy) => void;
    userPermissions: string[]; // Master permission untuk menyaring hak eksekusi tombol
};

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export function createOccupancyColumns(actions: ActiveActions): ColumnDef<Occupancy>[] {
    const canUpdate = actions.userPermissions.includes('occupancy.update');
    const canDelete = actions.userPermissions.includes('occupancy.delete');

    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'room_number',
            header: 'Unit Kamar',
            sortable: true,
            headerClassName: 'w-36',
            cell: (oc) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <BedDouble size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black tracking-tight text-foreground">
                            Kamar {oc.room?.room_number ?? '—'}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {oc.property?.name ?? '—'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            id: 'tenant',
            header: 'Penyewa Aktif',
            headerClassName: 'w-48',
            cell: (oc) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <User size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground truncate text-xs">
                            {oc.tenant?.name ?? '—'}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                            {oc.tenant?.phone ?? '—'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            id: 'rent_details',
            header: 'Biaya Sewa Deal',
            headerClassName: 'w-44',
            cell: (oc) => (
                <div className="flex flex-col text-xs gap-0.5">
                    <span className="font-mono font-bold text-foreground">
                        {formatIDR(oc.price)}
                    </span>
                    {oc.pricing_tier ? (
                        <span className="text-[9px] font-black tracking-wide uppercase text-amber-600 dark:text-amber-400">
                            Tier: {oc.pricing_tier.name}
                        </span>
                    ) : (
                        <span className="text-[9px] font-medium text-muted-foreground">
                            Tarif Pokok Bulanan
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: 'dates',
            header: 'Masa Sewa & Siklus',
            headerClassName: 'w-56',
            cell: (oc) => (
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                        <Calendar size={11} className="text-slate-400" />
                        {oc.start_date} s/d {oc.end_date ?? 'Berjalan'}
                    </span>
                    <span className="text-[10px]">
                        Tagihan Rutin: Tanggal <span className="font-bold text-foreground">{oc.billing_day}</span> per bulan
                    </span>
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status Kontrak',
            headerClassName: 'w-28 justify-center',
            cellClassName: 'text-center',
            sortable: true,
            cell: (oc) => (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    oc.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-slate-500/10 text-slate-500 line-through'
                }`}>
                    {oc.status === 'active' ? 'Aktif Huni' : 'Check Out'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (oc) => {
                const actionItems = [];

                if (oc.status === 'active' && canUpdate) {
                    actionItems.push({
                        label: 'Proses Check-Out',
                        icon: <LogOut size={14} className="text-amber-500" />,
                        onClick: () => actions.onCheckOut(oc),
                    });
                }

                if (canDelete) {
                    actionItems.push({
                        label: 'Hapus Log Sewa',
                        destructive: true,
                        icon: <Trash2 size={14} />,
                        onClick: () => actions.onDelete(oc),
                    });
                }

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
