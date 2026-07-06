<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'invoice_id' => Helper::encrypt($this->invoice_id),
            'payment_number' => $this->payment_number,
            'amount_paid' => (float) $this->amount_paid,
            'payment_date' => $this->payment_date ? $this->payment_date->format('Y-m-d H:i') : null,
            'payment_method' => $this->payment_method,
            'proof_attachment' => $this->proof_attachment ? Storage::url($this->proof_attachment) : null,
            'notes' => $this->notes,
            'receiver_name' => $this->receiver?->name ?? 'System',
            'invoice_number' => $this->invoice?->invoice_number,
            'tenant_name' => $this->invoice?->tenant?->name,
            'room_number' => $this->invoice?->room?->room_number,
            'property_name' => $this->invoice?->property?->name,
        ];
    }
}
