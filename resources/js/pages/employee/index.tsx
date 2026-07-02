// resources/js/pages/employee/index.tsx

import { Head, Link } from '@inertiajs/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';

import {
    BulkDeleteConfirmDialog,
    DataTable,
    DataTableBulkBar,
    DataTableFilterChips,
    DataTablePagination,
    DataTableToolbar,
} from '@/components/datatable';

import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';

import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { useDatatable } from '@/hooks/use-datatable';
import { useDebounceSearch } from '@/hooks/use-debounce-search';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { useRowSelection } from '@/hooks/use-row-selection';

import employeeRoute from '@/routes/employee';

import type { Employee, EmployeeFilters } from '@/types/employee/employee-type';

import type { PaginatedResponse } from '@/types/pagination';

import {
    createEmployeeColumns,
    DIVISION_OPTIONS,
    LEVEL_OPTIONS,
    STATUS_OPTIONS,
    labelOf,
} from './columns';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/**
 * Page props received from Inertia response.
 */
type Props = {
    employees: PaginatedResponse<Employee>;
    filters: EmployeeFilters;
};

/* -------------------------------------------------------------------------- */
/*                              Employee Index Page                           */
/* -------------------------------------------------------------------------- */

/**
 * Employee listing page.
 *
 * Features:
 * - server-side pagination
 * - debounced search
 * - sortable columns
 * - filter chips
 * - single delete
 * - bulk delete
 * - row selection
 */
export default function EmployeeIndex({ employees, filters }: Props) {
    /* ---------------------------------------------------------------------- */
    /* Datatable State Management                                             */
    /* ---------------------------------------------------------------------- */

    /**
     * Custom hook untuk:
     * - filtering
     * - sorting
     * - pagination
     * - loading state
     *
     * Semua state sinkron dengan URL query params.
     */
    const { applyFilter, applySort, goToPage, isPending } =
        useDatatable<EmployeeFilters>(employeeRoute.index().url, filters);

    /* ---------------------------------------------------------------------- */
    /* Debounced Search                                                       */
    /* ---------------------------------------------------------------------- */

    /**
     * Debounce search input agar:
     * - tidak spam request ke server
     * - UX lebih smooth
     * - mengurangi render berlebih
     */
    const { search: searchValue, setSearch: handleSearch } = useDebounceSearch(
        filters.search,
        800,
        (value) => {
            /**
             * Hindari request jika value tidak berubah.
             */
            if (value !== (filters.search ?? '')) {
                applyFilter({
                    search: value || undefined,
                } as Partial<EmployeeFilters>);
            }
        },
    );

    /* ---------------------------------------------------------------------- */
    /* Active Filter Counter                                                  */
    /* ---------------------------------------------------------------------- */

    /**
     * Total filter aktif.
     *
     * Digunakan untuk indicator badge
     * pada tombol filter toolbar.
     */
    const activeFilterCount = [
        filters.division,
        filters.level,
        filters.status,
    ].filter(Boolean).length;

    /* ---------------------------------------------------------------------- */
    /* Clear All Filters                                                      */
    /* ---------------------------------------------------------------------- */

    /**
     * Reset semua filter sekaligus.
     */
    const clearAllFilters = useCallback(() => {
        applyFilter({
            division: undefined,
            level: undefined,
            status: undefined,
            search: undefined,
        } as Partial<EmployeeFilters>);
    }, [applyFilter]);

    /* ---------------------------------------------------------------------- */
    /* Single Row Delete                                                      */
    /* ---------------------------------------------------------------------- */

    /**
     * Hook reusable untuk:
     * - open dialog
     * - selected item
     * - delete request
     */
    const {
        item: employeeToDelete,
        open: isDeleteOpen,
        setOpen: setIsDeleteOpen,
        confirm: triggerDeleteConfirmation,
        destroy,
    } = useDeleteConfirmation<Employee>();

    /**
     * Execute delete request.
     */
    const confirmDelete = () => {
        /**
         * Safety guard.
         */
        if (!employeeToDelete) {
            return;
        }

        destroy(employeeRoute.delete(employeeToDelete.id).url);
    };

    /* ---------------------------------------------------------------------- */
    /* Row Selection                                                          */
    /* ---------------------------------------------------------------------- */

    /**
     * Manage checkbox selection state.
     */
    const selection = useRowSelection<number>();

    /**
     * Reset selected rows ketika:
     * - page berubah
     * - filter berubah
     * - search berubah
     *
     * Mencegah selected state stale.
     */
    useEffect(() => {
        selection.clearAll();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        employees.current_page,
        filters.search,
        filters.division,
        filters.level,
        filters.status,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Bulk Delete                                                            */
    /* ---------------------------------------------------------------------- */

    /**
     * Bulk delete handler.
     */
    const bulkDelete = useBulkDelete({
        url: employeeRoute.bulkDestroy().url,

        /**
         * Clear selected rows after success delete.
         */
        onSuccess: () => selection.clearAll(),
    });

    /* ---------------------------------------------------------------------- */
    /* Datatable Columns                                                      */
    /* ---------------------------------------------------------------------- */

    /**
     * Memoized columns configuration.
     *
     * useMemo digunakan agar:
     * - columns tidak recreate setiap render
     * - mengurangi rerender DataTable
     */
    const columns = useMemo(
        () =>
            createEmployeeColumns({
                getDetailUrl: (emp) => employeeRoute.detail(emp.id).url,

                getEditUrl: (emp) => employeeRoute.form(emp.id).url,

                onDelete: triggerDeleteConfirmation,
            }),

        [triggerDeleteConfirmation],
    );

    /* ---------------------------------------------------------------------- */
    /* Filter Configurations                                                  */
    /* ---------------------------------------------------------------------- */

    /**
     * Toolbar filter dropdown configs.
     */
    const filterFields = [
        {
            key: 'division',
            label: 'Divisi',
            placeholder: 'Semua divisi',
            options: DIVISION_OPTIONS,
            value: filters.division,

            onChange: (v: string | undefined) =>
                applyFilter({
                    division: v,
                } as Partial<EmployeeFilters>),
        },

        {
            key: 'level',
            label: 'Level',
            placeholder: 'Semua level',
            options: LEVEL_OPTIONS,
            value: filters.level,

            onChange: (v: string | undefined) =>
                applyFilter({
                    level: v,
                } as Partial<EmployeeFilters>),
        },

        {
            key: 'status',
            label: 'Status',
            placeholder: 'Semua status',
            options: STATUS_OPTIONS,
            value: filters.status,

            onChange: (v: string | undefined) =>
                applyFilter({
                    status: v,
                } as Partial<EmployeeFilters>),
        },
    ];

    /* ---------------------------------------------------------------------- */
    /* Active Filter Chips                                                    */
    /* ---------------------------------------------------------------------- */

    /**
     * Active filter badges/chips.
     *
     * Digunakan untuk:
     * - visual active filters
     * - quick remove filter
     */
    const filterChips = [
        {
            key: 'div',
            value: filters.division,
            label: `Divisi: ${labelOf(DIVISION_OPTIONS, filters.division)}`,

            onRemove: () =>
                applyFilter({
                    division: undefined,
                } as Partial<EmployeeFilters>),
        },

        {
            key: 'lvl',
            value: filters.level,
            label: `Level: ${labelOf(LEVEL_OPTIONS, filters.level)}`,

            onRemove: () =>
                applyFilter({
                    level: undefined,
                } as Partial<EmployeeFilters>),
        },

        {
            key: 'sts',
            value: filters.status,
            label: `Status: ${labelOf(STATUS_OPTIONS, filters.status)}`,

            onRemove: () =>
                applyFilter({
                    status: undefined,
                } as Partial<EmployeeFilters>),
        },
    ];

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <>
            {/* Browser page title */}
            <Head title="Data Karyawan" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                {/* ============================================================ */}
                {/* Page Header                                                  */}
                {/* ============================================================ */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            Data Karyawan
                        </h1>

                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Total{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                {employees.total}
                            </span>{' '}
                            karyawan terdaftar
                        </p>
                    </div>

                    {/* Create employee button */}
                    <Button
                        asChild
                        className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    >
                        <Link href={employeeRoute.form().url}>
                            <PlusIcon className="mr-2 size-4" />
                            Tambah Karyawan
                        </Link>
                    </Button>
                </div>

                {/* ============================================================ */}
                {/* Datatable Toolbar                                            */}
                {/* ============================================================ */}

                <DataTableToolbar
                    searchValue={searchValue}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari nama, email, NIK..."
                    activeFilterCount={activeFilterCount}
                    filterFields={filterFields}
                    onClearFilters={clearAllFilters}
                    perPage={filters.per_page ?? 10}
                    onPerPageChange={(v) =>
                        applyFilter({
                            per_page: v,
                        } as Partial<EmployeeFilters>)
                    }
                />

                {/* ============================================================ */}
                {/* Active Filter Chips                                          */}
                {/* ============================================================ */}

                <DataTableFilterChips configs={filterChips} />

                {/* ============================================================ */}
                {/* Main Datatable                                               */}
                {/* ============================================================ */}

                <DataTable
                    data={employees}
                    columns={columns}
                    getRowId={(emp) => emp.id}
                    sort={filters.sort}
                    direction={filters.direction}
                    onSort={applySort}
                    isPending={isPending}
                    emptyText="Tidak ada data karyawan yang ditemukan."
                    rowSelection={selection}
                />

                {/* ============================================================ */}
                {/* Pagination                                                   */}
                {/* ============================================================ */}

                <DataTablePagination meta={employees} onPageChange={goToPage} />
            </div>

            {/* ================================================================ */}
            {/* Single Delete Confirmation Dialog                               */}
            {/* ================================================================ */}

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                description={
                    <>
                        Tindakan ini akan menghapus data karyawan{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {employeeToDelete?.user?.name}
                        </span>{' '}
                        secara permanen dari sistem. Tindakan ini tidak dapat
                        dibatalkan.
                    </>
                }
                onConfirm={confirmDelete}
            />

            {/* ================================================================ */}
            {/* Bulk Delete Dialog                                              */}
            {/* ================================================================ */}

            <BulkDeleteConfirmDialog
                open={bulkDelete.open}
                onOpenChange={bulkDelete.setOpen}
                count={bulkDelete.pendingCount}
                isDeleting={bulkDelete.isDeleting}
                onConfirm={bulkDelete.confirm}
                onCancel={bulkDelete.cancel}
                entityLabel="karyawan"
            />

            {/* ================================================================ */}
            {/* Floating Bulk Action Bar                                        */}
            {/* ================================================================ */}

            <DataTableBulkBar
                selectedCount={selection.selectedCount}
                selectedIds={Array.from(selection.selectedIds)}
                onClear={selection.clearAll}
                actions={[
                    {
                        label: 'Hapus',
                        icon: <Trash2Icon className="size-3.5" />,
                        destructive: true,

                        onClick: (ids) => bulkDelete.trigger(ids),
                    },
                ]}
            />
        </>
    );
}
