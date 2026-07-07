<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ExpenseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => Helper::encrypt($this->id),
            'property_id' => Helper::encrypt($this->property_id),
            'expense_category_id' => Helper::encrypt($this->expense_category_id),
            'property_name' => $this->property?->name,
            'category_name' => $this->category?->name,
            'amount' => (float) $this->amount,
            'expense_date' => $this->expense_date ? $this->expense_date->format('Y-m-d') : null,
            'notes' => $this->notes,
            'receipt_attachment' => $this->receipt_attachment ? Storage::url($this->receipt_attachment) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at ?? null,
        ];
    }
}
