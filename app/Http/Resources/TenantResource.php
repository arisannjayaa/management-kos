<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray($request): array
    {
        // Disamakan strukturnya dengan DataTable map demi menghindari malfungsi parsing React component
        return [
            'id' => Helper::encrypt($this->id),
            'owner_id' => Helper::encrypt($this->owner_id),
            'user_id' => Helper::encrypt($this->user_id), // Ditambahkan
            'name' => $this->name,
            'email' => $this->user?->email ?? '-', // Ditambahkan fallback string kasual
            'ktp_number' => $this->ktp_number,

            // Dibuat kembar simetris menggunakan secure routing file bawaan proyek Bli
            'ktp_attachment' => $this->ktp_attachment
                ? route('secure.file', ['path' => Helper::encrypt($this->ktp_attachment)])
                : null,

            'phone' => $this->phone,
            'emergency_contact' => $this->emergency_contact,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at ?? null,

            // Pertahankan relasi koleksi manifestasi kontrak hunian bawaan Bli
            'occupancies' => OccupancyResource::collection($this->whenLoaded('occupancies')),
        ];
    }
}
