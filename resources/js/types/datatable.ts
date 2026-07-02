// resources/js/types/datatable.ts

import type { ReactNode } from 'react';

// ─── Column Definition ────────────────────────────────────────────────────────

/**
 * Definisi satu kolom tabel — mirip TanStack Table ColumnDef.
 *
 * T = tipe baris data (misal: Employee, Item, dst.)
 */
export type ColumnDef<T> = {
    /**
     * Identifier unik kolom.
     * Untuk kolom sortable, nilai ini harus sama dengan field yang diterima backend.
     */
    id: string;

    /** Teks header kolom */
    header: string;

    /**
     * Render cell.
     * - row    : data baris
     * - index  : index 0-based dalam halaman ini
     * - offset : (halaman - 1) * per_page, untuk nomor urut absolut
     */
    cell: (row: T, index: number, offset: number) => ReactNode;

    /**
     * Aktifkan sorting pada kolom ini.
     * Jika true, header akan menjadi SortableHead dan klik akan memanggil onSort.
     */
    sortable?: boolean;

    /**
     * Default sort direction ketika kolom ini pertama kali diklik.
     * @default 'asc'
     */
    defaultSortDirection?: 'asc' | 'desc';

    /** Class tambahan untuk <TableHead> */
    headerClassName?: string;

    /** Class tambahan untuk <TableCell> */
    cellClassName?: string;

    /**
     * Alignment shortcut.
     * 'right' berguna untuk kolom Aksi.
     */
    align?: 'left' | 'center' | 'right';
};

// ─── Row Selection ────────────────────────────────────────────────────────────

/**
 * State yang dikembalikan oleh useRowSelection.
 */
export type RowSelectionState<TId extends string | number = number> = {
    /** Set id yang sedang dipilih */
    selectedIds: Set<TId>;

    /** Apakah semua baris di halaman ini dipilih */
    isAllSelected: boolean;

    /** Apakah sebagian baris dipilih (untuk indeterminate state checkbox) */
    isPartiallySelected: boolean;

    /** Jumlah baris yang dipilih */
    selectedCount: number;

    /** Toggle satu baris */
    toggle: (id: TId) => void;

    /** Toggle semua baris di halaman saat ini */
    toggleAll: (rows: TId[]) => void;

    /** Kosongkan semua pilihan */
    clearAll: () => void;

    /** Cek apakah id tertentu dipilih */
    isSelected: (id: TId) => boolean;
};

// ─── Filter ───────────────────────────────────────────────────────────────────

/**
 * Konfigurasi filter chip yang ditampilkan di bawah toolbar.
 */
export type FilterChipConfig = {
    key: string;
    value: string | undefined;
    label: string;
    onRemove: () => void;
};

/**
 * Satu opsi Select (value → label).
 */
export type SelectOption = {
    value: string;
    label: string;
};

/**
 * Konfigurasi satu filter Popover (Select).
 */
export type FilterFieldConfig = {
    key: string;
    label: string;
    placeholder?: string;
    options: SelectOption[];
    value: string | undefined;
    onChange: (value: string | undefined) => void;
};

// ─── Bulk Action ─────────────────────────────────────────────────────────────

/**
 * Satu aksi bulk yang ditampilkan di DataTableBulkBar.
 */
export type BulkAction = {
    label: string;
    icon?: ReactNode;
    /** Dipanggil dengan array id yang dipilih */
    onClick: (selectedIds: (string | number)[]) => void;
    /** Tampilkan styling destructive (merah) */
    destructive?: boolean;
    /** Nonaktifkan tombol */
    disabled?: boolean;
};
