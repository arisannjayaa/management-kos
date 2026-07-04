<?php

namespace App\DataTables;

use App\Helpers\Helper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleDataTable extends BaseDataTable
{
    /**
     * Membangun query dasar dengan Eager Loading relasi yang dibutuhkan.
     */
    public function query(): Builder
    {
        return Role::with('permissions');
    }

    /**
     * Menangani logika pencarian global (Global Search).
     */
    public function search(Builder $query, string $keyword): void
    {
        $query->where('name', 'like', "%{$keyword}%")
            ->orWhereHas('permissions', function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%");
            });
    }

    /**
     * Menggabungkan query dengan pencarian dan filter spesifik.
     */
    public function getFilteredQuery(Request $request): Builder
    {
        $query = $this->query();

        if ($request->filled('search')) {
            $this->search($query, $request->input('search'));
        }

        $this->filter($query, $request);

        return $query;
    }

    /**
     * Menangani filter spesifik per kolom (jika dibutuhkan ke depannya).
     */
    public function filter(Builder $query, Request $request): void
    {
        // Role Spatie biasanya tidak memiliki banyak parameter filter khusus.
        // Ruang ini disiapkan jika nanti Anda menambahkan fitur seperti is_active pada Role.
    }

    /**
     * Menangani logika pengurutan (Sorting) data.
     */
    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['name', 'created_at'];

        if (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            // Default sorting: Role terbaru berada di atas
            $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Memetakan koleksi baris database menjadi format array siap pakai untuk UI React.
     */
    public function map($row): array
    {
        return [
            // Catatan: ID bawaan Spatie adalah auto-increment integer,
            // kita tetap mengenkripsinya agar seragam dengan standar Helper Anda.
            'id' => Helper::encrypt($row->id),
            'name' => $row->name,

            'permissions' => $row->permissions ? $row->permissions->map(function ($p) {
                return [
                    'id' => Helper::encrypt($p->id),
                    'name' => $p->name,
                ];
            })->toArray() : [],

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $row->updated_at ? $row->updated_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
