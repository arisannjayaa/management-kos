// resources/js/types/charge-type/charge-type.ts

export type BillingMethod = 'flat' | 'metered' | 'per_occupant';

export interface ChargeType {
    id: string;
    property_id: string;
    name: string;
    billing_method: BillingMethod;
    default_amount: number;
    unit_label: string | null;
    unit_price: number;
    is_active: boolean;
    property_name?: string; // Kelengkapan tampilan DataTable
}
