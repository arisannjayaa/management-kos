export type { PaginatedResponse } from '@/types/pagination';

export type TenantStatus = 'active' | 'inactive';

export type Tenant = {
    id: string;
    owner_id: string;
    user_id: string;
    name: string;
    ktp_number: string | null;
    ktp_attachment: string | null;
    phone: string;
    emergency_contact: string | null;
    status: TenantStatus;
    email: string; // Diambil dari sinkronisasi relasi User
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
    status?: 'active' | 'inactive' | 'all';
};
