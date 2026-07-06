<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChargeMeterReadingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'occupancy_id' => Helper::encrypt($this->occupancy_id),
            'charge_type_id' => Helper::encrypt($this->charge_type_id),
            'charge_type_name' => $this->chargeType->name ?? '-',
            'room_number' => $this->occupancy->room->room_number ?? '-',
            'tenant_name' => $this->occupancy->tenant->name ?? '-',
            'previous_reading' => (float) $this->previous_reading,
            'current_reading' => (float) $this->current_reading,
            'usage' => (float) $this->usage,
            'unit_label' => $this->chargeType->unit_label ?? '',
            'amount' => (float) $this->amount,
            'reading_date' => $this->reading_date->format('Y-m-d'),
            'is_locked' => ! is_null($this->invoice_id), // Mengunci data jika invoice sudah terbit
        ];
    }
}
