<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use Illuminate\Foundation\Http\FormRequest;

class ChargeTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can($this->route('id') ? 'charge_type.edit' : 'charge_type.create');
    }

    protected function prepareForValidation(): void
    {
        // Jalur dekripsi ID Properti jika dikirim dalam bentuk terenkripsi dari frontend
        if ($this->filled('property_id')) {
            $this->merge([
                'property_id' => Helper::decrypt($this->property_id) ?? $this->property_id,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'property_id'    => 'required|uuid|exists:properties,id',
            'name'           => 'required|string|max:100',
            'billing_method' => 'required|in:flat,metered,per_occupant',
            'default_amount' => 'nullable|numeric|min:0',
            'unit_label'     => 'nullable|required_if:billing_method,metered|string|max:20',
            'unit_price'     => 'nullable|required_if:billing_method,metered|numeric|min:0',
            'is_active'      => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required'    => 'Gedung properti wajib ditentukan.',
            'name.required'           => 'Nama komponen biaya tidak boleh kosong.',
            'billing_method.required' => 'Metode perhitungan tagihan wajib dipilih.',
            'unit_label.required_if'  => 'Label satuan (Cth: kWh/M3) wajib diisi jika menggunakan metode metered.',
            'unit_price.required_if'  => 'Harga per satuan unit wajib diisi jika menggunakan metode metered.',
        ];
    }
}
