// resources/js/types/meter-reading/meter-reading.ts

export interface MeterReading {
    id: string;
    occupancy_id: string;
    charge_type_id: string;
    charge_type_name: string;
    room_number: string;
    tenant_name: string;
    previous_reading: number;
    current_reading: number;
    usage: number;
    unit_label: string;
    amount: number;
    reading_date: string;
    is_locked: boolean;
    deleted_at?: string;
}

export type MeterReadingFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1'; // 🌟 KUNCI KE LITERAL '1' AGAR SINKRON DENGAN HOOKS

    // Filter khusus modul meteran
    property_id?: string;
    charge_type_id?: string;
};
