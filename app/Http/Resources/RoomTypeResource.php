<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'property_id' => Helper::encrypt($this->property_id),
            'name' => $this->name,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Mengurai data anak Pricing Tiers secara otomatis dari relasi model
            'pricing_tiers' => $this->whenLoaded('pricingTiers', function () {
                return $this->pricingTiers->map(fn ($tier) => [
                    'id' => Helper::encrypt($tier->id),
                    'room_type_id' => Helper::encrypt($tier->room_type_id),
                    'name' => $tier->name,
                    'price' => (float) $tier->price,
                ]);
            }),

            'property' => new PropertyResource($this->whenLoaded('property')),
        ];
    }
}
