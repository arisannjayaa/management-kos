export type { PaginatedResponse } from '@/types/pagination';

export type TenantStatus = 'active' | 'inactive';

export type Tenant = {
    id: string;
    owner_id: string;
    name: string;
    ktp_number: string | null;
    phone: string;
    emergency_contact: string | null;
    status: TenantStatus;
    ktp_attachment: string | null;

    // Counter relasi total riwayat kontrak sewa
    occupancies_count?: number;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type TenantFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';

    status?: TenantStatus | 'all';
};
