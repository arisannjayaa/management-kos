// resources/js/types/debt/debt-type.ts

export type { PaginatedResponse } from '@/types/pagination';
import type { Tag } from '@/types/tag/tag-type';

// Jenis pencatatan utama modul: debt = Hutang kita, receivables = Piutang kita
export type DebtLogType = 'debt' | 'receivables';

// Status kelunasan berjalan kontrak tagihan
export type DebtStatus = 'unpaid' | 'partial' | 'paid';

// 🌟 STRATEGI UX: Metode pembayaran sekaligus (Lump Sum / Dana Talangan) atau Cicilan (Tenor)
export type DebtPaymentMethod = 'lump_sum' | 'installment';

// Tipe data ringkas untuk relasi Kategori di dalam Hutang
export type DebtCategory = {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
};

// 🌟 Tipe data ringkas untuk relasi Kontak (dari hasil map DebtDataTable)
export type DebtContact = {
    id: string;
    name: string;
    phone_number: string | null;
    type: string;
};

// ─── 1. TIPE DATA UTAMA: DEBT (KONTRAK TAGIHAN) ───
export type Debt = {
    id: string;
    transaction_id: string | null;

    // 🌟 Informasi Kontak
    contact_name: string; // Nama fallback (lama)
    contact?: DebtContact | null; // Objek kontak baru dari relasi database

    type: DebtLogType;
    payment_method: DebtPaymentMethod;

    amount: number;
    remaining_amount: number;
    is_deposit: boolean;
    deposit_target_name: string | null;
    description: string | null;
    due_date: string | null;
    status: DebtStatus;

    // 🌟 Pelacak WA Gateway
    last_reminded_at: string | null; // Waktu terakhir tagihan dikirim ke WA klien

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;

    // Parameter Amortisasi Cicilan Barang / Aset
    item_name: string | null;
    reference_url: string | null;

    payments_count?: number;

    // Relasi kondisional via Eloquent Eager Loading
    category?: DebtCategory | null;
    payments?: DebtPayment[];
    tags?: Tag[];
};

// ─── 2. TIPE DATA ANAK: DEBT PAYMENT (LOG / JADWAL CICILAN) ───
export type DebtPayment = {
    id: string;
    debt_id: string;
    transaction_id: string | null;

    account_id: string | null;
    payment_date: string | null;

    amount_paid: number;

    due_date: string | null;
    status: 'unpaid' | 'paid';
    installment_no: number;

    notes: string | null;
    created_at: string;
    updated_at: string;

    account?: {
        id: string;
        name: string;
        type: 'bank' | 'cash';
        balance?: number;
    } | null;
};

// ─── 3. TIPE DATA FILTER DATATABLE MANAGEMENT (DESKTOP & MOBILE) ───
export type DebtFilters = {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    trashed?: '1';

    // Filter Khusus Modul Hutang
    type?: DebtLogType | 'all';
    status?: DebtStatus | 'all';
    payment_method?: DebtPaymentMethod | 'all'; // 🌟 Ditambahkan agar sinkron dengan DataTables
    is_deposit?: '1' | '0';
    category_id?: string | 'all';

    // 🌟 Tambahan filter untuk memilah histori berdasarkan klien/kontak tertentu
    contact_id?: string | 'all';

    start_due_date?: string;
    end_due_date?: string;
    min_amount?: number;
    max_amount?: number;

    tag_ids?: (string | number)[] | string;
};
