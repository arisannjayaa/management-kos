<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Occupancy extends Model
{
    use GenUid, HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'room_id',
        'room_type_id',
        'tenant_id',
        'room_type_pricing_tier_id',
        'start_date',
        'end_date',
        'billing_day',
        'price',
        'deposit_amount',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function pricingTier(): BelongsTo
    {
        return $this->belongsTo(RoomTypePricingTier::class, 'room_type_pricing_tier_id');
    }

    /**
     * 🌟 KUNCI PERBAIKAN: Hubungkan Kontrak Huni dengan Banyak Biaya Tambahan
     */
    public function occupancyCharges(): HasMany
    {
        return $this->hasMany(OccupancyCharge::class, 'occupancy_id');
    }

    public function meterReadings(): HasMany
    {
        return $this->hasMany(ChargeMeterReading::class);
    }
}
