<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'property_id' => Helper::encrypt($this->property_id),
            'room_type_id' => Helper::encrypt($this->room_type_id),
            'room_number' => $this->room_number,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at ?? null,

            // Relasi Induk Gedung & Kategori Tarif Kamar
            'property' => new PropertyResource($this->whenLoaded('property')),
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
        ];
    }
}
