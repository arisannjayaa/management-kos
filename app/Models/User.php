<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use LaravelEasyRepository\Traits\GenUid;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use GenUid, HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Relasi ke semua catatan hutang/piutang milik user.
     */
    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class);
    }

    /**
     * Get all goals for the user.
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class)->orderBy('created_at', 'desc');
    }

    /**
     * Dapatkan semua pengaturan batas anggaran (budget) milik user ini.
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class)->orderBy('month_year', 'desc');
    }

    /**
     * Accessor untuk menghitung uang yang sudah terpakai (Hanya sebagai referensi/opsional).
     */
    public function getAmountSpentAttribute(): float
    {
        // Query langsung ke tabel transaksi untuk menghitung total pengeluaran
        $query = Transaction::where('user_id', $this->user_id)
            ->where('type', 'expense')
            ->where('date', 'like', $this->month_year.'-%');

        // Jika category_id tidak null, saring berdasarkan kategori tersebut
        if ($this->category_id) {
            $query->where('category_id', $this->category_id);
        }

        return (float) $query->sum('amount');
    }

    /**
     * Relasi ke status sesi WhatsApp.
     * Satu user hanya memiliki satu koneksi WhatsApp Gateway (One-to-One).
     */
    public function waSession(): HasOne
    {
        return $this->hasOne(WaSession::class);
    }

    public function recurringBills()
    {
        return $this->hasMany(RecurringBill::class);
    }
}
