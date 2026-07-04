<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class RoomTypeDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // Hanya menampilkan tipe kamar dari gedung kos milik owner yang sedang login
        return RoomType::with(['property', 'pricingTiers'])
            ->withCount('rooms')
            ->whereHas('property', function ($q) {
                $q->where('owner_id', auth()->id());
            })
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('description', 'like', "%{$keyword}%")
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

        // Filter berdasarkan gedung properti tertentu (Dekripsi otomatis)
        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->where('property_id', Helper::decrypt($propId) ?? $propId);
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['name', 'base_price', 'created_at'];

        if ($field === 'property') {
            $query->orderBy(
                \App\Models\Property::select('name')->whereColumn('properties.id', 'room_types.property_id'),
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
            'name' => $row->name,
            'description' => $row->description,
            'base_price' => (float) $row->base_price,

            // Mengambil hasil counter otomatis via withCount()
            'rooms_count' => (int) ($row->rooms_count ?? 0),

            'property' => $row->property ? [
                'id' => Helper::encrypt($row->property->id),
                'name' => $row->property->name,
            ] : null,

            // Mengurai skema harga berjenjang (pricing tiers) ke bentuk array terenkripsi
            'pricing_tiers' => $row->pricingTiers ? $row->pricingTiers->map(function ($tier) {
                return [
                    'id' => Helper::encrypt($tier->id),
                    'room_type_id' => Helper::encrypt($tier->room_type_id),
                    'name' => $tier->name,
                    'price' => (float) $tier->price,
                ];
            })->toArray() : [],

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $row->updated_at ? $row->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $row->deleted_at ? $row->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
