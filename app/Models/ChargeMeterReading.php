<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class ChargeMeterReading extends Model
{
    use GenUid, SoftDeletes;

    protected $fillable = [
        'occupancy_id',
        'charge_type_id',
        'previous_reading',
        'current_reading',
        'usage',
        'amount',
        'reading_date',
        'invoice_id',
    ];

    protected $casts = [
        'previous_reading' => 'float',
        'current_reading' => 'float',
        'usage' => 'float',
        'amount' => 'float',
        'reading_date' => 'date',
    ];

    public function occupancy(): BelongsTo
    {
        return $this->belongsTo(Occupancy::class);
    }

    public function chargeType(): BelongsTo
    {
        return $this->belongsTo(ChargeType::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
