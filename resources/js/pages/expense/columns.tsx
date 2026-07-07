import type { ColumnDef } from '@/types/datatable';
import { DataTableActions } from '@/components/datatable';
import type { Expense } from '@/types/expense/expense-type';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActiveActions = { onEdit: (item: Expense) => void; onDelete: (item: Expense) => void; };
type TrashedActions = { onRestore: (item: Expense) => void; onForceDelete: (item: Expense) => void; };

export function createExpenseColumns(actions: ActiveActions): ColumnDef<Expense>[] {
    return [
        { id: 'no', header: '#', cell: (_row, index, offset) => offset + index + 1 },
        { id: 'expense_date', header: 'Tanggal', sortable: true, cell: (c) => c.expense_date },
        { id: 'property_name', header: 'Gedung', cell: (c) => c.property_name },
        { id: 'category_name', header: 'Kategori', cell: (c) => c.category_name },
        {
            id: 'amount',
            header: 'Nominal',
            sortable: true,
            cellClassName: 'font-mono text-red-500 font-bold',
            cell: (c) => `Rp ${c.amount.toLocaleString('id-ID')}`
        },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => (
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.receipt_attachment && (
                        <Button type="button" variant="outline" size="icon" className="size-8"
                                onClick={() => window.open(item.receipt_attachment!, '_blank')}>
                            <Eye size={13} />
                        </Button>
                    )}
                    <DataTableActions items={[
                        { label: 'Ubah Data', onClick: () => actions.onEdit(item) },
                        { label: 'Buang ke Sampah', destructive: true, onClick: () => actions.onDelete(item) }
                    ]} />
                </div>
            )
        }
    ];
}

export function createExpenseTrashedColumns(actions: TrashedActions): ColumnDef<Expense>[] {
    return [
        { id: 'no', header: '#', cell: (_row, index, offset) => offset + index + 1 },
        { id: 'expense_date', header: 'Tanggal', cell: (c) => <span className="line-through">{c.expense_date}</span> },
        { id: 'property_name', header: 'Gedung', cell: (c) => c.property_name },
        {
            id: 'amount',
            header: 'Nominal',
            cellClassName: 'font-mono text-red-500',
            cell: (c) => `Rp ${c.amount.toLocaleString('id-ID')}`
        },
        { id: 'deleted_at', header: 'Dihapus Pada', sortable: true, cell: (c) => c.deleted_at },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => [
                <DataTableActions key={item.id} items={[
                    { label: 'Pulihkan', onClick: () => actions.onRestore(item) },
                    { label: 'Hapus Permanen', destructive: true, onClick: () => actions.onForceDelete(item) }
                ]} />
            ]
        }
    ];
}
