<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use Illuminate\Foundation\Http\FormRequest;

class RoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('id')) {
            return $this->user()->can('room.update');
        }
        return $this->user()->can('room.create');
    }

    /**
     * Otomatis mendekripsi properti_id dari input dropdown sebelum validasi tabel dilakukan.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'property_id' => $this->property_id ? (Helper::decrypt($this->property_id) ?? $this->property_id) : null,
        ]);
    }

    public function rules(): array
    {
        $isUpdate = !empty($this->route('id'));

        return [
            // Properti ID wajib dikirim saat pendaftaran awal (Create)
            'property_id' => $isUpdate ? 'nullable|exists:properties,id' : 'required|exists:properties,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',

            // Validasi Array Tarif Berjenjang anak (Pricing Tiers)
            'pricing_tiers' => 'nullable|array',
            'pricing_tiers.*.name' => 'required_with:pricing_tiers|string|max:100',
            'pricing_tiers.*.price' => 'required_with:pricing_tiers|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Gedung properti kos tempat bernaung wajib dipilih.',
            'property_id.exists' => 'Data gedung properti kos yang dipilih tidak valid atau tidak ditemukan.',
            'name.required' => 'Nama klasifikasi tipe kamar wajib diisi (Cth: Deluxe Premium).',
            'base_price.required' => 'Harga sewa dasar untuk tipe kamar ini wajib ditentukan.',
            'base_price.min' => 'Harga sewa dasar minimal bernilai Rp 0.',
            'pricing_tiers.*.name.required_with' => 'Nama label skema tarif berjenjang wajib diisi.',
            'pricing_tiers.*.price.min' => 'Nominal harga tarif berjenjang tidak boleh bernilai negatif.',
        ];
    }

    public function attributes(): array
    {
        return [
            'property_id' => 'Pilihan Properti',
            'name' => 'Nama Tipe Kamar',
            'base_price' => 'Harga Dasar',
            'pricing_tiers' => 'Skema Tarif Berjenjang',
            'pricing_tiers.*.name' => 'Nama Pilihan Tarif',
            'pricing_tiers.*.price' => 'Nominal Tarif Jenjang',
        ];
    }
}
