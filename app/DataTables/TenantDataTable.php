<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TenantDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // 🌟 IMPLEMENTASI PEDOMAN 9.4: Dynamic Scoping Visibilitas Data Multi-Role (Owner & Staff)
        $user = auth()->user();
        $ownerId = $user->hasRole('staff')
            ? User::whereHas('roles', fn($q) => $q->where('name', 'owner'))->first()?->id
            : $user->id;

        // Eager load relasi 'user' untuk akun portal dan pertahankan hitung kontrak 'occupancies'
        return Tenant::with(['user'])
            ->withCount('occupancies')
            ->where('owner_id', $ownerId)
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")
                ->orWhere('phone', 'like', "%{$keyword}%")
                ->orWhere('ktp_number', 'like', "%{$keyword}%")
                ->orWhereHas('user', function ($sub) use ($keyword) {
                    // Berikan kapabilitas pencarian berdasarkan email akun portal mandiri
                    $sub->where('email', 'like', "%{$keyword}%");
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
        // 🌟 KONSISTENSI MUTLAK: Struktur key dibuat kembar simetris 1:1 dengan TenantResource
        return [
            'id' => Helper::encrypt($row->id),
            'owner_id' => Helper::encrypt($row->owner_id),
            'user_id' => Helper::encrypt($row->user_id), // Ditambahkan untuk pelacakan id user terenkripsi
            'name' => $row->name,
            'email' => $row->user?->email ?? '-', // Fallback tanda strip jika tenant login via no HP tanpa email
            'ktp_number' => $row->ktp_number,
            'phone' => $row->phone,
            'emergency_contact' => $row->emergency_contact,
            'status' => $row->status,

            // Pertahankan instan counter log kontrak sewa bawaan Bli
            'occupancies_count' => (int) ($row->occupancies_count ?? 0),

            // Pertahankan sistem penanganan enkripsi jalur unduh dokumen aman milik Bli
            'ktp_attachment' => $row->ktp_attachment
                ? route('secure.file', ['path' => Helper::encrypt($row->ktp_attachment)])
                : null,

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $row->updated_at ? $row->updated_at->format('Y-m-d H:i:s') : null,
            'deleted_at' => $row->deleted_at ? $row->deleted_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
