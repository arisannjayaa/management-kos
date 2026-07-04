<?php

namespace App\Http\Resources;

use App\Helpers\Helper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DebtResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => Helper::encrypt($this->id),

            // Mengenkripsi transaction_id (mutasi awal pokok sirkulasi kas) jika ada
            'transaction_id' => $this->transaction_id ? Helper::encrypt($this->transaction_id) : null,

            'contact_name' => $this->contact_name,
            'type'         => $this->type, // 'debt', 'receivables'

            // 🌟 PARAMETER FONDASI: Sertakan payment_method agar dikenali di ekosistem frontend React
            'payment_method' => $this->payment_method, // 'lump_sum', 'installment'

            // Amortisasi Cicilan Barang / Pembelian Aset Event (Kasus 3)
            'item_name'     => $this->item_name,
            'reference_url' => $this->reference_url,

            'amount'           => (int) $this->amount,
            'remaining_amount' => (int) $this->remaining_amount,

            // Kontrol Akseptasi Uang Titipan Sementara (Kasus 2)
            'is_deposit'          => (bool) $this->is_deposit,
            'deposit_target_name' => $this->deposit_target_name,

            'description' => $this->description,
            'due_date'    => $this->due_date ? $this->due_date->format('Y-m-d') : null,
            'status'      => $this->status, // 'unpaid', 'partial', 'paid'

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at ?? null,

            // ─── RELASI KONDISIONAL (Loaded via Eager Loading) ──────────────────

            // Kategori Kontrak Pos Keuangan
            'category' => $this->whenLoaded('category', fn () => [
                'id'    => Helper::encrypt($this->category->id),
                'name'  => $this->category->name,
                'color' => $this->category->color,
                'icon'  => $this->category->icon,
            ]),

            // Memuat detail mutasi kas pencairan awal jika dipanggil oleh controller
            'transaction' => new TransactionResource($this->whenLoaded('transaction')),

            // 🌟 RELASI BARU: Memuat daftar Label/Tag Proyek Vendor Panggung
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id'   => Helper::encrypt($tag->id), // Enkripsi jika di front-end membutuhkan ID untuk filter balik
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                });
            }),

            // Memuat pecahan log jadwal pelunasan atau tenor angsuran berjangka
            'payments' => $this->whenLoaded('payments', function () {
                return $this->payments->map(function ($pay) {
                    return [
                        'id'             => Helper::encrypt($pay->id),
                        'debt_id'        => Helper::encrypt($pay->debt_id),
                        'transaction_id' => $pay->transaction_id ? Helper::encrypt($pay->transaction_id) : null,

                        // Enkripsi ID akun bank/cash penampung dana untuk pelunasan berjalan
                        'account_id'     => $pay->account_id ? Helper::encrypt($pay->account_id) : null,

                        'amount_paid'    => (int) $pay->amount_paid,
                        'payment_date'   => $pay->payment_date ? $pay->payment_date->format('Y-m-d') : null,
                        'due_date'       => $pay->due_date ? $pay->due_date->format('Y-m-d') : null,
                        'status'         => $pay->status, // 'unpaid', 'paid'
                        'installment_no' => (int) $pay->installment_no,
                        'notes'          => $pay->notes,
                    ];
                });
            }),

            // Perhitungan instan total jumlah baris pecahan log dari model relasi
            'payments_count' => $this->when(
                $this->payments_count !== null,
                $this->payments_count,
                fn () => $this->payments ? $this->payments->count() : 0
            ),
        ];
    }
}
