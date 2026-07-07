import type { ColumnDef } from '@/types/datatable';
import { DataTableActions } from '@/components/datatable';
import type { ExpenseCategory } from '@/types/expense/expense-category-type';

type ActiveActions = { onEdit: (item: ExpenseCategory) => void; onDelete: (item: ExpenseCategory) => void; };
type TrashedActions = { onRestore: (item: ExpenseCategory) => void; onForceDelete: (item: ExpenseCategory) => void; };

export function createExpenseCategoryColumns(actions: ActiveActions): ColumnDef<ExpenseCategory>[] {
    return [
        { id: 'no', header: '#', cell: (_row, index, offset) => offset + index + 1 },
        { id: 'name', header: 'Nama Kategori', sortable: true, cell: (c) => c.name },
        { id: 'description', header: 'Deskripsi', cell: (c) => c.description ?? '—' },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => [
                <DataTableActions key={item.id} items={[
                    { label: 'Ubah ...', onClick: () => actions.onEdit(item) },
                    { label: 'Buang ke Sampah', destructive: true, onClick: () => actions.onDelete(item) },
                ]} />
            ],
        },
    ];
}

export function createExpenseCategoryTrashedColumns(actions: TrashedActions): ColumnDef<ExpenseCategory>[] {
    return [
        { id: 'no', header: '#', cell: (_row, index, offset) => offset + index + 1 },
        { id: 'name', header: 'Nama Kategori', cell: (c) => <span className="line-through">{c.name}</span> },
        { id: 'deleted_at', header: 'Dihapus Pada', sortable: true, cell: (c) => c.deleted_at },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => [
                <DataTableActions key={item.id} items={[
                    { label: 'Pulihkan', onClick: () => actions.onRestore(item) },
                    { label: 'Hapus Permanen', destructive: true, onClick: () => actions.onForceDelete(item) },
                ]} />
            ],
        },
    ];
}
