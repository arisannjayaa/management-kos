import { Head, Link } from '@inertiajs/react';
import { PlusIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
    SortableHead,
    DatatableSearch,
    DataTablePerPage,
    DataTablePagination,
    DataTableLoadingOverlay,
} from '@/components/datatable';
import DataTableFilterChips from '@/components/datatable/data-table-filter-chips';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { useDatatable } from '@/hooks/use-datatable';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import employeeRoute from '@/routes/employee';
import type { Employee, EmployeeFilters } from '@/types/employee/employee-type';
import type { PaginatedResponse } from '@/types/pagination';

// ─── Constants ────────────────────────────────────────────────────────────────

const DIVISION_OPTIONS = [
    { value: 'sound', label: 'Soundman' },
    { value: 'lighting', label: 'Lightingman' },
    { value: 'led', label: 'LED System' },
    { value: 'rigging', label: 'Rigging & Production' },
    { value: 'generator', label: 'Genzet' },
];

const LEVEL_OPTIONS = [
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Leader', label: 'Team Lead' },
    { value: 'Supervisor', label: 'Supervisor' },
];

const STATUS_OPTIONS = [
    { value: 'permanent', label: 'Permanen' },
    { value: 'contract', label: 'Kontrak' },
    { value: 'freelance', label: 'Freelance' },
];

const STATUS_BADGE: Record<string, string> = {
    permanent:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    contract:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    freelance:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
};

const LEVEL_BADGE: Record<string, string> = {
    Junior: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    Senior: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300',
    Lead: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
    Admin: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function labelOf(options: { value: string; label: string }[], val?: string) {
    return options.find((o) => o.value === val)?.label ?? '—';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    employees: PaginatedResponse<Employee>;
    filters: EmployeeFilters;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeIndex({ employees, filters }: Props) {
    const { applyFilter, applySort, goToPage, isPending } =
        useDatatable<EmployeeFilters>(employeeRoute.index().url, filters);

    // Debounced search
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    //     null,
    // );
    // const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    const handleSearch = useCallback(
        (value: string) => {
            setSearchValue(value);

            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }

            searchTimer.current = setTimeout(() => {
                applyFilter({
                    search: value || undefined,
                } as Partial<EmployeeFilters>);
            }, 400);
        },
        [applyFilter],
    );

    useEffect(() => {
        return () => {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }
        };
    }, []);

    const activeFilterCount = [
        filters.division,
        filters.level,
        filters.status,
    ].filter(Boolean).length;

    const clearAllFilters = useCallback(() => {
        applyFilter({
            division: undefined,
            level: undefined,
            status: undefined,
            search: undefined,
        } as Partial<EmployeeFilters>);
    }, [applyFilter]);

    // const triggerDeleteConfirmation = (emp: Employee) => {
    //     setEmployeeToDelete(emp);
    //     setIsAlertOpen(true);
    // };

    const {
        item: employeeToDelete,
        open: isAlertOpen,
        setOpen: setIsAlertOpen,
        confirm: triggerDeleteConfirmation,
        destroy,
    } = useDeleteConfirmation<Employee>();

    const confirmDelete = () => {
        if (!employeeToDelete) {
            return;
        }

        destroy(employeeRoute.delete(employeeToDelete.id).url);
    };

    return (
        <>
            <Head title="Data Karyawan" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8">
                {/* ── Page Header ── */}
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

                {/* ── Toolbar: Search + Filter + Per Page ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <DatatableSearch
                        value={searchValue}
                        onChange={handleSearch}
                        placeholder="Cari nama, email, NIK..."
                    />

                    {/* Filter Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2"
                            >
                                <SlidersHorizontalIcon className="size-4" />
                                Filter
                                {activeFilterCount > 0 && (
                                    <span className="flex size-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-72 space-y-4 p-4"
                        >
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Filter Data
                            </p>
                            <Separator />

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Divisi
                                </Label>
                                <Select
                                    value={filters.division ?? ''}
                                    onValueChange={(v) =>
                                        applyFilter({
                                            division: v || undefined,
                                        } as Partial<EmployeeFilters>)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full text-sm">
                                        <SelectValue placeholder="Semua divisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DIVISION_OPTIONS.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Level
                                </Label>
                                <Select
                                    value={filters.level ?? ''}
                                    onValueChange={(v) =>
                                        applyFilter({
                                            level: v || undefined,
                                        } as Partial<EmployeeFilters>)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full text-sm">
                                        <SelectValue placeholder="Semua level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEVEL_OPTIONS.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Status
                                </Label>
                                <Select
                                    value={filters.status ?? ''}
                                    onValueChange={(v) =>
                                        applyFilter({
                                            status: v || undefined,
                                        } as Partial<EmployeeFilters>)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full text-sm">
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {activeFilterCount > 0 && (
                                <>
                                    <Separator />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-red-500 hover:text-red-600"
                                        onClick={clearAllFilters}
                                    >
                                        Reset semua filter
                                    </Button>
                                </>
                            )}
                        </PopoverContent>
                    </Popover>

                    <DataTablePerPage
                        value={filters.per_page ?? 10}
                        onChange={(v) =>
                            applyFilter({
                                per_page: v,
                            } as Partial<EmployeeFilters>)
                        }
                    />
                </div>

                {/* ── Active Filter Chips ── */}
                <DataTableFilterChips
                    configs={[
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
                    ]}
                />

                {/* ── Table ── */}
                <div className="relative rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <DataTableLoadingOverlay show={isPending} />

                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                                <TableHead className="w-10 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    #
                                </TableHead>
                                <SortableHead
                                    field="name"
                                    label="Nama"
                                    sort={filters.sort}
                                    direction={filters.direction}
                                    onSort={applySort}
                                />
                                <SortableHead
                                    field="id_card_number"
                                    label="NIK"
                                    sort={filters.sort}
                                    direction={filters.direction}
                                    onSort={applySort}
                                />
                                <SortableHead
                                    field="division"
                                    label="Divisi"
                                    sort={filters.sort}
                                    direction={filters.direction}
                                    onSort={applySort}
                                />
                                <SortableHead
                                    field="level"
                                    label="Level"
                                    sort={filters.sort}
                                    direction={filters.direction}
                                    onSort={applySort}
                                />
                                <SortableHead
                                    field="status"
                                    label="Status"
                                    sort={filters.sort}
                                    direction={filters.direction}
                                    onSort={applySort}
                                />
                                <SortableHead
                                    field="joined_at"
                                    label="Tgl. Bergabung"
                                    sort={filters.sort}
                                    direction={filters.direction}
                                    onSort={applySort}
                                />
                                <TableHead className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {employees.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-16 text-center text-sm text-slate-400"
                                    >
                                        Tidak ada data yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.data.map((emp, index) => (
                                    <TableRow
                                        key={emp.id}
                                        className="border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                                    >
                                        {/* Nomor urut */}
                                        <TableCell className="text-xs text-slate-400">
                                            {(employees.current_page - 1) *
                                                employees.per_page +
                                                index +
                                                1}
                                        </TableCell>

                                        {/* Nama & Email */}
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                {emp.user.name}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {emp.user.email}
                                            </div>
                                        </TableCell>

                                        {/* NIK */}
                                        <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                            {emp.id_card_number || '—'}
                                        </TableCell>

                                        {/* Divisi */}
                                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                            {labelOf(
                                                DIVISION_OPTIONS,
                                                emp.division,
                                            )}
                                        </TableCell>

                                        {/* Level */}
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${LEVEL_BADGE[emp.level] ?? ''}`}
                                            >
                                                {emp.level}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[emp.status] ?? ''}`}
                                            >
                                                {labelOf(
                                                    STATUS_OPTIONS,
                                                    emp.status,
                                                )}
                                            </span>
                                        </TableCell>

                                        {/* Tanggal Bergabung */}
                                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                            {emp.joined_at
                                                ? new Date(
                                                    emp.joined_at,
                                                ).toLocaleDateString(
                                                    'id-ID',
                                                    {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    },
                                                )
                                                : '—'}
                                        </TableCell>

                                        {/* Aksi */}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-slate-500"
                                                    >
                                                        •••
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-36"
                                                >
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={
                                                                employeeRoute.detail(
                                                                    emp.id,
                                                                ).url
                                                            }
                                                        >
                                                            Detail
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={
                                                                employeeRoute.form(
                                                                    emp.id,
                                                                ).url
                                                            }
                                                        >
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-500 focus:text-red-600"
                                                        onClick={() =>
                                                            triggerDeleteConfirmation(
                                                                emp,
                                                            )
                                                        }
                                                    >
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ── Pagination ── */}
                <DataTablePagination meta={employees} onPageChange={goToPage} />
            </div>

            <DeleteConfirmDialog
                open={isAlertOpen}
                onOpenChange={setIsAlertOpen}
                description={
                    <>
                        Tindakan ini akan menghapus data karyawan{' '}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {employeeToDelete?.user?.name}
                        </span>{' '}
                        secara permanen dari sistem AGS Pro Bali. Tindakan ini
                        tidak dapat dibatalkan.
                    </>
                }
                onConfirm={confirmDelete}
            />
        </>
    );
}
