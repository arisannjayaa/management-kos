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
     * Relasi ke status sesi WhatsApp.
     * Satu user hanya memiliki satu koneksi WhatsApp Gateway (One-to-One).
     */
    public function waSession(): HasOne
    {
        return $this->hasOne(WaSession::class);
    }

    public function receivedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'receiver_id');
    }

    /**
     * Relasi balik ke Profil Tenant (Symmetrical Relation)
     */
    public function tenant(): HasOne
    {
        return $this->hasOne(Tenant::class, 'user_id');
    }
}
