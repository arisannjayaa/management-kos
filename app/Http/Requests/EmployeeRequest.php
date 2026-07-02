<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use App\Models\Employee;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EmployeeRequest extends FormRequest
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
        $password = Helper::decrypt($this->id) ? '' : ['required', 'min:8'];
        $rules = [
            'name' => [
                'required',
            ],
            'id_card_number' => [
                'required',
                'max:255',
            ],
            'division' => [
                'required',
                'max:255',
            ],
            'level' => [
                'required',
                'max:255',
            ],
            'status' => [
                'required',
                'max:255',
            ],
            'address' => [
                'required',
                'max:255',
            ],
            'joined_at' => [
                'required',
                'date',
            ],
            'email' => [
                'required',
                'email',
                function (string $attribute, mixed $value, Closure $fail) {
                    $existingData = User::query()
                        ->where('email', $value)
                        ->first();

                    if ($existingData) {
                        $currentId = $this->user_id ? Helper::decrypt($this->user_id) : null;

                        if ($currentId && $existingData->id == $currentId) {
                            return;
                        }

                        $fail("Email '{$value}' sudah digunakan. Silakan gunakan email lain.");
                    }
                },
            ],
            'password' => $password,
//            'password_confirmation' => ['required'],
            'telephone' => [
                'required',
                'min:8',
                'regex:/^(?:\+62|62|0)8\d{8,11}$/'],
            function (string $attribute, mixed $value, Closure $fail) {
                $existingData = Employee::query()
                    ->where('telephone', $value)
                    ->first();

                if ($existingData) {
                    $currentId = $this->id ? Helper::decrypt($this->id) : null;

                    if ($currentId && $existingData->id == $currentId) {
                        return;
                    }

                    $fail("No Telepon '{$value}' sudah digunakan. Silakan gunakan no telepon lain.");
                }
            },
        ];

        if ($this->has('user_id') && $this->input('user_id') != null) {
            unset($rules['password'], $rules['password_confirmation']);
        }

//        if ($this->filled('password') || $this->filled('password_confirmation')) {
//            $rules['password'] = ['required', 'min:8', 'confirmed'];
//            $rules['password_confirmation'] = ['required'];
//        }

        return $rules;
    }

    /**
     * @return string[]
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tidak boleh kosong.',
            'telephone.regex' => 'Format salah.',
            'email.required' => 'Tidak boleh kosong.',
            'email.email' => 'Format salah.',
            'email.unique' => 'Harus bersifat unik.',
            'password.required' => 'Tidak boleh kosong.',
            'password.min' => 'Harus memiliki panjang 8 karakter',
            'password.confirmed' => 'Ulangi kata sandi tidak sama.',
            'telephone.required' => 'Tidak boleh kosong.',
            'telephone.min' => 'Harus memiliki panjang 8 karakter',
            'telephone.unique' => 'Sudah digunakan.',
            'address.max' => 'Maksimal 255 karakter',
            'address.required' => 'Tidak boleh kosong.',
            'password_confirmation.required' => 'Ulangi kata tidak boleh kosong.',
            'id_card_number.required' => 'Tidak boleh kosong.',
            'id_card_number.unique' => 'Sudah digunakan',
            'id_card_number_attachment.required' => 'Tidak boleh kosong.',
            'role_id.required' => 'Tidak boleh kosong.',
            'religion.required' => 'Tidak boleh kosong.',
            'religion.max' => 'Tidak boleh lebih dari 255 karakter.',
            'employee_code.required' => 'Tidak boleh kosong.',
            'department.required' => 'Tidak boleh kosong.',
            'department.max' => 'Tidak boleh lebih dari 255 karakter.',
            'division.required' => 'Tidak boleh kosong.',
            'division.max' => 'Tidak boleh lebih dari 255 karakter.',
            'level.required' => 'Tidak boleh kosong.',
            'level.max' => 'Tidak boleh lebih dari 255 karakter.',
            'joined_at.required' => 'Tidak boleh kosong.',
            'joined_at.date' => 'Format tidak valid.',
        ];
    }
}
