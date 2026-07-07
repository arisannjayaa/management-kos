<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('id')) {
            return $this->user()->can('expense.update');
        }
        return $this->user()->can('expense.create');
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|string',
            'expense_category_id' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'receipt_attachment' => 'nullable|image|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Gedung kos wajib dipilih.',
            'expense_category_id.required' => 'Kategori pengeluaran wajib dipilih.',
            'amount.required' => 'Nominal pengeluaran wajib diisi.',
            'amount.min' => 'Nominal tidak boleh minus.',
            'expense_date.required' => 'Tanggal pengeluaran wajib diisi.',
            'receipt_attachment.image' => 'Lampiran harus berupa file gambar (JPG/PNG).',
            'receipt_attachment.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }

    public function attributes(): array
    {
        return [
            'property_id' => 'Gedung Kos',
            'expense_category_id' => 'Kategori Pengeluaran',
            'amount' => 'Nominal Biaya',
            'expense_date' => 'Tanggal Biaya',
            'notes' => 'Catatan Tambahan',
            'receipt_attachment' => 'Lampiran Struk',
        ];
    }
}
