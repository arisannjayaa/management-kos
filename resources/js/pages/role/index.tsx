// resources/js/pages/Roles/index.tsx

import { Head, router } from '@inertiajs/react';
import { PlusIcon, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
} from '@/components/datatable';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';

import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useModalForm } from '@/hooks/use-modal-form';

import { MobileList } from '@/pages/role/mobile-list';
import { createRoleColumns } from '@/pages/role/columns';
import { RoleFormModal } from '@/pages/role/form';

import type { Role, RoleFilters, Permission } from '@/types/role/role-type';
import type { PaginatedResponse } from '@/types/pagination';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    roles: PaginatedResponse<Role>;
    filters: RoleFilters;
    permissions: Permission[]; // Master data permission dari backend
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoleIndex({
                                      roles,
                                      filters,
                                      permissions = [],
                                  }: Props) {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Gunakan URL endpoint root untuk modul Role
    const { applyFilter, goToPage, isPending, applySort } =
        useDatatable<RoleFilters>('/roles', filters);

    // Handler Pencarian
    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        400,
        (value) => {
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<RoleFilters>);
            }
        },
    );

    // State Manajemen Form & Konfirmasi Hapus
    const modal = useModalForm<Role>();
    const [deleteItem, setDeleteItem] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Handler Hapus Data
    const handleDeleteConfirm = () => {
        if (!deleteItem) return;
        setIsDeleting(true);

        router.delete(`/roles/delete/${deleteItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteItem(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false),
            onFinish: () => setIsDeleting(false),
        });
    };

    // Konfigurasi Kolom Tabel (Desktop)
    const columns = useMemo(() => {
        return createRoleColumns({
            onEdit: (role) => modal.open(role),
            onDelete: (role) => setDeleteItem(role),
        });
    }, [modal]);

    // ─── RENDER MOBILE LAYOUT ───
    if (mounted && isMobile) {
        return (
            <>
                <Head title="Hak Akses & Kapabilitas" />
                <MobileList
                    initialRoles={roles}
                    filters={filters}
                    onAdd={() => modal.open()}
                    onEdit={(role) => modal.open(role)}
                    onDelete={(role) => setDeleteItem(role)}
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    isPending={isPending}
                />

                <RoleFormModal
                    open={modal.isOpen}
                    item={modal.item}
                    availablePermissions={permissions}
                    onClose={modal.close}
                />

                <DeleteConfirmDialog
                    open={!!deleteItem}
                    onOpenChange={(isOpen) => !isOpen && setDeleteItem(null)}
                    description={
                        <>
                            Hapus permanen hak akses{' '}
                            <span className="font-bold text-foreground">
                                "{deleteItem?.name}"
                            </span>
                            ? Pengguna yang terikat pada peran ini mungkin akan kehilangan hak akses mereka.
                        </>
                    }
                    isDeleting={isDeleting}
                    onConfirm={handleDeleteConfirm}
                />
            </>
        );
    }

    // ─── RENDER DESKTOP LAYOUT ───
    return (
        <>
            <Head title="Manajemen Hak Akses" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                            <ShieldCheck size={24} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Hak Akses (Roles)
                            </h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Total <span className="font-medium text-foreground">{roles.total}</span> tingkat akses terdaftar di sistem.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => modal.open()}
                        className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-xl h-11 px-5"
                    >
                        <PlusIcon className="mr-2 size-4" /> Buat Akses Baru
                    </Button>
                </div>

                {/* Toolbar Section (Search Only) */}
                <DataTableToolbar
                    searchValue={searchValue}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari nama akses atau kapabilitas..."
                    activeFilterCount={0} // Tidak ada filter lanjutan untuk role
                    filterFields={[]} // Filter kosong
                    onClearFilters={() => {}}
                    perPage={filters.per_page ?? 10}
                    onPerPageChange={(v) =>
                        applyFilter({ per_page: v } as Partial<RoleFilters>)
                    }
                />

                {/* Chips Filter Aktif */}
                <DataTableFilterChips
                    configs={[
                        {
                            key: 'search',
                            value: filters.search,
                            label: `Pencarian: "${filters.search}"`,
                            onRemove: () =>
                                applyFilter({
                                    search: undefined,
                                } as Partial<RoleFilters>),
                        },
                    ]}
                />

                {/* Main Table */}
                <DataTable
                    data={roles}
                    columns={columns}
                    getRowId={(d) => d.id}
                    sort={filters.sort}
                    direction={filters.direction}
                    onSort={applySort}
                    isPending={isPending}
                    emptyText="Belum ada data Role yang terdaftar."
                />

                {/* Pagination */}
                <DataTablePagination meta={roles} onPageChange={goToPage} />
            </div>

            {/* Modals & Dialogs */}
            <RoleFormModal
                open={modal.isOpen}
                item={modal.item}
                availablePermissions={permissions}
                onClose={modal.close}
            />

            <DeleteConfirmDialog
                open={!!deleteItem}
                onOpenChange={(isOpen) => !isOpen && setDeleteItem(null)}
                description={
                    <>
                        Apakah Anda yakin ingin menghapus hak akses{' '}
                        <span className="font-bold text-foreground">
                            "{deleteItem?.name}"
                        </span>
                        ? Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}

RoleIndex.layout = {
    breadcrumbs: [
        { title: 'Sistem Inti', href: '#' },
        { title: 'Hak Akses & Kapabilitas', href: '/roles' },
    ],
};
