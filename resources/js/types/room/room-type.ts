export type { PaginatedResponse } from '@/types/pagination';

// ─── 1. TIPE DATA ANAK: ROOM TYPE PRICING TIER (TARIF BERJENJANG) ───
export type RoomTypePricingTier = {
    id: string;
    room_type_id: string;
    name: string; // Cth: "Tarif 1 Orang", "Tarif 2 Orang"
    price: number;
};

// ─── 2. TIPE DATA UTAMA: ROOM TYPE (KLASIFIKASI TIPE KAMAR) ───
export type RoomType = {
    id: string;
    property_id: string;
    name: string; // Cth: "Deluxe Premium"
    description: string | null;
    base_price: number;

    // Counter relasi unit kamar yang terikat
    rooms_count?: number;

    // Relasi hasil eager loading dari backend
    property?: {
        id: string;
        name: string;
    } | null;

    pricing_tiers?: RoomTypePricingTier[];

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

// ─── 3. TIPE DATA UTAMA: ROOM (UNIT KAMAR FISIK) ───
export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export type Room = {
    id: string;
    property_id: string;
    room_type_id: string;
    room_number: string; // Cth: "A1", "B10"
    status: RoomStatus;

    // Relasi hasil eager loading dari RoomDataTable
    property?: {
        id: string;
        name: string;
    } | null;

    room_type?: {
        id: string;
        name: string;
        base_price: number;
        pricing_tiers?: RoomTypePricingTier[];
    } | null;

    created_at: string;
    deleted_at?: string | null;
};

// ─── TIPE DATA FILTER DATATABLE: ROOM TYPE ───
export type RoomTypeFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';

    property_id?: string | 'all';
};

// ─── TIPE DATA FILTER DATATABLE: ROOM ───
export type RoomFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';

    // Filter spesifik modul kamar
    status?: RoomStatus | 'all';
    property_id?: string | 'all';
    room_type_id?: string | 'all';
};
