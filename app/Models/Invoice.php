<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class Invoice extends Model
{
    use GenUid, HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'room_id',
        'tenant_id',
        'occupancy_id',
        'invoice_number',
        'period_start',
        'period_end',
        'due_date',
        'amount',
        'discount_amount',
        'final_amount',
        'paid_amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function occupancy(): BelongsTo
    {
        return $this->belongsTo(Occupancy::class);
    }

    /**
     * Relasi ke rincian item breakdown tagihan
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Relasi ke riwayat cicilan/pelunasan pembayaran masuk
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function meterReadings(): HasMany
    {
        return $this->hasMany(ChargeMeterReading::class);
    }
}
