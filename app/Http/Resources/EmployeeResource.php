<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
// Sesuaikan namespace helper Anda
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => Helper::encrypt($this->id),
            'user_id' => Helper::encrypt($this->user_id),
            'employee_code' => $this->employee_code,
            'id_card_number' => $this->id_card_number,
            'telephone' => $this->telephone,
            'address' => $this->address,
            'division' => $this->division,
            'level' => $this->level,
            'status' => $this->status,
            'joined_at' => $this->joined_at,
            'user' => [
                'name' => $this->whenLoaded('user', fn () => $this->user->name),
                'email' => $this->whenLoaded('user', fn () => $this->user->email),
            ],
        ];
    }
}
