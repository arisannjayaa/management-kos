<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class EmployeeDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        return Employee::query()->with('user');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('id_card_number', 'like', "%{$keyword}%")
                ->orWhere('telephone', 'like', "%{$keyword}%")
                ->orWhere('address', 'like', "%{$keyword}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                );
        });
    }

    public function filter(Builder $query, Request $request): void
    {
        $query->when($request->division, fn ($q, $div) => $q->where('division', $div))
            ->when($request->level, fn ($q, $lvl) => $q->where('level', $lvl))
            ->when($request->status, fn ($q, $sts) => $q->where('status', $sts));
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['id_card_number', 'telephone', 'division', 'level', 'status', 'joined_at', 'created_at'];

        if ($field === 'name') {
            $query->orderByRaw("(SELECT name FROM users WHERE users.id = employees.user_id) {$direction}");
        } elseif (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    public function map($row): array
    {
        return [
            'id' => Helper::encrypt($row->id),
            'employee_code' => $row->employee_code,
            'id_card_number' => $row->id_card_number,
            'telephone' => $row->telephone,
            'address' => $row->address,
            'division' => $row->division,
            'level' => $row->level,
            'status' => $row->status,
            'joined_at' => $row->joined_at,
            'user' => [
                'name' => $row->user->name ?? '-',
                'email' => $row->user->email ?? '-',
            ],
        ];
    }
}
