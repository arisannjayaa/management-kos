export type { PaginatedResponse } from '@/types/pagination';

export type Employee = {
    id: number;
    user_id: number;
    employee_id: string;
    id_card_number: string;
    telephone: string;
    address: string;
    division: 'sound' | 'lighting' | 'led' | 'rigging' | 'generator';
    level: 'Junior' | 'Senior' | 'Leader' | 'Supervisor';
    status: 'permanent' | 'contract' | 'freelance';
    joined_at: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
};

export type EmployeeFilters = {
    search?: string;
    division?: string;
    level?: string;
    status?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
};
