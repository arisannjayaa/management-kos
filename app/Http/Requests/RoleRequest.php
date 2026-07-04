<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna memiliki izin untuk melakukan request ini.
     */
    public function authorize(): bool
    {
        // Berdasarkan seeder, aksi ini membutuhkan permission 'role.manage'
        return $this->user()->can('role.manage');
    }

    /**
     * Menyiapkan data sebelum divalidasi.
     * (Opsional: Jika ada manipulasi/dekripsi array data sebelum divalidasi)
     */
    protected function prepareForValidation()
    {
        // Pastikan permissions selalu berupa array meskipun kosong
        if ($this->has('permissions') && ! is_array($this->permissions)) {
            $this->merge([
                'permissions' => [],
            ]);
        }
    }

    /**
     * Dapatkan aturan validasi dasar yang berlaku untuk request ini.
     */
    public function rules(): array
    {
        // Menangkap parameter {id} dari rute (saat mode Update)
        $roleId = $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:125',
                // Harus unik di tabel roles, KECUALI untuk role yang sedang di-edit ini
                Rule::unique('roles', 'name')->ignore(Helper::decrypt($roleId)),
            ],
            'permissions' => 'nullable|array',

            // Memastikan setiap nama permission yang dikirim benar-benar ada di tabel permissions
            'permissions.*' => 'string|exists:permissions,name',
        ];
    }

    /**
     * Kustomisasi pesan error spesifik dalam Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama Role wajib diisi.',
            'name.string' => 'Format nama Role tidak valid.',
            'name.max' => 'Nama Role terlalu panjang (maksimal 125 karakter).',
            'name.unique' => 'Nama Role ini sudah digunakan. Silakan gunakan nama lain.',

            'permissions.array' => 'Format daftar hak akses tidak valid.',
            'permissions.*.exists' => 'Salah satu hak akses yang dipilih tidak dikenali oleh sistem.',
        ];
    }

    /**
     * Kustomisasi nama atribut untuk pesan error otomatis.
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Role',
            'permissions' => 'Daftar Hak Akses (Permissions)',
        ];
    }
}
