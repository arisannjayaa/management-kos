<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'property_id' => Helper::encrypt($this->property_id),
            'room_id' => Helper::encrypt($this->room_id),
            'tenant_id' => Helper::encrypt($this->tenant_id),
            'occupancy_id' => Helper::encrypt($this->occupancy_id),

            'invoice_number' => $this->invoice_number,
            'period_start' => $this->period_start ? $this->period_start->format('Y-m-d') : null,
            'period_end' => $this->period_end ? $this->period_end->format('Y-m-d') : null,
            'due_date' => $this->due_date ? $this->due_date->format('Y-m-d') : null,

            // Parameter Finansial Kasir
            'amount' => (float) $this->amount,
            'discount_amount' => (float) $this->discount_amount,
            'final_amount' => (float) $this->final_amount,
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => (float) ($this->final_amount - $this->paid_amount), // Sisa tunggakan

            'status' => $this->status, // unpaid, partially_paid, paid, void
            'notes' => $this->notes,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,

            // Relasi Eager Loading kondisional
            'property' => new PropertyResource($this->whenLoaded('property')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
