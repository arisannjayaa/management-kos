<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Property;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PropertyDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // Scope data: Owner hanya bisa melihat properti milik dirinya sendiri
        return Property::withCount(['rooms', 'roomTypes'])
            ->where('owner_id', auth()->id())
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('address', 'like', "%{$keyword}%")
                ->orWhere('city', 'like', "%{$keyword}%")
                ->orWhere('phone', 'like', "%{$keyword}%");
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

        if ($request->filled('is_active') && $request->input('is_active') !== 'all') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('city') && $request->input('city') !== 'all') {
            $query->where('city', $request->input('city'));
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['name', 'city', 'is_active', 'created_at'];

        if (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    public function map($row): array
    {
        return [
            'id' => Helper::encrypt($row->id),
            'owner_id' => Helper::encrypt($row->owner_id),
            'name' => $row->name,
            'address' => $row->address,
            'city' => $row->city,
            'phone' => $row->phone,
            'billing_cycle_days' => (int) $row->billing_cycle_days,
            'billing_grace_period_days' => (int) $row->billing_grace_period_days,
            'reminder_offsets_json' => $row->reminder_offsets_json ?? [],
            'wa_reminder_enabled' => (bool) $row->wa_reminder_enabled,
            'is_active' => (bool) $row->is_active,

            // Instan counter relasi dari Eloquent withCount
            'rooms_count' => (int) ($row->rooms_count ?? 0),
            'room_types_count' => (int) ($row->room_types_count ?? 0),

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $row->updated_at ? $row->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $row->deleted_at ? $row->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
