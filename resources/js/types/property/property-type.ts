export type { PaginatedResponse } from '@/types/pagination';

// ─── TIPE DATA UTAMA: PROPERTI ───
export type Property = {
    id: string;
    owner_id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    billing_cycle_days: number;
    billing_grace_period_days: number;
    reminder_offsets_json: number[];
    wa_reminder_enabled: boolean;
    is_active: boolean;

    // Counter relasi (withCount)
    rooms_count?: number;
    room_types_count?: number;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ─── TIPE DATA FILTER DATATABLE MANAGEMENT ───
export type PropertyFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';

    // Filter khusus modul properti
    is_active?: '1' | '0' | 'all';
    city?: string | 'all';
};
