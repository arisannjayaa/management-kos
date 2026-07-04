// resources/js/pages/Rooms/columns.tsx

import { BedDouble, Building2, Layers, Wrench, CheckCircle, UserX, RotateCcw, Trash2 } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Room, RoomStatus } from '@/types/room/room-type';

type ActiveActions = {
    onEdit: (room: Room) => void;
    onDelete: (room: Room) => void;
};

type TrashedActions = {
    onRestore: (room: Room) => void;
    onForceDelete: (room: Room) => void;
};

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const renderStatusBadge = (status: RoomStatus) => {
    switch (status) {
        case 'available':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={12} /> Kosong
                </span>
            );
        case 'occupied':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <UserX size={12} /> Terisi
                </span>
            );
        case 'maintenance':
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Wrench size={12} /> Perbaikan
                </span>
            );
        default:
            return null;
    }
};

export function createRoomColumns(actions: ActiveActions): ColumnDef<Room>[] {
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
            header: 'Nomor Kamar',
            sortable: true,
            headerClassName: 'w-40',
            cell: (r) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <BedDouble size={18} />
                    </div>
                    <span className="text-base font-black tracking-tight text-foreground">
                        Kamar {r.room_number}
                    </span>
                </div>
            ),
        },
        {
            id: 'property',
            header: 'Gedung Kos',
            headerClassName: 'w-52',
            cell: (r) => (
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Building2 size={13} className="text-slate-400" />
                    <span className="truncate text-foreground font-semibold">{r.property?.name ?? '—'}</span>
                </div>
            ),
        },
        {
            id: 'room_type',
            header: 'Tipe & Harga Sewa Dasar',
            headerClassName: 'w-64',
            cell: (r) => (
                <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1">
                        <Layers size={11} className="text-amber-500" /> {r.room_type?.name ?? '—'}
                    </span>
                    <span className="font-mono text-muted-foreground">
                        {r.room_type?.base_price ? formatIDR(r.room_type.base_price) : 'Rp 0'}
                    </span>
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Kondisi Hunian',
            headerClassName: 'w-32 justify-center',
            cellClassName: 'text-center',
            sortable: true,
            cell: (r) => renderStatusBadge(r.status),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (r) => [
                <DataTableActions
                    key={r.id}
                    items={[
                        {
                            label: 'Ubah Data Kamar',
                            onClick: () => actions.onEdit(r),
                        },
                        {
                            label: 'Buang ke Sampah',
                            destructive: true,
                            onClick: () => actions.onDelete(r),
                        },
                    ]}
                />
            ],
        },
    ];
}

export function createRoomTrashedColumns(actions: TrashedActions): ColumnDef<Room>[] {
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
            header: 'Unit Kamar Terhapus',
            sortable: true,
            cell: (r) => (
                <div className="flex items-center gap-2.5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        <BedDouble size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground line-through">
                            Kamar {r.room_number}
                        </span>
                        <span className="text-xs text-muted-foreground">{r.property?.name}</span>
                    </div>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (r) => [
                <DataTableActions
                    key={r.id}
                    items={[
                        {
                            label: 'Pulihkan Unit',
                            onClick: () => actions.onRestore(r),
                        },
                        {
                            label: 'Hapus Permanen',
                            destructive: true,
                            onClick: () => actions.onForceDelete(r),
                        },
                    ]}
                />
            ],
        },
    ];
}
