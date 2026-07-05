<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChargeTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => Helper::encrypt($this->id),
            'property_id'    => Helper::encrypt($this->property_id),
            'name'           => $this->name,
            'billing_method' => $this->billing_method, // flat, metered, per_occupant
            'default_amount' => (float) $this->default_amount,
            'unit_label'     => $this->unit_label,
            'unit_price'     => (float) $this->unit_price,
            'is_active'      => (bool) $this->is_active,
            'created_at'     => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,

            // Relasi bersyarat jika dimuat
            'property'       => new PropertyResource($this->whenLoaded('property')),
        ];
    }
}
