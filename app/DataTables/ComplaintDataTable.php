<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ComplaintDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        $user = auth()->user();
        $query = Complaint::with(['property', 'room', 'tenant']);

        // 🌟 PERBAIKAN: Scoping mencocokkan user_id yang tertanam pada profil tenant
        if ($user->hasRole('tenant')) {
            return $query->whereHas('tenant', function ($q) use ($user) {
                $q->where('user_id', $user->id); // Menggunakan user_id akun yang sedang login
            })->orderBy('created_at', 'desc');
        }

        $ownerId = $user->hasRole('staff')
            ? User::whereHas('roles', fn($q) => $q->where('name', 'owner'))->first()?->id
            : $user->id;

        return $query->whereHas('property', function ($q) use ($ownerId) {
            $q->where('owner_id', $ownerId);
        })->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
                ->orWhere('description', 'like', "%{$keyword}%")
                ->orWhereHas('tenant', fn($sub) => $sub->where('name', 'like', "%{$keyword}%"));
        });
    }

    public function getFilteredQuery(Request $request): Builder
    {
        $query = $this->query();
        if ($request->filled('search')) $this->search($query, $request->input('search'));
        $this->filter($query, $request);
        return $query;
    }

    public function filter(Builder $query, Request $request): void
    {
        if ($request->input('trashed') === '1') $query->onlyTrashed();
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowed = ['title', 'status', 'created_at'];
        if (in_array($field, $allowed)) {
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
            'tenant_id' => Helper::encrypt($row->tenant_id),
            'property_name' => $row->property?->name,
            'room_number' => $row->room?->room_number,
            'tenant_name' => $row->tenant?->name,
            'title' => $row->title,
            'description' => $row->description,
            'status' => $row->status,
            'response_notes' => $row->response_notes,
            'attachment' => $row->attachment ? route('secure.file', ['path' => Helper::encrypt($row->attachment)])
                : null,
            'created_at' => $row->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $row->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $row->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
