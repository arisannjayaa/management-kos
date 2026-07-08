<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Tenant extends Model
{
    use GenUid, HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'user_id',
        'name',
        'email',
        'ktp_number',
        'ktp_attachment', // 🌟 Ditambahkan disini
        'phone',
        'emergency_contact',
        'status'
    ];

    /**
     * Relasi balik ke Owner selaku pembuat data
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Riwayat riil hunian atau kontrak sewa yang pernah/sedang diambil tenant
     */
    public function occupancies(): HasMany
    {
        return $this->hasMany(Occupancy::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'tenant_id');
    }

    /**
     * Relasi ke Akun Login Tenant
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
