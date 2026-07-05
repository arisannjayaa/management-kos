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
        'name',
        'ktp_number',
        'phone',
        'emergency_contact',
        'ktp_attachment',
        'status',
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
}
