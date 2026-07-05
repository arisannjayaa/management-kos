<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LaravelEasyRepository\Traits\GenUid;

class OccupancyCharge extends Model
{
    use GenUid;

    protected $fillable = [
        'occupancy_id',
        'charge_type_id',
        'amount',
    ];

    public function occupancy(): BelongsTo
    {
        return $this->belongsTo(Occupancy::class, 'occupancy_id');
    }

    /**
     * 🌟 KUNCI UNTUK BISA MEMANGGIL .chargeType DI BILLING ENGINE
     */
    public function chargeType(): BelongsTo
    {
        return $this->belongsTo(ChargeType::class, 'charge_type_id');
    }
}
