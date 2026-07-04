<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Debt extends Model
{
    use GenUid, HasFactory, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'contact_id', // 🌟 Relasi baru ke Buku Kontak
        'category_id',
        'transaction_id',
        'contact_name', // Fallback data lama (bisa dikosongkan untuk data baru)
        'type',
        'payment_method', // lump_sum / installment
        'amount',
        'remaining_amount',
        'is_deposit',
        'deposit_target_name',
        'description',
        'due_date',
        'status',
        'last_reminded_at', // 🌟 Pelacak bot pengingat WA

        // Fitur Amortisasi Barang / Alat Event
        'item_name',
        'reference_url',
    ];

    /**
     * Atribut yang harus dikonversi tipe datanya secara otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'integer',
        'remaining_amount' => 'integer',
        'is_deposit' => 'boolean',
        'due_date' => 'date',
        'last_reminded_at' => 'datetime', // 🌟 Otomatis dikonversi ke objek Carbon
    ];

    // ─── RELATIONS ──────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke tabel contacts.
     * Menandakan dengan siapa transaksi hutang/piutang ini terjadi.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }

    /**
     * Relasi ke transaksi awal saat pokok hutang/piutang dicairkan otomatis.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Relasi ke riwayat cicilan/pembayaran tunggal maupun tenor berjadwal.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relasi Polymorphic M-M untuk mengambil daftar Tag/Label Proyek (Cth: #CrewAGS)
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    // ─── HELPER METHODS ─────────────────────────────────────────────────────────

    /**
     * Fungsi pembantu untuk mengupdate status otomatis berdasarkan sisa hutang.
     * Cerdas mendeteksi skema lump_sum maupun cicilan bertahap.
     */
    public function autoUpdateStatus(): void
    {
        if ($this->remaining_amount <= 0) {
            $this->status = 'paid';
        } elseif ($this->payment_method === 'lump_sum') {
            // Jika bayar sekaligus dan nominal sisa masih ada, status kembali ke unpaid penuh
            $this->status = 'unpaid';
        } else {
            // Jika cicilan dan nominal sudah berkurang tapi belum nol, set partial berjalan
            $this->status = $this->remaining_amount < $this->amount ? 'partial' : 'unpaid';
        }

        $this->save();
    }
}
