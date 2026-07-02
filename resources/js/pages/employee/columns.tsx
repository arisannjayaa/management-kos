import { DataTableActions } from '@/components/datatable';
import type { ColumnDef } from '@/types/datatable';
import type { Employee } from '@/types/employee/employee-type';

/**
 * Division master options.
 *
 * Digunakan untuk:
 * - label tampilan UI
 * - filter/select option
 * - mapping value database → readable label
 */
export const DIVISION_OPTIONS = [
    { value: 'sound', label: 'Soundman' },
    { value: 'lighting', label: 'Lightingman' },
    { value: 'led', label: 'LED System' },
    { value: 'rigging', label: 'Rigging & Production' },
    { value: 'generator', label: 'Genzet' },
];

/**
 * Employee seniority / hierarchy options.
 */
export const LEVEL_OPTIONS = [
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Leader', label: 'Team Lead' },
    { value: 'Supervisor', label: 'Supervisor' },
];

/**
 * Employment status options.
 */
export const STATUS_OPTIONS = [
    { value: 'permanent', label: 'Permanen' },
    { value: 'contract', label: 'Kontrak' },
    { value: 'freelance', label: 'Freelance' },
];

/**
 * Badge style mapping for employee status.
 *
 * Key harus konsisten dengan value pada STATUS_OPTIONS
 * dan value yang tersimpan di database.
 */
export const STATUS_BADGE: Record<string, string> = {
    permanent:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',

    contract:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',

    freelance:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
};

/**
 * Badge style mapping for employee level.
 */
export const LEVEL_BADGE: Record<string, string> = {
    Junior: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',

    Senior: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300',

    Leader: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',

    Supervisor:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
};

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/**
 * Mengubah stored value menjadi human-readable label.
 *
 * Contoh:
 * "contract" → "Kontrak"
 */
export function labelOf(
    options: { value: string; label: string }[],
    val?: string,
) {
    return options.find((o) => o.value === val)?.label ?? '—';
}

/* -------------------------------------------------------------------------- */
/*                              Table Definition                              */
/* -------------------------------------------------------------------------- */

/**
 * Factory function untuk menghasilkan konfigurasi kolom employee table.
 *
 * Menggunakan factory pattern agar:
 * - action handler tetap injectable
 * - reusable di berbagai halaman
 * - mempermudah testing
 */
export function createEmployeeColumns(actions: {
    getDetailUrl: (emp: Employee) => string;
    getEditUrl: (emp: Employee) => string;
    onDelete: (emp: Employee) => void;
}): ColumnDef<Employee>[] {
    return [
        {
            /**
             * Static row numbering.
             *
             * Tidak sortable karena bukan data actual dari database.
             */
            id: 'no',
            header: '#',
            headerClassName: 'w-10',
            cellClassName: 'text-xs text-slate-400',
            cell: (_row, index, offset) => offset + index + 1,
        },

        {
            /**
             * Employee identity column.
             *
             * Menampilkan:
             * - nama
             * - email
             */
            id: 'name',
            header: 'Nama',
            sortable: true,

            // Default sorting:
            // ascending alphabetical order (A → Z)
            cell: (emp) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                        {emp.user.name}
                    </div>

                    <div className="text-xs text-slate-400">
                        {emp.user.email}
                    </div>
                </div>
            ),
        },

        {
            /**
             * National identity number.
             *
             * Menggunakan monospace agar angka lebih mudah dibaca.
             */
            id: 'id_card_number',
            header: 'NIK',
            sortable: true,
            cellClassName:
                'font-mono text-xs text-slate-600 dark:text-slate-400',
            cell: (emp) => emp.id_card_number || '—',
        },

        {
            /**
             * Employee division / department.
             */
            id: 'division',
            header: 'Divisi',
            sortable: true,
            cellClassName: 'text-sm text-slate-600 dark:text-slate-400',
            cell: (emp) => labelOf(DIVISION_OPTIONS, emp.division),
        },

        {
            /**
             * Employee hierarchy level badge.
             */
            id: 'level',
            header: 'Level',
            sortable: true,

            cell: (emp) => (
                <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${LEVEL_BADGE[emp.level] ?? ''}`}
                >
                    {emp.level}
                </span>
            ),
        },

        {
            /**
             * Employment status badge.
             */
            id: 'status',
            header: 'Status',
            sortable: true,

            cell: (emp) => (
                <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[emp.status] ?? ''}`}
                >
                    {labelOf(STATUS_OPTIONS, emp.status)}
                </span>
            ),
        },

        {
            /**
             * Employee joining date.
             *
             * Default sorting menggunakan descending
             * agar employee terbaru muncul di atas.
             */
            id: 'joined_at',
            header: 'Tgl. Bergabung',
            sortable: true,
            defaultSortDirection: 'desc',

            cellClassName: 'text-sm text-slate-600 dark:text-slate-400',

            cell: (emp) =>
                emp.joined_at
                    ? new Date(emp.joined_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                      })
                    : '—',
        },

        {
            /**
             * Row action menu.
             *
             * Berisi:
             * - detail
             * - edit
             * - delete
             */
            id: 'actions',
            header: 'Aksi',
            align: 'right',

            // Action column should never be sortable.
            cell: (emp) => (
                <DataTableActions
                    items={[
                        {
                            label: 'Detail',
                            href: actions.getDetailUrl(emp),
                        },

                        {
                            label: 'Edit',
                            href: actions.getEditUrl(emp),
                        },

                        {
                            label: 'Hapus',
                            destructive: true,
                            onClick: () => actions.onDelete(emp),
                        },
                    ]}
                />
            ),
        },
    ];
}
