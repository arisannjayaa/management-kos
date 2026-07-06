// resources/js/pages/Payments/columns.tsx

import { Receipt, Calendar, User, Eye, Ban, CreditCard, Wallet } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Payment } from '@/types/payment/payment-type';

type ActiveActions = {
    onAnnul: (payment: Payment) => void;
    canDelete: boolean;
};

export function createPaymentColumns(actions: ActiveActions): ColumnDef<Payment>[] {
    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'payment_number',
            header: 'No. Kuitansi',
            sortable: true,
            headerClassName: 'w-44',
            cellClassName: 'font-mono font-bold text-foreground',
            cell: (p) => p.payment_number,
        },
        {
            id: 'invoice_number',
            header: 'Referensi Invoice',
            headerClassName: 'w-44',
            cellClassName: 'font-mono text-xs text-muted-foreground',
            cell: (p) => p.invoice_number,
        },
        {
            id: 'room',
            header: 'Gedung / Kamar',
            headerClassName: 'w-56',
            cell: (p) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground">{p.property_name}</span>
                    <span className="text-[11px] text-muted-foreground">Kamar {p.room_number} — {p.tenant_name}</span>
                </div>
            ),
        },
        {
            id: 'payment_date',
            header: 'Tanggal Setor',
            sortable: true,
            headerClassName: 'w-40',
            cell: (p) => (
                <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                    <Calendar size={12} /> {p.payment_date}
                </div>
            ),
        },
        {
            id: 'method',
            header: 'Metode',
            headerClassName: 'w-32 justify-center',
            cellClassName: 'text-center',
            cell: (p) => p.payment_method === 'transfer' ? (
                <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                    <CreditCard size={11} className="mr-1" /> Bank
                </span>
            ) : (
                <span className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-600">
                    <Wallet size={11} className="mr-1" /> Tunai
                </span>
            ),
        },
        {
            id: 'amount_paid',
            header: 'Dana Masuk',
            sortable: true,
            headerClassName: 'w-40 text-right',
            cellClassName: 'text-right font-mono font-black text-sm text-emerald-600',
            cell: (p) => `Rp ${p.amount_paid.toLocaleString('id-ID')}`,
        },
        {
            id: 'receiver',
            header: 'Petugas',
            headerClassName: 'w-36',
            cell: (p) => (
                <span className="flex items-center gap-1 font-medium text-muted-foreground">
                    <User size={11} /> {p.receiver_name}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (p) => {
                const items = [];
                if (p.proof_attachment) {
                    items.push({
                        label: 'Lihat Struk Transfer',
                        icon: <Eye size={12} className="mr-2" />,
                        onClick: () => window.open(p.proof_attachment!, '_blank'),
                    });
                }
                if (actions.canDelete) {
                    items.push({
                        label: 'Anulir Kuitansi',
                        icon: <Ban size={12} className="mr-2" />,
                        destructive: true,
                        onClick: () => actions.onAnnul(p),
                    });
                }
                return items.length > 0 ? [<DataTableActions key={p.id} items={items} />] : [];
            },
        },
    ];
}
