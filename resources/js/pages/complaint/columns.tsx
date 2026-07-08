import type { ColumnDef } from '@/types/datatable';
import { DataTableActions } from '@/components/datatable';
import type { Complaint } from '@/types/complaint/complaint-type';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActiveActions = { onEdit: (item: Complaint) => void; onDelete: (item: Complaint) => void; isAdminOrStaff: boolean; };
type TrashedActions = { onRestore: (item: Complaint) => void; onForceDelete: (item: Complaint) => void; };

const getStatusBadge = (status: string) => {
    const maps: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        processing: 'bg-blue-100 text-blue-700 border-blue-200',
        resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return <span className={`px-2.5 py-0.5 border text-xs font-bold rounded-full uppercase tracking-wider ${maps[status]}`}>{status}</span>;
};

export function createComplaintColumns(actions: ActiveActions): ColumnDef<Complaint>[] {
    return [
        { id: 'no', header: '#', cell: (_r, i, off) => off + i + 1 },
        { id: 'title', header: 'Judul Keluhan', sortable: true, cell: (c) => c.title },
        { id: 'room', header: 'Unit Kamar', cell: (c) => `${c.property_name} — Kamar ${c.room_number}` },
        { id: 'tenant_name', header: 'Pelapor', cell: (c) => c.tenant_name },
        { id: 'status', header: 'Status Tiket', sortable: true, cell: (c) => getStatusBadge(c.status) },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => (
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.attachment && (
                        <Button type="button" variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => window.open(item.attachment!, '_blank')}>
                            <Eye size={13} />
                        </Button>
                    )}
                    <DataTableActions items={[
                        { label: actions.isAdminOrStaff ? 'Tanggapi / Ubah Status' : 'Lihat / Edit', onClick: () => actions.onEdit(item) },
                        { label: 'Buang ke Sampah', destructive: true, onClick: () => actions.onDelete(item) },
                    ]} />
                </div>
            ),
        },
    ];
}

export function createComplaintTrashedColumns(actions: TrashedActions): ColumnDef<Complaint>[] {
    return [
        { id: 'no', header: '#', cell: (_r, i, off) => off + i + 1 },
        { id: 'title', header: 'Judul Keluhan', cell: (c) => <span className="line-through">{c.title}</span> },
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
