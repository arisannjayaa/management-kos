<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'owner_id' => Helper::encrypt($this->owner_id),
            'name' => $this->name,
            'ktp_number' => $this->ktp_number,
            'phone' => $this->phone,
            'emergency_contact' => $this->emergency_contact,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at ?? null,

            'occupancies' => OccupancyResource::collection($this->whenLoaded('occupancies')),
        ];
    }
}
