export type { PaginatedResponse } from '@/types/pagination';

export type OccupancyStatus = 'active' | 'checked_out';

export type Occupancy = {
    id: string;
    property_id: string;
    room_id: string;
    room_type_id: string;
    tenant_id: string;
    room_type_pricing_tier_id: string | null;

    start_date: string;
    end_date: string | null;
    billing_day: number;
    price: number;
    deposit_amount: number;
    status: OccupancyStatus;

    // Data hasil Eager Loading ter-mapping dari server
    property?: {
        id: string;
        name: string;
    } | null;

    room?: {
        id: string;
        room_number: string;
    } | null;

    room_type?: {
        id: string;
        name: string;
    } | null;

    tenant?: {
        id: string;
        name: string;
        phone: string;
    } | null;

    pricing_tier?: {
        id: string;
        name: string;
        price: number;
    } | null;

    created_at: string;
};

export type OccupancyFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;

    status?: OccupancyStatus | 'all';
    property_id?: string | 'all';
};
