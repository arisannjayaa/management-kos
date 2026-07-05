<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecordPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Pengamanan Spatie Gate untuk otoritas kasir keuangan
        return $this->user()->can('invoice.pay');
    }

    public function rules(): array
    {
        return [
            'amount_paid' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,transfer',
            'proof_attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048', // Opsional untuk bukti transfer
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'amount_paid.required' => 'Nominal jumlah uang yang dibayarkan wajib diisi.',
            'amount_paid.min' => 'Nominal pembayaran tidak boleh minus atau nol.',
            'payment_method.in' => 'Metode pembayaran wajib memilih Cash atau Transfer Bank.',
            'proof_attachment.max' => 'Ukuran berkas bukti transfer terlalu besar. Maksimal 2MB.',
        ];
    }
}
