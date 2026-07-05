<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class InvoiceDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // Scope data: Hanya memuat invoice dari properti milik Owner yang sedang login
        return Invoice::with(['property', 'room', 'tenant', 'occupancy'])
            ->whereHas('property', function ($q) {
                $q->where('owner_id', auth()->id());
            })
            ->orderBy('created_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('invoice_number', 'like', "%{$keyword}%")
                ->orWhereHas('tenant', function ($subQ) use ($keyword) {
                    $subQ->where('name', 'like', "%{$keyword}%");
                })
                ->orWhereHas('room', function ($subQ) use ($keyword) {
                    $subQ->where('room_number', 'like', "%{$keyword}%");
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

        // Filter berdasarkan Status Pembayaran (unpaid, partially_paid, paid, void)
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Filter spesifik per Gedung Properti
        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->where('property_id', Helper::decrypt($propId) ?? $propId);
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['invoice_number', 'due_date', 'final_amount', 'status', 'created_at'];

        if ($field === 'room_number') {
            $query->orderBy(
                \App\Models\Room::select('room_number')->whereColumn('rooms.id', 'invoices.room_id'),
                $direction
            );
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
            'property_id' => Helper::encrypt($row->property_id),
            'room_id' => Helper::encrypt($row->room_id),
            'tenant_id' => Helper::encrypt($row->tenant_id),
            'occupancy_id' => Helper::encrypt($row->occupancy_id),

            'invoice_number' => $row->invoice_number,
            'period_start' => $row->period_start ? $row->period_start->format('Y-m-d') : null,
            'period_end' => $row->period_end ? $row->period_end->format('Y-m-d') : null,
            'due_date' => $row->due_date ? $row->due_date->format('Y-m-d') : null,

            // Parameter Finansial Kasir (Cast ke Float/Numeric agar aman di JavaScript)
            'amount' => (float) $row->amount,
            'discount_amount' => (float) $row->discount_amount,
            'final_amount' => (float) $row->final_amount,
            'paid_amount' => (float) $row->paid_amount,
            'remaining_amount' => (float) ($row->final_amount - $row->paid_amount), // Sisa tunggakan

            'status' => $row->status, // unpaid, partially_paid, paid, void
            'notes' => $row->notes,

            'property' => $row->property ? [
                'id' => Helper::encrypt($row->property->id),
                'name' => $row->property->name,
            ] : null,

            'room' => $row->room ? [
                'id' => Helper::encrypt($row->room->id),
                'room_number' => $row->room->room_number,
            ] : null,

            'tenant' => $row->tenant ? [
                'id' => Helper::encrypt($row->tenant->id),
                'name' => $row->tenant->name,
                'phone' => $row->tenant->phone,
            ] : null,

            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
