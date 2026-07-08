import type { ColumnDef } from '@/types/datatable';
import { DataTableActions } from '@/components/datatable';
import type { Tenant } from '@/types/tenant/tenant-type';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActiveActions = { onEdit: (item: Tenant) => void; onDelete: (item: Tenant) => void; };
type TrashedActions = { onRestore: (item: Tenant) => void; onForceDelete: (item: Tenant) => void; };

export function createTenantColumns(actions: ActiveActions): ColumnDef<Tenant>[] {
    return [
        { id: 'no', header: '#', cell: (_row, index, offset) => offset + index + 1 },
        { id: 'name', header: 'Nama Penyewa', sortable: true, cell: (c) => <span className="font-bold text-foreground">{c.name}</span> },
        { id: 'email', header: 'Email Akun', cell: (c) => <span className="text-muted-foreground">{c.email}</span> },
        { id: 'phone', header: 'No. WhatsApp', cell: (c) => <code className="font-mono text-xs font-bold">{c.phone}</code> },
        {
            id: 'status',
            header: 'Status',
            cell: (c) => c.status === 'active'
                ? <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-emerald-50 text-emerald-700 border-emerald-200">AKTIF</span>
                : <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-slate-50 text-slate-600 border-slate-200">NONAKTIF</span>
        },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => (
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.ktp_attachment && (
                        <Button type="button" variant="outline" size="icon" className="size-8 rounded-xl" onClick={() => window.open(item.ktp_attachment!, '_blank')}>
                            <Eye size={13} />
                        </Button>
                    )}
                    <DataTableActions items={[
                        { label: 'Ubah Profil', onClick: () => actions.onEdit(item) },
                        { label: 'Buang ke Sampah', destructive: true, onClick: () => actions.onDelete(item) },
                    ]} />
                </div>
            ),
        },
    ];
}

export function createTenantTrashedColumns(actions: TrashedActions): ColumnDef<Tenant>[] {
    return [
        { id: 'no', header: '#', cell: (_row, index, offset) => offset + index + 1 },
        { id: 'name', header: 'Nama Penyewa', cell: (c) => <span className="line-through text-muted-foreground">{c.name}</span> },
        { id: 'phone', header: 'No. WhatsApp', cell: (c) => <span className="line-through font-mono text-xs">{c.phone}</span> },
        { id: 'deleted_at', header: 'Dihapus Pada', sortable: true, cell: (c) => c.deleted_at },
        {
            id: 'actions', header: 'Aksi', align: 'right',
            cell: (item) => [
                <DataTableActions key={item.id} items={[
                    { label: 'Pulihkan Profil', onClick: () => actions.onRestore(item) },
                    { label: 'Hapus Permanen', destructive: true, onClick: () => actions.onForceDelete(item) },
                ]} />
            ],
        },
    ];
}
