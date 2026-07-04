<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Property extends Model
{
    use GenUid, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'owner_id',
        'name',
        'address',
        'city',
        'phone',
        'billing_cycle_days',
        'billing_grace_period_days',
        'reminder_offsets_json',
        'wa_reminder_enabled',
        'is_active'
    ];

    protected $casts = [
        'reminder_offsets_json' => 'array',
        'wa_reminder_enabled' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke Owner properti ini (User induk)
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Relasi ke daftar Tipe Kamar di properti ini
     */
    public function roomTypes()
    {
        return $this->hasMany(RoomType::class, 'property_id');
    }

    /**
     * Relasi ke seluruh unit Kamar fisik di properti ini
     */
    public function rooms()
    {
        return $this->hasMany(Room::class, 'property_id');
    }

    /**
     * Relasi ke Penjaga Kos (Staff) yang ditugaskan ke properti ini
     */
    public function staffs()
    {
        return $this->belongsToMany(User::class, 'property_user', 'property_id', 'user_id');
    }
}
