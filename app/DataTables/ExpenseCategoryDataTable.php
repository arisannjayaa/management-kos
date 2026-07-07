<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ExpenseCategoryDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        $ownerId = auth()->user()->hasRole('staff') ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id : auth()->id();

        return ExpenseCategory::where('owner_id', $ownerId)->orderBy('created_at', 'desc'); // Scoping wajib berdasarkan kepemilikan[cite: 3]
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('name', 'like', "%{$keyword}%")->orWhere('description', 'like', "%{$keyword}%");
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
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['name', 'created_at'];
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
            'description' => $row->description,
            'created_at' => $row->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $row->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $row->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
