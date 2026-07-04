<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use Illuminate\Foundation\Http\FormRequest;

class DebtRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna memiliki izin untuk melakukan request ini.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Menyiapkan data sebelum divalidasi (Proses Dekripsi ID otomatis).
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'category_id' => $this->category_id ? (Helper::decrypt($this->category_id) ?? $this->category_id) : null,
            'account_id' => $this->account_id ? (Helper::decrypt($this->account_id) ?? $this->account_id) : null,

            // 🌟 TAMBAHAN: Dekripsi contact_id dari input dropdown React
            'contact_id' => $this->contact_id ? (Helper::decrypt($this->contact_id) ?? $this->contact_id) : null,

            'is_deposit' => $this->has('is_deposit') ? $this->boolean('is_deposit') : false,
            'is_item_financing' => $this->has('is_item_financing') ? $this->boolean('is_item_financing') : false,
        ]);
    }

    /**
     * Dapatkan aturan validasi dasar yang berlaku untuk request ini.
     */
    public function rules(): array
    {
        return [
            // 🌟 PERBAIKAN: Validasi Kontak (Saling Melengkapi)
            'contact_id' => 'nullable|exists:contacts,id',
            'contact_name' => 'required_without:contact_id|nullable|string|max:255',

            'type' => 'required|in:debt,receivables',
            'payment_method' => 'required|in:lump_sum,installment',
            'amount' => 'required|numeric|min:1',
            'tenor' => 'required_if:payment_method,installment|integer|min:1|max:12',
            'due_date' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
            'account_id' => 'nullable|exists:accounts,id',
            'description' => 'nullable|string',

            // Fitur Setoran / Titipan Dana
            'is_deposit' => 'boolean',
            'deposit_target_name' => 'nullable|required_if:is_deposit,true|string|max:255',

            // Fitur Paylater / Amortisasi Barang
            'is_item_financing' => 'boolean',
            'item_name' => 'nullable|required_if:is_item_financing,true|string|max:255',
            'reference_url' => 'nullable|url|max:2048',

            // Multi-Tag Proyek
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'nullable|string',
        ];
    }

    /**
     * Kustomisasi pesan error spesifik dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            // 🌟 TAMBAHAN: Pesan error khusus untuk kontak
            'contact_id.exists' => 'Data kontak yang dipilih tidak ditemukan di dalam sistem.',
            'contact_name.required_without' => 'Nama kontak wajib diisi jika Anda tidak memilih klien/rekan dari buku alamat.',
            'contact_name.max' => 'Nama kontak terlalu panjang (maksimal 255 karakter).',

            'type.required' => 'Jenis pencatatan (Hutang/Piutang) wajib ditentukan.',
            'type.in' => 'Jenis pencatatan tidak valid.',
            'payment_method.required' => 'Skema pengembalian dana wajib ditentukan.',
            'payment_method.in' => 'Skema pengembalian dana tidak valid.',
            'amount.required' => 'Nominal utama wajib dimasukkan.',
            'amount.min' => 'Nominal minimal bernilai Rp 1.',
            'tenor.required_if' => 'Jumlah tenor bulan wajib diatur jika menggunakan skema cicilan.',
            'due_date.date' => 'Format tanggal batas waktu tidak valid.',
            'deposit_target_name.required_if' => 'Nama target setoran wajib diisi karena Anda menandai ini sebagai uang titipan.',
            'item_name.required_if' => 'Nama spesifik barang wajib diisi jika Anda menandai ini sebagai cicilan barang.',
            'reference_url.url' => 'Format tautan link referensi tidak valid.',
            'category_id.exists' => 'Kategori tidak valid atau tidak ditemukan.',
            'account_id.exists' => 'Akun dompet yang dipilih tidak valid.',
        ];
    }

    /**
     * Kustomisasi nama atribut untuk pesan error otomatis.
     */
    public function attributes(): array
    {
        return [
            'contact_id' => 'Pilihan Kontak', // 🌟 Atribut baru
            'contact_name' => 'Nama Kontak Manual',
            'type' => 'Jenis Pencatatan',
            'payment_method' => 'Skema Pengembalian',
            'amount' => 'Nominal Pokok',
            'tenor' => 'Tenor',
            'category_id' => 'Kategori Pos',
            'account_id' => 'Dompet Transaksi',
            'due_date' => 'Batas Waktu',
            'description' => 'Catatan Memo',
            'is_deposit' => 'Status Uang Titipan',
            'deposit_target_name' => 'Nama Target Setoran',
            'item_name' => 'Nama Barang',
            'reference_url' => 'Link Referensi',
            'tag_ids' => 'Label Proyek',
        ];
    }
}
