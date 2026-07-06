<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PaymentDataTable extends BaseDataTable
{
    /**
     * Query Utama Sumber Data Kuitansi Pembayaran
     */
    public function query(): Builder
    {
        $ownerId = auth()->user()->hasRole('staff')
            ? User::whereHas('roles', fn ($q) => $q->where('name', 'owner'))->first()?->id
            : auth()->id();

        return Payment::with(['invoice.property', 'invoice.room', 'invoice.tenant', 'receiver'])
            ->whereHas('invoice.property', function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId);
            })
            ->orderBy('created_at', 'desc');
    }

    /**
     * Logika Pencatatan Filter Global Berbasis Kata Kunci
     */
    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            $q->where('payment_number', 'like', "%{$keyword}%")
                ->orWhereHas('invoice', function ($sub) use ($keyword) {
                    $sub->where('invoice_number', 'like', "%{$keyword}%");
                })
                ->orWhereHas('invoice.tenant', function ($sub) use ($keyword) {
                    $sub->where('name', 'like', "%{$keyword}%");
                });
        });
    }

    /**
     * Pemicu Pipeline Filter & Search Server-Side
     */
    public function getFilteredQuery(Request $request): Builder
    {
        $query = $this->query();

        if ($request->filled('search')) {
            $this->search($query, $request->input('search'));
        }

        // Jalankan pemisahan filter kustom
        $this->filter($query, $request);

        return $query;
    }

    /**
     * 🌟 IMPLEMENTASI METHOD ABSTRACT: filter
     * Memecah kriteria penyaringan data kuitansi sesuai standar BaseDataTable
     */
    public function filter(Builder $query, Request $request): void
    {
        if ($request->input('trashed') === '1') {
            $query->onlyTrashed();
        }

        // Filter Metode Pembayaran (cash / transfer)
        if ($request->filled('payment_method') && $request->input('payment_method') !== 'all') {
            $query->where('payment_method', $request->input('payment_method'));
        }

        // Filter Spesifik per Gedung Kos Terpilih
        if ($request->filled('property_id') && $request->input('property_id') !== 'all') {
            $propId = $request->input('property_id');
            $query->whereHas('invoice', function ($q) use ($propId) {
                $q->where('property_id', Helper::decrypt($propId) ?? $propId);
            });
        }
    }

    /**
     * 🌟 IMPLEMENTASI METHOD ABSTRACT: sort
     * Menangani request pengurutan kolom dari sisi DataTable UI frontend
     */
    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = ['payment_number', 'payment_date', 'amount_paid', 'created_at'];

        if (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // Default fallback order
        }
    }

    /**
     * Transformasi Data Payload ke JSON Resource
     */
    public function map($row): array
    {
        return [
            'id' => Helper::encrypt($row->id),
            'invoice_id' => Helper::encrypt($row->invoice_id),
            'payment_number' => $row->payment_number,
            'invoice_number' => $row->invoice?->invoice_number ?? 'N/A',
            'amount_paid' => (float) $row->amount_paid,
            'payment_date' => $row->payment_date ? $row->payment_date->format('Y-m-d H:i') : null,
            'payment_method' => $row->payment_method,
            'proof_attachment' => $row->proof_attachment ? Storage::url($row->proof_attachment) : null,
            'notes' => $row->notes,
            'receiver_name' => $row->receiver?->name ?? 'System',
            'tenant_name' => $row->invoice?->tenant?->name ?? '—',
            'room_number' => $row->invoice?->room?->room_number ?? '—',
            'property_name' => $row->invoice?->property?->name ?? '—',
            'created_at' => $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
