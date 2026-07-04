<?php

namespace App\DataTables;

use App\Helpers\Helper;
use App\Models\Debt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DebtDataTable extends BaseDataTable
{
    public function query(): Builder
    {
        // 🌟 PERBAIKAN: Tambahkan 'contact' ke dalam Eager Loading array
        return Debt::with(['contact', 'category', 'tags', 'payments' => function ($q) {
            $q->orderBy('installment_no', 'asc');
        }])->where('user_id', auth()->id())
            ->orderBy('updated_at', 'desc');
    }

    public function search(Builder $query, string $keyword): void
    {
        $query->where(function ($q) use ($keyword) {
            // 🌟 PERBAIKAN: Memungkinkan pencarian berdasarkan nama kontak dari tabel relasi,
            // sekaligus fallback ke kolom contact_name lama.
            $q->whereHas('contact', function ($subQ) use ($keyword) {
                $subQ->where('name', 'like', "%{$keyword}%");
            })
                ->orWhere('contact_name', 'like', "%{$keyword}%")
                ->orWhere('description', 'like', "%{$keyword}%")
                ->orWhere('item_name', 'like', "%{$keyword}%")
                ->orWhere('deposit_target_name', 'like', "%{$keyword}%");
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

    public function getSummaryTotals(Request $request): array
    {
        $query = $this->getFilteredQuery($request);

        $totalDebt = (clone $query)
            ->where('type', 'debt')
            ->where('status', '!=', 'paid')
            ->sum('remaining_amount');

        $totalReceivables = (clone $query)
            ->where('type', 'receivables')
            ->where('status', '!=', 'paid')
            ->sum('remaining_amount');

        return [
            'total_debt' => (float) $totalDebt,
            'total_receivables' => (float) $totalReceivables,
            'net_balance' => (float) ($totalReceivables - $totalDebt),
        ];
    }

    public function filter(Builder $query, Request $request): void
    {
        if ($request->input('trashed') === '1') {
            $query->onlyTrashed();
        }

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('payment_method') && $request->input('payment_method') !== 'all') {
            $query->where('payment_method', $request->input('payment_method'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id') && $request->input('category_id') !== 'all') {
            $catId = $request->input('category_id');
            $decrypted = Helper::decrypt($catId);
            $query->where('category_id', $decrypted ?? $catId);
        }

        // 🌟 TAMBAHAN FILTER: Menyaring berdasarkan Kontak Tertentu (berguna saat melihat histori satu klien)
        if ($request->filled('contact_id') && $request->input('contact_id') !== 'all') {
            $contactId = $request->input('contact_id');
            $decrypted = Helper::decrypt($contactId);
            $query->where('contact_id', $decrypted ?? $contactId);
        }

        if ($request->filled('is_deposit')) {
            $query->where('is_deposit', $request->boolean('is_deposit'));
        }

        if ($request->filled('start_due_date')) {
            $query->whereDate('due_date', '>=', $request->input('start_due_date'));
        }
        if ($request->filled('end_due_date')) {
            $query->whereDate('due_date', '<=', $request->input('end_due_date'));
        }

        if ($request->filled('min_amount')) {
            $query->where('amount', '>=', $request->input('min_amount'));
        }
        if ($request->filled('max_amount')) {
            $query->where('amount', '<=', $request->input('max_amount'));
        }

        if ($request->filled('tag_ids')) {
            $tagInput = $request->input('tag_ids');
            $tagIds = is_array($tagInput) ? $tagInput : explode(',', $tagInput);
            $tagIds = array_filter($tagIds);

            if (!empty($tagIds)) {
                $decryptedTagIds = array_map(function ($encryptedId) {
                    return Helper::decrypt($encryptedId) ?? $encryptedId;
                }, $tagIds);

                $query->whereHas('tags', function ($q) use ($decryptedTagIds) {
                    $q->whereIn('tags.id', $decryptedTagIds);
                });
            }
        }
    }

    public function sort(Builder $query, string $field, string $direction): void
    {
        $allowedSorts = [
            'contact_name', 'type', 'payment_method', 'amount',
            'remaining_amount', 'due_date', 'status', 'created_at'
        ];

        // 🌟 PERBAIKAN: Tangani sorting jika relasi contact yang ditekan
        if ($field === 'contact') {
            $query->orderBy(
                Contact::select('name')
                    ->whereColumn('contacts.id', 'debts.contact_id'),
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
            'transaction_id' => $row->transaction_id ? Helper::encrypt($row->transaction_id) : null,

            // 🌟 PARAMETER BARU: Objek kontak untuk React
            'contact' => $row->contact ? [
                'id' => Helper::encrypt($row->contact->id),
                'name' => $row->contact->name,
                'phone_number' => $row->contact->phone_number,
                'type' => $row->contact->type,
            ] : null,

            'contact_name' => $row->contact_name, // Dipertahankan untuk fallback backward compatibility
            'type' => $row->type,
            'payment_method' => $row->payment_method,

            'amount' => (int) $row->amount,
            'remaining_amount' => (int) $row->remaining_amount,

            'status' => $row->status,
            'is_deposit' => (bool) $row->is_deposit,
            'deposit_target_name' => $row->deposit_target_name,

            'description' => $row->description,
            'due_date' => $row->due_date ? $row->due_date->format('Y-m-d') : null,
            'last_reminded_at' => $row->last_reminded_at ? $row->last_reminded_at->format('Y-m-d H:i:s') : null, // Info tracking WA Gateway

            'item_name' => $row->item_name,
            'reference_url' => $row->reference_url,

            'category' => $row->category ? [
                'id' => Helper::encrypt($row->category->id),
                'name' => $row->category->name,
                'color' => $row->category->color,
            ] : null,

            'tags' => $row->tags ? $row->tags->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'slug' => $t->slug,
                ];
            })->toArray() : [],

            'payments' => $row->payments ? $row->payments->map(function ($pay) {
                return [
                    'id' => Helper::encrypt($pay->id),
                    'debt_id' => Helper::encrypt($pay->debt_id),
                    'amount_paid' => (int) $pay->amount_paid,
                    'payment_date' => $pay->payment_date ? $pay->payment_date->format('Y-m-d') : null,
                    'due_date' => $pay->due_date ? $pay->due_date->format('Y-m-d') : null,
                    'status' => $pay->status,
                    'installment_no' => $pay->installment_no,
                    'notes' => $pay->notes,
                ];
            })->toArray() : [],

            'payments_count' => $row->payments ? $row->payments->count() : 0,

            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
            'deleted_at' => $row->deleted_at,
        ];
    }
}
