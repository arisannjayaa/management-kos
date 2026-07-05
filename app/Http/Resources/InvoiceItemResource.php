<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'invoice_id' => Helper::encrypt($this->invoice_id),
            'name' => $this->name,
            'qty' => (int) $this->qty,
            'price' => (float) $this->price,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
