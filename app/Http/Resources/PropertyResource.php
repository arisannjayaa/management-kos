<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'owner_id' => Helper::encrypt($this->owner_id),
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'billing_cycle_days' => (int) $this->billing_cycle_days,
            'billing_grace_period_days' => (int) $this->billing_grace_period_days,
            'reminder_offsets_json' => $this->reminder_offsets_json ?? [],
            'wa_reminder_enabled' => (bool) $this->wa_reminder_enabled,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at ?? null,

            // Kondisional memuat Tipe Kamar & Unit Kamar jika dipanggil via Eager Loading
            'room_types' => RoomTypeResource::collection($this->whenLoaded('roomTypes')),
            'rooms' => RoomResource::collection($this->whenLoaded('rooms')),
        ];
    }
}
