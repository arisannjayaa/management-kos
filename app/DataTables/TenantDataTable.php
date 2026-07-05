<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TenantDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // Scope data: Owner hanya bisa melihat penyewa yang didaftarkannya sendiri
        return Tenant::withCount('occupancies')
            ->where('owner_id', auth()->id())
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('phone', 'like', "%{$keyword}%")
                ->orWhere('ktp_number', 'like', "%{$keyword}%");
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
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['name', 'status', 'created_at'];

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
            'ktp_number' => $row->ktp_number,
            'phone' => $row->phone,
            'emergency_contact' => $row->emergency_contact,
            'status' => $row->status, // active, inactive

            // Instan counter log kontrak sewa
            'occupancies_count' => (int) ($row->occupancies_count ?? 0),
            'ktp_attachment' => $row->ktp_attachment
                ? route('secure.file', ['path' => Helper::encrypt($row->ktp_attachment)])
                : null,

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $row->updated_at ? $row->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $row->deleted_at ? $row->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
