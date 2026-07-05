<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'invoice_id' => Helper::encrypt($this->invoice_id),
            'receiver_id' => Helper::encrypt($this->receiver_id),
            'payment_number' => $this->payment_number,
            'amount_paid' => (float) $this->amount_paid,
            'payment_date' => $this->payment_date ? $this->payment_date->format('Y-m-d H:i:s') : null,
            'payment_method' => $this->payment_method, // cash, transfer

            // 🌟 Amankan berkas bukti transfer lewat SecureFile URL Token
            'proof_attachment' => $this->proof_attachment
                ? route('secure.file', ['path' => Helper::encrypt($this->proof_attachment)])
                : null,

            'notes' => $this->notes,

            // Eager loading profil staff/owner penerima dana
            'receiver_name' => $this->receiver->name ?? 'Sistem',
        ];
    }
}
