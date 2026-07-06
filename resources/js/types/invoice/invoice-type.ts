// resources/js/types/invoice/invoice-type.ts

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'void';
export type PaymentMethod = 'cash' | 'transfer';

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    name: string;
    qty: number;
    price: number;
    subtotal: number;
}

export interface Payment {
    id: string;
    invoice_id: string;
    receiver_id: string;
    payment_number: string;
    amount_paid: number;
    payment_date: string;
    payment_method: PaymentMethod;
    proof_attachment: string | null;
    notes: string | null;
    receiver_name: string;
}

export interface Invoice {
    id: string;
    property_id: string;
    room_id: string;
    tenant_id: string;
    occupancy_id: string;
    invoice_number: string;
    period_start: string;
    period_end: string;
    due_date: string;

    amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount: number;
    remaining_amount: number;

    status: InvoiceStatus;
    notes: string | null;
    created_at: string;
    deleted_at?: string | null;

    property?: { id: string; name: string };
    room?: { id: string; room_number: string };
    tenant?: { id: string; name: string; phone: string };
    items?: InvoiceItem[];
    payments?: Payment[];
}

// 🌟 TAMBAHAN: FILTER UNTUK DATATABLE BAR TAGIHAN
export type InvoiceFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1'; // 🌟 KUNCI KE LITERAL '1' AGAR SINKRON DENGAN HOOKS
    status?: string | 'all';
    property_id?: string | 'all';
}
