export type PaymentMethod = 'cash' | 'transfer';

export type Payment = {
    id: string;
    invoice_id: string;
    payment_number: string;
    invoice_number: string;
    amount_paid: number;
    payment_date: string;
    payment_method: PaymentMethod;
    proof_attachment: string | null;
    notes: string | null;
    receiver_name: string;
    tenant_name: string;
    room_number: string;
    property_name: string;
    created_at: string;
    deleted_at?: string | null;
};

export type PaymentFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';
    payment_method?: string;
    property_id?: string;
};
