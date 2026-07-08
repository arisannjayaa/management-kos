<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplaintResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // 🌟 KONSISTENSI MUTLAK: Struktur dibuat kembar simetris 1:1 dengan Map di ComplaintDataTable
        return [
            'id' => Helper::encrypt($this->id),
            'property_id' => Helper::encrypt($this->property_id),
            'room_id' => Helper::encrypt($this->room_id),
            'tenant_id' => Helper::encrypt($this->tenant_id),

            // Mengurai data string dari relasi lintas model anak/induk
            'property_name' => $this->property?->name,
            'room_number' => $this->room?->room_number,
            'tenant_name' => $this->tenant?->name,

            // Inti payload aduan
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status, // pending, processing, resolved, rejected
            'response_notes' => $this->response_notes,

            // Tautan url unduh file gambar bukti aduan fasilitas kos
            'attachment' => $this->attachment ? route('secure.file', ['path' => Helper::encrypt($this->attachment)])
                : null,

            // Penyelarasan format waktu pelaporan objek Carbon demi kelancaran parsing di React JS
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $this->deleted_at ? $this->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
