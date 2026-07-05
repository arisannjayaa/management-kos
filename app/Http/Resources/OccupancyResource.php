<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Resources\Json\JsonResource;

class OccupancyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'property_id' => Helper::encrypt($this->property_id),
            'room_id' => Helper::encrypt($this->room_id),
            'room_type_id' => Helper::encrypt($this->room_type_id),
            'tenant_id' => Helper::encrypt($this->tenant_id),
            'room_type_pricing_tier_id' => $this->room_type_pricing_tier_id ? Helper::encrypt($this->room_type_pricing_tier_id) : null,

            'start_date' => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'end_date' => $this->end_date ? $this->end_date->format('Y-m-d') : null,
            'billing_day' => (int) $this->billing_day,
            'price' => (float) $this->price,
            'deposit_amount' => (float) $this->deposit_amount,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'property' => new PropertyResource($this->whenLoaded('property')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
        ];
    }
}
