// resources/js/pages/Roles/columns.tsx

import { ShieldCheck, Key, Lock, ShieldAlert } from 'lucide-react';
import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Role } from '@/types/role/role-type';

type ActiveActions = {
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
};

// Helper untuk format teks nama Role agar lebih rapi (misal: "super_admin" -> "Super Admin")
const formatRoleName = (name: string) => {
    return name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper untuk merender Ikon berdasarkan jenis Role
const renderRoleIcon = (roleName: string) => {
    switch (roleName) {
        case 'super_admin':
            return <ShieldAlert size={18} className="text-red-500" />;
        case 'owner':
            return <ShieldCheck size={18} className="text-primary" />;
        case 'staff':
            return <Key size={18} className="text-amber-500" />;
        default:
            return <Lock size={18} className="text-muted-foreground" />;
    }
};

export function createRoleColumns(actions: ActiveActions): ColumnDef<Role>[] {
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
            header: 'Nama Hak Akses',
            sortable: true,
            headerClassName: 'w-48',
            cell: (r) => {
                const isSystemRole = r.name === 'super_admin' || r.name === 'owner';

                return (
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border/50">
                            {renderRoleIcon(r.name)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold tracking-tight text-foreground">
                                {formatRoleName(r.name)}
                            </span>
                            {isSystemRole && (
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                                    Sistem Inti
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'permissions',
            header: 'Daftar Kapabilitas (Permissions)',
            cell: (r) => {
                const perms = r.permissions || [];

                if (perms.length === 0) {
                    return (
                        <span className="text-xs font-medium italic text-muted-foreground/50">
                            Tidak ada hak akses
                        </span>
                    );
                }

                // Tampilkan maksimal 4 permission awal, sisanya disembunyikan agar UI tidak penuh
                const displayPerms = perms.slice(0, 4);
                const remaining = perms.length - 4;

                return (
                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {displayPerms.map((p) => (
                            <span
                                key={p.id}
                                className="inline-flex items-center rounded-md border border-border/50 bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                            >
                                {p.name}
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                +{remaining} lainnya
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            headerClassName: 'w-16',
            cell: (r) => {
                const actionItems = [];

                // Aturan Sistem: Super Admin tidak bisa di-edit & di-hapus
                const isSuperAdmin = r.name === 'super_admin';
                // Aturan Sistem: Owner bisa di-edit permission-nya, tapi tidak bisa dihapus
                const isOwner = r.name === 'owner';

                if (!isSuperAdmin) {
                    actionItems.push({
                        label: 'Edit Akses',
                        onClick: () => actions.onEdit(r),
                    });
                }

                if (!isSuperAdmin && !isOwner) {
                    actionItems.push({
                        label: 'Hapus Role',
                        destructive: true,
                        onClick: () => actions.onDelete(r),
                    });
                }

                // Jika super_admin, kita tampilkan tombol action palsu atau kosong agar UI rapi
                if (actionItems.length === 0) {
                    actionItems.push({
                        label: 'Terkunci (Sistem)',
                        onClick: () => {},
                    });
                }

                return <DataTableActions items={actionItems} />;
            },
        },
    ];
}
