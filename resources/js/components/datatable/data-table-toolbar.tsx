// resources/js/components/datatable/data-table-toolbar.tsx

import { SlidersHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

import type { FilterFieldConfig } from '@/types/datatable';
import { DatatableSearch } from './datatable-search';
import { DataTablePerPage } from './datatable-per-page';

type Props = {
    /** Value search (controlled dari luar agar debounce di luar) */
    searchValue: string;
    onSearch: (value: string) => void;
    searchPlaceholder?: string;

    /** Jumlah filter aktif — ditampilkan di badge tombol Filter */
    activeFilterCount?: number;

    /** Daftar field filter yang muncul di dalam Popover */
    filterFields?: FilterFieldConfig[];

    /** Callback reset semua filter */
    onClearFilters?: () => void;

    /** Per-page */
    perPage: number;
    onPerPageChange: (value: number) => void;
    perPageOptions?: number[];

    /** Slot kanan — misal tombol "Tambah" */
    children?: React.ReactNode;
};

/**
 * DataTableToolbar — Toolbar standar: Search | Filter | PerPage | [slot kanan].
 *
 * Pemakaian:
 * ```tsx
 * <DataTableToolbar
 *   searchValue={searchValue}
 *   onSearch={handleSearch}
 *   activeFilterCount={activeFilterCount}
 *   filterFields={filterFields}
 *   onClearFilters={clearAllFilters}
 *   perPage={filters.per_page ?? 10}
 *   onPerPageChange={(v) => applyFilter({ per_page: v })}
 * />
 * ```
 */
export function DataTableToolbar({
    searchValue,
    onSearch,
    searchPlaceholder,
    activeFilterCount = 0,
    filterFields = [],
    onClearFilters,
    perPage,
    onPerPageChange,
    perPageOptions,
    children,
}: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <DatatableSearch
                value={searchValue}
                onChange={onSearch}
                placeholder={searchPlaceholder}
            />

            {/* Filter Popover — hanya render jika ada filterFields */}
            {filterFields.length > 0 && (
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

                    <PopoverContent align="end" className="w-72 space-y-4 p-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Filter Data
                        </p>
                        <Separator />

                        {filterFields.map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <Label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    {field.label}
                                </Label>
                                <Select
                                    value={field.value ?? ''}
                                    onValueChange={(v) =>
                                        field.onChange(v || undefined)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full text-sm">
                                        <SelectValue
                                            placeholder={
                                                field.placeholder ??
                                                `Semua ${field.label.toLowerCase()}`
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}

                        {activeFilterCount > 0 && onClearFilters && (
                            <>
                                <Separator />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-red-500 hover:text-red-600"
                                    onClick={onClearFilters}
                                >
                                    Reset semua filter
                                </Button>
                            </>
                        )}
                    </PopoverContent>
                </Popover>
            )}

            <DataTablePerPage
                value={perPage}
                onChange={onPerPageChange}
                options={perPageOptions}
            />

            {children}
        </div>
    );
}
