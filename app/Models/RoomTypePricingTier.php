<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class RoomTypePricingTier extends Model
{
    use GenUid, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'room_type_id',
        'name',
        'price',
    ];

    /**
     * Menunjuk kembali ke Tipe Kamar pemilik tier tarif ini
     */
    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }
}
