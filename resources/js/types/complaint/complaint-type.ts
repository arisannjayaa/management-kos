export type { PaginatedResponse } from '@/types/pagination';

export type ComplaintStatus = 'pending' | 'processing' | 'resolved' | 'rejected';

export type Complaint = {
    id: string;
    property_id: string;
    room_id: string;
    tenant_id: string;
    property_name: string;
    room_number: string;
    tenant_name: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    response_notes: string | null;
    attachment: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type ComplaintFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';
    status?: string;
};
