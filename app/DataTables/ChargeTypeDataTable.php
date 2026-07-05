<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\ChargeType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ChargeTypeDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        return ChargeType::with(['property'])
            ->whereHas('property', function ($q) {
                $q->where('owner_id', auth()->id()); // Scoping ketat data milik owner login
            });
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where('name', 'like', "%{$keyword}%");
    }

    public function getFilteredQuery(Request $request): Builder
    {
        $query = $this->query();

        if ($request->filled('search')) {
            $this->search($query, $request->input('search'));
        }

        // 🌟 SEKARANG SUDAH MEMANGGIL METHOD FILTER TERSENDIRI
        $this->filter($query, $request);

        return $query;
    }

    public function filter(Builder $query, Request $request): void
    {
        // Filter berdasarkan gedung properti
        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->where('property_id', Helper::decrypt($propId) ?? $propId);
        }

        // Sekalian saya tambahkan filter status aktif/nonaktif untuk kebutuhan frontend nanti
        if ($request->filled('is_active') && $request->input('is_active') !== 'all') {
            $query->where('is_active', $request->input('is_active') === '1');
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['name', 'billing_method', 'default_amount', 'is_active'];

        if (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    public function map($row): array
    {
        return [
            'id'             => Helper::encrypt($row->id),
            'property_id'    => Helper::encrypt($row->property_id),
            'name'           => $row->name,
            'billing_method' => $row->billing_method,
            'default_amount' => (float) $row->default_amount,
            'unit_label'     => $row->unit_label,
            'unit_price'     => (float) $row->unit_price,
            'is_active'      => (bool) $row->is_active,
            'property_name'  => $row->property->name ?? '-',
        ];
    }
}
