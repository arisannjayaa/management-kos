<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PropertyRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna memiliki izin untuk melakukan request ini.
     */
    public function authorize(): bool
    {
        // Memisahkan izin Spatie berdasarkan keberadaan parameter ID rute (Create vs Update)
        if ($this->route('id')) {
            return $this->user()->can('property.update');
        }

        return $this->user()->can('property.create');
    }

    /**
     * Menyiapkan data sebelum divalidasi (Casting Tipe Data Otomatis).
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'wa_reminder_enabled' => $this->has('wa_reminder_enabled') ? $this->boolean('wa_reminder_enabled') : true,
            'is_active' => $this->has('is_active') ? $this->boolean('is_active') : true,
        ]);
    }

    /**
     * Dapatkan aturan validasi dasar yang berlaku untuk request ini.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'billing_cycle_days' => 'nullable|integer|min:1',
            'billing_grace_period_days' => 'nullable|integer|min:0',
            'reminder_offsets_json' => 'nullable|array',
            'reminder_offsets_json.*' => 'integer',
            'wa_reminder_enabled' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Kustomisasi pesan error spesifik dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama properti kos wajib diisi.',
            'name.max' => 'Nama properti terlalu panjang (maksimal 150 karakter).',
            'address.required' => 'Alamat lengkap lokasi kos wajib diisi.',
            'city.required' => 'Nama kota lokasi kos wajib ditentukan.',
            'phone.required' => 'Nomor telepon operasional kos wajib diisi.',
            'billing_cycle_days.integer' => 'Siklus tagihan harus berupa angka hitungan hari.',
            'billing_cycle_days.min' => 'Siklus tagihan minimal bernilai 1 hari.',
            'billing_grace_period_days.min' => 'Masa tenggang pembayaran tidak boleh bernilai negatif.',
            'reminder_offsets_json.array' => 'Format pengaturan pengingat otomatis tidak valid.',
        ];
    }

    /**
     * Kustomisasi nama atribut untuk pesan error otomatis.
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Properti',
            'address' => 'Alamat Kos',
            'city' => 'Kota',
            'phone' => 'No. Telepon',
            'billing_cycle_days' => 'Siklus Tagihan',
            'billing_grace_period_days' => 'Masa Tenggang',
            'reminder_offsets_json' => 'Jadwal Pengingat WA',
        ];
    }
}
