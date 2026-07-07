export type { PaginatedResponse } from '@/types/pagination';

export type Expense = {
    id: string;
    property_id: string;
    expense_category_id: string;
    property_name: string;
    category_name: string;
    amount: number;
    expense_date: string;
    notes: string | null;
    receipt_attachment: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
};

export type ExpenseFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';
    property_id?: string;
    expense_category_id?: string;
};
