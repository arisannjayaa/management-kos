<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('id')) {
            return $this->user()->can('tenant.update');
        }
        return $this->user()->can('tenant.create');
    }

    protected function prepareForValidation()
    {
        // Standarisasi status keaktifan default jika kosong
        $this->merge([
            'status' => $this->input('status', 'active'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'ktp_number' => 'nullable|string|max:20',
            'phone' => 'required|string|max:20',
            'emergency_contact' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
            'ktp_attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap calon penyewa wajib diisi.',
            'phone.required' => 'Nomor WhatsApp aktif wajib dicantumkan untuk pengiriman tagihan.',
            'status.in' => 'Status parameter penyewa tidak valid.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nama Penyewa',
            'phone' => 'No. WhatsApp',
            'ktp_number' => 'No. KTP',
            'ktp_attachment' => 'KTP',
        ];
    }
}
