<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelEasyRepository\Traits\GenUid;

class RoomType extends Model
{
    use GenUid, SoftDeletes;

    protected $keyType = 'string';
    protected $table = 'room_types';

    public $incrementing = false;

    protected $fillable = [
        'property_id',
        'name',
        'description',
        'base_price',
    ];

    /**
     * Menunjuk ke Properti bernaung
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    /**
     * Mendapatkan unit Kamar yang memiliki tipe ini
     */
    public function rooms()
    {
        return $this->hasMany(Room::class, 'room_type_id');
    }

    /**
     * Relasi ke daftar pilihan tarif berjenjang yang dimiliki tipe kamar ini
     */
    public function pricingTiers()
    {
        return $this->hasMany(RoomTypePricingTier::class, 'room_type_id');
    }
}
