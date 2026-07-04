<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use Illuminate\Foundation\Http\FormRequest;

class RoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('id')) {
            return $this->user()->can('room.update');
        }

        return $this->user()->can('room.create');
    }

    /**
     * Otomatis memecah dan mendekripsi relasi ID induk sebelum proses pengecekan constraints database.
     */
    protected function prepareForValidation()
    {
        $propertyId = $this->input('property_id');
        $roomTypeId = $this->input('room_type_id');

        // 🌟 KUNCI PERBAIKAN: Pastikan string kosong "" diubah menjadi null sebelum validasi
        $this->merge([
            'property_id' => (! empty($propertyId) && $propertyId !== '') ? (Helper::decrypt($propertyId) ?? $propertyId) : null,
            'room_type_id' => (! empty($roomTypeId) && $roomTypeId !== '') ? (Helper::decrypt($roomTypeId) ?? $roomTypeId) : null,
        ]);
    }

    public function rules(): array
    {
        $isUpdate = ! empty($this->route('id'));

        return [
            'property_id' => $isUpdate ? 'nullable|exists:properties,id' : 'required|exists:properties,id',
            'room_type_id' => 'required|exists:room_types,id',
            'room_number' => 'required|string|max:50',
            'status' => 'nullable|in:available,occupied,maintenance',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Gedung properti penempatan kamar wajib ditentukan.',
            'room_type_id.required' => 'Klasifikasi tipe kamar wajib ditentukan.',
            'room_type_id.exists' => 'Tipe kamar yang dipilih tidak ditemukan di dalam sistem.',
            'room_number.required' => 'Nomor atau kode identitas kamar wajib diisi.',
            'status.in' => 'Status kondisi operasional kamar tidak valid.',
        ];
    }

    public function attributes(): array
    {
        return [
            'property_id' => 'Gedung Properti',
            'room_type_id' => 'Kategori Tipe Kamar',
            'room_number' => 'Nomor Kamar',
            'status' => 'Status Operasional',
        ];
    }
}
