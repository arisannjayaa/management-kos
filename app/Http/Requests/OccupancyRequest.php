<?php

namespace App\Http\Requests;

use App\Helpers\Helper;
use Illuminate\Foundation\Http\FormRequest;

class OccupancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('id')) {
            return $this->user()->can('occupancy.update');
        }
        return $this->user()->can('occupancy.create');
    }

    protected function prepareForValidation()
    {
        $propertyId = $this->input('property_id');
        $roomId = $this->input('room_id');
        $roomTypeId = $this->input('room_type_id');
        $tenantId = $this->input('tenant_id');
        $tierId = $this->input('room_type_pricing_tier_id');

        $this->merge([
            'property_id' => (!empty($propertyId)) ? (Helper::decrypt($propertyId) ?? $propertyId) : null,
            'room_id' => (!empty($roomId)) ? (Helper::decrypt($roomId) ?? $roomId) : null,
            'room_type_id' => (!empty($roomTypeId)) ? (Helper::decrypt($roomTypeId) ?? $roomTypeId) : null,
            'tenant_id' => (!empty($tenantId)) ? (Helper::decrypt($tenantId) ?? $tenantId) : null,
            'room_type_pricing_tier_id' => (!empty($tierId)) ? (Helper::decrypt($tierId) ?? $tierId) : null,
        ]);
    }

    public function rules(): array
    {
        $isUpdate = ! empty($this->route('id'));

        return [
            'property_id' => $isUpdate ? 'nullable|exists:properties,id' : 'required|exists:properties,id',
            'room_id' => $isUpdate ? 'nullable|exists:rooms,id' : 'required|exists:rooms,id',
            'room_type_id' => 'required|exists:room_types,id',
            'tenant_id' => 'required|exists:tenants,id',
            'room_type_pricing_tier_id' => 'nullable|exists:room_type_pricing_tiers,id',

            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'billing_day' => 'nullable|integer|between:1,31',
            'price' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'room_id.required' => 'Unit kamar fisik tempat menginap wajib ditentukan.',
            'tenant_id.required' => 'Identitas penyewa yang menempati wajib dipilih.',
            'price.required' => 'Nominal harga deal sewa wajib dikunci.',
            'start_date.required' => 'Tanggal mulai huni (Check-In) wajib ditentukan.',
        ];
    }
}
