<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExpenseDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        $ownerId = auth()->user()->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : auth()->id();

        return Expense::with(['property', 'category'])
            ->whereHas('property', function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId);
            })
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('notes', 'like', "%{$keyword}%")
                ->orWhereHas('category', function ($sub) use ($keyword) {
                    $sub->where('name', 'like', "%{$keyword}%");
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
        if ($request->filled('property_id')) {
            $query->where('property_id', Helper::decrypt($request->input('property_id')));
        }
        if ($request->filled('expense_category_id')) {
            $query->where('expense_category_id', Helper::decrypt($request->input('expense_category_id')));
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['amount', 'expense_date', 'created_at'];
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
            'property_id' => Helper::encrypt($row->property_id),
            'expense_category_id' => Helper::encrypt($row->expense_category_id),
            'property_name' => $row->property?->name,
            'category_name' => $row->category?->name,
            'amount' => (float) $row->amount,
            'expense_date' => $row->expense_date?->format('Y-m-d'),
            'notes' => $row->notes,
            'receipt_attachment' => $row->receipt_attachment ? Storage::url($row->receipt_attachment) : null,
            'created_at' => $row->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $row->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $row->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
