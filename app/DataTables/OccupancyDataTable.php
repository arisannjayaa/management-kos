<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Occupancy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class OccupancyDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // Ambil data okupansi berjalan di bawah properti gedung milik owner yang login
        return Occupancy::with(['property', 'room', 'roomType', 'tenant', 'pricingTier'])
            ->whereHas('property', function ($q) {
                $q->where('owner_id', auth()->id());
            })
            ->orderBy('status', 'asc')
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->whereHas('tenant', function ($subQ) use ($keyword) {
                $subQ->where('name', 'like', "%{$keyword}%");
            })
                ->orWhereHas('room', function ($subQ) use ($keyword) {
                    $subQ->where('room_number', 'like', "%{$keyword}%");
                })
                ->orWhereHas('property', function ($subQ) use ($keyword) {
                    $subQ->where('name', 'like', "%{$keyword}%");
                });
        });
    }

    public function getFilteredQuery(Request $request): Builder
    {
        $query = $this->query();

        if ($request->filled('search')) {
            $this->search($query, $request->input('search'));
        }

        $this->filter($query, $request);

        return $query;
    }

    public function filter(Builder $query, Request $request): void
    {
        if ($request->input('trashed') === '1') {
            $query->onlyTrashed();
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->where('property_id', Helper::decrypt($propId) ?? $propId);
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['start_date', 'billing_day', 'status', 'created_at'];

        if ($field === 'room_number') {
            $query->orderBy(
                \App\Models\Room::select('room_number')->whereColumn('rooms.id', 'occupancies.room_id'),
                $direction
            );
        } elseif (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    public function map($row): array
    {
        return [
            'id' => Helper::encrypt($row->id),
            'property_id' => Helper::encrypt($row->property_id),
            'room_id' => Helper::encrypt($row->room_id),
            'room_type_id' => Helper::encrypt($row->room_type_id),
            'tenant_id' => Helper::encrypt($row->tenant_id),
            'room_type_pricing_tier_id' => $row->room_type_pricing_tier_id ? Helper::encrypt($row->room_type_pricing_tier_id) : null,

            'start_date' => $row->start_date ? $row->start_date->format('Y-m-d') : null,
            'end_date' => $row->end_date ? $row->end_date->format('Y-m-d') : null,
            'billing_day' => (int) $row->billing_day,
            'price' => (float) $row->price,
            'deposit_amount' => (float) $row->deposit_amount,
            'status' => $row->status, // active, checked_out

            'property' => $row->property ? [
                'id' => Helper::encrypt($row->property->id),
                'name' => $row->property->name,
            ] : null,

            'room' => $row->room ? [
                'id' => Helper::encrypt($row->room->id),
                'room_number' => $row->room->room_number,
            ] : null,

            'room_type' => $row->roomType ? [
                'id' => Helper::encrypt($row->roomType->id),
                'name' => $row->roomType->name,
            ] : null,

            'tenant' => $row->tenant ? [
                'id' => Helper::encrypt($row->tenant->id),
                'name' => $row->tenant->name,
                'phone' => $row->tenant->phone,
            ] : null,

            'pricing_tier' => $row->pricingTier ? [
                'id' => Helper::encrypt($row->pricingTier->id),
                'name' => $row->pricingTier->name,
                'price' => (float) $row->pricingTier->price,
            ] : null,

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
