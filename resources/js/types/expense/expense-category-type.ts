export type { PaginatedResponse } from '@/types/pagination';

export type ExpenseCategory = {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type ExpenseCategoryFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';
};
