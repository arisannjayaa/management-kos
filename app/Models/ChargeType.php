<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class ChargeType extends Model
{
    use GenUid, SoftDeletes;

    protected $fillable = [
        'property_id',
        'name',
        'billing_method', // flat, metered, per_occupant
        'default_amount',
        'unit_label',
        'unit_price',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'default_amount' => 'float',
        'unit_price' => 'float',
    ];

    /**
     * Relasi balik ke induk Gedung Properti
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Relasi ke unit hunian kamar kos
     */
    public function occupancyCharges(): HasMany
    {
        return $this->hasMany(OccupancyCharge::class, 'charge_type_id');
    }
}
