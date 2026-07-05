// resources/js/types/role/role-type.ts

export type { PaginatedResponse } from '@/types/pagination';

// ─── 1. TIPE DATA ANAK: PERMISSION (HAK AKSES) ───
// Berdasarkan PermissionResource yang hanya mengirimkan id dan name
export type Permission = {
    id: number; // Spatie secara default menggunakan auto-increment bigint untuk ID tabel permissions
    name: string;
};

// ─── 2. TIPE DATA UTAMA: ROLE ───
export type Role = {
    id: number; // Spatie secara default menggunakan auto-increment bigint untuk ID tabel roles
    name: string;

    // Relasi kondisional via Eloquent Eager Loading (dari RoleResource)
    permissions?: Permission[];

    created_at?: string;
};

// ─── 3. TIPE DATA FILTER DATATABLE MANAGEMENT (DESKTOP & MOBILE) ───
export type RoleFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
};
