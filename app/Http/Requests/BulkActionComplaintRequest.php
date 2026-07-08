<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkActionComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['ids' => ['required', 'array', 'min:1']];
    }

    public function messages(): array
    {
        return ['ids.array' => 'Data tidak valid.', 'ids.min' => 'Data tidak valid.', 'ids.required' => 'Data tidak valid.'];
    }
}
