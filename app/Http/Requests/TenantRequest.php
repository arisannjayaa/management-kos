<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use App\Models\Tenant;
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

    public function rules(): array
    {
        $tenantId = $this->route('id') ? Helper::decrypt($this->route('id')) : null;

        $userId = null;
        if ($tenantId) {
            $userId = Tenant::find($tenantId)?->user_id;
        }

        return [
            'name' => 'required|string|max:150',
            'ktp_number' => 'nullable|string|max:20',
            'ktp_attachment' => 'nullable|image|max:2048', // 🌟 Validasi file upload gambar max 2MB
            'phone' => 'required|string|max:20',
            'emergency_contact' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
            'email' => 'required|email|max:255|unique:users,email,'.$userId,
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama penyewa wajib diisi.',
            'phone.required' => 'Nomor HP/WhatsApp wajib diisi.',
            'email.required' => 'Email untuk akun login portal wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar di sistem KosManager.',
            'status.required' => 'Status hunian tenant wajib dipilih.',
            'ktp_attachment.image' => 'Berkas KTP harus berupa file gambar (JPG/PNG).',
            'ktp_attachment.max' => 'Ukuran berkas KTP maksimal berukuran 2MB.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nama Penyewa',
            'ktp_number' => 'Nomor KTP',
            'ktp_attachment' => 'Foto Lampiran KTP',
            'phone' => 'Nomor WhatsApp',
            'emergency_contact' => 'Kontak Darurat',
            'email' => 'Alamat Email Akun',
            'status' => 'Status Aktif',
        ];
    }
}
