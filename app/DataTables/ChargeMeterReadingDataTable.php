<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\ChargeMeterReading;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ChargeMeterReadingDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        $ownerId = auth()->user()->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : auth()->id();

        return ChargeMeterReading::with(['occupancy.tenant', 'occupancy.room', 'chargeType'])
            ->whereHas('occupancy.property', function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId);
            });
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->whereHas('occupancy.room', function ($q) use ($keyword) {
            $q->where('room_number', 'like', "%{$keyword}%");
        })->orWhereHas('occupancy.tenant', function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%");
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
            $query = ChargeMeterReading::onlyTrashed()
                ->with(['occupancy.room', 'occupancy.tenant', 'chargeType'])
                ->whereHas('occupancy.property', function ($q) {
                    $q->where('owner_id', auth()->id());
                });
        } else {
            $query = $this->query();
        }

        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->whereHas('occupancy', function ($q) use ($propId) {
                $q->where('property_id', Helper::decrypt($propId) ?? $propId);
            });
        }

        if ($request->filled('charge_type_id') && $request->input('charge_type_id') !== 'all') {
            $chargeId = $request->input('charge_type_id');
            $query->where('charge_type_id', Helper::decrypt($chargeId) ?? $chargeId);
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $query->orderBy('reading_date', $direction);
    }

    public function map($row): array
    {
        return [
            'id' => Helper::encrypt($row->id),
            'room_number' => $row->occupancy->room->room_number ?? '-',
            'tenant_name' => $row->occupancy->tenant->name ?? '-',
            'charge_type_name' => $row->chargeType->name ?? '-',
            'previous_reading' => (float) $row->previous_reading,
            'current_reading' => (float) $row->current_reading,
            'usage' => (float) $row->usage,
            'unit_label' => $row->chargeType->unit_label ?? '',
            'amount' => (float) $row->amount,
            'reading_date' => $row->reading_date->format('Y-m-d'),
            'is_locked' => ! is_null($row->invoice_id),
        ];
    }
}
