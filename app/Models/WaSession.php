<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LaravelEasyRepository\Traits\GenUid;

class WaSession extends Model
{
    use HasFactory, GenUid;

    /**
     * Kolom yang diizinkan untuk diisi secara massal (Mass Assignment).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'status',
        'last_connected_at',
    ];

    /**
     * Casting tipe data agar otomatis menjadi objek Carbon/Tanggal.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_connected_at' => 'datetime',
    ];

    /**
     * Relasi ke tabel users.
     * Menandakan siapa pemilik koneksi WA ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── FUNGSI PEMBANTU (HELPERS) ───────────────────────────────────────────

    /**
     * Cek apakah status WA saat ini sedang terhubung.
     */
    public function isConnected(): bool
    {
        return $this->status === 'CONNECTED';
    }

    /**
     * Cek apakah WA sedang menunggu scan QR Code.
     */
    public function requiresScan(): bool
    {
        return $this->status === 'REQUIRES_SCAN';
    }

    /**
     * Cek apakah WA sedang offline / terputus.
     */
    public function isDisconnected(): bool
    {
        return $this->status === 'DISCONNECTED';
    }
}
