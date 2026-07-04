<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BulkActionPropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'ids' => [
                'required',
                'array',
                'min:1',
            ],
        ];

        return $rules;
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'ids.array' => 'Data tidak valid.',
            'ids.min' => 'Data tidak valid.',
            'ids.required' => 'Data tidak valid.',
        ];
    }
}
