<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class RoomDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        $ownerId = auth()->user()->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : auth()->id();

        return Room::with(['property', 'roomType'])
            ->whereHas('property', function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId);
            });
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('room_number', 'like', "%{$keyword}%")
                ->orWhereHas('roomType', function ($subQ) use ($keyword) {
                    $subQ->where('name', 'like', "%{$keyword}%");
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

        // Resolusi filter ber-UUID Enkripsi
        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->where('property_id', Helper::decrypt($propId) ?? $propId);
        }

        if ($request->filled('room_type_id') && $request->input('room_type_id') !== 'all') {
            $typeId = $request->input('room_type_id');
            $query->where('room_type_id', Helper::decrypt($typeId) ?? $typeId);
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['room_number', 'status', 'created_at'];

        if ($field === 'room_type') {
            $query->orderBy(
                RoomType::select('name')->whereColumn('room_types.id', 'rooms.room_type_id'),
                $direction
            );
        } elseif (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            $query->orderBy('room_number', 'asc');
        }
    }

    public function map($row): array
    {
        return [
            'id' => Helper::encrypt($row->id),
            'room_number' => $row->room_number,
            'status' => $row->status, // available, occupied, maintenance

            'property' => $row->property ? [
                'id' => Helper::encrypt($row->property->id),
                'name' => $row->property->name,
            ] : null,

            'room_type' => $row->roomType ? [
                'id' => Helper::encrypt($row->roomType->id),
                'name' => $row->roomType->name,
                'base_price' => (float) $row->roomType->base_price,
                'pricing_tiers' => $row->roomType->pricingTiers->map(fn ($tier) => [
                    'id' => Helper::encrypt($tier->id),
                    'name' => $tier->name,
                    'price' => (float) $tier->price,
                ])->toArray(),
            ] : null,

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $row->deleted_at ? $row->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
