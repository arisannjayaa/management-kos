// resources/js/pages/RoomTypes/columns.tsx

import { Layers, Building2, Layers2, Edit3, Trash2 } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { RoomType } from '@/types/room/room-type';

type ActiveActions = {
    onEdit: (roomType: RoomType) => void;
    onDelete: (roomType: RoomType) => void;
};

// Helper Format Rupiah
const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export function createRoomTypeColumns(actions: ActiveActions): ColumnDef<RoomType>[] {
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
            header: 'Klasifikasi Tipe Kamar',
            sortable: true,
            headerClassName: 'w-64',
            cell: (rt) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Layers size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold tracking-tight text-foreground">
                            {rt.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 size={11} /> {rt.property?.name ?? '—'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            id: 'base_price',
            header: 'Harga Sewa Dasar',
            sortable: true,
            headerClassName: 'w-44',
            cellClassName: 'font-mono font-bold text-foreground',
            cell: (rt) => formatIDR(rt.base_price),
        },
        {
            id: 'pricing_tiers',
            header: 'Opsi Tarif Berjenjang',
            headerClassName: 'w-72',
            cell: (rt) => {
                const tiers = rt.pricing_tiers || [];
                if (tiers.length === 0) {
                    return (
                        <span className="text-xs italic text-muted-foreground/60">
                            Hanya tarif dasar (Single Tier)
                        </span>
                    );
                }

                return (
                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {tiers.map((tier) => (
                            <span
                                key={tier.id}
                                className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-foreground"
                            >
                                <span className="font-semibold text-muted-foreground mr-1">{tier.name}:</span>
                                <span className="font-mono font-bold text-primary">{formatIDR(tier.price)}</span>
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            id: 'rooms_count',
            header: 'Total Kamar',
            headerClassName: 'w-24 text-center',
            cellClassName: 'text-center font-semibold text-muted-foreground',
            cell: (rt) => (
                <span className={rt.rooms_count ? 'text-foreground font-bold' : ''}>
                    {rt.rooms_count ?? 0} Unit
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (rt) => [
                <DataTableActions
                    key={rt.id}
                    items={[
                        {
                            label: 'Ubah Spesifikasi',
                            onClick: () => actions.onEdit(rt),
                        },
                        {
                            label: 'Hapus Kategori',
                            destructive: true,
                            onClick: () => actions.onDelete(rt),
                        },
                    ]}
                />
            ],
        },
    ];
}
