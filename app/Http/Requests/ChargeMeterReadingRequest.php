<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use App\Models\ChargeMeterReading;
use Illuminate\Foundation\Http\FormRequest;

class ChargeMeterReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $permission = $this->route('id') ? 'meter_reading.edit' : 'meter_reading.create';

        return $this->user()->can($permission);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'occupancy_id' => Helper::decrypt($this->occupancy_id) ?? $this->occupancy_id,
            'charge_type_id' => Helper::decrypt($this->charge_type_id) ?? $this->charge_type_id,
        ]);
    }

    public function rules(): array
    {
        $rules = [
            'occupancy_id' => 'required|exists:occupancies,id',
            'charge_type_id' => 'required|exists:charge_types,id',
            'reading_date' => 'required|date',
            'current_reading' => 'required|numeric|min:0',
        ];

        if ($this->filled('occupancy_id') && $this->filled('charge_type_id') && $this->filled('current_reading')) {
            $latest = ChargeMeterReading::where('occupancy_id', $this->occupancy_id)
                ->where('charge_type_id', $this->charge_type_id)
                ->when($this->route('id'), function ($q) {
                    $q->where('id', '!=', Helper::decrypt($this->route('id')));
                })
                ->orderBy('reading_date', 'desc')
                ->first();

            $minReading = $latest ? (float) $latest->current_reading : 0.0;

            // 🌟 DIBERSIHKAN: Menggunakan fungsi penolak Closure untuk membandingkan angka secara realtime
            $rules['current_reading'] = [
                'required',
                'numeric',
                function ($attribute, $value, $fail) use ($minReading) {
                    if ((float) $value < $minReading) {
                        $fail("Angka meteran baru tidak boleh lebih kecil dari meteran sebelumnya ({$minReading}).");
                    }
                },
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'occupancy_id.required' => 'Ikatan kontrak hunian wajib disertakan.',
            'charge_type_id.required' => 'Jenis komponen biaya metered wajib dipilih.',
            'current_reading.required' => 'Angka meteran saat ini tidak boleh kosong.',
        ];
    }
}
