// resources/js/pages/Invoices/columns.tsx

import { Eye, Ban, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button'; // 🌟 IMPORT BUTTON COMPONENT ASLI
import type { ColumnDef } from '@/types/datatable';
import type { Invoice, InvoiceStatus } from '@/types/invoice/invoice-type';
import { cn } from '@/lib/utils';

type ActiveActions = {
    onView: (invoice: Invoice) => void;
    onPay: (invoice: Invoice) => void;
    onVoid: (invoice: Invoice) => void;
    canPay: boolean;
    canVoid: boolean;
};

type TrashedActions = {
    onRestore: (invoice: Invoice) => void;
    onForceDelete: (invoice: Invoice) => void;
};

const getStatusBadge = (status: InvoiceStatus) => {
    const styles: Record<InvoiceStatus, string> = {
        paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        partially_paid: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        unpaid: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        void: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
    };
    const labels: Record<InvoiceStatus, string> = {
        paid: 'LUNAS',
        partially_paid: 'DICICIL',
        unpaid: 'BELUM BAYAR',
        void: 'VOID',
    };
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border uppercase tracking-wider", styles[status])}>
            {labels[status]}
        </span>
    );
};

export function createInvoiceColumns(actions: ActiveActions): ColumnDef<Invoice>[] {
    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'invoice_number',
            header: 'No. Invoice',
            sortable: true,
            headerClassName: 'w-44',
            cellClassName: 'font-mono font-bold text-foreground',
            cell: (inv) => inv.invoice_number,
        },
        {
            id: 'property',
            header: 'Gedung / Kamar',
            headerClassName: 'w-56',
            cell: (inv) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground">{inv.property?.name ?? '—'}</span>
                    <span className="text-[11px] text-muted-foreground">Nomor Unit: Kamar {inv.room?.room_number ?? '—'}</span>
                </div>
            ),
        },
        {
            id: 'tenant',
            header: 'Nama Penyewa',
            headerClassName: 'w-44',
            cellClassName: 'font-bold text-foreground',
            cell: (inv) => inv.tenant?.name ?? '—',
        },
        {
            id: 'due_date',
            header: 'Jatuh Tempo',
            sortable: true,
            headerClassName: 'w-36',
            cell: (inv) => (
                <div className="flex items-center gap-1 font-semibold text-slate-500 font-mono text-xs">
                    <Calendar size={12} /> {inv.due_date}
                </div>
            ),
        },
        {
            id: 'final_amount',
            header: 'Total Tagihan',
            sortable: true,
            headerClassName: 'w-40 text-right',
            cellClassName: 'text-right font-bold text-foreground font-mono',
            cell: (inv) => `Rp ${inv.final_amount.toLocaleString('id-ID')}`,
        },
        {
            id: 'paid_amount',
            header: 'Sudah Dibayar',
            headerClassName: 'w-40 text-right',
            cellClassName: 'text-right font-semibold text-emerald-600 font-mono',
            cell: (inv) => `Rp ${inv.paid_amount.toLocaleString('id-ID')}`,
        },
        {
            id: 'status',
            header: 'Status',
            headerClassName: 'w-32 justify-center',
            cellClassName: 'text-center',
            sortable: true,
            cell: (inv) => getStatusBadge(inv.status),
        },
        {
            id: 'actions',
            header: 'Aksi Cepat',
            align: 'right',
            headerClassName: 'w-44',
            cell: (inv) => (
                /* 🌟 KEMBALI KE STYLE ASLI ANDA: Tampil telanjang berdampingan di baris tabel */
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg animate-in fade-in"
                        onClick={() => actions.onView(inv)}
                    >
                        <Eye size={13} />
                    </Button>

                    {actions.canPay && !['paid', 'void'].includes(inv.status) && (
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider px-3 bg-primary text-primary-foreground hover:bg-primary/90 animate-in zoom-in-95"
                            onClick={() => actions.onPay(inv)}
                        >
                            Bayar
                        </Button>
                    )}

                    {actions.canVoid && inv.status !== 'void' && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 animate-in fade-in"
                            onClick={() => actions.onVoid(inv)}
                        >
                            <Ban size={13} />
                        </Button>
                    )}
                </div>
            ),
        },
    ];
}

export function createInvoiceTrashedColumns(actions: TrashedActions): ColumnDef<Invoice>[] {
    return [
        {
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-muted-foreground',
            cell: (_row, index, offset) => offset + index + 1,
        },
        {
            id: 'invoice_number',
            header: 'Nota Terhapus',
            cell: (inv) => (
                <div className="flex items-center gap-2.5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <Ban size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono font-bold text-foreground line-through">{inv.invoice_number}</span>
                        <span className="text-xs text-muted-foreground">Penyewa: {inv.tenant?.name} (Kamar {inv.room?.room_number})</span>
                    </div>
                </div>
            ),
        },
        {
            id: 'deleted_at',
            header: 'Dihapus Pada',
            sortable: true,
            headerClassName: 'w-48',
            cellClassName: 'text-sm text-red-500 font-mono',
            cell: (inv) => inv.deleted_at ? new Date(inv.deleted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-36',
            cell: (inv) => (
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold uppercase" onClick={() => actions.onRestore(inv)}>
                        Pulihkan
                    </Button>
                    <Button type="button" size="sm" variant="destructive" className="h-8 rounded-lg text-[10px] font-bold uppercase" onClick={() => actions.onForceDelete(inv)}>
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];
}
