<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Pembedaan create/update lewat route('id')[cite: 3]
        if ($this->route('id')) {
            return $this->user()->can('expense_category.update');
        }
        return $this->user()->can('expense_category.create');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max' => 'Nama kategori maksimal 255 karakter.',
        ];
    }

    public function attributes(): array
    {
        return ['name' => 'Nama Kategori', 'description' => 'Deskripsi Kategori'];
    }
}
