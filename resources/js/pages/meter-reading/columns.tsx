// resources/js/pages/MeterReadings/columns.tsx

import { Gauge, Calendar, Lock, Unlock, Zap, Droplet, Trash2 } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { MeterReading } from '@/types/meter-reading/meter-reading-type';

type ActiveActions = {
    onDelete: (item: MeterReading) => void;
};

type TrashedActions = {
    onRestore: (item: MeterReading) => void;
    onForceDelete: (item: MeterReading) => void;
};

export function createMeterReadingColumns(actions: ActiveActions): ColumnDef<MeterReading>[] {
    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'reading_date',
            header: 'Tanggal Catat',
            sortable: true,
            headerClassName: 'w-36',
            cell: (m) => (
                <div className="flex items-center gap-1.5 font-bold font-mono">
                    <Calendar size={13} className="text-muted-foreground" />
                    {m.reading_date}
                </div>
            ),
        },
        {
            id: 'room',
            header: 'Unit Kamar',
            headerClassName: 'w-40',
            cell: (m) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-black text-sm text-foreground">Kamar {m.room_number}</span>
                    <span className="text-xs text-muted-foreground">{m.tenant_name}</span>
                </div>
            ),
        },
        {
            id: 'utility',
            header: 'Beban Utilitas',
            headerClassName: 'w-44',
            cell: (m) => (
                <span className="flex items-center gap-1 font-bold text-foreground">
                    {m.charge_type_name.toLowerCase().includes('listrik') ? (
                        <Zap size={13} className="text-amber-500 fill-amber-500/10" />
                    ) : (
                        <Droplet size={13} className="text-blue-500 fill-blue-500/10" />
                    )}
                    {m.charge_type_name}
                </span>
            ),
        },
        {
            id: 'indicator',
            header: 'Indikator (Lalu → Baru)',
            headerClassName: 'w-48 text-center',
            cellClassName: 'text-center font-mono text-xs text-slate-500',
            cell: (m) => (
                <>
                    {m.previous_reading}
                    <span className="mx-2 text-slate-400/60 select-none">→</span>
                    <span className="font-bold text-foreground">{m.current_reading}</span>
                </>
            ),
        },
        {
            id: 'usage',
            header: 'Volume Pakai',
            headerClassName: 'w-36 text-center',
            cellClassName: 'text-center font-mono font-black text-blue-600 bg-blue-500/5',
            cell: (m) => `${m.usage} ${m.unit_label}`,
        },
        {
            id: 'amount',
            header: 'Rupiah Beban',
            headerClassName: 'w-40 text-right',
            cellClassName: 'text-right font-mono font-black text-sm text-foreground',
            cell: (m) => `Rp ${m.amount.toLocaleString('id-ID')}`,
        },
        {
            id: 'status',
            header: 'Status',
            headerClassName: 'w-36 justify-center',
            cellClassName: 'text-center',
            cell: (m) => m.is_locked ? (
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-600">
                    <Lock size={10} className="mr-1" /> Locked
                </span>
            ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                    <Unlock size={10} className="mr-1" /> Open
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (m) => !m.is_locked ? [
                <DataTableActions
                    key={m.id}
                    items={[
                        {
                            label: 'Anulir Catatan',
                            destructive: true,
                            onClick: () => actions.onDelete(m),
                        },
                    ]}
                />
            ] : [
                <div key={m.id} className="pr-3 text-muted-foreground/40" title="Data terkunci invoice"><Lock size={12}/></div>
            ],
        },
    ];
}

export function createMeterReadingTrashedColumns(actions: TrashedActions): ColumnDef<MeterReading>[] {
    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'room',
            header: 'Kamar Terhapus',
            cell: (m) => (
                <div className="flex items-center gap-2.5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <Gauge size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold tracking-tight text-foreground line-through">Kamar {m.room_number}</span>
                        <span className="text-xs text-muted-foreground">{m.charge_type_name} ({m.usage} {m.unit_label})</span>
                    </div>
                </div>
            ),
        },
        {
            id: 'deleted_at',
            header: 'Dihapus Pada',
            sortable: true,
            headerClassName: 'w-48',
            cellClassName: 'text-sm text-red-500',
            cell: (m) => m.deleted_at ? new Date(m.deleted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (m) => [
                <DataTableActions
                    key={m.id}
                    items={[
                        {
                            label: 'Pulihkan Catatan',
                            onClick: () => actions.onRestore(m),
                        },
                        {
                            label: 'Hapus Permanen',
                            destructive: true,
                            onClick: () => actions.onForceDelete(m),
                        },
                    ]}
                />
            ],
        },
    ];
}
