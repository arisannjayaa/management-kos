<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('id')) {
            return $this->user()->can('complaint.update');
        }
        return $this->user()->can('complaint.create');
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'attachment' => 'nullable|image|max:2048',
        ];

        // Jika diupdate oleh Staff/Owner untuk memberikan tanggapan status
        if ($this->route('id')) {
            $rules['status'] = 'required|in:pending,processing,resolved,rejected';
            $rules['response_notes'] = 'nullable|string|max:1000';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul komplain wajib diisi.',
            'description.required' => 'Deskripsi keluhan wajib ditulis secara jelas.',
            'attachment.image' => 'Berkas bukti harus berupa gambar (JPG/PNG).',
            'attachment.max' => 'Ukuran gambar bukti maksimal berukuran 2MB.',
            'status.required' => 'Status perkembangan tiket komplain wajib ditentukan.',
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'Judul Keluhan',
            'description' => 'Deskripsi Keluhan',
            'attachment' => 'Foto Bukti',
            'status' => 'Status Tiket',
            'response_notes' => 'Catatan Tanggapan Staff',
        ];
    }
}
